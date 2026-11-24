import {
  keepPreviousData,
  useQuery,
} from "@tanstack/react-query";

import {
  obtenerProductos,
} from "../api/productosService";

import type {
  ObtenerProductosParams,
} from "../types/producto.types";


export const productosQueryKey = [
  "productos",
] as const;


export function useProductosQuery({
  skip = 0,
  limit = 12,
  search = "",
  categoriaId = null,
  disponible,
}: ObtenerProductosParams = {}) {
  return useQuery({
    queryKey: [
      ...productosQueryKey,
      {
        skip,
        limit,
        search,
        categoriaId,
        disponible,
      },
    ],

    queryFn: () =>
      obtenerProductos({
        skip,
        limit,
        search,
        categoriaId,
        disponible,
      }),

    placeholderData:
      keepPreviousData,

    staleTime: 30_000,
  });
}