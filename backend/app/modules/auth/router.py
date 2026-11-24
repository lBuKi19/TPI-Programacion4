from typing import Annotated

from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    Response,
    status,
)
from fastapi.security import (
    OAuth2PasswordRequestForm,
)

from app.core.config import settings
from app.core.deps import CurrentUserDep
from app.core.security import (
    create_access_token,
)
from app.modules.auth.schema import (
    AuthMessage,
)
from app.modules.auth.service import (
    AuthService,
    CredencialesInvalidasError,
    CuentaDesactivadaError,
)
from app.modules.usuarios.schema import (
    UsuarioCreate,
    UsuarioPublic,
)
from app.modules.usuarios.service import (
    EmailDuplicadoError,
    UsernameDuplicadoError,
    UsuarioService,
)


router = APIRouter(
    prefix="/auth",
    tags=["Autenticación"],
)


def get_auth_service() -> AuthService:
    return AuthService()


def get_usuario_service() -> UsuarioService:
    return UsuarioService()


AuthServiceDep = Annotated[
    AuthService,
    Depends(get_auth_service),
]


UsuarioServiceDep = Annotated[
    UsuarioService,
    Depends(get_usuario_service),
]


OAuth2FormDep = Annotated[
    OAuth2PasswordRequestForm,
    Depends(),
]


@router.post(
    "/register",
    response_model=UsuarioPublic,
    status_code=status.HTTP_201_CREATED,
)
def registrar_usuario(
    datos: UsuarioCreate,
    service: UsuarioServiceDep,
) -> UsuarioPublic:
    try:
        return service.registrar_usuario(
            datos
        )

    except (
        UsernameDuplicadoError,
        EmailDuplicadoError,
    ) as error:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=str(error),
        ) from error


@router.post(
    "/token",
    response_model=UsuarioPublic,
    status_code=status.HTTP_200_OK,
)
def iniciar_sesion(
    response: Response,
    form_data: OAuth2FormDep,
    service: AuthServiceDep,
) -> UsuarioPublic:
    try:
        usuario = service.autenticar_usuario(
            username=form_data.username,
            password=form_data.password,
        )

    except CredencialesInvalidasError as error:
        raise HTTPException(
            status_code=(
                status.HTTP_401_UNAUTHORIZED
            ),
            detail=str(error),
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

    token = create_access_token(
        subject=str(usuario.id),
        role=usuario.role.value,
    )

    response.set_cookie(
        key=settings.cookie_name,
        value=token,
        httponly=True,
        secure=settings.cookie_secure,
        samesite=settings.cookie_samesite,
        max_age=(
            settings.access_token_expire_minutes
            * 60
        ),
        path="/",
    )

    return usuario


@router.post(
    "/logout",
    response_model=AuthMessage,
    status_code=status.HTTP_200_OK,
)
def cerrar_sesion(
    response: Response,
) -> AuthMessage:
    response.delete_cookie(
        key=settings.cookie_name,
        path="/",
        httponly=True,
        secure=settings.cookie_secure,
        samesite=settings.cookie_samesite,
    )

    return AuthMessage(
        message="Sesión cerrada correctamente"
    )


@router.get(
    "/me",
    response_model=UsuarioPublic,
    status_code=status.HTTP_200_OK,
)
def obtener_mi_usuario(
    usuario: CurrentUserDep,
) -> UsuarioPublic:
    return usuario