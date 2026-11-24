export type RolUsuario =
  | "user"
  | "admin";


export interface UsuarioAuth {
  id: number;
  username: string;
  full_name: string;
  email: string;
  role: RolUsuario;
  disabled: boolean;
  created_at: string;
}


export interface LoginData {
  username: string;
  password: string;
}


export interface RegisterData {
  username: string;
  full_name: string;
  email: string;
  password: string;
}


export interface AuthMessage {
  message: string;
}
