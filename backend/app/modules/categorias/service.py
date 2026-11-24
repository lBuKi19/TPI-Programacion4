from collections.abc import Callable

from app.modules.categorias.model import Categoria
from app.modules.categorias.schema import (
    CategoriaCreate,
    CategoriaListResponse,
    CategoriaRead,
    CategoriaUpdate,
)
from app.modules.categorias.unit_of_work import (
    CategoriaUnitOfWork,
)


class CategoriaNoEncontradaError(Exception):
    """La categoría no existe o se encuentra inactiva."""


class CategoriaDuplicadaError(Exception):
    """Ya existe una categoría con el mismo nombre."""


CategoriaUnitOfWorkFactory = Callable[
    [],
    CategoriaUnitOfWork,
]


class CategoriaService:
    def __init__(
        self,
        unit_of_work_factory:
            CategoriaUnitOfWorkFactory
            = CategoriaUnitOfWork,
    ) -> None:
        self.unit_of_work_factory = (
            unit_of_work_factory
        )

    def listar_categorias(
        self,
        skip: int = 0,
        limit: int = 100,
        search: str | None = None,
    ) -> CategoriaListResponse:
        with self.unit_of_work_factory() as uow:
            repository = (
                uow.obtener_categorias_repository()
            )

            categorias, total = (
                repository.listar_activas(
                    skip=skip,
                    limit=limit,
                    search=search,
                )
            )

            items = [
                self._construir_categoria_read(
                    categoria
                )
                for categoria in categorias
            ]

            resultado = CategoriaListResponse(
                total=total,
                items=items,
            )

        return resultado

    def obtener_categoria(
        self,
        categoria_id: int,
    ) -> CategoriaRead:
        with self.unit_of_work_factory() as uow:
            repository = (
                uow.obtener_categorias_repository()
            )

            categoria = (
                repository.obtener_activa_por_id(
                    categoria_id
                )
            )

            if categoria is None:
                raise CategoriaNoEncontradaError(
                    "Categoría no encontrada"
                )

            resultado = (
                self._construir_categoria_read(
                    categoria
                )
            )

        return resultado

    def crear_categoria(
        self,
        datos: CategoriaCreate,
    ) -> CategoriaRead:
        with self.unit_of_work_factory() as uow:
            repository = (
                uow.obtener_categorias_repository()
            )

            if repository.nombre_existe(
                datos.nombre
            ):
                raise CategoriaDuplicadaError(
                    "Ya existe una categoría "
                    "con ese nombre"
                )

            categoria = Categoria(
                nombre=datos.nombre,
                descripcion=datos.descripcion,
                activo=True,
            )

            repository.agregar(
                categoria
            )

            uow.flush()

            if categoria.id is None:
                raise RuntimeError(
                    "No se pudo generar el ID "
                    "de la categoría"
                )

            resultado = (
                self._construir_categoria_read(
                    categoria
                )
            )

        return resultado

    def actualizar_categoria(
        self,
        categoria_id: int,
        datos: CategoriaUpdate,
    ) -> CategoriaRead:
        with self.unit_of_work_factory() as uow:
            repository = (
                uow.obtener_categorias_repository()
            )

            categoria = (
                repository.obtener_activa_por_id(
                    categoria_id
                )
            )

            if categoria is None:
                raise CategoriaNoEncontradaError(
                    "Categoría no encontrada"
                )

            cambios = datos.model_dump(
                exclude_unset=True,
            )

            nuevo_nombre = cambios.get(
                "nombre"
            )

            if (
                isinstance(nuevo_nombre, str)
                and repository.nombre_existe(
                    nombre=nuevo_nombre,
                    excluir_categoria_id=(
                        categoria_id
                    ),
                )
            ):
                raise CategoriaDuplicadaError(
                    "Ya existe otra categoría "
                    "con ese nombre"
                )

            for campo, valor in cambios.items():
                setattr(
                    categoria,
                    campo,
                    valor,
                )

            repository.agregar(
                categoria
            )

            uow.flush()

            resultado = (
                self._construir_categoria_read(
                    categoria
                )
            )

        return resultado

    def eliminar_categoria(
        self,
        categoria_id: int,
    ) -> None:
        with self.unit_of_work_factory() as uow:
            repository = (
                uow.obtener_categorias_repository()
            )

            categoria = (
                repository.obtener_activa_por_id(
                    categoria_id
                )
            )

            if categoria is None:
                raise CategoriaNoEncontradaError(
                    "Categoría no encontrada"
                )

            categoria.activo = False

            repository.agregar(
                categoria
            )

            uow.flush()

    @staticmethod
    def _construir_categoria_read(
        categoria: Categoria,
    ) -> CategoriaRead:
        if categoria.id is None:
            raise RuntimeError(
                "La categoría todavía no "
                "fue persistida"
            )

        return CategoriaRead(
            id=categoria.id,
            nombre=categoria.nombre,
            descripcion=(
                categoria.descripcion
            ),
            activo=categoria.activo,
        )