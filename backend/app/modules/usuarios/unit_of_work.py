from types import TracebackType

from sqlmodel import Session

from app.core.database import engine
from app.core.unit_of_work import AbstractUnitOfWork
from app.modules.usuarios.model import Usuario
from app.modules.usuarios.repository import (
    UsuarioRepository,
)


class UsuarioUnitOfWork(
    AbstractUnitOfWork,
):
    def __init__(self) -> None:
        self.session: Session | None = None

        self.usuarios: (
            UsuarioRepository | None
        ) = None

    def __enter__(
        self,
    ) -> "UsuarioUnitOfWork":
        if self.session is not None:
            raise RuntimeError(
                "La unidad de trabajo de usuarios "
                "ya fue iniciada"
            )

        self.session = Session(
            engine,
            expire_on_commit=False,
        )

        self.usuarios = UsuarioRepository(
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
        usuario: Usuario,
    ) -> None:
        self._obtener_session().refresh(
            usuario
        )

    def obtener_usuarios_repository(
        self,
    ) -> UsuarioRepository:
        if self.usuarios is None:
            raise RuntimeError(
                "El repositorio de usuarios no está "
                "disponible. UsuarioUnitOfWork debe "
                "utilizarse dentro de un bloque with."
            )

        return self.usuarios

    def _obtener_session(self) -> Session:
        if self.session is None:
            raise RuntimeError(
                "La unidad de trabajo de usuarios no "
                "fue iniciada. Debe utilizarse dentro "
                "de un bloque with."
            )

        return self.session

    def _cerrar(self) -> None:
        if self.session is not None:
            self.session.close()

        self.session = None
        self.usuarios = None