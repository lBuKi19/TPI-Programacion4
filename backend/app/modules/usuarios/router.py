from typing import Annotated

from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    Query,
    status,
)

from app.core.deps import AdminUserDep
from app.modules.usuarios.schema import (
    UsuarioListResponse,
    UsuarioPublic,
)
from app.modules.usuarios.service import (
    AutodesactivacionNoPermitidaError,
    UsuarioNoEncontradoError,
    UsuarioService,
)


router = APIRouter(
    prefix="/admin/usuarios",
    tags=["Usuarios"],
)


def get_usuario_service() -> UsuarioService:
    return UsuarioService()


UsuarioServiceDep = Annotated[
    UsuarioService,
    Depends(get_usuario_service),
]


@router.get(
    "",
    response_model=UsuarioListResponse,
    status_code=status.HTTP_200_OK,
)
def listar_usuarios(
    service: UsuarioServiceDep,
    _admin: AdminUserDep,
    skip: Annotated[
        int,
        Query(ge=0),
    ] = 0,
    limit: Annotated[
        int,
        Query(
            ge=1,
            le=100,
        ),
    ] = 100,
    disabled: Annotated[
        bool | None,
        Query(),
    ] = None,
) -> UsuarioListResponse:
    return service.listar_usuarios(
        skip=skip,
        limit=limit,
        disabled=disabled,
    )


@router.patch(
    "/{usuario_id}/activar",
    response_model=UsuarioPublic,
    status_code=status.HTTP_200_OK,
)
def activar_usuario(
    usuario_id: int,
    service: UsuarioServiceDep,
    _admin: AdminUserDep,
) -> UsuarioPublic:
    try:
        return service.activar_usuario(
            usuario_id
        )

    except UsuarioNoEncontradoError as error:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(error),
        ) from error


@router.patch(
    "/{usuario_id}/desactivar",
    response_model=UsuarioPublic,
    status_code=status.HTTP_200_OK,
)
def desactivar_usuario(
    usuario_id: int,
    service: UsuarioServiceDep,
    admin: AdminUserDep,
) -> UsuarioPublic:
    try:
        return service.desactivar_usuario(
            usuario_id=usuario_id,
            administrador_id=admin.id,
        )

    except UsuarioNoEncontradoError as error:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(error),
        ) from error

    except (
        AutodesactivacionNoPermitidaError
    ) as error:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=str(error),
        ) from error