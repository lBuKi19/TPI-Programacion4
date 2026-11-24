import { useState } from "react";

import {
  obtenerMensajeApiError,
} from "../../../shared/api/errorHandler";

import EmptyState from "../../../shared/components/EmptyState";
import ErrorState from "../../../shared/components/ErrorState";
import LoadingState from "../../../shared/components/LoadingState";

import {
  useCategoriasQuery,
} from "../../categorias/hooks/useCategoriasQuery";

import AdminProductosTable from "../components/AdminProductosTable";
import ProductoFormModal from "../components/ProductoFormModal";
import ProductoStockModal from "../components/ProductoStockModal";

import {
  useActualizarProductoMutation,
  useActualizarStockMutation,
  useCrearProductoMutation,
  useEliminarProductoMutation,
} from "../hooks/useProductoMutations";

import {
  useProductosQuery,
} from "../hooks/useProductosQuery";

import type {
  Producto,
  ProductoCreate,
  ProductoStockUpdate,
  ProductoUpdate,
} from "../types/producto.types";


const PAGE_SIZE = 20;


function AdminProductosPage() {
  const [pagina, setPagina] =
    useState(0);

  const [search, setSearch] =
    useState("");

  const [
    categoriaId,
    setCategoriaId,
  ] = useState<number | null>(null);

  const [
    productoSeleccionado,
    setProductoSeleccionado,
  ] = useState<Producto | null>(null);

  const [
    formModalOpen,
    setFormModalOpen,
  ] = useState(false);

  const [
    stockModalOpen,
    setStockModalOpen,
  ] = useState(false);

  const [modalError, setModalError] =
    useState<string | null>(null);

  const [pageError, setPageError] =
    useState<string | null>(null);


  const categoriasQuery =
    useCategoriasQuery({
      skip: 0,
      limit: 100,
    });

  const productosQuery =
    useProductosQuery({
      skip: pagina * PAGE_SIZE,
      limit: PAGE_SIZE,
      search,
      categoriaId,
    });


  const crearMutation =
    useCrearProductoMutation();

  const actualizarMutation =
    useActualizarProductoMutation();

  const stockMutation =
    useActualizarStockMutation();

  const eliminarMutation =
    useEliminarProductoMutation();


  const isMutating =
    crearMutation.isPending
    || actualizarMutation.isPending
    || stockMutation.isPending
    || eliminarMutation.isPending;

  const categorias =
    categoriasQuery.data?.items ?? [];

  const productos =
    productosQuery.data?.items ?? [];

  const total =
    productosQuery.data?.total ?? 0;

  const totalPaginas = Math.ceil(
    total / PAGE_SIZE,
  );


  function abrirCrear(): void {
    setProductoSeleccionado(null);
    setModalError(null);
    setFormModalOpen(true);
  }


  function abrirEditar(
    producto: Producto,
  ): void {
    setProductoSeleccionado(producto);
    setModalError(null);
    setFormModalOpen(true);
  }


  function abrirStock(
    producto: Producto,
  ): void {
    setProductoSeleccionado(producto);
    setModalError(null);
    setStockModalOpen(true);
  }


  function cerrarModales(): void {
    if (isMutating) {
      return;
    }

    setFormModalOpen(false);
    setStockModalOpen(false);
    setProductoSeleccionado(null);
    setModalError(null);
  }


  async function guardarProducto(
    datos: ProductoCreate,
  ): Promise<void> {
    setModalError(null);

    try {
      if (productoSeleccionado === null) {
        await crearMutation.mutateAsync(
          datos,
        );
      } else {
        const cambios: ProductoUpdate = {
          nombre: datos.nombre,
          descripcion:
            datos.descripcion,
          precio_base:
            datos.precio_base,
          imagen_url:
            datos.imagen_url,
          categoria_id:
            datos.categoria_id,
        };

        await actualizarMutation.mutateAsync({
          productoId:
            productoSeleccionado.id,
          datos: cambios,
        });
      }

      cerrarModales();
    } catch (error: unknown) {
      setModalError(
        obtenerMensajeApiError(
          error,
          "No se pudo guardar el producto.",
        ),
      );
    }
  }


  async function guardarStock(
    datos: ProductoStockUpdate,
  ): Promise<void> {
    if (productoSeleccionado === null) {
      return;
    }

    setModalError(null);

    try {
      await stockMutation.mutateAsync({
        productoId:
          productoSeleccionado.id,
        datos,
      });

      setStockModalOpen(false);
      setProductoSeleccionado(null);
    } catch (error: unknown) {
      setModalError(
        obtenerMensajeApiError(
          error,
          "No se pudo actualizar el stock.",
        ),
      );
    }
  }


  async function handleDelete(
    producto: Producto,
  ): Promise<void> {
    const confirmado = window.confirm(
      `¿Querés dar de baja el producto "${producto.nombre}"?`,
    );

    if (!confirmado) {
      return;
    }

    setPageError(null);

    try {
      await eliminarMutation.mutateAsync(
        producto.id,
      );
    } catch (error: unknown) {
      setPageError(
        obtenerMensajeApiError(
          error,
          "No se pudo eliminar el producto.",
        ),
      );
    }
  }


  let queryError: string | null = null;

  if (productosQuery.isError) {
    queryError = obtenerMensajeApiError(
      productosQuery.error,
      "No se pudieron cargar los productos.",
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
            Productos
          </h1>

          <p className="mt-2 text-slate-600">
            Administrá el catálogo, los precios,
            el stock y la disponibilidad.
          </p>
        </div>

        <button
          type="button"
          onClick={abrirCrear}
          disabled={isMutating}
          className="self-start rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700 disabled:bg-blue-300"
        >
          Nuevo producto
        </button>
      </header>


      <section className="mt-8 grid gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:grid-cols-[1fr_280px_auto]">
        <div>
          <label
            htmlFor="admin-product-search"
            className="block text-sm font-semibold text-slate-700"
          >
            Buscar
          </label>

          <input
            id="admin-product-search"
            type="search"
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPagina(0);
            }}
            className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-3"
          />
        </div>

        <div>
          <label
            htmlFor="admin-product-category"
            className="block text-sm font-semibold text-slate-700"
          >
            Categoría
          </label>

          <select
            id="admin-product-category"
            value={categoriaId ?? ""}
            onChange={(event) => {
              setCategoriaId(
                event.target.value
                  ? Number(event.target.value)
                  : null,
              );

              setPagina(0);
            }}
            className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-4 py-3"
          >
            <option value="">
              Todas
            </option>

            {categorias.map(
              (categoria) => (
                <option
                  key={categoria.id}
                  value={categoria.id}
                >
                  {categoria.nombre}
                </option>
              ),
            )}
          </select>
        </div>

        <button
          type="button"
          onClick={() => {
            setSearch("");
            setCategoriaId(null);
            setPagina(0);
          }}
          className="self-end rounded-lg border border-slate-300 px-4 py-3 font-semibold text-slate-700 hover:bg-slate-100"
        >
          Limpiar
        </button>
      </section>


      {pageError !== null && (
        <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
          {pageError}
        </div>
      )}


      <section className="mt-8">
        {queryError !== null ? (
          <ErrorState
            message={queryError}
            onRetry={() => {
              void productosQuery.refetch();
            }}
          />
        ) : productosQuery.isPending ? (
          <LoadingState
            message="Cargando productos..."
          />
        ) : productos.length === 0 ? (
          <EmptyState
            title="No hay productos"
            description="No existen productos que coincidan con los filtros."
          />
        ) : (
          <>
            <AdminProductosTable
              productos={productos}
              isMutating={isMutating}
              onEdit={abrirEditar}
              onStock={abrirStock}
              onDelete={(producto) => {
                void handleDelete(producto);
              }}
            />

            {totalPaginas > 1 && (
              <nav className="mt-8 flex items-center justify-center gap-3">
                <button
                  type="button"
                  disabled={pagina === 0}
                  onClick={() => {
                    setPagina(
                      Math.max(
                        0,
                        pagina - 1,
                      ),
                    );
                  }}
                  className="rounded-lg border border-slate-300 px-4 py-2"
                >
                  Anterior
                </button>

                <span>
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
                  className="rounded-lg border border-slate-300 px-4 py-2"
                >
                  Siguiente
                </button>
              </nav>
            )}
          </>
        )}
      </section>


      <ProductoFormModal
        isOpen={formModalOpen}
        producto={productoSeleccionado}
        categorias={categorias}
        isSubmitting={isMutating}
        error={modalError}
        onClose={cerrarModales}
        onSubmit={guardarProducto}
      />

      <ProductoStockModal
        isOpen={stockModalOpen}
        producto={productoSeleccionado}
        isSubmitting={isMutating}
        error={modalError}
        onClose={cerrarModales}
        onSubmit={guardarStock}
      />
    </main>
  );
}


export default AdminProductosPage;