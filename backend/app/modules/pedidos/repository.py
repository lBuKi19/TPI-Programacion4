from datetime import datetime
from decimal import Decimal
from typing import Any, cast

from sqlalchemy import func
from sqlalchemy.orm import (
    QueryableAttribute,
    selectinload,
)
from sqlalchemy.sql.elements import ColumnElement
from sqlmodel import Session, col, select

from app.core.datetime_utils import utc_now
from app.core.repository import BaseRepository
from app.modules.pedidos.model import (
    DetallePedido,
    Pedido,
)
from app.modules.pedidos.schema import (
    EstadoPedido,
)


pedido_detalles_attr = cast(
    QueryableAttribute[Any],
    Pedido.detalles,
)


class PedidoRepository(
    BaseRepository[Pedido],
):
    def __init__(
        self,
        session: Session,
    ) -> None:
        super().__init__(
            session=session,
            model=Pedido,
        )

    def listar(
        self,
        skip: int = 0,
        limit: int = 20,
        usuario_id: int | None = None,
        estado: EstadoPedido | None = None,
    ) -> tuple[list[Pedido], int]:
        filtros: list[ColumnElement[bool]] = []

        if usuario_id is not None:
            filtros.append(
                col(Pedido.usuario_id)
                == usuario_id
            )

        if estado is not None:
            filtros.append(
                col(Pedido.estado)
                == estado.value
            )

        statement = (
            select(Pedido)
            .where(*filtros)
            .options(
                selectinload(
                    pedido_detalles_attr
                )
            )
            .order_by(
                col(Pedido.created_at).desc(),
                col(Pedido.id).desc(),
            )
            .offset(skip)
            .limit(limit)
        )

        pedidos = list(
            self.session.exec(
                statement
            ).all()
        )

        count_statement = (
            select(func.count())
            .select_from(Pedido)
            .where(*filtros)
        )

        total = int(
            self.session.exec(
                count_statement
            ).one()
        )

        return pedidos, total

    def obtener_por_id_con_detalles(
        self,
        pedido_id: int,
    ) -> Pedido | None:
        statement = (
            select(Pedido)
            .where(
                col(Pedido.id)
                == pedido_id
            )
            .options(
                selectinload(
                    pedido_detalles_attr
                )
            )
        )

        return self.session.exec(
            statement
        ).first()

    def obtener_por_id_bloqueado(
        self,
        pedido_id: int,
    ) -> Pedido | None:
        """
        Bloquea la fila del pedido hasta que finalice
        la transacción.

        Los detalles se consultan por separado porque
        PostgreSQL no combina convenientemente FOR UPDATE
        con eager loading sobre relaciones de colección.
        """
        statement = (
            select(Pedido)
            .where(
                col(Pedido.id)
                == pedido_id
            )
            .with_for_update()
        )

        return self.session.exec(
            statement
        ).first()

    def contar_por_estado(
        self,
        estado: EstadoPedido,
    ) -> int:
        statement = (
            select(func.count())
            .select_from(Pedido)
            .where(
                col(Pedido.estado)
                == estado.value
            )
        )

        return int(
            self.session.exec(
                statement
            ).one()
        )

    def contar_desde_fecha(
        self,
        fecha_desde: datetime,
    ) -> int:
        statement = (
            select(func.count())
            .select_from(Pedido)
            .where(
                col(Pedido.created_at)
                >= fecha_desde
            )
        )

        return int(
            self.session.exec(
                statement
            ).one()
        )

    def sumar_total_entregados(
        self,
    ) -> Decimal:
        statement = select(
            func.coalesce(
                func.sum(Pedido.total),
                Decimal("0.00"),
            )
        ).where(
            col(Pedido.estado)
            == EstadoPedido.ENTREGADO.value
        )

        resultado = self.session.exec(
            statement
        ).one()

        return Decimal(
            str(resultado)
        )


class DetallePedidoRepository(
    BaseRepository[DetallePedido],
):
    def __init__(
        self,
        session: Session,
    ) -> None:
        super().__init__(
            session=session,
            model=DetallePedido,
        )

    def listar_por_pedido(
        self,
        pedido_id: int,
    ) -> list[DetallePedido]:
        statement = (
            select(DetallePedido)
            .where(
                col(DetallePedido.pedido_id)
                == pedido_id
            )
            .order_by(
                col(DetallePedido.id)
            )
        )

        return list(
            self.session.exec(
                statement
            ).all()
        )

    def listar_por_pedido_bloqueados(
        self,
        pedido_id: int,
    ) -> list[DetallePedido]:
        """
        Bloquea las líneas del pedido durante la cancelación
        para impedir una restitución doble de stock.
        """
        statement = (
            select(DetallePedido)
            .where(
                col(DetallePedido.pedido_id)
                == pedido_id
            )
            .order_by(
                col(DetallePedido.id)
            )
            .with_for_update()
        )

        return list(
            self.session.exec(
                statement
            ).all()
        )