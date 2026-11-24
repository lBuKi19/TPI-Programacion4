import axiosInstance from "../../../shared/api/axiosInstance";

import type {
  ObtenerProductosParams,
  Producto,
  ProductoCreate,
  ProductoListResponse,
  ProductoStockUpdate,
  ProductoUpdate,
} from "../types/producto.types";


const PRODUCTOS_URL = "/productos";


export async function obtenerProductos({
  skip = 0,
  limit = 12,
  search = "",
  categoriaId = null,
  disponible,
}: ObtenerProductosParams = {}): Promise<ProductoListResponse> {
  const searchNormalizado =
    search.trim();

  const response =
    await axiosInstance.get<
      ProductoListResponse
    >(
      PRODUCTOS_URL,
      {
        params: {
          skip,
          limit,

          ...(searchNormalizado
            ? {
                search: searchNormalizado,
              }
            : {}),

          ...(categoriaId !== null
            ? {
                categoria_id: categoriaId,
              }
            : {}),

          ...(disponible !== undefined
            ? {
                disponible,
              }
            : {}),
        },
      },
    );

  return response.data;
}


export async function obtenerProducto(
  productoId: number,
): Promise<Producto> {
  const response =
    await axiosInstance.get<Producto>(
      `${PRODUCTOS_URL}/${productoId}`,
    );

  return response.data;
}


export async function crearProducto(
  datos: ProductoCreate,
): Promise<Producto> {
  const response =
    await axiosInstance.post<Producto>(
      PRODUCTOS_URL,
      datos,
    );

  return response.data;
}


export async function actualizarProducto(
  productoId: number,
  datos: ProductoUpdate,
): Promise<Producto> {
  const response =
    await axiosInstance.put<Producto>(
      `${PRODUCTOS_URL}/${productoId}`,
      datos,
    );

  return response.data;
}


export async function actualizarStockProducto(
  productoId: number,
  datos: ProductoStockUpdate,
): Promise<Producto> {
  const response =
    await axiosInstance.patch<Producto>(
      `${PRODUCTOS_URL}/${productoId}/stock`,
      datos,
    );

  return response.data;
}


export async function eliminarProducto(
  productoId: number,
): Promise<void> {
  await axiosInstance.delete(
    `${PRODUCTOS_URL}/${productoId}`,
  );
}