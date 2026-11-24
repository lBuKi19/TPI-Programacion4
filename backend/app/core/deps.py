from collections.abc import Callable
from typing import Annotated

from fastapi import (
    Depends,
    HTTPException,
    Request,
    status,
)

from app.core.config import settings
from app.core.security import (
    TokenInvalidoError,
    decode_access_token,
)
from app.modules.auth.service import (
    AuthService,
    CuentaDesactivadaError,
    UsuarioSesionNoEncontradoError,
)
from app.modules.usuarios.schema import (
    RolUsuario,
    UsuarioPublic,
)


auth_service = AuthService()


def get_current_user(
    request: Request,
) -> UsuarioPublic:
    token = request.cookies.get(
        settings.cookie_name
    )

    if not token:
        raise HTTPException(
            status_code=(
                status.HTTP_401_UNAUTHORIZED
            ),
            detail="No autenticado",
            headers={
                "WWW-Authenticate": "Bearer",
            },
        )

    try:
        payload = decode_access_token(
            token
        )

        subject = payload.get("sub")

        if not isinstance(subject, str):
            raise TokenInvalidoError(
                "El token no contiene "
                "un usuario válido"
            )

        usuario_id = int(subject)

        return auth_service.obtener_usuario_actual(
            usuario_id=usuario_id,
        )

    except (
        TokenInvalidoError,
        ValueError,
        TypeError,
        UsuarioSesionNoEncontradoError,
    ) as error:
        raise HTTPException(
            status_code=(
                status.HTTP_401_UNAUTHORIZED
            ),
            detail="Sesión inválida o expirada",
            headers={
                "WWW-Authenticate": "Bearer",
            },
        ) from error

    except CuentaDesactivadaError as error:
        raise HTTPException(
            status_code=(
                status.HTTP_400_BAD_REQUEST
            ),
            detail=str(error),
        ) from error


CurrentUserDep = Annotated[
    UsuarioPublic,
    Depends(get_current_user),
]


def require_role(
    roles_permitidos: set[str],
) -> Callable[
    [UsuarioPublic],
    UsuarioPublic,
]:
    def verificar_rol(
        usuario: CurrentUserDep,
    ) -> UsuarioPublic:
        if usuario.role not in roles_permitidos:
            raise HTTPException(
                status_code=(
                    status.HTTP_403_FORBIDDEN
                ),
                detail=(
                    "No tiene permisos suficientes "
                    "para realizar esta operación"
                ),
            )

        return usuario

    return verificar_rol


AdminUserDep = Annotated[
    UsuarioPublic,
    Depends(
        require_role({RolUsuario.ADMIN})
    ),
]