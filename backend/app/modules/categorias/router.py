from typing import Annotated

from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    Query,
    Response,
    status,
)

from app.core.deps import AdminUserDep
from app.modules.categorias.schema import (
    CategoriaCreate,
    CategoriaListResponse,
    CategoriaRead,
    CategoriaUpdate,
)
from app.modules.categorias.service import (
    CategoriaDuplicadaError,
    CategoriaNoEncontradaError,
    CategoriaService,
)


router = APIRouter(
    prefix="/categorias",
    tags=["Categorías"],
)


def get_categoria_service() -> CategoriaService:
    return CategoriaService()


CategoriaServiceDep = Annotated[
    CategoriaService,
    Depends(get_categoria_service),
]


@router.get(
    "",
    response_model=CategoriaListResponse,
    status_code=status.HTTP_200_OK,
)
def listar_categorias(
    service: CategoriaServiceDep,
    skip: Annotated[
        int,
        Query(
            ge=0,
            description=(
                "Cantidad de registros que deben "
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
                "Cantidad máxima de registros "
                "devueltos"
            ),
        ),
    ] = 20,
    search: Annotated[
        str | None,
        Query(
            min_length=1,
            max_length=100,
            description=(
                "Búsqueda parcial por nombre"
            ),
        ),
    ] = None,
) -> CategoriaListResponse:
    return service.listar_categorias(
        skip=skip,
        limit=limit,
        search=search,
    )


@router.get(
    "/{categoria_id}",
    response_model=CategoriaRead,
    status_code=status.HTTP_200_OK,
    responses={
        status.HTTP_404_NOT_FOUND: {
            "description": (
                "La categoría no existe "
                "o se encuentra inactiva"
            ),
        },
    },
)
def obtener_categoria(
    categoria_id: int,
    service: CategoriaServiceDep,
) -> CategoriaRead:
    try:
        return service.obtener_categoria(
            categoria_id=categoria_id,
        )

    except CategoriaNoEncontradaError as error:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(error),
        ) from error


@router.post(
    "",
    response_model=CategoriaRead,
    status_code=status.HTTP_201_CREATED,
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
        status.HTTP_409_CONFLICT: {
            "description": (
                "Ya existe una categoría "
                "con el mismo nombre"
            ),
        },
        status.HTTP_422_UNPROCESSABLE_ENTITY: {
            "description": (
                "Los datos enviados no son válidos"
            ),
        },
    },
)
def crear_categoria(
    datos: CategoriaCreate,
    service: CategoriaServiceDep,
    _admin: AdminUserDep,
) -> CategoriaRead:
    try:
        return service.crear_categoria(
            datos=datos,
        )

    except CategoriaDuplicadaError as error:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=str(error),
        ) from error


@router.put(
    "/{categoria_id}",
    response_model=CategoriaRead,
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
        status.HTTP_404_NOT_FOUND: {
            "description": (
                "La categoría no existe "
                "o se encuentra inactiva"
            ),
        },
        status.HTTP_409_CONFLICT: {
            "description": (
                "Ya existe otra categoría "
                "con el mismo nombre"
            ),
        },
        status.HTTP_422_UNPROCESSABLE_ENTITY: {
            "description": (
                "Los datos enviados no son válidos"
            ),
        },
    },
)
def actualizar_categoria(
    categoria_id: int,
    datos: CategoriaUpdate,
    service: CategoriaServiceDep,
    _admin: AdminUserDep,
) -> CategoriaRead:
    try:
        return service.actualizar_categoria(
            categoria_id=categoria_id,
            datos=datos,
        )

    except CategoriaNoEncontradaError as error:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(error),
        ) from error

    except CategoriaDuplicadaError as error:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=str(error),
        ) from error


@router.delete(
    "/{categoria_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    response_class=Response,
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
        status.HTTP_404_NOT_FOUND: {
            "description": (
                "La categoría no existe "
                "o ya se encuentra inactiva"
            ),
        },
    },
)
def eliminar_categoria(
    categoria_id: int,
    service: CategoriaServiceDep,
    _admin: AdminUserDep,
) -> Response:
    try:
        service.eliminar_categoria(
            categoria_id=categoria_id,
        )

    except CategoriaNoEncontradaError as error:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(error),
        ) from error

    return Response(
        status_code=status.HTTP_204_NO_CONTENT,
    )