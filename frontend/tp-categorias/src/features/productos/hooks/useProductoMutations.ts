import {
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import {
  actualizarProducto,
  actualizarStockProducto,
  crearProducto,
  eliminarProducto,
} from "../api/productosService";

import {
  productosQueryKey,
} from "./useProductosQuery";

import type {
  ProductoCreate,
  ProductoStockUpdate,
  ProductoUpdate,
} from "../types/producto.types";


interface ActualizarProductoVariables {
  productoId: number;
  datos: ProductoUpdate;
}


interface ActualizarStockVariables {
  productoId: number;
  datos: ProductoStockUpdate;
}


async function invalidarProductos(
  queryClient: ReturnType<
    typeof useQueryClient
  >,
): Promise<void> {
  await Promise.all([
    queryClient.invalidateQueries({
      queryKey: productosQueryKey,
    }),

    queryClient.invalidateQueries({
      queryKey: [
        "pedido-resumen",
      ],
    }),
  ]);
}


export function useCrearProductoMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (
      datos: ProductoCreate,
    ) => crearProducto(datos),

    onSuccess: async () => {
      await invalidarProductos(
        queryClient,
      );
    },
  });
}


export function useActualizarProductoMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (
      variables:
        ActualizarProductoVariables,
    ) =>
      actualizarProducto(
        variables.productoId,
        variables.datos,
      ),

    onSuccess: async () => {
      await invalidarProductos(
        queryClient,
      );
    },
  });
}


export function useActualizarStockMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (
      variables:
        ActualizarStockVariables,
    ) =>
      actualizarStockProducto(
        variables.productoId,
        variables.datos,
      ),

    onSuccess: async () => {
      await invalidarProductos(
        queryClient,
      );
    },
  });
}


export function useEliminarProductoMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (
      productoId: number,
    ) => eliminarProducto(productoId),

    onSuccess: async () => {
      await invalidarProductos(
        queryClient,
      );
    },
  });
}