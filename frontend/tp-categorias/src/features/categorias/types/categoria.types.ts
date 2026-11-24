export interface Categoria {
  id: number;
  nombre: string;
  descripcion: string | null;
  activo: boolean;
}


export interface CategoriaListResponse {
  total: number;
  items: Categoria[];
}


export interface CategoriaCreate {
  nombre: string;
  descripcion: string | null;
}


export interface CategoriaUpdate {
  nombre?: string;
  descripcion?: string | null;
}
