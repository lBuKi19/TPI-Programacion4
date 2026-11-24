export type RolUsuario =
  | "user"
  | "admin";


export interface UsuarioAdmin {
  id: number;
  username: string;
  full_name: string;
  email: string;
  role: RolUsuario;
  disabled: boolean;
  created_at: string;
}


export interface UsuarioListResponse {
  total: number;
  items: UsuarioAdmin[];
}


export interface ObtenerUsuariosParams {
  skip?: number;
  limit?: number;
  disabled?: boolean;
}