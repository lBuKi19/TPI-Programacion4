from decimal import Decimal

from pydantic import (
    HttpUrl,
    field_validator,
    model_validator
)
from sqlmodel import Field, SQLModel

from app.modules.categorias.schema import (
    CategoriaRead,
)


class ProductoBase(SQLModel):
    nombre: str = Field(
        min_length=1,
        max_length=150,
    )

    descripcion: str | None = Field(
        default=None,
        max_length=1000,
    )

    precio_base: Decimal = Field(
        gt=0,
        max_digits=12,
        decimal_places=2,
    )

    imagen_url: str | None = Field(
        default=None,
        max_length=500,
    )

    categoria_id: int = Field(
        gt=0,
    )


class ProductoCreate(ProductoBase):
    stock: int = Field(
        default=0,
        ge=0,
    )

    disponible: bool = True

    @field_validator("nombre")
    @classmethod
    def normalizar_nombre(
        cls,
        value: str,
    ) -> str:
        nombre = value.strip()

        if not nombre:
            raise ValueError(
                "El nombre del producto es obligatorio"
            )

        return nombre

    @field_validator("descripcion")
    @classmethod
    def normalizar_descripcion(
        cls,
        value: str | None,
    ) -> str | None:
        if value is None:
            return None

        descripcion = value.strip()

        return descripcion or None

    @field_validator("imagen_url")
    @classmethod
    def normalizar_imagen_url(
        cls,
        value: str | None,
    ) -> str | None:
        if value is None:
            return None

        imagen_url = value.strip()

        if not imagen_url:
            return None

        return imagen_url


class ProductoUpdate(SQLModel):
    nombre: str | None = Field(
        default=None,
        min_length=1,
        max_length=150,
    )

    descripcion: str | None = Field(
        default=None,
        max_length=1000,
    )

    precio_base: Decimal | None = Field(
        default=None,
        gt=0,
        max_digits=12,
        decimal_places=2,
    )

    imagen_url: str | None = Field(
        default=None,
        max_length=500,
    )

    categoria_id: int | None = Field(
        default=None,
        gt=0,
    )

    @field_validator("nombre")
    @classmethod
    def normalizar_nombre(
        cls,
        value: str | None,
    ) -> str | None:
        if value is None:
            return None

        nombre = value.strip()

        if not nombre:
            raise ValueError(
                "El nombre del producto no puede estar vacío"
            )

        return nombre

    @field_validator("descripcion")
    @classmethod
    def normalizar_descripcion(
        cls,
        value: str | None,
    ) -> str | None:
        if value is None:
            return None

        descripcion = value.strip()

        return descripcion or None

    @field_validator("imagen_url")
    @classmethod
    def normalizar_imagen_url(
        cls,
        value: str | None,
    ) -> str | None:
        if value is None:
            return None

        imagen_url = value.strip()

        return imagen_url or None


class ProductoStockUpdate(SQLModel):
    stock: int | None = Field(
        default=None,
        ge=0,
    )

    disponible: bool | None = None

    @model_validator(mode="after")
    def validar_al_menos_un_campo(
        self,
    ) -> "ProductoStockUpdate":
        if (
            self.stock is None
            and self.disponible is None
        ):
            raise ValueError(
                "Debe enviar stock, disponible "
                "o ambos campos"
            )

        return self


class ProductoRead(SQLModel):
    id: int
    nombre: str
    descripcion: str | None
    precio_base: Decimal
    imagen_url: str | None
    stock: int
    disponible: bool
    activo: bool
    categoria_id: int


class ProductoDetailRead(ProductoRead):
    categoria: CategoriaRead


class ProductoListResponse(SQLModel):
    total: int = Field(
        ge=0,
    )

    items: list[ProductoDetailRead] = Field(
        default_factory=list,
    )