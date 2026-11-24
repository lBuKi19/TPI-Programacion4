from collections.abc import Callable

from app.core.security import verify_password
from app.modules.usuarios.model import Usuario
from app.modules.usuarios.schema import (
    RolUsuario,
    UsuarioPublic,
)
from app.modules.usuarios.unit_of_work import (
    UsuarioUnitOfWork,
)


class CredencialesInvalidasError(Exception):
    """El username o la contraseña son incorrectos."""


class CuentaDesactivadaError(Exception):
    """La cuenta está desactivada."""


class UsuarioSesionNoEncontradoError(Exception):
    """El usuario indicado por el token ya no existe."""


UsuarioUnitOfWorkFactory = Callable[
    [],
    UsuarioUnitOfWork,
]


class AuthService:
    def __init__(
        self,
        unit_of_work_factory:
            UsuarioUnitOfWorkFactory
            = UsuarioUnitOfWork,
    ) -> None:
        self.unit_of_work_factory = (
            unit_of_work_factory
        )

    def autenticar_usuario(
        self,
        username: str,
        password: str,
    ) -> UsuarioPublic:
        username_normalizado = (
            username.strip().lower()
        )

        with self.unit_of_work_factory() as uow:
            repository = (
                uow.obtener_usuarios_repository()
            )

            usuario = (
                repository.obtener_por_username(
                    username_normalizado
                )
            )

            if usuario is None:
                raise CredencialesInvalidasError(
                    "Username o contraseña incorrectos"
                )

            if not verify_password(
                password,
                usuario.hashed_password,
            ):
                raise CredencialesInvalidasError(
                    "Username o contraseña incorrectos"
                )

            if usuario.disabled:
                raise CuentaDesactivadaError(
                    "Cuenta de usuario desactivada"
                )

            resultado = (
                self._construir_usuario_publico(
                    usuario
                )
            )

        return resultado

    def obtener_usuario_actual(
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
                raise (
                    UsuarioSesionNoEncontradoError(
                        "Usuario no encontrado"
                    )
                )

            if usuario.disabled:
                raise CuentaDesactivadaError(
                    "Cuenta de usuario desactivada"
                )

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
                "El usuario no está persistido"
            )

        try:
            role = RolUsuario(usuario.role)
        except ValueError as error:
            raise RuntimeError(
                "El usuario tiene un rol inválido "
                f"en la base de datos: {usuario.role}"
            ) from error

        return UsuarioPublic(
            id=usuario.id,
            username=usuario.username,
            full_name=usuario.full_name,
            email=usuario.email,
            role=role,
            disabled=usuario.disabled,
            created_at=usuario.created_at,
        )