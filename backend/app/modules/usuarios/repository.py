from sqlalchemy import func
from sqlalchemy.sql.elements import ColumnElement
from sqlmodel import Session, col, select

from app.core.repository import BaseRepository
from app.modules.usuarios.model import Usuario


class UsuarioRepository(
    BaseRepository[Usuario],
):
    def __init__(
        self,
        session: Session,
    ) -> None:
        super().__init__(
            session=session,
            model=Usuario,
        )

    def obtener_por_id(
        self,
        usuario_id: int,
    ) -> Usuario | None:
        statement = select(Usuario).where(
            col(Usuario.id) == usuario_id
        )

        return self.session.exec(
            statement
        ).first()

    def obtener_por_username(
        self,
        username: str,
    ) -> Usuario | None:
        username_normalizado = (
            username.strip().lower()
        )

        statement = select(Usuario).where(
            func.lower(
                func.trim(
                    col(Usuario.username)
                )
            )
            == username_normalizado
        )

        return self.session.exec(
            statement
        ).first()

    def obtener_por_email(
        self,
        email: str,
    ) -> Usuario | None:
        email_normalizado = (
            email.strip().lower()
        )

        statement = select(Usuario).where(
            func.lower(
                func.trim(
                    col(Usuario.email)
                )
            )
            == email_normalizado
        )

        return self.session.exec(
            statement
        ).first()

    def username_existe(
        self,
        username: str,
        excluir_usuario_id: int | None = None,
    ) -> bool:
        username_normalizado = (
            username.strip().lower()
        )

        filtros: list[ColumnElement[bool]] = [
            func.lower(
                func.trim(
                    col(Usuario.username)
                )
            )
            == username_normalizado
        ]

        if excluir_usuario_id is not None:
            filtros.append(
                col(Usuario.id)
                != excluir_usuario_id
            )

        statement = select(
            Usuario.id
        ).where(*filtros)

        return (
            self.session.exec(
                statement
            ).first()
            is not None
        )

    def email_existe(
        self,
        email: str,
        excluir_usuario_id: int | None = None,
    ) -> bool:
        email_normalizado = (
            email.strip().lower()
        )

        filtros: list[ColumnElement[bool]] = [
            func.lower(
                func.trim(
                    col(Usuario.email)
                )
            )
            == email_normalizado
        ]

        if excluir_usuario_id is not None:
            filtros.append(
                col(Usuario.id)
                != excluir_usuario_id
            )

        statement = select(
            Usuario.id
        ).where(*filtros)

        return (
            self.session.exec(
                statement
            ).first()
            is not None
        )

    def listar(
        self,
        skip: int = 0,
        limit: int = 100,
        disabled: bool | None = None,
    ) -> tuple[list[Usuario], int]:
        filtros: list[ColumnElement[bool]] = []

        if disabled is not None:
            filtros.append(
                col(Usuario.disabled)
                == disabled
            )

        statement = (
            select(Usuario)
            .where(*filtros)
            .order_by(
                col(Usuario.created_at).desc(),
                col(Usuario.id).desc(),
            )
            .offset(skip)
            .limit(limit)
        )

        usuarios = list(
            self.session.exec(
                statement
            ).all()
        )

        count_statement = (
            select(func.count())
            .select_from(Usuario)
            .where(*filtros)
        )

        total = int(
            self.session.exec(
                count_statement
            ).one()
        )

        return usuarios, total