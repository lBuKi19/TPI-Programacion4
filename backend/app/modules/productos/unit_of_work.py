from types import TracebackType

from sqlmodel import Session

from app.core.database import engine
from app.core.unit_of_work import AbstractUnitOfWork
from app.modules.categorias.repository import (
    CategoriaRepository,
)
from app.modules.productos.model import Producto
from app.modules.productos.repository import (
    ProductoRepository,
)


class ProductoUnitOfWork(
    AbstractUnitOfWork,
):
    def __init__(self) -> None:
        self.session: Session | None = None

        self.productos: (
            ProductoRepository | None
        ) = None

        self.categorias: (
            CategoriaRepository | None
        ) = None

    def __enter__(
        self,
    ) -> "ProductoUnitOfWork":
        if self.session is not None:
            raise RuntimeError(
                "La unidad de trabajo de productos "
                "ya fue iniciada"
            )

        self.session = Session(
            engine,
            expire_on_commit=False,
        )

        self.productos = ProductoRepository(
            session=self.session,
        )

        self.categorias = CategoriaRepository(
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

    def refresh(
        self,
        producto: Producto,
    ) -> None:
        self._obtener_session().refresh(
            producto
        )

    def obtener_productos_repository(
        self,
    ) -> ProductoRepository:
        if self.productos is None:
            raise RuntimeError(
                "El repositorio de productos no está "
                "disponible. ProductoUnitOfWork debe "
                "utilizarse dentro de un bloque with."
            )

        return self.productos

    def obtener_categorias_repository(
        self,
    ) -> CategoriaRepository:
        if self.categorias is None:
            raise RuntimeError(
                "El repositorio de categorías no está "
                "disponible. ProductoUnitOfWork debe "
                "utilizarse dentro de un bloque with."
            )

        return self.categorias

    def _obtener_session(self) -> Session:
        if self.session is None:
            raise RuntimeError(
                "La unidad de trabajo de productos no "
                "fue iniciada. Debe utilizarse dentro "
                "de un bloque with."
            )

        return self.session

    def _cerrar(self) -> None:
        if self.session is not None:
            self.session.close()

        self.session = None
        self.productos = None
        self.categorias = None