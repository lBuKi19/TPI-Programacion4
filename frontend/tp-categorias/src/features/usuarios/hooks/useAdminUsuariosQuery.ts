import {
  keepPreviousData,
  useQuery,
} from "@tanstack/react-query";

import {
  obtenerUsuarios,
} from "../api/usuariosService";

import type {
  ObtenerUsuariosParams,
} from "../types/usuario.types";


export const adminUsuariosQueryKey = [
  "admin-usuarios",
] as const;


export function useAdminUsuariosQuery({
  skip = 0,
  limit = 100,
  disabled,
}: ObtenerUsuariosParams = {}) {
  return useQuery({
    queryKey: [
      ...adminUsuariosQueryKey,
      {
        skip,
        limit,
        disabled,
      },
    ],

    queryFn: () =>
      obtenerUsuarios({
        skip,
        limit,
        disabled,
      }),

    placeholderData:
      keepPreviousData,

    staleTime: 30_000,
  });
}
