from types import TracebackType

from sqlmodel import Session

from app.core.database import engine
from app.core.unit_of_work import AbstractUnitOfWork
from app.modules.categorias.repository import (
    CategoriaRepository,
)


class CategoriaUnitOfWork(
    AbstractUnitOfWork,
):
    def __init__(self) -> None:
        self.session: Session | None = None

        self.categorias: (
            CategoriaRepository | None
        ) = None

    def __enter__(
        self,
    ) -> "CategoriaUnitOfWork":
        if self.session is not None:
            raise RuntimeError(
                "La unidad de trabajo de categorías "
                "ya fue iniciada"
            )

        self.session = Session(
            engine,
            expire_on_commit=False,
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
        session = self._obtener_session()
        session.commit()

    def rollback(self) -> None:
        session = self._obtener_session()
        session.rollback()

    def flush(self) -> None:
        session = self._obtener_session()
        session.flush()

    def refresh(
        self,
        entidad: object,
    ) -> None:
        session = self._obtener_session()
        session.refresh(entidad)

    def obtener_categorias_repository(
        self,
    ) -> CategoriaRepository:
        if self.categorias is None:
            raise RuntimeError(
                "El repositorio de categorías no está "
                "disponible. CategoriaUnitOfWork debe "
                "utilizarse dentro de un bloque with."
            )

        return self.categorias

    def _obtener_session(self) -> Session:
        if self.session is None:
            raise RuntimeError(
                "La unidad de trabajo de categorías no "
                "fue iniciada. Debe utilizarse dentro "
                "de un bloque with."
            )

        return self.session

    def _cerrar(self) -> None:
        if self.session is not None:
            self.session.close()

        self.session = None
        self.categorias = None