import type {
  Categoria,
} from "../../categorias/types/categoria.types";


export interface Producto {
  id: number;
  nombre: string;
  descripcion: string | null;
  precio_base: string;
  imagen_url: string | null;
  stock: number;
  disponible: boolean;
  activo: boolean;
  categoria_id: number;
  categoria: Categoria;
}


export interface ProductoListResponse {
  total: number;
  items: Producto[];
}


export interface ProductoCreate {
  nombre: string;
  descripcion: string | null;
  precio_base: string;
  imagen_url: string | null;
  stock: number;
  disponible: boolean;
  categoria_id: number;
}


export interface ProductoUpdate {
  nombre?: string;
  descripcion?: string | null;
  precio_base?: string;
  imagen_url?: string | null;
  categoria_id?: number;
}


export interface ProductoStockUpdate {
  stock?: number;
  disponible?: boolean;
}


export interface ObtenerProductosParams {
  skip?: number;
  limit?: number;
  search?: string;
  categoriaId?: number | null;
  disponible?: boolean;
}