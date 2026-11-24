import {
  keepPreviousData,
  useQuery,
} from "@tanstack/react-query";

import {
  obtenerPedidos,
} from "../api/pedidosService";

import type {
  EstadoPedido,
} from "../types/pedido.types";


interface UseAdminPedidosQueryParams {
  skip?: number;
  limit?: number;
  estado?: EstadoPedido;
}


export const adminPedidosQueryKey = [
  "pedidos",
  "admin",
] as const;


export function useAdminPedidosQuery({
  skip = 0,
  limit = 20,
  estado,
}: UseAdminPedidosQueryParams = {}) {
  return useQuery({
    queryKey: [
      ...adminPedidosQueryKey,
      {
        skip,
        limit,
        estado,
      },
    ],

    queryFn: () =>
      obtenerPedidos({
        skip,
        limit,
        estado,
      }),

    placeholderData: keepPreviousData,
    staleTime: 15_000,
  });
}