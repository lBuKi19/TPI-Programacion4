import axios, {
  type AxiosError,
} from "axios";

import {
  notifyUnauthorized,
} from "../../features/auth/authSessionController";


const axiosInstance = axios.create({
  baseURL:
    import.meta.env.VITE_API_URL
    ?? "http://localhost:8000/api/v1",

  timeout: 10_000,

  /*
   * Permite recibir y enviar la cookie HttpOnly
   * access_token entre Vite y FastAPI.
   */
  withCredentials: true,

  headers: {
    Accept: "application/json",
  },
});


function esEndpointAuthPublico(
  url: string | undefined,
): boolean {
  if (url === undefined) {
    return false;
  }

  return (
    url.includes("/api/v1/auth/token")
    || url.includes("/api/v1/auth/register")
    || url.includes("/api/v1/auth/me")
  );
}


axiosInstance.interceptors.response.use(
  (response) => response,

  (error: AxiosError) => {
    const status = error.response?.status;
    const url = error.config?.url;

    /*
     * No limpiamos el store por un 401 de login:
     * ese error significa credenciales incorrectas.
     *
     * Tampoco por /me, porque checkSession ya maneja
     * naturalmente la ausencia de una sesión.
     */
    if (
      status === 401
      && !esEndpointAuthPublico(url)
    ) {
      notifyUnauthorized();
    }

    return Promise.reject(error);
  },
);


export default axiosInstance;