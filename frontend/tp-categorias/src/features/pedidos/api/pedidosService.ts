import axiosInstance from "../../../shared/api/axiosInstance";

import type {
  EstadoPedido,
  PedidoCreate,
  PedidoDetalle,
  PedidoListResponse,
  PedidoResumen,
} from "../types/pedido.types";


const PEDIDOS_URL = "/pedidos";


interface ObtenerPedidosParams {
  skip?: number;
  limit?: number;
  estado?: EstadoPedido;
}


export async function crearPedido(
  datos: PedidoCreate,
): Promise<PedidoDetalle> {
  const response =
    await axiosInstance.post<PedidoDetalle>(
      PEDIDOS_URL,
      datos,
    );

  return response.data;
}


export async function obtenerPedidos({
  skip = 0,
  limit = 20,
  estado,
}: ObtenerPedidosParams = {}): Promise<PedidoListResponse> {
  const response =
    await axiosInstance.get<
      PedidoListResponse
    >(
      PEDIDOS_URL,
      {
        params: {
          skip,
          limit,

          ...(estado !== undefined
            ? {
                estado,
              }
            : {}),
        },
      },
    );

  return response.data;
}


export async function obtenerPedido(
  pedidoId: number,
): Promise<PedidoDetalle> {
  const response =
    await axiosInstance.get<PedidoDetalle>(
      `${PEDIDOS_URL}/${pedidoId}`,
    );

  return response.data;
}


export async function cancelarPedido(
  pedidoId: number,
): Promise<PedidoDetalle> {
  const response =
    await axiosInstance.patch<PedidoDetalle>(
      `${PEDIDOS_URL}/${pedidoId}/cancelar`,
    );

  return response.data;
}


export async function actualizarEstadoPedido(
  pedidoId: number,
  estado: EstadoPedido,
): Promise<PedidoDetalle> {
  const response =
    await axiosInstance.patch<PedidoDetalle>(
      `${PEDIDOS_URL}/${pedidoId}/estado`,
      {
        estado,
      },
    );

  return response.data;
}


export async function obtenerResumenPedidos():
  Promise<PedidoResumen> {
  const response =
    await axiosInstance.get<PedidoResumen>(
      `${PEDIDOS_URL}/resumen`,
    );

  return response.data;
}