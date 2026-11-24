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


interface UsePedidosQueryParams {
  skip?: number;
  limit?: number;
  estado?: EstadoPedido;
}


export const pedidosQueryKey = [
  "pedidos",
] as const;


export function usePedidosQuery({
  skip = 0,
  limit = 20,
  estado,
}: UsePedidosQueryParams = {}) {
  return useQuery({
    queryKey: [
      ...pedidosQueryKey,
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