from functools import lru_cache
from typing import Literal

from pydantic import (
    EmailStr,
    Field,
    field_validator,
)
from pydantic_settings import (
    BaseSettings,
    SettingsConfigDict,
)


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # Base de datos
    database_url: str = Field(
        min_length=1,
    )

    # JWT
    secret_key: str = Field(
        min_length=32,
    )

    algorithm: Literal["HS256"] = "HS256"

    access_token_expire_minutes: int = Field(
        default=30,
        ge=1,
        le=1440,
    )

    # Cookie de autenticación
    cookie_name: str = Field(
        default="access_token",
        min_length=1,
        max_length=100,
    )

    cookie_secure: bool = False

    cookie_samesite: Literal[
        "lax",
        "strict",
        "none",
    ] = "lax"

    # CORS
    frontend_origin: str = Field(
        default="http://localhost:5173",
        min_length=1,
    )

    # Administrador inicial
    initial_admin_username: str = Field(
        default="admin",
        min_length=3,
        max_length=50,
    )

    initial_admin_email: EmailStr = Field(
        default="admin@foodstore.com",
    )

    initial_admin_password: str = Field(
        min_length=8,
    )

    initial_admin_full_name: str = Field(
        default="Administrador Food Store",
        min_length=2,
        max_length=150,
    )

    @field_validator(
        "database_url",
        "secret_key",
        "cookie_name",
        "frontend_origin",
        "initial_admin_username",
        "initial_admin_password",
        "initial_admin_full_name",
    )
    @classmethod
    def normalizar_texto_obligatorio(
        cls,
        value: str,
    ) -> str:
        value_normalizado = value.strip()

        if not value_normalizado:
            raise ValueError(
                "La variable de configuración "
                "no puede estar vacía"
            )

        return value_normalizado

    @field_validator("secret_key")
    @classmethod
    def validar_secret_key(
        cls,
        value: str,
    ) -> str:
        if len(value) < 32:
            raise ValueError(
                "SECRET_KEY debe tener al menos "
                "32 caracteres"
            )

        valores_inseguros = {
            "SECRET",
            "CHANGE_ME",
            "REEMPLAZAR_CON_CLAVE_SEGURA",
            "CLAVE_SECRETA_DE_AL_MENOS_32_CARACTERES",
        }

        if value.upper() in valores_inseguros:
            raise ValueError(
                "SECRET_KEY contiene un valor "
                "de ejemplo inseguro"
            )

        return value

    @field_validator("frontend_origin")
    @classmethod
    def validar_frontend_origin(
        cls,
        value: str,
    ) -> str:
        origin = value.rstrip("/")

        if not origin.startswith(
            (
                "http://",
                "https://",
            )
        ):
            raise ValueError(
                "FRONTEND_ORIGIN debe comenzar "
                "con http:// o https://"
            )

        return origin

    @field_validator("initial_admin_username")
    @classmethod
    def normalizar_admin_username(
        cls,
        value: str,
    ) -> str:
        username = value.strip().lower()

        if not username.replace(
            "_",
            "",
        ).isalnum():
            raise ValueError(
                "INITIAL_ADMIN_USERNAME solo puede "
                "contener letras, números y guion bajo"
            )

        return username

    @field_validator("initial_admin_email")
    @classmethod
    def normalizar_admin_email(
        cls,
        value: EmailStr,
    ) -> str:
        return str(value).strip().lower()

    @field_validator("initial_admin_password")
    @classmethod
    def validar_admin_password(
        cls,
        value: str,
    ) -> str:
        if not value.strip():
            raise ValueError(
                "INITIAL_ADMIN_PASSWORD no puede "
                "contener solamente espacios"
            )

        if len(value.encode("utf-8")) > 72:
            raise ValueError(
                "INITIAL_ADMIN_PASSWORD no puede "
                "superar los 72 bytes en UTF-8"
            )

        return value


@lru_cache
def get_settings() -> Settings:
    # BaseSettings obtiene los campos obligatorios
    # desde variables de entorno o desde .env.
    return Settings()  # pyright: ignore[reportCallIssue]


settings = get_settings()