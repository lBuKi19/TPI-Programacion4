import {
  useEffect,
  useState,
} from "react";

import {
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import {
  obtenerMensajeApiError,
} from "../../../shared/api/errorHandler";

import EmptyState from "../../../shared/components/EmptyState";
import ErrorState from "../../../shared/components/ErrorState";
import LoadingState from "../../../shared/components/LoadingState";

import {
  actualizarEstadoPedido,
  cancelarPedido,
} from "../api/pedidosService";

import AdminPedidosTable from "../components/AdminPedidosTable";
import PedidoDetailModal from "../components/PedidoDetailModal";

import {
  adminPedidosQueryKey,
  useAdminPedidosQuery,
} from "../hooks/useAdminPedidosQuery";

import {
  usePedidoQuery,
} from "../hooks/usePedidoQuery";

import type {
  EstadoPedido,
  Pedido,
} from "../types/pedido.types";


const PEDIDOS_POR_PAGINA = 15;


interface ActualizarEstadoVariables {
  pedidoId: number;
  estado: EstadoPedido;
}


function AdminPedidosPage() {
  const queryClient = useQueryClient();

  const [pagina, setPagina] =
    useState(0);

  const [
    estadoFiltro,
    setEstadoFiltro,
  ] = useState<EstadoPedido | undefined>(
    undefined,
  );

  const [
    pedidoSeleccionadoId,
    setPedidoSeleccionadoId,
  ] = useState<number | null>(null);

  const [
    pageError,
    setPageError,
  ] = useState<string | null>(null);


  const pedidosQuery =
    useAdminPedidosQuery({
      skip:
        pagina
        * PEDIDOS_POR_PAGINA,

      limit:
        PEDIDOS_POR_PAGINA,

      estado:
        estadoFiltro,
    });


  const pedidoDetailQuery =
    usePedidoQuery(
      pedidoSeleccionadoId,
    );


  async function invalidarDatos(
    pedidoId?: number,
  ): Promise<void> {
    const invalidations = [
      queryClient.invalidateQueries({
        queryKey: adminPedidosQueryKey,
      }),

      queryClient.invalidateQueries({
        queryKey: ["pedidos"],
      }),

      queryClient.invalidateQueries({
        queryKey: ["pedido-resumen"],
      }),
    ];

    if (pedidoId !== undefined) {
      invalidations.push(
        queryClient.invalidateQueries({
          queryKey: [
            "pedido",
            pedidoId,
          ],
        }),
      );
    }

    await Promise.all(invalidations);
  }


  const actualizarEstadoMutation =
    useMutation({
      mutationFn: ({
        pedidoId,
        estado,
      }: ActualizarEstadoVariables) =>
        actualizarEstadoPedido(
          pedidoId,
          estado,
        ),

      onSuccess: async (pedido) => {
        setPageError(null);

        await invalidarDatos(
          pedido.id,
        );
      },
    });


  const cancelarMutation = useMutation({
    mutationFn: cancelarPedido,

    onSuccess: async (pedido) => {
      setPageError(null);

      await Promise.all([
        invalidarDatos(
          pedido.id,
        ),

        queryClient.invalidateQueries({
          queryKey: ["productos"],
        }),
      ]);
    },
  });


  const isMutating =
    actualizarEstadoMutation.isPending
    || cancelarMutation.isPending;


  const pedidos =
    pedidosQuery.data?.items
    ?? [];

  const total =
    pedidosQuery.data?.total
    ?? 0;

  const totalPaginas = Math.ceil(
    total / PEDIDOS_POR_PAGINA,
  );


  useEffect(() => {
    if (
      totalPaginas > 0
      && pagina >= totalPaginas
    ) {
      setPagina(
        totalPaginas - 1,
      );
    }
  }, [
    pagina,
    totalPaginas,
  ]);


  async function handlePrepare(
    pedido: Pedido,
  ): Promise<void> {
    if (
      pedido.estado !== "PENDIENTE"
    ) {
      return;
    }

    const confirmado = window.confirm(
      `¿Querés iniciar la preparación del pedido #${pedido.id}?`,
    );

    if (!confirmado) {
      return;
    }

    setPageError(null);

    try {
      await actualizarEstadoMutation.mutateAsync({
        pedidoId: pedido.id,
        estado: "EN_PREPARACION",
      });
    } catch (error) {
      setPageError(
        obtenerMensajeApiError(
          error,
          "No se pudo iniciar la preparación.",
        ),
      );
    }
  }


  async function handleDeliver(
    pedido: Pedido,
  ): Promise<void> {
    if (
      pedido.estado
      !== "EN_PREPARACION"
    ) {
      return;
    }

    const confirmado = window.confirm(
      `¿Querés marcar el pedido #${pedido.id} como entregado?`,
    );

    if (!confirmado) {
      return;
    }

    setPageError(null);

    try {
      await actualizarEstadoMutation.mutateAsync({
        pedidoId: pedido.id,
        estado: "ENTREGADO",
      });
    } catch (error) {
      setPageError(
        obtenerMensajeApiError(
          error,
          "No se pudo marcar el pedido como entregado.",
        ),
      );
    }
  }


  async function handleCancel(
    pedido: Pedido,
  ): Promise<void> {
    const cancelable =
      pedido.estado === "PENDIENTE"
      || pedido.estado
        === "EN_PREPARACION";

    if (!cancelable) {
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


  function handleFilterChange(
    value: string,
  ): void {
    setEstadoFiltro(
      value
        ? value as EstadoPedido
        : undefined,
    );

    setPagina(0);
    setPageError(null);
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
      <header className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">
            Panel administrativo
          </p>

          <h1 className="mt-1 text-3xl font-bold text-slate-900">
            Pedidos
          </h1>

          <p className="mt-2 max-w-2xl text-slate-600">
            Consultá los pedidos, avanzá su preparación
            y gestioná las cancelaciones.
          </p>
        </div>

        <button
          type="button"
          disabled={pedidosQuery.isFetching}
          onClick={() => {
            void pedidosQuery.refetch();
          }}
          className="self-start rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {pedidosQuery.isFetching
            ? "Actualizando..."
            : "Actualizar"}
        </button>
      </header>


      <section
        aria-label="Filtros de pedidos"
        className="mt-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
      >
        <div className="max-w-xs">
          <label
            htmlFor="pedido-estado-filter"
            className="block text-sm font-semibold text-slate-700"
          >
            Estado
          </label>

          <select
            id="pedido-estado-filter"
            value={estadoFiltro ?? ""}
            onChange={(event) => {
              handleFilterChange(
                event.target.value,
              );
            }}
            className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
          >
            <option value="">
              Todos los estados
            </option>

            <option value="PENDIENTE">
              Pendiente
            </option>

            <option value="EN_PREPARACION">
              En preparación
            </option>

            <option value="ENTREGADO">
              Entregado
            </option>

            <option value="CANCELADO">
              Cancelado
            </option>
          </select>
        </div>
      </section>


      {pageError !== null && (
        <div
          role="alert"
          className="mt-6 rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-red-700"
        >
          {pageError}
        </div>
      )}


      <section className="mt-8">
        <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-slate-600">
            Total de pedidos:{" "}

            <span className="font-bold text-slate-900">
              {total}
            </span>
          </p>

          {pedidosQuery.isFetching
            && !pedidosQuery.isPending && (
              <span
                role="status"
                className="text-sm font-semibold text-blue-600"
              >
                Actualizando listado...
              </span>
            )}
        </div>


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
            title="No hay pedidos"
            description={
              estadoFiltro !== undefined
                ? (
                  "No existen pedidos con el estado seleccionado."
                )
                : (
                  "Todavía no se registraron pedidos."
                )
            }
          />
        ) : (
          <>
            <AdminPedidosTable
              pedidos={pedidos}
              isMutating={isMutating}
              onView={abrirDetalle}
              onPrepare={(pedido) => {
                void handlePrepare(pedido);
              }}
              onDeliver={(pedido) => {
                void handleDeliver(pedido);
              }}
              onCancel={(pedido) => {
                void handleCancel(pedido);
              }}
            />


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
      </section>


      <PedidoDetailModal
        isOpen={
          pedidoSeleccionadoId
          !== null
        }
        pedido={
          pedidoDetailQuery.data
        }
        isLoading={
          pedidoSeleccionadoId
            !== null
          && pedidoDetailQuery.isPending
        }
        error={detalleError}
        onClose={cerrarDetalle}
      />
    </main>
  );
}


export default AdminPedidosPage;