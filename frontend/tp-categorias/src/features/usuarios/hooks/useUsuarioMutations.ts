import {
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import {
  activarUsuario,
  desactivarUsuario,
} from "../api/usuariosService";

import {
  adminUsuariosQueryKey,
} from "./useAdminUsuariosQuery";


export function useActivarUsuarioMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (
      usuarioId: number,
    ) => activarUsuario(usuarioId),

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey:
          adminUsuariosQueryKey,
      });
    },
  });
}


export function useDesactivarUsuarioMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (
      usuarioId: number,
    ) => desactivarUsuario(usuarioId),

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey:
          adminUsuariosQueryKey,
      });
    },
  });
}