interface ApiErrorResponse {
  detail?: string;
}

export async function obtenerMensajeError(
  response: Response,
): Promise<string> {
  try {
    const data =
      (await response.json()) as ApiErrorResponse;

    if (typeof data.detail === "string") {
      return data.detail;
    }

    if (Array.isArray(data.detail)) {
      return "Los datos enviados no son válidos.";
    }
  } catch {
    // La respuesta puede no contener JSON.
  }

  return `Error ${response.status}: ${response.statusText}`;
}