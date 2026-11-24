from contextlib import asynccontextmanager
from typing import AsyncIterator

from fastapi import FastAPI, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text

from app.core.config import settings
from app.core.database import (
    create_db_and_tables,
    engine,
)
from app.modules.auth.router import (
    router as auth_router,
)
from app.modules.categorias.router import (
    router as categorias_router,
)
from app.modules.pedidos.router import (
    router as pedidos_router,
)
from app.modules.productos.router import (
    router as productos_router,
)
from app.modules.usuarios.router import (
    router as usuarios_router,
)


API_PREFIX = "/api/v1"


@asynccontextmanager
async def lifespan(
    _app: FastAPI,
) -> AsyncIterator[None]:
    """
    Registra y crea las tablas inexistentes al iniciar.

    El seed se ejecuta independientemente mediante:

        python -m app.db.seed
    """
    create_db_and_tables()

    yield


app = FastAPI(
    title="Food Store API",
    description=(
        "API REST del Trabajo Práctico Integrador "
        "de Programación IV."
    ),
    version="1.0.0",
    lifespan=lifespan,
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        settings.frontend_origin,
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(
    auth_router,
    prefix=API_PREFIX,
)

app.include_router(
    usuarios_router,
    prefix=API_PREFIX,
)

app.include_router(
    categorias_router,
    prefix=API_PREFIX,
)

app.include_router(
    productos_router,
    prefix=API_PREFIX,
)

app.include_router(
    pedidos_router,
    prefix=API_PREFIX,
)


@app.get(
    "/health",
    tags=["Health"],
    status_code=status.HTTP_200_OK,
)
def health_check() -> dict[str, str]:
    return {
        "status": "ok",
        "service": "food-store-api",
    }


@app.get(
    "/health/db",
    tags=["Health"],
    status_code=status.HTTP_200_OK,
)
def database_health_check() -> dict[str, str]:
    with engine.connect() as connection:
        connection.execute(
            text("SELECT 1")
        )

    return {
        "status": "ok",
        "database": "connected",
    }