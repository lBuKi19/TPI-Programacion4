from datetime import datetime
from decimal import Decimal
from typing import TYPE_CHECKING, ClassVar

from sqlalchemy import Column, Numeric
from sqlmodel import (
    Field,
    Relationship,
    SQLModel,
)

from app.core.datetime_utils import utc_now


if TYPE_CHECKING:
    from app.modules.productos.model import Producto
    from app.modules.usuarios.model import Usuario


class Pedido(SQLModel, table=True):
    __tablename__: ClassVar[str] = "pedidos"

    id: int | None = Field(
        default=None,
        primary_key=True,
    )

    usuario_id: int = Field(
        foreign_key="usuarios.id",
        nullable=False,
        index=True,
        ondelete="RESTRICT",
    )

    estado: str = Field(
        default="PENDIENTE",
        max_length=30,
        nullable=False,
        index=True,
    )

    forma_pago: str = Field(
        max_length=30,
        nullable=False,
    )

    direccion_entrega: str = Field(
        min_length=5,
        max_length=200,
        nullable=False,
    )

    notas: str | None = Field(
        default=None,
        max_length=500,
        nullable=True,
    )

    total: Decimal = Field(
        default=Decimal("0.00"),
        ge=0,
        sa_column=Column(
            Numeric(
                precision=14,
                scale=2,
            ),
            nullable=False,
        ),
    )

    created_at: datetime = Field(
        default_factory=utc_now,
        nullable=False,
        index=True,
    )

    updated_at: datetime = Field(
        default_factory=utc_now,
        nullable=False,
    )

    usuario: "Usuario" = Relationship(
        back_populates="pedidos",
    )

    detalles: list["DetallePedido"] = Relationship(
        back_populates="pedido",
        sa_relationship_kwargs={
            "cascade": (
                "all, delete-orphan"
            ),
        },
    )


class DetallePedido(SQLModel, table=True):
    __tablename__: ClassVar[str] = (
        "detalles_pedido"
    )

    id: int | None = Field(
        default=None,
        primary_key=True,
    )

    pedido_id: int = Field(
        foreign_key="pedidos.id",
        nullable=False,
        index=True,
        ondelete="CASCADE",
    )

    producto_id: int = Field(
        foreign_key="productos.id",
        nullable=False,
        index=True,
        ondelete="RESTRICT",
    )

    cantidad: int = Field(
        ge=1,
        nullable=False,
    )

    nombre_producto: str = Field(
        min_length=1,
        max_length=150,
        nullable=False,
    )

    precio_unitario: Decimal = Field(
        gt=0,
        sa_column=Column(
            Numeric(
                precision=12,
                scale=2,
            ),
            nullable=False,
        ),
    )

    subtotal: Decimal = Field(
        gt=0,
        sa_column=Column(
            Numeric(
                precision=14,
                scale=2,
            ),
            nullable=False,
        ),
    )

    pedido: "Pedido" = Relationship(
        back_populates="detalles",
    )

    producto: "Producto" = Relationship(
        back_populates="detalles_pedido",
    )