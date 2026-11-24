from sqlalchemy import func
from sqlmodel import Session, col, select

from app.core.repository import BaseRepository
from app.modules.categorias.model import Categoria


class CategoriaRepository(
    BaseRepository[Categoria],
):
    def __init__(
        self,
        session: Session,
    ) -> None:
        super().__init__(
            session=session,
            model=Categoria,
        )

    def listar_activas(
        self,
        skip: int = 0,
        limit: int = 100,
        search: str | None = None,
    ) -> tuple[list[Categoria], int]:
        filtros = [
            col(Categoria.activo).is_(True),
        ]

        if search is not None:
            search_normalizado = search.strip()

            if search_normalizado:
                filtros.append(
                    col(Categoria.nombre).ilike(
                        f"%{search_normalizado}%"
                    )
                )

        statement = (
            select(Categoria)
            .where(*filtros)
            .order_by(
                col(Categoria.nombre)
            )
            .offset(skip)
            .limit(limit)
        )

        categorias = list(
            self.session.exec(
                statement
            ).all()
        )

        count_statement = (
            select(func.count())
            .select_from(Categoria)
            .where(*filtros)
        )

        total = int(
            self.session.exec(
                count_statement
            ).one()
        )

        return categorias, total

    def obtener_activa_por_id(
        self,
        categoria_id: int,
    ) -> Categoria | None:
        statement = select(
            Categoria
        ).where(
            col(Categoria.id)
            == categoria_id,
            col(Categoria.activo).is_(True),
        )

        return self.session.exec(
            statement
        ).first()

    def obtener_por_id(
        self,
        categoria_id: int,
    ) -> Categoria | None:
        """
        Recupera la categoría aunque se encuentre inactiva.

        Este método es útil para verificaciones internas.
        Los casos de uso normales deben utilizar
        obtener_activa_por_id().
        """
        statement = select(
            Categoria
        ).where(
            col(Categoria.id)
            == categoria_id
        )

        return self.session.exec(
            statement
        ).first()

    def obtener_por_nombre(
        self,
        nombre: str,
    ) -> Categoria | None:
        nombre_normalizado = (
            nombre.strip().lower()
        )

        statement = select(
            Categoria
        ).where(
            func.lower(
                func.trim(
                    col(Categoria.nombre)
                )
            )
            == nombre_normalizado
        )

        return self.session.exec(
            statement
        ).first()

    def nombre_existe(
        self,
        nombre: str,
        excluir_categoria_id: int | None = None,
    ) -> bool:
        nombre_normalizado = (
            nombre.strip().lower()
        )

        filtros = [
            func.lower(
                func.trim(
                    col(Categoria.nombre)
                )
            )
            == nombre_normalizado,
        ]

        if excluir_categoria_id is not None:
            filtros.append(
                col(Categoria.id)
                != excluir_categoria_id
            )

        statement = select(
            Categoria.id
        ).where(*filtros)

        categoria_id = self.session.exec(
            statement
        ).first()

        return categoria_id is not None

    

    