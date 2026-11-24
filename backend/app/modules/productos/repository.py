from typing import Any, cast
from sqlalchemy import ColumnElement, func
from sqlalchemy.orm import selectinload, QueryableAttribute
from sqlmodel import Session, col, select

from app.core.repository import BaseRepository
from app.modules.productos.model import Producto

producto_categoria_attr = cast(
    QueryableAttribute[Any],
    Producto.categoria,
)

class ProductoRepository(
    BaseRepository[Producto],
):
    def __init__(
        self,
        session: Session,
    ) -> None:
        super().__init__(
            session=session,
            model=Producto,
        )

    def listar_activos(
        self,
        skip: int = 0,
        limit: int = 20,
        search: str | None = None,
        categoria_id: int | None = None,
        disponible: bool | None = None,
    ) -> tuple[list[Producto], int]:
        filtros: list[ColumnElement[bool]] = [
            col(Producto.activo).is_(True),
        ]

        if search is not None:
            search_normalizado = search.strip()

            if search_normalizado:
                filtros.append(
                    col(Producto.nombre).ilike(
                        f"%{search_normalizado}%"
                    )
                )

        if categoria_id is not None:
            filtros.append(
                col(Producto.categoria_id)
                == categoria_id
            )

        if disponible is not None:
            filtros.append(
                col(Producto.disponible)
                == disponible
            )

        statement = (
            select(Producto)
            .where(*filtros)
            .options(
                selectinload(
                    producto_categoria_attr
                )
            )
            .order_by(
                col(Producto.nombre)
            )
            .offset(skip)
            .limit(limit)
        )

        productos = list(
            self.session.exec(
                statement
            ).all()
        )

        count_statement = (
            select(func.count())
            .select_from(Producto)
            .where(*filtros)
        )

        total = int(
            self.session.exec(
                count_statement
            ).one()
        )

        return productos, total

    def obtener_activo_por_id(
        self,
        producto_id: int,
    ) -> Producto | None:
        statement = (
            select(Producto)
            .where(
                col(Producto.id)
                == producto_id,
                col(Producto.activo).is_(
                    True
                ),
            )
            .options(
                selectinload(
                    producto_categoria_attr
                )
            )
        )

        return self.session.exec(
            statement
        ).first()

    def obtener_por_id(
        self,
        producto_id: int,
    ) -> Producto | None:
        """
        Obtiene el producto aunque se encuentre inactivo.

        Debe reservarse para verificaciones internas.
        Los casos de uso normales deben consultar
        obtener_activo_por_id().
        """
        statement = (
            select(Producto)
            .where(
                col(Producto.id)
                == producto_id
            )
            .options(
                selectinload(
                    producto_categoria_attr
                )
            )
        )

        return self.session.exec(
            statement
        ).first()

    def obtener_activos_por_ids(
        self,
        producto_ids: list[int],
    ) -> list[Producto]:
        """
        Recupera en una sola consulta los productos activos
        requeridos para crear un pedido.
        """
        if not producto_ids:
            return []

        statement = (
            select(Producto)
            .where(
                col(Producto.id).in_(
                    producto_ids
                ),
                col(Producto.activo).is_(
                    True
                ),
            )
            .order_by(
                col(Producto.id)
            )
        )

        return list(
            self.session.exec(
                statement
            ).all()
        )

    def obtener_por_nombre(
        self,
        nombre: str,
    ) -> Producto | None:
        nombre_normalizado = (
            nombre.strip().lower()
        )

        statement = select(
            Producto
        ).where(
            func.lower(
                func.trim(
                    col(Producto.nombre)
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
        excluir_producto_id: int | None = None,
    ) -> bool:
        nombre_normalizado = (
            nombre.strip().lower()
        )

        filtros = [
            func.lower(
                func.trim(
                    col(Producto.nombre)
                )
            )
            == nombre_normalizado,
        ]

        if excluir_producto_id is not None:
            filtros.append(
                col(Producto.id)
                != excluir_producto_id
            )

        statement = select(
            Producto.id
        ).where(*filtros)

        producto_id = self.session.exec(
            statement
        ).first()

        return producto_id is not None

    def bloquear_activos_por_ids(
        self,
        producto_ids: list[int],
    ) -> list[Producto]:
        """
        Recupera productos activos bloqueando sus filas hasta
        finalizar la transacción.

        Este método se utilizará durante la creación de pedidos
        para evitar que dos compras simultáneas descuenten el
        mismo stock sin verse entre sí.
        """
        if not producto_ids:
            return []

        statement = (
            select(Producto)
            .where(
                col(Producto.id).in_(
                    producto_ids
                ),
                col(Producto.activo).is_(
                    True
                ),
            )
            .order_by(
                col(Producto.id)
            )
            .with_for_update()
        )

        return list(
            self.session.exec(
                statement
            ).all()
        )
    
    def bloquear_por_ids(
        self,
        producto_ids: list[int],
    ) -> list[Producto]:
        """
        Bloquea productos activos o inactivos.

        Se utiliza para restituir stock durante la
        cancelación de un pedido histórico.
        """
        if not producto_ids:
            return []

        statement = (
            select(Producto)
            .where(
                col(Producto.id).in_(
                    producto_ids
                )
            )
            .order_by(
                col(Producto.id)
            )
            .with_for_update()
        )

        return list(
            self.session.exec(
                statement
            ).all()
        )