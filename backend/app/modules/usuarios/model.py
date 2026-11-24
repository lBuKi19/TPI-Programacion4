from datetime import datetime
from typing import TYPE_CHECKING, ClassVar

from sqlmodel import (
    Field,
    Relationship,
    SQLModel,
)

from app.core.datetime_utils import utc_now




if TYPE_CHECKING:
    from app.modules.pedidos.model import Pedido


class Usuario(SQLModel, table=True):
    __tablename__: ClassVar[str] = "usuarios"

    id: int | None = Field(
        default=None,
        primary_key=True,
    )

    username: str = Field(
        min_length=3,
        max_length=50,
        unique=True,
        index=True,
        nullable=False,
    )

    full_name: str = Field(
        max_length=150,
        nullable=False,
    )

    email: str = Field(
        max_length=254,
        unique=True,
        index=True,
        nullable=False,
    )

    hashed_password: str = Field(
        max_length=255,
        nullable=False,
    )

    role: str = Field(
        default="user",
        max_length=20,
        nullable=False,
    )

    disabled: bool = Field(
        default=False,
        nullable=False,
    )

    created_at: datetime = Field(
        default_factory=utc_now,
        nullable=False,
    )

    pedidos: list["Pedido"] = Relationship(
        back_populates="usuario",
    )