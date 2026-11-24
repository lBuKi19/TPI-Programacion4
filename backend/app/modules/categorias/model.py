from typing import TYPE_CHECKING, ClassVar

from sqlmodel import (
    Field,
    Relationship,
    SQLModel,
)


if TYPE_CHECKING:
    from app.modules.productos.model import Producto


class Categoria(SQLModel, table=True):
    __tablename__: ClassVar[str] = "categorias"

    id: int | None = Field(
        default=None,
        primary_key=True,
    )

    nombre: str = Field(
        min_length=1,
        max_length=100,
        unique=True,
        index=True,
        nullable=False,
    )

    descripcion: str | None = Field(
        default=None,
        max_length=500,
        nullable=True,
    )

    activo: bool = Field(
        default=True,
        nullable=False,
    )

    productos: list["Producto"] = Relationship(
        back_populates="categoria",
    )