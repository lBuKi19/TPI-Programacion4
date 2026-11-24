import axiosInstance from "../../../shared/api/axiosInstance";

import type {
  ObtenerUsuariosParams,
  UsuarioAdmin,
  UsuarioListResponse,
} from "../types/usuario.types";


const ADMIN_USUARIOS_URL =
  "/admin/usuarios";


export async function obtenerUsuarios({
  skip = 0,
  limit = 100,
  disabled,
}: ObtenerUsuariosParams = {}): Promise<UsuarioListResponse> {
  const response =
    await axiosInstance.get<
      UsuarioListResponse
    >(
      ADMIN_USUARIOS_URL,
      {
        params: {
          skip,
          limit,

          ...(disabled !== undefined
            ? {
                disabled,
              }
            : {}),
        },
      },
    );

  return response.data;
}


export async function activarUsuario(
  usuarioId: number,
): Promise<UsuarioAdmin> {
  const response =
    await axiosInstance.patch<UsuarioAdmin>(
      `${ADMIN_USUARIOS_URL}/${usuarioId}/activar`,
    );

  return response.data;
}


export async function desactivarUsuario(
  usuarioId: number,
): Promise<UsuarioAdmin> {
  const response =
    await axiosInstance.patch<UsuarioAdmin>(
      `${ADMIN_USUARIOS_URL}/${usuarioId}/desactivar`,
    );

  return response.data;
}