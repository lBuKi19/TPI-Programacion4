import {
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import {
  actualizarCategoria,
  crearCategoria,
  eliminarCategoria,
} from "../api/categoriasService";

import {
  categoriasQueryKey,
} from "./useCategoriasQuery";

import type {
  CategoriaCreate,
  CategoriaUpdate,
} from "../types/categoria.types";


interface ActualizarCategoriaVariables {
  categoriaId: number;
  datos: CategoriaUpdate;
}


export function useCrearCategoriaMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (
      datos: CategoriaCreate,
    ) => crearCategoria(datos),

    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: categoriasQueryKey,
        }),

        queryClient.invalidateQueries({
          queryKey: ["productos"],
        }),
      ]);
    },
  });
}


export function useActualizarCategoriaMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      categoriaId,
      datos,
    }: ActualizarCategoriaVariables) =>
      actualizarCategoria(
        categoriaId,
        datos,
      ),

    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: categoriasQueryKey,
        }),

        queryClient.invalidateQueries({
          queryKey: ["productos"],
        }),
      ]);
    },
  });
}


export function useEliminarCategoriaMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (
      categoriaId: number,
    ) => eliminarCategoria(categoriaId),

    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: categoriasQueryKey,
        }),

        queryClient.invalidateQueries({
          queryKey: ["productos"],
        }),
      ]);
    },
  });
}