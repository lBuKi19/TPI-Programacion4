import { useState } from "react";

import { obtenerMensajeApiError } from "../../../shared/api/errorHandler";
import EmptyState from "../../../shared/components/EmptyState";
import ErrorState from "../../../shared/components/ErrorState";
import LoadingState from "../../../shared/components/LoadingState";

import CategoriaFormModal from "../components/CategoriaFormModal";
import CategoriasTable from "../components/CategoriasTable";

import {
  useActualizarCategoriaMutation,
  useCrearCategoriaMutation,
  useEliminarCategoriaMutation,
} from "../hooks/useCategoriaMutations";
import { useCategoriasQuery } from "../hooks/useCategoriasQuery";

import type {
  Categoria,
  CategoriaCreate,
  CategoriaUpdate,
} from "../types/categoria.types";


function AdminCategoriasPage() {
  const [search, setSearch] = useState("");
  const [modalAbierto, setModalAbierto] = useState(false);

  const [categoriaSeleccionada, setCategoriaSeleccionada] =
    useState<Categoria | null>(null);

  const [modalError, setModalError] =
    useState<string | null>(null);

  const [pageError, setPageError] =
    useState<string | null>(null);


  const categoriasQuery = useCategoriasQuery({
    skip: 0,
    limit: 100,
    search,
  });

  const crearMutation = useCrearCategoriaMutation();
  const actualizarMutation =
    useActualizarCategoriaMutation();
  const eliminarMutation =
    useEliminarCategoriaMutation();


  const isMutating =
    crearMutation.isPending
    || actualizarMutation.isPending
    || eliminarMutation.isPending;

  const categorias =
    categoriasQuery.data?.items ?? [];

  const total =
    categoriasQuery.data?.total ?? 0;


  function abrirModalCrear(): void {
    setCategoriaSeleccionada(null);
    setModalError(null);
    setPageError(null);
    setModalAbierto(true);
  }


  function abrirModalEditar(
    categoria: Categoria,
  ): void {
    setCategoriaSeleccionada(categoria);
    setModalError(null);
    setPageError(null);
    setModalAbierto(true);
  }


  function cerrarModal(): void {
    if (isMutating) {
      return;
    }

    setModalAbierto(false);
    setCategoriaSeleccionada(null);
    setModalError(null);
  }


  async function guardarCategoria(
    datos: CategoriaCreate,
  ): Promise<void> {
    setModalError(null);

    try {
      if (categoriaSeleccionada === null) {
        await crearMutation.mutateAsync(datos);
      } else {
        const cambios: CategoriaUpdate = {
          nombre: datos.nombre,
          descripcion: datos.descripcion,
        };

        await actualizarMutation.mutateAsync({
          categoriaId: categoriaSeleccionada.id,
          datos: cambios,
        });
      }

      setModalAbierto(false);
      setCategoriaSeleccionada(null);
      setModalError(null);
    } catch (error: unknown) {
      const mensaje =
        categoriaSeleccionada === null
          ? "No se pudo crear la categoría."
          : "No se pudo actualizar la categoría.";

      setModalError(
        obtenerMensajeApiError(
          error,
          mensaje,
        ),
      );
    }
  }


  async function eliminarCategoriaSeleccionada(
    categoria: Categoria,
  ): Promise<void> {
    const confirmado = window.confirm(
      `¿Querés dar de baja la categoría "${categoria.nombre}"? Los productos asociados no se desactivarán automáticamente.`,
    );

    if (!confirmado) {
      return;
    }

    setPageError(null);

    try {
      await eliminarMutation.mutateAsync(
        categoria.id,
      );
    } catch (error: unknown) {
      setPageError(
        obtenerMensajeApiError(
          error,
          "No se pudo eliminar la categoría.",
        ),
      );
    }
  }


  let queryError: string | null = null;

  if (categoriasQuery.isError) {
    queryError = obtenerMensajeApiError(
      categoriasQuery.error,
      "No se pudieron cargar las categorías.",
    );
  }


  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <header className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">
            Panel administrativo
          </p>

          <h1 className="mt-1 text-3xl font-bold text-slate-900">
            Categorías
          </h1>

          <p className="mt-2 max-w-2xl text-slate-600">
            Creá, editá y administrá las categorías visibles en
            el catálogo.
          </p>
        </div>

        <button
          type="button"
          onClick={abrirModalCrear}
          disabled={isMutating}
          className="self-start rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
        >
          Nueva categoría
        </button>
      </header>


      <section
        aria-label="Búsqueda de categorías"
        className="mt-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
      >
        <div className="max-w-xl">
          <label
            htmlFor="admin-category-search"
            className="block text-sm font-semibold text-slate-700"
          >
            Buscar por nombre
          </label>

          <div className="mt-2 flex gap-3">
            <input
              id="admin-category-search"
              type="search"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
              }}
              placeholder="Ejemplo: bebidas"
              className="min-w-0 flex-1 rounded-lg border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            />

            {search.length > 0 ? (
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                }}
                className="rounded-lg border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
              >
                Limpiar
              </button>
            ) : null}
          </div>
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
            Total de categorías:{" "}
            <span className="font-bold text-slate-900">
              {total}
            </span>
          </p>

          {categoriasQuery.isFetching
          && !categoriasQuery.isPending ? (
            <span
              role="status"
              className="text-sm font-semibold text-blue-600"
            >
              Actualizando...
            </span>
          ) : null}
        </div>


        {queryError !== null ? (
          <ErrorState
            message={queryError}
            onRetry={() => {
              void categoriasQuery.refetch();
            }}
          />
        ) : null}


        {queryError === null
        && categoriasQuery.isPending ? (
          <LoadingState message="Cargando categorías..." />
        ) : null}


        {queryError === null
        && !categoriasQuery.isPending
        && categorias.length === 0 ? (
          <EmptyState
            title="No hay categorías"
            description={
              search.trim().length > 0
                ? "No existen categorías activas que coincidan con la búsqueda."
                : "Creá la primera categoría para organizar el catálogo."
            }
          />
        ) : null}


        {queryError === null
        && !categoriasQuery.isPending
        && categorias.length > 0 ? (
          <CategoriasTable
            categorias={categorias}
            isMutating={isMutating}
            onEdit={abrirModalEditar}
            onDelete={(categoria) => {
              void eliminarCategoriaSeleccionada(
                categoria,
              );
            }}
          />
        ) : null}
      </section>


      <CategoriaFormModal
        isOpen={modalAbierto}
        categoria={categoriaSeleccionada}
        isSubmitting={isMutating}
        error={modalError}
        onClose={cerrarModal}
        onSubmit={guardarCategoria}
      />
    </main>
  );
}


export default AdminCategoriasPage;