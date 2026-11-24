from datetime import datetime
from enum import StrEnum

from pydantic import (
    EmailStr,
    field_validator,
)
from sqlmodel import Field, SQLModel


class RolUsuario(StrEnum):
    USER = "user"
    ADMIN = "admin"


class UsuarioCreate(SQLModel):
    username: str = Field(
        min_length=3,
        max_length=50,
    )

    full_name: str = Field(
        min_length=2,
        max_length=150,
    )

    email: EmailStr

    password: str = Field(
        min_length=8,
    )

    @field_validator("username")
    @classmethod
    def normalizar_username(
        cls,
        value: str,
    ) -> str:
        value = value.strip().lower()

        if not value:
            raise ValueError(
                "El username es obligatorio"
            )

        if not value.replace("_", "").isalnum():
            raise ValueError(
                "El username solo puede contener "
                "letras, números y guion bajo"
            )

        return value

    @field_validator("full_name")
    @classmethod
    def normalizar_full_name(
        cls,
        value: str,
    ) -> str:
        value = value.strip()

        if not value:
            raise ValueError(
                "El nombre completo es obligatorio"
            )

        return value

    @field_validator("email")
    @classmethod
    def normalizar_email(
        cls,
        value: EmailStr,
    ) -> str:
        return str(value).strip().lower()

    @field_validator("password")
    @classmethod
    def validar_password(
        cls,
        value: str,
    ) -> str:
        if not value.strip():
            raise ValueError(
                "La contraseña no puede contener "
                "solamente espacios"
            )

        if len(value.encode("utf-8")) > 72:
            raise ValueError(
                "La contraseña no puede superar "
                "los 72 bytes en UTF-8"
            )

        return value


class UsuarioPublic(SQLModel):
    id: int
    username: str
    full_name: str
    email: EmailStr
    role: RolUsuario
    disabled: bool
    created_at: datetime


class UsuarioListResponse(SQLModel):
    total: int = Field(
        ge=0,
    )

    items: list[UsuarioPublic] = Field(
        default_factory=list,
    )


class AuthMessage(SQLModel):
    message: str