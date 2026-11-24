import LoadingState from "../../../shared/components/LoadingState";

import PedidoEstadoBadge from "./PedidoEstadoBadge";

import type {
  PedidoDetalle,
} from "../types/pedido.types";


interface PedidoDetailModalProps {
  isOpen: boolean;
  pedido: PedidoDetalle | undefined;
  isLoading: boolean;
  error: string | null;
  onClose: () => void;
}


function formatearPrecio(
  value: string | number,
): string {
  return new Intl.NumberFormat(
    "es-AR",
    {
      style: "currency",
      currency: "ARS",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    },
  ).format(Number(value));
}


function formatearFecha(
  value: string,
): string {
  const fecha = new Date(value);

  if (Number.isNaN(fecha.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat(
    "es-AR",
    {
      dateStyle: "medium",
      timeStyle: "short",
    },
  ).format(fecha);
}


function PedidoDetailModal({
  isOpen,
  pedido,
  isLoading,
  error,
  onClose,
}: PedidoDetailModalProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <div
      role="presentation"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4"
      onMouseDown={(event) => {
        if (
          event.target
          === event.currentTarget
        ) {
          onClose();
        }
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="pedido-detail-title"
        className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl sm:p-8"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-blue-600">
              Detalle de compra
            </p>

            <h2
              id="pedido-detail-title"
              className="mt-1 text-2xl font-bold text-slate-900"
            >
              {pedido !== undefined
                ? `Pedido #${pedido.id}`
                : "Pedido"}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar detalle"
            className="rounded-lg px-3 py-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
          >
            ✕
          </button>
        </div>


        {isLoading ? (
          <LoadingState
            message="Cargando detalle..."
          />
        ) : error !== null ? (
          <div
            role="alert"
            className="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            {error}
          </div>
        ) : pedido === undefined ? (
          <p className="mt-6 text-slate-600">
            No se encontró el pedido.
          </p>
        ) : (
          <>
            <div className="mt-6 grid gap-4 rounded-xl bg-slate-50 p-5 sm:grid-cols-2">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Estado
                </p>

                <div className="mt-2">
                  <PedidoEstadoBadge
                    estado={pedido.estado}
                  />
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Fecha
                </p>

                <p className="mt-2 font-medium text-slate-900">
                  {formatearFecha(
                    pedido.created_at,
                  )}
                </p>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Forma de pago
                </p>

                <p className="mt-2 font-medium text-slate-900">
                  {pedido.forma_pago
                    === "EFECTIVO"
                    ? "Efectivo"
                    : "Transferencia"}
                </p>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Total
                </p>

                <p className="mt-2 text-xl font-bold text-blue-700">
                  {formatearPrecio(
                    pedido.total,
                  )}
                </p>
              </div>

              <div className="sm:col-span-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Dirección
                </p>

                <p className="mt-2 text-slate-900">
                  {pedido.direccion_entrega}
                </p>
              </div>

              {pedido.notas !== null && (
                <div className="sm:col-span-2">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Notas
                  </p>

                  <p className="mt-2 whitespace-pre-wrap text-slate-900">
                    {pedido.notas}
                  </p>
                </div>
              )}
            </div>


            <div className="mt-7">
              <h3 className="text-lg font-bold text-slate-900">
                Productos
              </h3>

              <ul className="mt-4 divide-y divide-slate-200 rounded-xl border border-slate-200">
                {pedido.detalles.map(
                  (detalle) => (
                    <li
                      key={detalle.id}
                      className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div>
                        <p className="font-semibold text-slate-900">
                          {detalle.nombre_producto}
                        </p>

                        <p className="mt-1 text-sm text-slate-600">
                          {detalle.cantidad}
                          {" × "}
                          {formatearPrecio(
                            detalle.precio_unitario,
                          )}
                        </p>
                      </div>

                      <p className="font-bold text-slate-900">
                        {formatearPrecio(
                          detalle.subtotal,
                        )}
                      </p>
                    </li>
                  ),
                )}
              </ul>
            </div>
          </>
        )}
      </section>
    </div>
  );
}


export default PedidoDetailModal;