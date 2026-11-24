import { Link } from "react-router-dom";

import {
  obtenerMensajeApiError,
} from "../../../shared/api/errorHandler";

import ErrorState from "../../../shared/components/ErrorState";
import LoadingState from "../../../shared/components/LoadingState";

import ResumenCard from "../components/ResumenCard";

import {
  usePedidoResumenQuery,
} from "../hooks/usePedidoResumenQuery";


function formatearPrecio(
  value: string | number,
): string {
  const valueNumber = Number(value);

  if (!Number.isFinite(valueNumber)) {
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
  ).format(valueNumber);
}


function formatearFechaActual(): string {
  return new Intl.DateTimeFormat(
    "es-AR",
    {
      dateStyle: "full",
      timeStyle: "short",
    },
  ).format(new Date());
}


function AdminResumenPage() {
  const resumenQuery =
    usePedidoResumenQuery();


  if (resumenQuery.isPending) {
    return (
      <main className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <LoadingState
          message="Cargando resumen..."
        />
      </main>
    );
  }


  if (resumenQuery.isError) {
    return (
      <main className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <ErrorState
          message={obtenerMensajeApiError(
            resumenQuery.error,
            "No se pudo cargar el resumen.",
          )}
          onRetry={() => {
            void resumenQuery.refetch();
          }}
        />
      </main>
    );
  }


  const resumen = resumenQuery.data;

  const pedidosEnCurso =
    resumen.pendientes
    + resumen.en_preparacion;

  const totalHistorico =
    resumen.pendientes
    + resumen.en_preparacion
    + resumen.entregados
    + resumen.cancelados;


  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <header className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">
            Panel administrativo
          </p>

          <h1 className="mt-1 text-3xl font-bold text-slate-900">
            Resumen del negocio
          </h1>

          <p className="mt-2 max-w-2xl text-slate-600">
            Consultá el estado general de los pedidos y los
            ingresos generados por las ventas entregadas.
          </p>
        </div>

        <div className="flex flex-col items-start gap-2 sm:items-end">
          {resumenQuery.isFetching && (
            <span
              role="status"
              className="text-sm font-semibold text-blue-600"
            >
              Actualizando...
            </span>
          )}

          <button
            type="button"
            onClick={() => {
              void resumenQuery.refetch();
            }}
            disabled={resumenQuery.isFetching}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Actualizar resumen
          </button>
        </div>
      </header>


      <section
        aria-label="Indicadores de pedidos"
        className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-3"
      >
        <ResumenCard
          title="Pedidos pendientes"
          value={resumen.pendientes}
          description="Pedidos recibidos que todavía no comenzaron a prepararse."
          icon="⏳"
          variant="amber"
        />

        <ResumenCard
          title="En preparación"
          value={resumen.en_preparacion}
          description="Pedidos que actualmente están siendo preparados."
          icon="🛒"
          variant="blue"
        />

        <ResumenCard
          title="Pedidos entregados"
          value={resumen.entregados}
          description="Pedidos que completaron exitosamente todo el proceso."
          icon="✓"
          variant="green"
        />

        <ResumenCard
          title="Pedidos cancelados"
          value={resumen.cancelados}
          description="Pedidos cancelados cuyo stock fue restituido."
          icon="✕"
          variant="red"
        />

        <ResumenCard
          title="Pedidos de hoy"
          value={resumen.pedidos_hoy}
          description="Pedidos creados durante la jornada actual."
          icon="📅"
          variant="purple"
        />

        <ResumenCard
          title="Ingresos entregados"
          value={formatearPrecio(
            resumen.ingresos_entregados,
          )}
          description="Suma de los importes de pedidos con estado Entregado."
          icon="$"
          variant="slate"
        />
      </section>


      <section className="mt-8 grid gap-5 lg:grid-cols-3">
        <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Actividad de pedidos
              </h2>

              <p className="mt-2 text-sm text-slate-600">
                Resumen calculado a partir de todos los pedidos
                registrados.
              </p>
            </div>

            <Link
              to="/admin/pedidos"
              className="self-start rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              Administrar pedidos
            </Link>
          </div>


          <dl className="mt-7 grid gap-5 sm:grid-cols-3">
            <div className="rounded-xl bg-slate-50 p-4">
              <dt className="text-sm font-medium text-slate-600">
                En curso
              </dt>

              <dd className="mt-2 text-2xl font-bold text-slate-900">
                {pedidosEnCurso}
              </dd>
            </div>

            <div className="rounded-xl bg-slate-50 p-4">
              <dt className="text-sm font-medium text-slate-600">
                Finalizados
              </dt>

              <dd className="mt-2 text-2xl font-bold text-slate-900">
                {resumen.entregados
                  + resumen.cancelados}
              </dd>
            </div>

            <div className="rounded-xl bg-slate-50 p-4">
              <dt className="text-sm font-medium text-slate-600">
                Total histórico
              </dt>

              <dd className="mt-2 text-2xl font-bold text-slate-900">
                {totalHistorico}
              </dd>
            </div>
          </dl>
        </article>


        <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold text-slate-900">
            Accesos rápidos
          </h2>

          <nav className="mt-5 space-y-3">
            <Link
              to="/admin/categorias"
              className="flex items-center justify-between rounded-lg border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
            >
              Administrar categorías

              <span aria-hidden="true">
                →
              </span>
            </Link>

            <Link
              to="/admin/productos"
              className="flex items-center justify-between rounded-lg border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
            >
              Administrar productos

              <span aria-hidden="true">
                →
              </span>
            </Link>

            <Link
              to="/admin/usuarios"
              className="flex items-center justify-between rounded-lg border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
            >
              Administrar usuarios

              <span aria-hidden="true">
                →
              </span>
            </Link>
          </nav>
        </article>
      </section>


      <p className="mt-6 text-right text-xs text-slate-500">
        Última visualización:{" "}
        {formatearFechaActual()}
      </p>
    </main>
  );
}


export default AdminResumenPage;