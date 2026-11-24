from pydantic import field_validator
from sqlmodel import Field, SQLModel


class CategoriaBase(SQLModel):
    nombre: str = Field(
        min_length=1,
        max_length=100,
    )

    descripcion: str | None = Field(
        default=None,
        max_length=500,
    )


class CategoriaCreate(CategoriaBase):
    @field_validator("nombre")
    @classmethod
    def normalizar_nombre(
        cls,
        value: str,
    ) -> str:
        nombre = value.strip()

        if not nombre:
            raise ValueError(
                "El nombre de la categoría es obligatorio"
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


class CategoriaUpdate(SQLModel):
    nombre: str | None = Field(
        default=None,
        min_length=1,
        max_length=100,
    )

    descripcion: str | None = Field(
        default=None,
        max_length=500,
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
                "El nombre de la categoría no puede estar vacío"
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


class CategoriaRead(SQLModel):
    id: int
    nombre: str
    descripcion: str | None
    activo: bool


class CategoriaListResponse(SQLModel):
    total: int = Field(
        ge=0,
    )

    items: list[CategoriaRead] = Field(
        default_factory=list,
    )