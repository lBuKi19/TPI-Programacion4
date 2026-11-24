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
from app.modules.productos.schema import (
    ProductoCreate,
    ProductoDetailRead,
    ProductoListResponse,
    ProductoStockUpdate,
    ProductoUpdate,
)
from app.modules.productos.service import (
    CategoriaProductoNoEncontradaError,
    ProductoDuplicadoError,
    ProductoNoEncontradoError,
    ProductoService,
)


router = APIRouter(
    prefix="/productos",
    tags=["Productos"],
)


def get_producto_service() -> ProductoService:
    return ProductoService()


ProductoServiceDep = Annotated[
    ProductoService,
    Depends(get_producto_service),
]


@router.get(
    "",
    response_model=ProductoListResponse,
    status_code=status.HTTP_200_OK,
)
def listar_productos(
    service: ProductoServiceDep,
    skip: Annotated[
        int,
        Query(
            ge=0,
            description=(
                "Cantidad de productos que deben "
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
                "Cantidad máxima de productos "
                "devueltos"
            ),
        ),
    ] = 20,
    search: Annotated[
        str | None,
        Query(
            min_length=1,
            max_length=150,
            description=(
                "Búsqueda parcial por nombre"
            ),
        ),
    ] = None,
    categoria_id: Annotated[
        int | None,
        Query(
            gt=0,
            description=(
                "Filtrar por categoría"
            ),
        ),
    ] = None,
    disponible: Annotated[
        bool | None,
        Query(
            description=(
                "Filtrar por disponibilidad"
            ),
        ),
    ] = None,
) -> ProductoListResponse:
    return service.listar_productos(
        skip=skip,
        limit=limit,
        search=search,
        categoria_id=categoria_id,
        disponible=disponible,
    )


@router.get(
    "/{producto_id}",
    response_model=ProductoDetailRead,
    status_code=status.HTTP_200_OK,
    responses={
        status.HTTP_404_NOT_FOUND: {
            "description": (
                "El producto no existe "
                "o se encuentra inactivo"
            ),
        },
    },
)
def obtener_producto(
    producto_id: int,
    service: ProductoServiceDep,
) -> ProductoDetailRead:
    try:
        return service.obtener_producto(
            producto_id=producto_id,
        )

    except ProductoNoEncontradoError as error:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(error),
        ) from error


@router.post(
    "",
    response_model=ProductoDetailRead,
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
        status.HTTP_404_NOT_FOUND: {
            "description": (
                "La categoría indicada no existe "
                "o se encuentra inactiva"
            ),
        },
        status.HTTP_409_CONFLICT: {
            "description": (
                "Ya existe un producto "
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
def crear_producto(
    datos: ProductoCreate,
    service: ProductoServiceDep,
    _admin: AdminUserDep,
) -> ProductoDetailRead:
    try:
        return service.crear_producto(
            datos=datos,
        )

    except ProductoDuplicadoError as error:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=str(error),
        ) from error

    except (
        CategoriaProductoNoEncontradaError
    ) as error:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(error),
        ) from error


@router.put(
    "/{producto_id}",
    response_model=ProductoDetailRead,
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
                "El producto o la categoría "
                "no fueron encontrados"
            ),
        },
        status.HTTP_409_CONFLICT: {
            "description": (
                "Ya existe otro producto "
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
def actualizar_producto(
    producto_id: int,
    datos: ProductoUpdate,
    service: ProductoServiceDep,
    _admin: AdminUserDep,
) -> ProductoDetailRead:
    try:
        return service.actualizar_producto(
            producto_id=producto_id,
            datos=datos,
        )

    except ProductoNoEncontradoError as error:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(error),
        ) from error

    except (
        CategoriaProductoNoEncontradaError
    ) as error:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(error),
        ) from error

    except ProductoDuplicadoError as error:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=str(error),
        ) from error


@router.patch(
    "/{producto_id}/stock",
    response_model=ProductoDetailRead,
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
                "El producto no existe "
                "o se encuentra inactivo"
            ),
        },
        status.HTTP_422_UNPROCESSABLE_ENTITY: {
            "description": (
                "El stock o la disponibilidad "
                "no son válidos"
            ),
        },
    },
)
def actualizar_stock_producto(
    producto_id: int,
    datos: ProductoStockUpdate,
    service: ProductoServiceDep,
    _admin: AdminUserDep,
) -> ProductoDetailRead:
    try:
        return service.actualizar_stock(
            producto_id=producto_id,
            datos=datos,
        )

    except ProductoNoEncontradoError as error:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(error),
        ) from error


@router.delete(
    "/{producto_id}",
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
                "El producto no existe "
                "o ya se encuentra inactivo"
            ),
        },
    },
)
def eliminar_producto(
    producto_id: int,
    service: ProductoServiceDep,
    _admin: AdminUserDep,
) -> Response:
    try:
        service.eliminar_producto(
            producto_id=producto_id,
        )

    except ProductoNoEncontradoError as error:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(error),
        ) from error

    return Response(
        status_code=status.HTTP_204_NO_CONTENT,
    )