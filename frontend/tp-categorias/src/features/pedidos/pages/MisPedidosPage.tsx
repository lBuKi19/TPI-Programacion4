import {
  useEffect,
  useState,
} from "react";

import {
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import {
  useLocation,
} from "react-router-dom";

import {
  obtenerMensajeApiError,
} from "../../../shared/api/errorHandler";

import EmptyState from "../../../shared/components/EmptyState";
import ErrorState from "../../../shared/components/ErrorState";
import LoadingState from "../../../shared/components/LoadingState";

import {
  cancelarPedido,
} from "../api/pedidosService";

import PedidoDetailModal from "../components/PedidoDetailModal";
import PedidoEstadoBadge from "../components/PedidoEstadoBadge";

import {
  pedidosQueryKey,
  usePedidosQuery,
} from "../hooks/usePedidosQuery";

import {
  usePedidoQuery,
} from "../hooks/usePedidoQuery";

import type {
  Pedido,
} from "../types/pedido.types";


const PEDIDOS_POR_PAGINA = 10;


interface MisPedidosLocationState {
  pedidoCreadoId?: number;
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


function MisPedidosPage() {
  const location = useLocation();
  const queryClient = useQueryClient();

  const [pagina, setPagina] =
    useState(0);

  const [
    pedidoSeleccionadoId,
    setPedidoSeleccionadoId,
  ] = useState<number | null>(null);

  const [
    pageError,
    setPageError,
  ] = useState<string | null>(null);

  const locationState =
    location.state as
      | MisPedidosLocationState
      | null;


  const pedidosQuery = usePedidosQuery({
    skip:
      pagina
      * PEDIDOS_POR_PAGINA,

    limit:
      PEDIDOS_POR_PAGINA,
  });


  const pedidoDetailQuery =
    usePedidoQuery(
      pedidoSeleccionadoId,
    );


  const cancelarMutation = useMutation({
    mutationFn: cancelarPedido,

    onSuccess: async () => {
      setPageError(null);
      setPedidoSeleccionadoId(null);

      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: pedidosQueryKey,
        }),

        queryClient.invalidateQueries({
          queryKey: [
            "productos",
          ],
        }),

        queryClient.invalidateQueries({
          queryKey: [
            "pedido-resumen",
          ],
        }),
      ]);
    },
  });


  useEffect(() => {
    if (
      locationState?.pedidoCreadoId
      !== undefined
    ) {
      setPedidoSeleccionadoId(
        locationState.pedidoCreadoId,
      );
    }
  }, [
    locationState?.pedidoCreadoId,
  ]);


  const pedidos =
    pedidosQuery.data?.items
    ?? [];

  const total =
    pedidosQuery.data?.total
    ?? 0;

  const totalPaginas = Math.ceil(
    total / PEDIDOS_POR_PAGINA,
  );


  async function handleCancelar(
    pedido: Pedido,
  ): Promise<void> {
    if (
      pedido.estado
      !== "PENDIENTE"
    ) {
      return;
    }

    const confirmado = window.confirm(
      `¿Querés cancelar el pedido #${pedido.id}? El stock será restituido.`,
    );

    if (!confirmado) {
      return;
    }

    setPageError(null);

    try {
      await cancelarMutation.mutateAsync(
        pedido.id,
      );
    } catch (error) {
      setPageError(
        obtenerMensajeApiError(
          error,
          "No se pudo cancelar el pedido.",
        ),
      );
    }
  }


  function abrirDetalle(
    pedidoId: number,
  ): void {
    setPedidoSeleccionadoId(
      pedidoId,
    );
  }


  function cerrarDetalle(): void {
    setPedidoSeleccionadoId(null);
  }


  const mensajeQueryError =
    pedidosQuery.isError
      ? obtenerMensajeApiError(
          pedidosQuery.error,
          "No se pudieron cargar los pedidos.",
        )
      : null;

  const detalleError =
    pedidoDetailQuery.isError
      ? obtenerMensajeApiError(
          pedidoDetailQuery.error,
          "No se pudo cargar el detalle.",
        )
      : null;


  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">
          Tu cuenta
        </p>

        <h1 className="mt-1 text-3xl font-bold text-slate-900">
          Mis pedidos
        </h1>

        <p className="mt-2 text-slate-600">
          Consultá el estado y el detalle de tus compras.
        </p>
      </header>


      {locationState?.pedidoCreadoId
        !== undefined && (
        <div
          role="status"
          className="mb-6 rounded-xl border border-green-200 bg-green-50 px-5 py-4 text-green-800"
        >
          El pedido #
          {locationState.pedidoCreadoId}
          {" "}
          fue creado correctamente.
        </div>
      )}


      {pageError !== null && (
        <div
          role="alert"
          className="mb-6 rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-red-700"
        >
          {pageError}
        </div>
      )}


      {mensajeQueryError !== null ? (
        <ErrorState
          message={mensajeQueryError}
          onRetry={() => {
            void pedidosQuery.refetch();
          }}
        />
      ) : pedidosQuery.isPending ? (
        <LoadingState
          message="Cargando pedidos..."
        />
      ) : pedidos.length === 0 ? (
        <EmptyState
          title="Todavía no hiciste pedidos"
          description="Agregá productos al carrito y confirmá tu primera compra."
        />
      ) : (
        <>
          <div className="space-y-4">
            {pedidos.map(
              (pedido) => (
                <article
                  key={pedido.id}
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                >
                  <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-3">
                        <h2 className="text-xl font-bold text-slate-900">
                          Pedido #{pedido.id}
                        </h2>

                        <PedidoEstadoBadge
                          estado={pedido.estado}
                        />
                      </div>

                      <p className="mt-2 text-sm text-slate-600">
                        {formatearFecha(
                          pedido.created_at,
                        )}
                      </p>

                      <p className="mt-1 text-sm text-slate-600">
                        {pedido.direccion_entrega}
                      </p>
                    </div>


                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                      <p className="text-2xl font-bold text-blue-700">
                        {formatearPrecio(
                          pedido.total,
                        )}
                      </p>

                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            abrirDetalle(
                              pedido.id,
                            );
                          }}
                          className="rounded-lg border border-blue-300 px-4 py-2 text-sm font-semibold text-blue-700 transition hover:bg-blue-50"
                        >
                          Ver detalle
                        </button>

                        {pedido.estado
                          === "PENDIENTE" && (
                          <button
                            type="button"
                            disabled={
                              cancelarMutation
                                .isPending
                            }
                            onClick={() => {
                              void handleCancelar(
                                pedido,
                              );
                            }}
                            className="rounded-lg border border-red-300 px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {cancelarMutation
                              .isPending
                              ? "Cancelando..."
                              : "Cancelar"}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </article>
              ),
            )}
          </div>


          {totalPaginas > 1 && (
            <nav
              aria-label="Paginación de pedidos"
              className="mt-8 flex items-center justify-center gap-3"
            >
              <button
                type="button"
                disabled={pagina === 0}
                onClick={() => {
                  setPagina(
                    (actual) =>
                      Math.max(
                        0,
                        actual - 1,
                      ),
                  );
                }}
                className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Anterior
              </button>

              <span className="text-sm font-medium text-slate-600">
                Página {pagina + 1}
                {" de "}
                {totalPaginas}
              </span>

              <button
                type="button"
                disabled={
                  pagina
                  >= totalPaginas - 1
                }
                onClick={() => {
                  setPagina(
                    (actual) =>
                      Math.min(
                        totalPaginas - 1,
                        actual + 1,
                      ),
                  );
                }}
                className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Siguiente
              </button>
            </nav>
          )}
        </>
      )}


      <PedidoDetailModal
        isOpen={
          pedidoSeleccionadoId
          !== null
        }
        pedido={
          pedidoDetailQuery.data
        }
        isLoading={
          pedidoDetailQuery.isPending
          && pedidoSeleccionadoId
            !== null
        }
        error={detalleError}
        onClose={cerrarDetalle}
      />
    </main>
  );
}


export default MisPedidosPage;