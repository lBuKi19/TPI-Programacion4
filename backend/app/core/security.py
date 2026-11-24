from datetime import (
    datetime,
    timedelta,
    timezone,
)
from typing import Any

from jose import JWTError, jwt
from passlib.context import CryptContext

from app.core.config import settings


password_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto",
)


class TokenInvalidoError(Exception):
    """El token no es válido, expiró o no es de acceso."""


def hash_password(
    password: str,
) -> str:
    """
    Genera el hash bcrypt de una contraseña.

    El límite de 72 bytes también se valida en el schema,
    pero se repite aquí para proteger usos internos.
    """
    if len(password.encode("utf-8")) > 72:
        raise ValueError(
            "La contraseña no puede superar "
            "los 72 bytes en UTF-8"
        )

    return password_context.hash(password)


def verify_password(
    plain_password: str,
    hashed_password: str,
) -> bool:
    """
    Compara una contraseña recibida con su hash almacenado.
    """
    try:
        return password_context.verify(
            plain_password,
            hashed_password,
        )
    except (ValueError, TypeError):
        return False


def create_access_token(
    subject: str,
    role: str,
) -> str:
    issued_at = datetime.now(
        timezone.utc
    )

    expires_at = issued_at + timedelta(
        minutes=(
            settings.access_token_expire_minutes
        )
    )

    payload: dict[str, Any] = {
        "sub": subject,
        "role": role,
        "type": "access",
        "iat": issued_at,
        "exp": expires_at,
    }

    return jwt.encode(
        payload,
        settings.secret_key,
        algorithm=settings.algorithm,
    )

def decode_access_token(
    token: str,
) -> dict[str, Any]:
    """
    Valida firma, algoritmo, expiración y tipo del token.
    """
    try:
        payload = jwt.decode(
            token,
            settings.secret_key,
            algorithms=[
                settings.algorithm,
            ],
        )
    except JWTError as error:
        raise TokenInvalidoError(
            "Token inválido o expirado"
        ) from error

    subject = payload.get("sub")
    token_type = payload.get("type")

    if (
        not isinstance(subject, str)
        or not subject
        or token_type != "access"
    ):
        raise TokenInvalidoError(
            "Token de acceso inválido"
        )

    roles = payload.get("roles", [])

    if not isinstance(roles, list):
        raise TokenInvalidoError(
            "Los roles del token no son válidos"
        )

    if not all(
        isinstance(role, str)
        for role in roles
    ):
        raise TokenInvalidoError(
            "Los roles del token no son válidos"
        )

    return payload