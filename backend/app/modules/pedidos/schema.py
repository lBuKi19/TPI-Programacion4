from datetime import datetime
from decimal import Decimal
from enum import StrEnum

from pydantic import (
    field_validator,
)
from sqlmodel import (
    Field,
    SQLModel,
)


class EstadoPedido(StrEnum):
    PENDIENTE = "PENDIENTE"
    EN_PREPARACION = "EN_PREPARACION"
    ENTREGADO = "ENTREGADO"
    CANCELADO = "CANCELADO"


class FormaPago(StrEnum):
    EFECTIVO = "EFECTIVO"
    TRANSFERENCIA = "TRANSFERENCIA"


class PedidoItemCreate(SQLModel):
    producto_id: int = Field(
        gt=0,
    )

    cantidad: int = Field(
        ge=1,
    )


class PedidoCreate(SQLModel):
    items: list[PedidoItemCreate] = Field(
        min_length=1,
    )

    forma_pago: FormaPago

    direccion_entrega: str = Field(
        min_length=5,
        max_length=200,
    )

    notas: str | None = Field(
        default=None,
        max_length=500,
    )

    @field_validator("items")
    @classmethod
    def validar_productos_no_repetidos(
        cls,
        items: list[PedidoItemCreate],
    ) -> list[PedidoItemCreate]:
        producto_ids = [
            item.producto_id
            for item in items
        ]

        if len(producto_ids) != len(
            set(producto_ids)
        ):
            raise ValueError(
                "Un mismo producto no puede aparecer "
                "más de una vez en el pedido"
            )

        return items

    @field_validator("direccion_entrega")
    @classmethod
    def normalizar_direccion(
        cls,
        value: str,
    ) -> str:
        direccion = value.strip()

        if len(direccion) < 5:
            raise ValueError(
                "La dirección de entrega debe tener "
                "al menos 5 caracteres"
            )

        return direccion

    @field_validator("notas")
    @classmethod
    def normalizar_notas(
        cls,
        value: str | None,
    ) -> str | None:
        if value is None:
            return None

        notas = value.strip()

        if not notas:
            return None

        return notas


class PedidoEstadoUpdate(SQLModel):
    estado: EstadoPedido


class DetallePedidoRead(SQLModel):
    id: int
    producto_id: int
    cantidad: int
    nombre_producto: str
    precio_unitario: Decimal
    subtotal: Decimal


class PedidoRead(SQLModel):
    id: int
    usuario_id: int
    estado: EstadoPedido
    forma_pago: FormaPago
    direccion_entrega: str
    notas: str | None
    total: Decimal
    created_at: datetime
    updated_at: datetime


class PedidoDetailRead(PedidoRead):
    detalles: list[DetallePedidoRead] = Field(
        default_factory=list,
    )


class PedidoListResponse(SQLModel):
    total: int = Field(
        ge=0,
    )

    items: list[PedidoRead] = Field(
        default_factory=list,
    )


class PedidoResumenRead(SQLModel):
    pendientes: int = Field(
        default=0,
        ge=0,
    )

    en_preparacion: int = Field(
        default=0,
        ge=0,
    )

    entregados: int = Field(
        default=0,
        ge=0,
    )

    cancelados: int = Field(
        default=0,
        ge=0,
    )

    pedidos_hoy: int = Field(
        default=0,
        ge=0,
    )

    ingresos_entregados: Decimal = Field(
        default=Decimal("0.00"),
        ge=0,
    )