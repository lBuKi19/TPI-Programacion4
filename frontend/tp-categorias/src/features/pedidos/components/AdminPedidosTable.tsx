import PedidoEstadoBadge from "./PedidoEstadoBadge";

import type {
  Pedido,
} from "../types/pedido.types";


interface AdminPedidosTableProps {
  pedidos: Pedido[];
  isMutating: boolean;

  onView: (
    pedidoId: number,
  ) => void;

  onPrepare: (
    pedido: Pedido,
  ) => void;

  onDeliver: (
    pedido: Pedido,
  ) => void;

  onCancel: (
    pedido: Pedido,
  ) => void;
}


function formatearPrecio(
  value: string | number,
): string {
  const amount = Number(value);

  if (!Number.isFinite(amount)) {
    return "$ 0,00";
  }

  return new Intl.NumberFormat(
    "es-AR",
    {
      style: "currency",
      currency: "ARS",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    },
  ).format(amount);
}


function formatearFecha(
  value: string,
): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat(
    "es-AR",
    {
      dateStyle: "short",
      timeStyle: "short",
    },
  ).format(date);
}


function AdminPedidosTable({
  pedidos,
  isMutating,
  onView,
  onPrepare,
  onDeliver,
  onCancel,
}: AdminPedidosTableProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th
                scope="col"
                className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500"
              >
                Pedido
              </th>

              <th
                scope="col"
                className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500"
              >
                Usuario
              </th>

              <th
                scope="col"
                className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500"
              >
                Fecha
              </th>

              <th
                scope="col"
                className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500"
              >
                Total
              </th>

              <th
                scope="col"
                className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500"
              >
                Estado
              </th>

              <th
                scope="col"
                className="px-5 py-4 text-right text-xs font-bold uppercase tracking-wider text-slate-500"
              >
                Acciones
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-200">
            {pedidos.map((pedido) => {
              const puedePreparar =
                pedido.estado === "PENDIENTE";

              const puedeEntregar =
                pedido.estado
                === "EN_PREPARACION";

              const puedeCancelar =
                pedido.estado === "PENDIENTE"
                || pedido.estado
                  === "EN_PREPARACION";

              return (
                <tr
                  key={pedido.id}
                  className="transition hover:bg-slate-50"
                >
                  <td className="whitespace-nowrap px-5 py-4">
                    <span className="font-bold text-slate-900">
                      #{pedido.id}
                    </span>
                  </td>

                  <td className="whitespace-nowrap px-5 py-4">
                    <span className="text-sm font-medium text-slate-700">
                      Usuario #{pedido.usuario_id}
                    </span>
                  </td>

                  <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-600">
                    {formatearFecha(
                      pedido.created_at,
                    )}
                  </td>

                  <td className="whitespace-nowrap px-5 py-4 font-bold text-slate-900">
                    {formatearPrecio(
                      pedido.total,
                    )}
                  </td>

                  <td className="whitespace-nowrap px-5 py-4">
                    <PedidoEstadoBadge
                      estado={pedido.estado}
                    />
                  </td>

                  <td className="px-5 py-4">
                    <div className="flex flex-wrap justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          onView(pedido.id);
                        }}
                        className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                      >
                        Ver detalle
                      </button>

                      {puedePreparar && (
                        <button
                          type="button"
                          disabled={isMutating}
                          onClick={() => {
                            onPrepare(pedido);
                          }}
                          className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          Iniciar preparación
                        </button>
                      )}

                      {puedeEntregar && (
                        <button
                          type="button"
                          disabled={isMutating}
                          onClick={() => {
                            onDeliver(pedido);
                          }}
                          className="rounded-lg bg-green-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          Marcar entregado
                        </button>
                      )}

                      {puedeCancelar && (
                        <button
                          type="button"
                          disabled={isMutating}
                          onClick={() => {
                            onCancel(pedido);
                          }}
                          className="rounded-lg border border-red-300 px-3 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          Cancelar
                        </button>
                      )}

                      {!puedePreparar
                        && !puedeEntregar
                        && !puedeCancelar && (
                        <span className="px-3 py-2 text-sm text-slate-500">
                          Sin acciones
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}


export default AdminPedidosTable;