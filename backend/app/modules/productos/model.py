from decimal import Decimal
from typing import TYPE_CHECKING, ClassVar

from sqlalchemy import Column, Numeric
from sqlmodel import (
    Field,
    Relationship,
    SQLModel,
)

if TYPE_CHECKING:
    from app.modules.categorias.model import Categoria
    from app.modules.pedidos.model import DetallePedido


class Producto(SQLModel, table=True):
    __tablename__: ClassVar[str] = "productos"

    id: int | None = Field(
        default=None,
        primary_key=True,
    )

    nombre: str = Field(
        min_length=1,
        max_length=150,
        unique=True,
        index=True,
        nullable=False,
    )

    descripcion: str | None = Field(
        default=None,
        max_length=1000,
        nullable=True,
    )

    precio_base: Decimal = Field(
        gt=0,
        sa_column=Column(
            Numeric(
                precision=12,
                scale=2,
            ),
            nullable=False,
        ),
    )

    imagen_url: str | None = Field(
        default=None,
        max_length=500,
        nullable=True,
    )

    stock: int = Field(
        default=0,
        ge=0,
        nullable=False,
    )

    disponible: bool = Field(
        default=True,
        nullable=False,
    )

    activo: bool = Field(
        default=True,
        nullable=False,
    )

    categoria_id: int = Field(
        foreign_key="categorias.id",
        nullable=False,
        ondelete="RESTRICT",
    )

    categoria: "Categoria" = Relationship(
        back_populates="productos",
    )

    detalles_pedido: list["DetallePedido"] = Relationship(
        back_populates="producto",
    )