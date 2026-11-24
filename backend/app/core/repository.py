from typing import Generic, TypeVar

from sqlmodel import Session, SQLModel


ModelType = TypeVar(
    "ModelType",
    bound=SQLModel,
)


class BaseRepository(
    Generic[ModelType],
):
    def __init__(
        self,
        session: Session,
        model: type[ModelType],
    ) -> None:
        self.session = session
        self.model = model

    def obtener_por_id(
        self,
        entity_id: int,
    ) -> ModelType | None:
        return self.session.get(
            self.model,
            entity_id,
        )

    def agregar(
        self,
        entidad: ModelType,
    ) -> ModelType:
        self.session.add(entidad)

        return entidad

    def agregar_varios(
        self,
        entidades: list[ModelType],
    ) -> list[ModelType]:
        self.session.add_all(entidades)

        return entidades

    def eliminar(
        self,
        entidad: ModelType,
    ) -> None:
        self.session.delete(entidad)

    def flush(self) -> None:
        self.session.flush()

    def refresh(
        self,
        entidad: ModelType,
    ) -> None:
        self.session.refresh(entidad)