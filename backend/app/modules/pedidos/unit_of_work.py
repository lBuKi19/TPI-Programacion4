from types import TracebackType

from sqlmodel import Session

from app.core.database import engine
from app.core.unit_of_work import AbstractUnitOfWork
from app.modules.pedidos.model import (
    DetallePedido,
    Pedido,
)
from app.modules.pedidos.repository import (
    DetallePedidoRepository,
    PedidoRepository,
)
from app.modules.productos.repository import (
    ProductoRepository,
)


class PedidoUnitOfWork(
    AbstractUnitOfWork,
):
    def __init__(self) -> None:
        self.session: Session | None = None

        self.pedidos: (
            PedidoRepository | None
        ) = None

        self.detalles: (
            DetallePedidoRepository | None
        ) = None

        self.productos: (
            ProductoRepository | None
        ) = None

    def __enter__(
        self,
    ) -> "PedidoUnitOfWork":
        if self.session is not None:
            raise RuntimeError(
                "La unidad de trabajo de pedidos "
                "ya fue iniciada"
            )

        self.session = Session(
            engine,
            expire_on_commit=False,
        )

        self.pedidos = PedidoRepository(
            session=self.session,
        )

        self.detalles = DetallePedidoRepository(
            session=self.session,
        )

        self.productos = ProductoRepository(
            session=self.session,
        )

        return self

    def __exit__(
        self,
        exc_type: type[BaseException] | None,
        exc_value: BaseException | None,
        traceback: TracebackType | None,
    ) -> bool:
        try:
            if exc_type is None:
                self.commit()
            else:
                self.rollback()
        finally:
            self._cerrar()

        return False

    def commit(self) -> None:
        self._obtener_session().commit()

    def rollback(self) -> None:
        self._obtener_session().rollback()

    def flush(self) -> None:
        self._obtener_session().flush()

    def refresh_pedido(
        self,
        pedido: Pedido,
    ) -> None:
        self._obtener_session().refresh(
            pedido
        )

    def refresh_detalle(
        self,
        detalle: DetallePedido,
    ) -> None:
        self._obtener_session().refresh(
            detalle
        )

    def obtener_pedidos_repository(
        self,
    ) -> PedidoRepository:
        if self.pedidos is None:
            raise RuntimeError(
                "El repositorio de pedidos no está "
                "disponible. PedidoUnitOfWork debe "
                "utilizarse dentro de un bloque with."
            )

        return self.pedidos

    def obtener_detalles_repository(
        self,
    ) -> DetallePedidoRepository:
        if self.detalles is None:
            raise RuntimeError(
                "El repositorio de detalles no está "
                "disponible. PedidoUnitOfWork debe "
                "utilizarse dentro de un bloque with."
            )

        return self.detalles

    def obtener_productos_repository(
        self,
    ) -> ProductoRepository:
        if self.productos is None:
            raise RuntimeError(
                "El repositorio de productos no está "
                "disponible. PedidoUnitOfWork debe "
                "utilizarse dentro de un bloque with."
            )

        return self.productos

    def _obtener_session(self) -> Session:
        if self.session is None:
            raise RuntimeError(
                "La unidad de trabajo de pedidos no "
                "fue iniciada. Debe utilizarse dentro "
                "de un bloque with."
            )

        return self.session

    def _cerrar(self) -> None:
        if self.session is not None:
            self.session.close()

        self.session = None
        self.pedidos = None
        self.detalles = None
        self.productos = None