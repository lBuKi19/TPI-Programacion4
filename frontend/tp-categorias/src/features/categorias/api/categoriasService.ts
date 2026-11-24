import axiosInstance from "../../../shared/api/axiosInstance";

import type {
  Categoria,
  CategoriaCreate,
  CategoriaListResponse,
  CategoriaUpdate,
} from "../types/categoria.types";


const CATEGORIAS_URL = "/categorias";


interface ObtenerCategoriasParams {
  skip?: number;
  limit?: number;
  search?: string;
}


export async function obtenerCategorias({
  skip = 0,
  limit = 100,
  search = "",
}: ObtenerCategoriasParams = {}): Promise<CategoriaListResponse> {
  const searchNormalizado =
    search.trim();

  const response =
    await axiosInstance.get<
      CategoriaListResponse
    >(
      CATEGORIAS_URL,
      {
        params: {
          skip,
          limit,

          ...(searchNormalizado
            ? {
                search: searchNormalizado,
              }
            : {}),
        },
      },
    );

  return response.data;
}


export async function obtenerCategoria(
  categoriaId: number,
): Promise<Categoria> {
  const response =
    await axiosInstance.get<Categoria>(
      `${CATEGORIAS_URL}/${categoriaId}`,
    );

  return response.data;
}


export async function crearCategoria(
  datos: CategoriaCreate,
): Promise<Categoria> {
  const response =
    await axiosInstance.post<Categoria>(
      CATEGORIAS_URL,
      datos,
    );

  return response.data;
}


export async function actualizarCategoria(
  categoriaId: number,
  datos: CategoriaUpdate,
): Promise<Categoria> {
  const response =
    await axiosInstance.put<Categoria>(
      `${CATEGORIAS_URL}/${categoriaId}`,
      datos,
    );

  return response.data;
}


export async function eliminarCategoria(
  categoriaId: number,
): Promise<void> {
  await axiosInstance.delete(
    `${CATEGORIAS_URL}/${categoriaId}`,
  );
}