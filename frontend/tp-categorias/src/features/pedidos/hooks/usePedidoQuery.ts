import {
  useQuery,
} from "@tanstack/react-query";

import {
  obtenerPedido,
} from "../api/pedidosService";


export function usePedidoQuery(
  pedidoId: number | null,
) {
  return useQuery({
    queryKey: [
      "pedido",
      pedidoId,
    ],

    queryFn: () => {
      if (pedidoId === null) {
        throw new Error(
          "No se indicó el pedido.",
        );
      }

      return obtenerPedido(
        pedidoId,
      );
    },

    enabled: pedidoId !== null,
    staleTime: 30_000,
  });
}