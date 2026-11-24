from typing import Literal

from sqlmodel import SQLModel


class HealthResponse(SQLModel):
    status: Literal["ok"]
    service: str


class DatabaseHealthResponse(SQLModel):
    status: Literal["ok", "error"]
    database: str