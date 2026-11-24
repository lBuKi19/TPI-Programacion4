import { useQuery } from "@tanstack/react-query";

import {
  obtenerResumenPedidos,
} from "../api/pedidosService";


export const pedidoResumenQueryKey = [
  "pedido-resumen",
] as const;


export function usePedidoResumenQuery() {
  return useQuery({
    queryKey: pedidoResumenQueryKey,

    queryFn: obtenerResumenPedidos,

    staleTime: 30_000,

    refetchInterval: 60_000,
  });
}