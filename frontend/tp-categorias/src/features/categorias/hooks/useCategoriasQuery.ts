import {
  useQuery,
} from "@tanstack/react-query";

import {
  obtenerCategorias,
} from "../api/categoriasService";


interface UseCategoriasQueryParams {
  skip?: number;
  limit?: number;
  search?: string;
}


export const categoriasQueryKey = [
  "categorias",
] as const;


export function useCategoriasQuery({
  skip = 0,
  limit = 100,
  search = "",
}: UseCategoriasQueryParams = {}) {
  return useQuery({
    queryKey: [
      ...categoriasQueryKey,
      {
        skip,
        limit,
        search,
      },
    ],

    queryFn: () =>
      obtenerCategorias({
        skip,
        limit,
        search,
      }),

    staleTime: 5 * 60 * 1000,
  });
}