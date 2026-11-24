import axiosInstance from "../../../shared/api/axiosInstance";

import type {
  AuthMessage,
  LoginData,
  RegisterData,
  UsuarioAuth,
} from "../types/auth.types";


const AUTH_URL = "/auth";


export async function registrarUsuario(
  datos: RegisterData,
): Promise<UsuarioAuth> {
  const response =
    await axiosInstance.post<UsuarioAuth>(
      `${AUTH_URL}/register`,
      datos,
    );

  return response.data;
}


export async function iniciarSesion(
  datos: LoginData,
): Promise<UsuarioAuth> {
  const formData = new URLSearchParams();

  formData.set(
    "username",
    datos.username.trim().toLowerCase(),
  );

  formData.set(
    "password",
    datos.password,
  );

  const response =
    await axiosInstance.post<UsuarioAuth>(
      `${AUTH_URL}/token`,
      formData,
      {
        headers: {
          "Content-Type":
            "application/x-www-form-urlencoded",
        },
      },
    );

  return response.data;
}


export async function obtenerSesionActual():
  Promise<UsuarioAuth> {
  const response =
    await axiosInstance.get<UsuarioAuth>(
      `${AUTH_URL}/me`,
    );

  return response.data;
}


export async function cerrarSesion():
  Promise<AuthMessage> {
  const response =
    await axiosInstance.post<AuthMessage>(
      `${AUTH_URL}/logout`,
    );

  return response.data;
}