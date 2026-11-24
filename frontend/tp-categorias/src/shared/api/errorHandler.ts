import axios from "axios";


interface ApiErrorBody {
  detail?: unknown;
}


function obtenerDetalleValidacion(
  detail: unknown,
): string | null {
  if (!Array.isArray(detail)) {
    return null;
  }

  const mensajes = detail
    .map((item) => {
      if (
        typeof item === "object"
        && item !== null
        && "msg" in item
        && typeof item.msg === "string"
      ) {
        return item.msg;
      }

      return null;
    })
    .filter(
      (mensaje): mensaje is string =>
        mensaje !== null,
    );

  if (mensajes.length === 0) {
    return null;
  }

  return mensajes.join(". ");
}


export function obtenerMensajeApiError(
  error: unknown,
  mensajePredeterminado = (
    "No se pudo completar la operación."
  ),
): string {
  if (!axios.isAxiosError(error)) {
    return error instanceof Error
      ? error.message
      : mensajePredeterminado;
  }

  if (error.code === "ECONNABORTED") {
    return (
      "La solicitud tardó demasiado. "
      + "Intentá nuevamente."
    );
  }

  if (error.response === undefined) {
    return (
      "No se pudo conectar con el servidor. "
      + "Verificá que el backend esté iniciado."
    );
  }

  const data =
    error.response.data as
      | ApiErrorBody
      | undefined;

  if (
    data !== undefined
    && typeof data.detail === "string"
  ) {
    return data.detail;
  }

  const mensajeValidacion =
    obtenerDetalleValidacion(
      data?.detail,
    );

  if (mensajeValidacion !== null) {
    return mensajeValidacion;
  }

  switch (error.response.status) {
    case 400:
      return "La solicitud no es válida.";

    case 401:
      return (
        "La sesión no es válida o expiró."
      );

    case 403:
      return (
        "No tenés permisos para realizar "
        + "esta operación."
      );

    case 404:
      return "El recurso no fue encontrado.";

    case 409:
      return (
        "La operación entra en conflicto "
        + "con los datos existentes."
      );

    case 422:
      return (
        "Los datos enviados no son válidos."
      );

    case 500:
      return (
        "Ocurrió un error interno "
        + "en el servidor."
      );

    default:
      return mensajePredeterminado;
  }
}