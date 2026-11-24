from collections.abc import Callable

from app.core.security import hash_password
from app.modules.usuarios.model import Usuario
from app.modules.usuarios.schema import (
    RolUsuario,
    UsuarioCreate,
    UsuarioListResponse,
    UsuarioPublic,
)
from app.modules.usuarios.unit_of_work import (
    UsuarioUnitOfWork,
)


class UsuarioNoEncontradoError(Exception):
    """El usuario no existe."""


class UsernameDuplicadoError(Exception):
    """El username ya está registrado."""


class EmailDuplicadoError(Exception):
    """El email ya está registrado."""


class AutodesactivacionNoPermitidaError(Exception):
    """El administrador no puede desactivarse a sí mismo."""


UsuarioUnitOfWorkFactory = Callable[
    [],
    UsuarioUnitOfWork,
]


class UsuarioService:
    def __init__(
        self,
        unit_of_work_factory:
            UsuarioUnitOfWorkFactory
            = UsuarioUnitOfWork,
    ) -> None:
        self.unit_of_work_factory = (
            unit_of_work_factory
        )

    def registrar_usuario(
        self,
        datos: UsuarioCreate,
    ) -> UsuarioPublic:
        with self.unit_of_work_factory() as uow:
            repository = (
                uow.obtener_usuarios_repository()
            )

            if repository.username_existe(
                datos.username
            ):
                raise UsernameDuplicadoError(
                    "El username ya está registrado"
                )

            if repository.email_existe(
                str(datos.email)
            ):
                raise EmailDuplicadoError(
                    "El email ya está registrado"
                )

            usuario = Usuario(
                username=datos.username,
                full_name=datos.full_name,
                email=str(datos.email),
                hashed_password=hash_password(
                    datos.password
                ),
                role="user",
                disabled=False,
            )

            repository.agregar(usuario)

            uow.flush()

            if usuario.id is None:
                raise RuntimeError(
                    "No se pudo generar el ID "
                    "del usuario"
                )

            resultado = (
                self._construir_usuario_publico(
                    usuario
                )
            )

        return resultado

    def obtener_usuario(
        self,
        usuario_id: int,
    ) -> UsuarioPublic:
        with self.unit_of_work_factory() as uow:
            repository = (
                uow.obtener_usuarios_repository()
            )

            usuario = repository.obtener_por_id(
                usuario_id
            )

            if usuario is None:
                raise UsuarioNoEncontradoError(
                    "Usuario no encontrado"
                )

            resultado = (
                self._construir_usuario_publico(
                    usuario
                )
            )

        return resultado

    def listar_usuarios(
        self,
        skip: int = 0,
        limit: int = 100,
        disabled: bool | None = None,
    ) -> UsuarioListResponse:
        with self.unit_of_work_factory() as uow:
            repository = (
                uow.obtener_usuarios_repository()
            )

            usuarios, total = repository.listar(
                skip=skip,
                limit=limit,
                disabled=disabled,
            )

            resultado = UsuarioListResponse(
                total=total,
                items=[
                    self._construir_usuario_publico(
                        usuario
                    )
                    for usuario in usuarios
                ],
            )

        return resultado

    def activar_usuario(
        self,
        usuario_id: int,
    ) -> UsuarioPublic:
        with self.unit_of_work_factory() as uow:
            repository = (
                uow.obtener_usuarios_repository()
            )

            usuario = repository.obtener_por_id(
                usuario_id
            )

            if usuario is None:
                raise UsuarioNoEncontradoError(
                    "Usuario no encontrado"
                )

            usuario.disabled = False

            repository.agregar(usuario)

            uow.flush()

            resultado = (
                self._construir_usuario_publico(
                    usuario
                )
            )

        return resultado

    def desactivar_usuario(
        self,
        usuario_id: int,
        administrador_id: int,
    ) -> UsuarioPublic:
        if usuario_id == administrador_id:
            raise (
                AutodesactivacionNoPermitidaError(
                    "No puede desactivar "
                    "su propia cuenta"
                )
            )

        with self.unit_of_work_factory() as uow:
            repository = (
                uow.obtener_usuarios_repository()
            )

            usuario = repository.obtener_por_id(
                usuario_id
            )

            if usuario is None:
                raise UsuarioNoEncontradoError(
                    "Usuario no encontrado"
                )

            usuario.disabled = True

            repository.agregar(usuario)

            uow.flush()

            resultado = (
                self._construir_usuario_publico(
                    usuario
                )
            )

        return resultado

    @staticmethod
    def _construir_usuario_publico(
        usuario: Usuario,
    ) -> UsuarioPublic:
        if usuario.id is None:
            raise RuntimeError(
                "El usuario todavía no "
                "fue persistido"
            )

        return UsuarioPublic(
            id=usuario.id,
            username=usuario.username,
            full_name=usuario.full_name,
            email=usuario.email,
            role=RolUsuario(usuario.role),
            disabled=usuario.disabled,
            created_at=usuario.created_at,
        )
