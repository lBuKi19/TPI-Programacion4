import {
  useEffect,
  useState,
} from "react";

import {
  obtenerMensajeApiError,
} from "../../../shared/api/errorHandler";

import EmptyState from "../../../shared/components/EmptyState";
import ErrorState from "../../../shared/components/ErrorState";
import LoadingState from "../../../shared/components/LoadingState";

import {
  useAuthStore,
} from "../../../store/authStore";

import AdminUsuariosTable from "../components/AdminUsuariosTable";

import {
  useAdminUsuariosQuery,
} from "../hooks/useAdminUsuariosQuery";

import {
  useActivarUsuarioMutation,
  useDesactivarUsuarioMutation,
} from "../hooks/useUsuarioMutations";

import type {
  UsuarioAdmin,
} from "../types/usuario.types";


const USUARIOS_POR_PAGINA = 20;


type EstadoFiltro =
  | "todos"
  | "activos"
  | "desactivados";


function esEstadoFiltro(
  value: string,
): value is EstadoFiltro {
  return (
    value === "todos"
    || value === "activos"
    || value === "desactivados"
  );
}


function AdminUsuariosPage() {
  const currentUser = useAuthStore(
    (state) => state.user,
  );

  const [pagina, setPagina] =
    useState(0);

  const [
    estadoFiltro,
    setEstadoFiltro,
  ] = useState<EstadoFiltro>(
    "todos",
  );

  const [
    pageError,
    setPageError,
  ] = useState<string | null>(
    null,
  );

  const [
    usuarioMutandoId,
    setUsuarioMutandoId,
  ] = useState<number | null>(
    null,
  );


  let disabledFilter:
    boolean | undefined;

  if (estadoFiltro === "activos") {
    disabledFilter = false;
  } else if (
    estadoFiltro === "desactivados"
  ) {
    disabledFilter = true;
  } else {
    disabledFilter = undefined;
  }


  const usuariosQuery =
    useAdminUsuariosQuery({
      skip:
        pagina
        * USUARIOS_POR_PAGINA,

      limit:
        USUARIOS_POR_PAGINA,

      disabled:
        disabledFilter,
    });


  const activarMutation =
    useActivarUsuarioMutation();

  const desactivarMutation =
    useDesactivarUsuarioMutation();


  const isMutating =
    activarMutation.isPending
    || desactivarMutation.isPending;


  const usuarios =
    usuariosQuery.data?.items
    ?? [];

  const total =
    usuariosQuery.data?.total
    ?? 0;

  const totalPaginas = Math.ceil(
    total
    / USUARIOS_POR_PAGINA,
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


  async function handleActivate(
    usuario: UsuarioAdmin,
  ): Promise<void> {
    if (!usuario.disabled) {
      return;
    }

    const confirmado = window.confirm(
      `¿Querés activar la cuenta de ${usuario.full_name}?`,
    );

    if (!confirmado) {
      return;
    }

    setPageError(null);
    setUsuarioMutandoId(
      usuario.id,
    );

    try {
      await activarMutation.mutateAsync(
        usuario.id,
      );
    } catch (error: unknown) {
      setPageError(
        obtenerMensajeApiError(
          error,
          "No se pudo activar el usuario.",
        ),
      );
    } finally {
      setUsuarioMutandoId(null);
    }
  }


  async function handleDeactivate(
    usuario: UsuarioAdmin,
  ): Promise<void> {
    if (usuario.disabled) {
      return;
    }

    if (
      currentUser !== null
      && usuario.id === currentUser.id
    ) {
      setPageError(
        "No podés desactivar tu propia cuenta.",
      );

      return;
    }

    const confirmado = window.confirm(
      `¿Querés desactivar la cuenta de ${usuario.full_name}? La cuenta no podrá iniciar sesión.`,
    );

    if (!confirmado) {
      return;
    }

    setPageError(null);
    setUsuarioMutandoId(
      usuario.id,
    );

    try {
      await desactivarMutation.mutateAsync(
        usuario.id,
      );
    } catch (error: unknown) {
      setPageError(
        obtenerMensajeApiError(
          error,
          "No se pudo desactivar el usuario.",
        ),
      );
    } finally {
      setUsuarioMutandoId(null);
    }
  }


  function handleFiltroChange(
    value: string,
  ): void {
    if (!esEstadoFiltro(value)) {
      return;
    }

    setEstadoFiltro(value);
    setPagina(0);
    setPageError(null);
  }


  let queryError: string | null =
    null;

  if (usuariosQuery.isError) {
    queryError =
      obtenerMensajeApiError(
        usuariosQuery.error,
        "No se pudieron cargar los usuarios.",
      );
  }


  if (currentUser === null) {
    return null;
  }


  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <header className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">
            Panel administrativo
          </p>

          <h1 className="mt-1 text-3xl font-bold text-slate-900">
            Usuarios
          </h1>

          <p className="mt-2 max-w-2xl text-slate-600">
            Consultá las cuentas registradas y administrá
            el acceso a la plataforma.
          </p>
        </div>

        <button
          type="button"
          disabled={
            usuariosQuery.isFetching
          }
          onClick={() => {
            void usuariosQuery.refetch();
          }}
          className="self-start rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {usuariosQuery.isFetching
            ? "Actualizando..."
            : "Actualizar"}
        </button>
      </header>


      <section
        aria-label="Filtros de usuarios"
        className="mt-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
      >
        <div className="max-w-xs">
          <label
            htmlFor="usuario-estado-filter"
            className="block text-sm font-semibold text-slate-700"
          >
            Estado
          </label>

          <select
            id="usuario-estado-filter"
            value={estadoFiltro}
            onChange={(event) => {
              handleFiltroChange(
                event.currentTarget.value,
              );
            }}
            className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
          >
            <option value="todos">
              Todos
            </option>

            <option value="activos">
              Activos
            </option>

            <option value="desactivados">
              Desactivados
            </option>
          </select>
        </div>
      </section>


      {pageError !== null ? (
        <div
          role="alert"
          className="mt-6 rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-red-700"
        >
          {pageError}
        </div>
      ) : null}


      <section className="mt-8">
        <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-slate-600">
            Total de usuarios:{" "}

            <span className="font-bold text-slate-900">
              {total}
            </span>
          </p>

          {usuariosQuery.isFetching
          && !usuariosQuery.isPending ? (
            <span
              role="status"
              className="text-sm font-semibold text-blue-600"
            >
              Actualizando listado...
            </span>
          ) : null}
        </div>


        {queryError !== null ? (
          <ErrorState
            message={queryError}
            onRetry={() => {
              void usuariosQuery.refetch();
            }}
          />
        ) : null}


        {queryError === null
        && usuariosQuery.isPending ? (
          <LoadingState
            message="Cargando usuarios..."
          />
        ) : null}


        {queryError === null
        && !usuariosQuery.isPending
        && usuarios.length === 0 ? (
          <EmptyState
            title="No hay usuarios"
            description={
              estadoFiltro === "todos"
                ? "Todavía no hay usuarios registrados."
                : "No existen usuarios con el estado seleccionado."
            }
          />
        ) : null}


        {queryError === null
        && !usuariosQuery.isPending
        && usuarios.length > 0 ? (
          <>
            <AdminUsuariosTable
              usuarios={usuarios}
              currentUserId={
                currentUser.id
              }
              isMutating={
                isMutating
              }
              usuarioMutandoId={
                usuarioMutandoId
              }
              onActivate={(usuario) => {
                void handleActivate(
                  usuario,
                );
              }}
              onDeactivate={(usuario) => {
                void handleDeactivate(
                  usuario,
                );
              }}
            />


            {totalPaginas > 1 ? (
              <nav
                aria-label="Paginación de usuarios"
                className="mt-8 flex items-center justify-center gap-3"
              >
                <button
                  type="button"
                  disabled={
                    pagina === 0
                  }
                  onClick={() => {
                    setPagina(
                      Math.max(
                        0,
                        pagina - 1,
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
                      Math.min(
                        totalPaginas - 1,
                        pagina + 1,
                      ),
                    );
                  }}
                  className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Siguiente
                </button>
              </nav>
            ) : null}
          </>
        ) : null}
      </section>
    </main>
  );
}


export default AdminUsuariosPage;