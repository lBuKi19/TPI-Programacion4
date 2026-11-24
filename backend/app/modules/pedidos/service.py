from collections.abc import Callable
from datetime import datetime, timezone
from decimal import Decimal

from app.core.datetime_utils import utc_now
from app.modules.pedidos.model import (
    DetallePedido,
    Pedido,
)
from app.modules.pedidos.schema import (
    DetallePedidoRead,
    EstadoPedido,
    FormaPago,
    PedidoCreate,
    PedidoDetailRead,
    PedidoEstadoUpdate,
    PedidoListResponse,
    PedidoRead,
    PedidoResumenRead,
)
from app.modules.pedidos.unit_of_work import (
    PedidoUnitOfWork,
)
from app.modules.productos.model import Producto


class PedidoNoEncontradoError(Exception):
    """El pedido no existe."""


class PedidoAjenoError(Exception):
    """El pedido pertenece a otro usuario."""


class ProductoPedidoNoEncontradoError(Exception):
    """Uno o más productos no existen o están inactivos."""

    def __init__(
        self,
        producto_ids: list[int],
    ) -> None:
        self.producto_ids = producto_ids

        ids_texto = ", ".join(
            str(producto_id)
            for producto_id in producto_ids
        )

        super().__init__(
            "No se encontraron productos activos "
            f"con los siguientes IDs: {ids_texto}"
        )


class ProductoNoDisponibleError(Exception):
    """El producto existe, pero no está disponible."""

    def __init__(
        self,
        producto: Producto,
    ) -> None:
        self.producto_id = producto.id
        self.producto_nombre = producto.nombre

        super().__init__(
            f'El producto "{producto.nombre}" '
            "no se encuentra disponible"
        )


class StockInsuficienteError(Exception):
    """El producto no tiene stock para satisfacer el pedido."""

    def __init__(
        self,
        producto: Producto,
        cantidad_solicitada: int,
    ) -> None:
        self.producto_id = producto.id
        self.producto_nombre = producto.nombre
        self.stock_disponible = producto.stock
        self.cantidad_solicitada = (
            cantidad_solicitada
        )

        super().__init__(
            f'Stock insuficiente para "{producto.nombre}". '
            f"Disponible: {producto.stock}; "
            f"solicitado: {cantidad_solicitada}"
        )


class TransicionEstadoInvalidaError(Exception):
    """La máquina de estados no admite la transición."""


class CancelacionNoPermitidaError(Exception):
    """El usuario no puede cancelar el pedido en su estado actual."""


class ProductoHistoricoNoEncontradoError(Exception):
    """
    Un producto de una línea histórica ya no existe físicamente.

    La baja lógica no produce este error porque el repositorio de
    cancelación incluye productos inactivos.
    """


PedidoUnitOfWorkFactory = Callable[
    [],
    PedidoUnitOfWork,
]


class PedidoService:
    TRANSICIONES_VALIDAS: dict[
        EstadoPedido,
        set[EstadoPedido],
    ] = {
        EstadoPedido.PENDIENTE: {
            EstadoPedido.EN_PREPARACION,
            EstadoPedido.CANCELADO,
        },
        EstadoPedido.EN_PREPARACION: {
            EstadoPedido.ENTREGADO,
            EstadoPedido.CANCELADO,
        },
        EstadoPedido.ENTREGADO: set(),
        EstadoPedido.CANCELADO: set(),
    }

    def __init__(
        self,
        unit_of_work_factory:
            PedidoUnitOfWorkFactory
            = PedidoUnitOfWork,
    ) -> None:
        self.unit_of_work_factory = (
            unit_of_work_factory
        )

    def crear_pedido(
        self,
        datos: PedidoCreate,
        usuario_id: int,
    ) -> PedidoDetailRead:
        """
        Crea el pedido, descuenta stock y genera las líneas
        dentro de una única transacción.
        """
        with self.unit_of_work_factory() as uow:
            pedidos_repository = (
                uow.obtener_pedidos_repository()
            )

            detalles_repository = (
                uow.obtener_detalles_repository()
            )

            productos_repository = (
                uow.obtener_productos_repository()
            )

            producto_ids = [
                item.producto_id
                for item in datos.items
            ]

            productos = (
                productos_repository
                .bloquear_activos_por_ids(
                    producto_ids
                )
            )

            productos_por_id = (
                self._crear_mapa_productos(
                    productos
                )
            )

            ids_inexistentes = [
                producto_id
                for producto_id in producto_ids
                if producto_id
                not in productos_por_id
            ]

            if ids_inexistentes:
                raise (
                    ProductoPedidoNoEncontradoError(
                        ids_inexistentes
                    )
                )

            total = Decimal("0.00")

            detalles_preparados: list[
                tuple[
                    Producto,
                    int,
                    Decimal,
                    Decimal,
                ]
            ] = []

            for item in datos.items:
                producto = productos_por_id[
                    item.producto_id
                ]

                if not producto.disponible:
                    raise ProductoNoDisponibleError(
                        producto
                    )

                if producto.stock < item.cantidad:
                    raise StockInsuficienteError(
                        producto=producto,
                        cantidad_solicitada=(
                            item.cantidad
                        ),
                    )

                precio_unitario = (
                    producto.precio_base
                )

                subtotal = (
                    precio_unitario
                    * item.cantidad
                )

                producto.stock -= item.cantidad

                productos_repository.agregar(
                    producto
                )

                total += subtotal

                detalles_preparados.append(
                    (
                        producto,
                        item.cantidad,
                        precio_unitario,
                        subtotal,
                    )
                )

            pedido = Pedido(
                usuario_id=usuario_id,
                estado=(
                    EstadoPedido.PENDIENTE.value
                ),
                forma_pago=datos.forma_pago.value,
                direccion_entrega=(
                    datos.direccion_entrega
                ),
                notas=datos.notas,
                total=total,
                created_at=utc_now(),
                updated_at=utc_now(),
            )

            pedidos_repository.agregar(
                pedido
            )

            uow.flush()

            if pedido.id is None:
                raise RuntimeError(
                    "No se pudo generar el ID "
                    "del pedido"
                )

            detalles = [
                DetallePedido(
                    pedido_id=pedido.id,
                    producto_id=(
                        self._obtener_producto_id(
                            producto
                        )
                    ),
                    cantidad=cantidad,
                    nombre_producto=(
                        producto.nombre
                    ),
                    precio_unitario=(
                        precio_unitario
                    ),
                    subtotal=subtotal,
                )
                for (
                    producto,
                    cantidad,
                    precio_unitario,
                    subtotal,
                ) in detalles_preparados
            ]

            detalles_repository.agregar_varios(
                detalles
            )

            uow.flush()

            resultado = (
                self._construir_pedido_detalle(
                    pedido=pedido,
                    detalles=detalles,
                )
            )

        return resultado

    def listar_pedidos(
        self,
        usuario_id: int,
        es_admin: bool,
        skip: int = 0,
        limit: int = 20,
        estado: EstadoPedido | None = None,
    ) -> PedidoListResponse:
        """
        El administrador consulta todos los pedidos.
        Un cliente consulta solamente los propios.
        """
        with self.unit_of_work_factory() as uow:
            repository = (
                uow.obtener_pedidos_repository()
            )

            usuario_id_filtro = (
                None
                if es_admin
                else usuario_id
            )

            pedidos, total = repository.listar(
                skip=skip,
                limit=limit,
                usuario_id=usuario_id_filtro,
                estado=estado,
            )

            resultado = PedidoListResponse(
                total=total,
                items=[
                    self._construir_pedido_read(
                        pedido
                    )
                    for pedido in pedidos
                ],
            )

        return resultado

    def obtener_pedido(
        self,
        pedido_id: int,
        usuario_id: int,
        es_admin: bool,
    ) -> PedidoDetailRead:
        with self.unit_of_work_factory() as uow:
            repository = (
                uow.obtener_pedidos_repository()
            )

            pedido = (
                repository
                .obtener_por_id_con_detalles(
                    pedido_id
                )
            )

            if pedido is None:
                raise PedidoNoEncontradoError(
                    "Pedido no encontrado"
                )

            self._validar_propietario(
                pedido=pedido,
                usuario_id=usuario_id,
                es_admin=es_admin,
            )

            resultado = (
                self._construir_pedido_detalle(
                    pedido=pedido,
                    detalles=list(
                        pedido.detalles
                    ),
                )
            )

        return resultado

    def actualizar_estado(
        self,
        pedido_id: int,
        datos: PedidoEstadoUpdate,
    ) -> PedidoDetailRead:
        """
        Caso de uso administrativo.

        Las cancelaciones deben pasar por cancelar_pedido()
        para garantizar la restitución del stock.
        """
        if (
            datos.estado
            == EstadoPedido.CANCELADO
        ):
            raise TransicionEstadoInvalidaError(
                "Para cancelar un pedido debe utilizar "
                "el endpoint específico de cancelación"
            )

        with self.unit_of_work_factory() as uow:
            pedidos_repository = (
                uow.obtener_pedidos_repository()
            )

            detalles_repository = (
                uow.obtener_detalles_repository()
            )

            pedido = (
                pedidos_repository
                .obtener_por_id_bloqueado(
                    pedido_id
                )
            )

            if pedido is None:
                raise PedidoNoEncontradoError(
                    "Pedido no encontrado"
                )

            estado_actual = EstadoPedido(
                pedido.estado
            )

            self._validar_transicion(
                estado_actual=estado_actual,
                estado_nuevo=datos.estado,
            )

            pedido.estado = datos.estado.value
            pedido.updated_at = utc_now()

            pedidos_repository.agregar(
                pedido
            )

            detalles = (
                detalles_repository
                .listar_por_pedido(
                    pedido_id
                )
            )

            uow.flush()

            resultado = (
                self._construir_pedido_detalle(
                    pedido=pedido,
                    detalles=detalles,
                )
            )

        return resultado

    def cancelar_pedido(
        self,
        pedido_id: int,
        usuario_id: int,
        es_admin: bool,
    ) -> PedidoDetailRead:
        """
        Cancela el pedido y restituye el stock en una sola
        transacción.
        """
        with self.unit_of_work_factory() as uow:
            pedidos_repository = (
                uow.obtener_pedidos_repository()
            )

            detalles_repository = (
                uow.obtener_detalles_repository()
            )

            productos_repository = (
                uow.obtener_productos_repository()
            )

            pedido = (
                pedidos_repository
                .obtener_por_id_bloqueado(
                    pedido_id
                )
            )

            if pedido is None:
                raise PedidoNoEncontradoError(
                    "Pedido no encontrado"
                )

            self._validar_propietario(
                pedido=pedido,
                usuario_id=usuario_id,
                es_admin=es_admin,
            )

            estado_actual = EstadoPedido(
                pedido.estado
            )

            if (
                not es_admin
                and estado_actual
                != EstadoPedido.PENDIENTE
            ):
                raise CancelacionNoPermitidaError(
                    "El cliente solo puede cancelar "
                    "pedidos en estado PENDIENTE"
                )

            self._validar_transicion(
                estado_actual=estado_actual,
                estado_nuevo=(
                    EstadoPedido.CANCELADO
                ),
            )

            detalles = (
                detalles_repository
                .listar_por_pedido_bloqueados(
                    pedido_id
                )
            )

            producto_ids = [
                detalle.producto_id
                for detalle in detalles
            ]

            productos = (
                productos_repository
                .bloquear_por_ids(
                    producto_ids
                )
            )

            productos_por_id = (
                self._crear_mapa_productos(
                    productos
                )
            )

            ids_inexistentes = [
                producto_id
                for producto_id in producto_ids
                if producto_id
                not in productos_por_id
            ]

            if ids_inexistentes:
                ids_texto = ", ".join(
                    str(producto_id)
                    for producto_id
                    in ids_inexistentes
                )

                raise (
                    ProductoHistoricoNoEncontradoError(
                        "No se pudo restituir el stock "
                        "de los productos: "
                        f"{ids_texto}"
                    )
                )

            for detalle in detalles:
                producto = productos_por_id[
                    detalle.producto_id
                ]

                producto.stock += (
                    detalle.cantidad
                )

                productos_repository.agregar(
                    producto
                )

            pedido.estado = (
                EstadoPedido.CANCELADO.value
            )

            pedido.updated_at = utc_now()

            pedidos_repository.agregar(
                pedido
            )

            uow.flush()

            resultado = (
                self._construir_pedido_detalle(
                    pedido=pedido,
                    detalles=detalles,
                )
            )

        return resultado

    def obtener_resumen(
        self,
    ) -> PedidoResumenRead:
        with self.unit_of_work_factory() as uow:
            repository = (
                uow.obtener_pedidos_repository()
            )

            inicio_hoy = datetime.now(
                timezone.utc
            ).replace(
                hour=0,
                minute=0,
                second=0,
                microsecond=0,
            )

            resultado = PedidoResumenRead(
                pendientes=(
                    repository.contar_por_estado(
                        EstadoPedido.PENDIENTE
                    )
                ),
                en_preparacion=(
                    repository.contar_por_estado(
                        EstadoPedido.EN_PREPARACION
                    )
                ),
                entregados=(
                    repository.contar_por_estado(
                        EstadoPedido.ENTREGADO
                    )
                ),
                cancelados=(
                    repository.contar_por_estado(
                        EstadoPedido.CANCELADO
                    )
                ),
                pedidos_hoy=(
                    repository.contar_desde_fecha(
                        inicio_hoy
                    )
                ),
                ingresos_entregados=(
                    repository
                    .sumar_total_entregados()
                ),
            )

        return resultado

    @classmethod
    def _validar_transicion(
        cls,
        estado_actual: EstadoPedido,
        estado_nuevo: EstadoPedido,
    ) -> None:
        estados_permitidos = (
            cls.TRANSICIONES_VALIDAS[
                estado_actual
            ]
        )

        if estado_nuevo not in estados_permitidos:
            raise TransicionEstadoInvalidaError(
                "No se puede cambiar el pedido "
                f"de {estado_actual.value} "
                f"a {estado_nuevo.value}"
            )

    @staticmethod
    def _validar_propietario(
        pedido: Pedido,
        usuario_id: int,
        es_admin: bool,
    ) -> None:
        if (
            not es_admin
            and pedido.usuario_id
            != usuario_id
        ):
            raise PedidoAjenoError(
                "No tiene permiso para acceder "
                "a este pedido"
            )

    @staticmethod
    def _crear_mapa_productos(
        productos: list[Producto],
    ) -> dict[int, Producto]:
        return {
            producto.id: producto
            for producto in productos
            if producto.id is not None
        }

    @staticmethod
    def _obtener_producto_id(
        producto: Producto,
    ) -> int:
        if producto.id is None:
            raise RuntimeError(
                "El producto no está persistido"
            )

        return producto.id

    @staticmethod
    def _construir_detalle_read(
        detalle: DetallePedido,
    ) -> DetallePedidoRead:
        if detalle.id is None:
            raise RuntimeError(
                "El detalle del pedido todavía "
                "no fue persistido"
            )

        return DetallePedidoRead(
            id=detalle.id,
            producto_id=detalle.producto_id,
            cantidad=detalle.cantidad,
            nombre_producto=(
                detalle.nombre_producto
            ),
            precio_unitario=(
                detalle.precio_unitario
            ),
            subtotal=detalle.subtotal,
        )

    @staticmethod
    def _construir_pedido_read(
        pedido: Pedido,
    ) -> PedidoRead:
        if pedido.id is None:
            raise RuntimeError(
                "El pedido todavía no fue persistido"
            )

        return PedidoRead(
            id=pedido.id,
            usuario_id=pedido.usuario_id,
            estado=EstadoPedido(
                pedido.estado
            ),
            forma_pago=FormaPago(
                pedido.forma_pago
            ),
            direccion_entrega=(
                pedido.direccion_entrega
            ),
            notas=pedido.notas,
            total=pedido.total,
            created_at=pedido.created_at,
            updated_at=pedido.updated_at,
        )

    @classmethod
    def _construir_pedido_detalle(
        cls,
        pedido: Pedido,
        detalles: list[DetallePedido],
    ) -> PedidoDetailRead:
        pedido_read = (
            cls._construir_pedido_read(
                pedido
            )
        )

        detalles_read = [
            cls._construir_detalle_read(
                detalle
            )
            for detalle in detalles
        ]

        return PedidoDetailRead(
            **pedido_read.model_dump(),
            detalles=detalles_read,
        )