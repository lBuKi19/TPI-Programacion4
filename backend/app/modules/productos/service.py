from collections.abc import Callable

from app.modules.categorias.model import Categoria
from app.modules.categorias.schema import CategoriaRead
from app.modules.productos.model import Producto
from app.modules.productos.schema import (
    ProductoCreate,
    ProductoDetailRead,
    ProductoListResponse,
    ProductoStockUpdate,
    ProductoUpdate,
)
from app.modules.productos.unit_of_work import (
    ProductoUnitOfWork,
)


class ProductoNoEncontradoError(Exception):
    """El producto no existe o se encuentra inactivo."""


class ProductoDuplicadoError(Exception):
    """Ya existe un producto con el mismo nombre."""


class CategoriaProductoNoEncontradaError(Exception):
    """
    La categoría indicada no existe o se encuentra inactiva.
    """


ProductoUnitOfWorkFactory = Callable[
    [],
    ProductoUnitOfWork,
]


class ProductoService:
    def __init__(
        self,
        unit_of_work_factory:
            ProductoUnitOfWorkFactory
            = ProductoUnitOfWork,
    ) -> None:
        self.unit_of_work_factory = (
            unit_of_work_factory
        )

    def listar_productos(
        self,
        skip: int = 0,
        limit: int = 20,
        search: str | None = None,
        categoria_id: int | None = None,
        disponible: bool | None = None,
    ) -> ProductoListResponse:
        with self.unit_of_work_factory() as uow:
            productos_repository = (
                uow.obtener_productos_repository()
            )

            productos, total = (
                productos_repository.listar_activos(
                    skip=skip,
                    limit=limit,
                    search=search,
                    categoria_id=categoria_id,
                    disponible=disponible,
                )
            )

            items = [
                self._construir_producto_read(
                    producto=producto,
                )
                for producto in productos
            ]

            resultado = ProductoListResponse(
                total=total,
                items=items,
            )

        return resultado

    def obtener_producto(
        self,
        producto_id: int,
    ) -> ProductoDetailRead:
        with self.unit_of_work_factory() as uow:
            productos_repository = (
                uow.obtener_productos_repository()
            )

            producto = (
                productos_repository
                .obtener_activo_por_id(
                    producto_id=producto_id,
                )
            )

            if producto is None:
                raise ProductoNoEncontradoError(
                    "Producto no encontrado"
                )

            resultado = (
                self._construir_producto_read(
                    producto=producto,
                )
            )

        return resultado

    def crear_producto(
        self,
        datos: ProductoCreate,
    ) -> ProductoDetailRead:
        with self.unit_of_work_factory() as uow:
            productos_repository = (
                uow.obtener_productos_repository()
            )

            categorias_repository = (
                uow.obtener_categorias_repository()
            )

            if productos_repository.nombre_existe(
                nombre=datos.nombre,
            ):
                raise ProductoDuplicadoError(
                    "Ya existe un producto "
                    "con ese nombre"
                )

            categoria = (
                categorias_repository
                .obtener_activa_por_id(
                    categoria_id=datos.categoria_id,
                )
            )

            if categoria is None:
                raise CategoriaProductoNoEncontradaError(
                    "Categoría no encontrada"
                )

            if categoria.id is None:
                raise RuntimeError(
                    "La categoría no está persistida"
                )

            producto = Producto(
                nombre=datos.nombre,
                descripcion=datos.descripcion,
                precio_base=datos.precio_base,
                imagen_url=datos.imagen_url,
                stock=datos.stock,
                disponible=datos.disponible,
                activo=True,
                categoria_id=categoria.id,
            )

            productos_repository.agregar(
                producto
            )

            uow.flush()

            if producto.id is None:
                raise RuntimeError(
                    "No se pudo generar el ID "
                    "del producto"
                )

            resultado = (
                self._construir_producto_read(
                    producto=producto,
                    categoria=categoria,
                )
            )

        return resultado

    def actualizar_producto(
        self,
        producto_id: int,
        datos: ProductoUpdate,
    ) -> ProductoDetailRead:
        with self.unit_of_work_factory() as uow:
            productos_repository = (
                uow.obtener_productos_repository()
            )

            categorias_repository = (
                uow.obtener_categorias_repository()
            )

            producto = (
                productos_repository
                .obtener_activo_por_id(
                    producto_id=producto_id,
                )
            )

            if producto is None:
                raise ProductoNoEncontradoError(
                    "Producto no encontrado"
                )

            cambios = datos.model_dump(
                exclude_unset=True,
            )

            nuevo_nombre = cambios.get(
                "nombre"
            )

            if (
                isinstance(nuevo_nombre, str)
                and productos_repository.nombre_existe(
                    nombre=nuevo_nombre,
                    excluir_producto_id=(
                        producto_id
                    ),
                )
            ):
                raise ProductoDuplicadoError(
                    "Ya existe otro producto "
                    "con ese nombre"
                )

            categoria = producto.categoria

            nueva_categoria_id = cambios.get(
                "categoria_id"
            )

            if isinstance(
                nueva_categoria_id,
                int,
            ):
                categoria_encontrada = (
                    categorias_repository
                    .obtener_activa_por_id(
                        categoria_id=(
                            nueva_categoria_id
                        ),
                    )
                )

                if categoria_encontrada is None:
                    raise (
                        CategoriaProductoNoEncontradaError(
                            "Categoría no encontrada"
                        )
                    )

                if categoria_encontrada.id is None:
                    raise RuntimeError(
                        "La categoría no está persistida"
                    )

                categoria = categoria_encontrada

                producto.categoria_id = (
                    categoria_encontrada.id
                )

                producto.categoria = (
                    categoria_encontrada
                )

                cambios.pop(
                    "categoria_id",
                    None,
                )

            for campo, valor in cambios.items():
                setattr(
                    producto,
                    campo,
                    valor,
                )

            productos_repository.agregar(
                producto
            )

            uow.flush()

            resultado = (
                self._construir_producto_read(
                    producto=producto,
                    categoria=categoria,
                )
            )

        return resultado

    def actualizar_stock(
        self,
        producto_id: int,
        datos: ProductoStockUpdate,
    ) -> ProductoDetailRead:
        with self.unit_of_work_factory() as uow:
            productos_repository = (
                uow.obtener_productos_repository()
            )

            producto = (
                productos_repository
                .obtener_activo_por_id(
                    producto_id=producto_id,
                )
            )

            if producto is None:
                raise ProductoNoEncontradoError(
                    "Producto no encontrado"
                )

            cambios = datos.model_dump(
                exclude_unset=True,
            )

            if "stock" in cambios:
                producto.stock = cambios["stock"]

            if "disponible" in cambios:
                producto.disponible = cambios[
                    "disponible"
                ]

            productos_repository.agregar(
                producto
            )

            uow.flush()

            resultado = (
                self._construir_producto_read(
                    producto=producto,
                )
            )

        return resultado

    def eliminar_producto(
        self,
        producto_id: int,
    ) -> None:
        with self.unit_of_work_factory() as uow:
            productos_repository = (
                uow.obtener_productos_repository()
            )

            producto = (
                productos_repository
                .obtener_activo_por_id(
                    producto_id=producto_id,
                )
            )

            if producto is None:
                raise ProductoNoEncontradoError(
                    "Producto no encontrado"
                )

            producto.activo = False

            productos_repository.agregar(
                producto
            )

            uow.flush()

    @staticmethod
    def _construir_categoria_read(
        categoria: Categoria,
    ) -> CategoriaRead:
        if categoria.id is None:
            raise RuntimeError(
                "La categoría todavía no "
                "fue persistida"
            )

        return CategoriaRead(
            id=categoria.id,
            nombre=categoria.nombre,
            descripcion=categoria.descripcion,
            activo=categoria.activo,
        )

    @classmethod
    def _construir_producto_read(
        cls,
        producto: Producto,
        categoria: Categoria | None = None,
    ) -> ProductoDetailRead:
        if producto.id is None:
            raise RuntimeError(
                "El producto todavía no "
                "fue persistido"
            )

        categoria_producto = (
            categoria
            if categoria is not None
            else producto.categoria
        )

        if categoria_producto is None:
            raise RuntimeError(
                "El producto no tiene una "
                "categoría asociada"
            )

        return ProductoDetailRead(
            id=producto.id,
            nombre=producto.nombre,
            descripcion=producto.descripcion,
            precio_base=producto.precio_base,
            imagen_url=producto.imagen_url,
            stock=producto.stock,
            disponible=producto.disponible,
            activo=producto.activo,
            categoria_id=producto.categoria_id,
            categoria=(
                cls._construir_categoria_read(
                    categoria_producto
                )
            ),
        )