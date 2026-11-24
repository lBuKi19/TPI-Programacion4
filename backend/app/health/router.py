from typing import Annotated

from fastapi import (
    APIRouter,
    Depends,
    status,
)
from fastapi.responses import JSONResponse
from sqlalchemy import text
from sqlalchemy.exc import SQLAlchemyError
from sqlmodel import Session

from app.core.database import get_session
from app.health.schema import (
    DatabaseHealthResponse,
    HealthResponse,
)


router = APIRouter(
    prefix="/health",
    tags=["Health"],
)


SessionDep = Annotated[
    Session,
    Depends(get_session),
]


@router.get(
    "/",
    response_model=HealthResponse,
    status_code=status.HTTP_200_OK,
)
def health_check() -> HealthResponse:
    return HealthResponse(
        status="ok",
        service="api",
    )


@router.get(
    "/db",
    response_model=DatabaseHealthResponse,
    responses={
        status.HTTP_503_SERVICE_UNAVAILABLE: {
            "model": DatabaseHealthResponse,
            "description": "La base de datos no está disponible",
        },
    },
)
def database_health_check(
    session: SessionDep,
) -> DatabaseHealthResponse | JSONResponse:
    try:
        session.execute(
            text("SELECT 1")
        ).one()

        return DatabaseHealthResponse(
            status="ok",
            database="postgresql",
        )

    except SQLAlchemyError:
        session.rollback()

        return JSONResponse(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            content={
                "status": "error",
                "database": "postgresql",
            },
        )