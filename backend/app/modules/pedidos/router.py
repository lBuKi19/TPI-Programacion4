from typing import Annotated

from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    Query,
    status,
)

from app.core.deps import (
    AdminUserDep,
    CurrentUserDep,
)
from app.modules.pedidos.schema import (
    EstadoPedido,
    PedidoCreate,
    PedidoDetailRead,
    PedidoEstadoUpdate,
    PedidoListResponse,
    PedidoResumenRead,
)
from app.modules.pedidos.service import (
    CancelacionNoPermitidaError,
    PedidoAjenoError,
    PedidoNoEncontradoError,
    PedidoService,
    ProductoHistoricoNoEncontradoError,
    ProductoNoDisponibleError,
    ProductoPedidoNoEncontradoError,
    StockInsuficienteError,
    TransicionEstadoInvalidaError,
)
from app.modules.usuarios.schema import RolUsuario


router = APIRouter(
    prefix="/pedidos",
    tags=["Pedidos"],
)


def get_pedido_service() -> PedidoService:
    return PedidoService()


PedidoServiceDep = Annotated[
    PedidoService,
    Depends(get_pedido_service),
]


@router.post(
    "",
    response_model=PedidoDetailRead,
    status_code=status.HTTP_201_CREATED,
    responses={
        status.HTTP_400_BAD_REQUEST: {
            "description": (
                "Producto no disponible "
                "o stock insuficiente"
            ),
        },
        status.HTTP_401_UNAUTHORIZED: {
            "description": (
                "El usuario no está autenticado"
            ),
        },
        status.HTTP_404_NOT_FOUND: {
            "description": (
                "Uno o más productos no existen "
                "o se encuentran inactivos"
            ),
        },
        status.HTTP_422_UNPROCESSABLE_ENTITY: {
            "description": (
                "Los datos enviados no son válidos"
            ),
        },
    },
)
def crear_pedido(
    datos: PedidoCreate,
    service: PedidoServiceDep,
    usuario: CurrentUserDep,
) -> PedidoDetailRead:
    try:
        return service.crear_pedido(
            datos=datos,
            usuario_id=usuario.id,
        )

    except (
        ProductoNoDisponibleError,
        StockInsuficienteError,
    ) as error:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(error),
        ) from error

    except (
        ProductoPedidoNoEncontradoError
    ) as error:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(error),
        ) from error


@router.get(
    "",
    response_model=PedidoListResponse,
    status_code=status.HTTP_200_OK,
    responses={
        status.HTTP_401_UNAUTHORIZED: {
            "description": (
                "El usuario no está autenticado"
            ),
        },
    },
)
def listar_pedidos(
    service: PedidoServiceDep,
    usuario: CurrentUserDep,
    skip: Annotated[
        int,
        Query(
            ge=0,
            description=(
                "Cantidad de pedidos que deben "
                "omitirse"
            ),
        ),
    ] = 0,
    limit: Annotated[
        int,
        Query(
            ge=1,
            le=100,
            description=(
                "Cantidad máxima de pedidos "
                "devueltos"
            ),
        ),
    ] = 20,
    estado: Annotated[
        EstadoPedido | None,
        Query(
            description=(
                "Filtrar pedidos por estado"
            ),
        ),
    ] = None,
) -> PedidoListResponse:
    es_admin = ( usuario.role == RolUsuario.ADMIN)

    return service.listar_pedidos(
        usuario_id=usuario.id,
        es_admin=es_admin,
        skip=skip,
        limit=limit,
        estado=estado,
    )


@router.get(
    "/resumen",
    response_model=PedidoResumenRead,
    status_code=status.HTTP_200_OK,
    responses={
        status.HTTP_401_UNAUTHORIZED: {
            "description": (
                "El usuario no está autenticado"
            ),
        },
        status.HTTP_403_FORBIDDEN: {
            "description": (
                "El usuario no tiene rol admin"
            ),
        },
    },
)
def obtener_resumen_pedidos(
    service: PedidoServiceDep,
    _admin: AdminUserDep,
) -> PedidoResumenRead:
    return service.obtener_resumen()


@router.get(
    "/{pedido_id}",
    response_model=PedidoDetailRead,
    status_code=status.HTTP_200_OK,
    responses={
        status.HTTP_401_UNAUTHORIZED: {
            "description": (
                "El usuario no está autenticado"
            ),
        },
        status.HTTP_403_FORBIDDEN: {
            "description": (
                "El pedido pertenece a otro usuario"
            ),
        },
        status.HTTP_404_NOT_FOUND: {
            "description": (
                "El pedido no existe"
            ),
        },
    },
)
def obtener_pedido(
    pedido_id: int,
    service: PedidoServiceDep,
    usuario: CurrentUserDep,
) -> PedidoDetailRead:
    try:
        return service.obtener_pedido(
            pedido_id=pedido_id,
            usuario_id=usuario.id,
            es_admin=(
                usuario.role == RolUsuario.ADMIN
            ),
        )

    except PedidoNoEncontradoError as error:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(error),
        ) from error

    except PedidoAjenoError as error:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=str(error),
        ) from error


@router.patch(
    "/{pedido_id}/estado",
    response_model=PedidoDetailRead,
    status_code=status.HTTP_200_OK,
    responses={
        status.HTTP_400_BAD_REQUEST: {
            "description": (
                "La transición de estado "
                "no está permitida"
            ),
        },
        status.HTTP_401_UNAUTHORIZED: {
            "description": (
                "El usuario no está autenticado"
            ),
        },
        status.HTTP_403_FORBIDDEN: {
            "description": (
                "El usuario no tiene rol admin"
            ),
        },
        status.HTTP_404_NOT_FOUND: {
            "description": (
                "El pedido no existe"
            ),
        },
        status.HTTP_422_UNPROCESSABLE_ENTITY: {
            "description": (
                "El estado enviado no es válido"
            ),
        },
    },
)
def actualizar_estado_pedido(
    pedido_id: int,
    datos: PedidoEstadoUpdate,
    service: PedidoServiceDep,
    _admin: AdminUserDep,
) -> PedidoDetailRead:
    try:
        return service.actualizar_estado(
            pedido_id=pedido_id,
            datos=datos,
        )

    except PedidoNoEncontradoError as error:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(error),
        ) from error

    except TransicionEstadoInvalidaError as error:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(error),
        ) from error


@router.patch(
    "/{pedido_id}/cancelar",
    response_model=PedidoDetailRead,
    status_code=status.HTTP_200_OK,
    responses={
        status.HTTP_400_BAD_REQUEST: {
            "description": (
                "El pedido no puede cancelarse "
                "en su estado actual"
            ),
        },
        status.HTTP_401_UNAUTHORIZED: {
            "description": (
                "El usuario no está autenticado"
            ),
        },
        status.HTTP_403_FORBIDDEN: {
            "description": (
                "El pedido pertenece a otro usuario"
            ),
        },
        status.HTTP_404_NOT_FOUND: {
            "description": (
                "El pedido no existe"
            ),
        },
        status.HTTP_500_INTERNAL_SERVER_ERROR: {
            "description": (
                "No se pudo restituir el stock "
                "por una inconsistencia de datos"
            ),
        },
    },
)
def cancelar_pedido(
    pedido_id: int,
    service: PedidoServiceDep,
    usuario: CurrentUserDep,
) -> PedidoDetailRead:
    try:
        return service.cancelar_pedido(
            pedido_id=pedido_id,
            usuario_id=usuario.id,
            es_admin=(
                usuario.role == RolUsuario.ADMIN
            ),
        )

    except PedidoNoEncontradoError as error:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(error),
        ) from error

    except PedidoAjenoError as error:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=str(error),
        ) from error

    except (
        CancelacionNoPermitidaError,
        TransicionEstadoInvalidaError,
    ) as error:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(error),
        ) from error

    except (
        ProductoHistoricoNoEncontradoError
    ) as error:
        raise HTTPException(
            status_code=(
                status.HTTP_500_INTERNAL_SERVER_ERROR
            ),
            detail=str(error),
        ) from error