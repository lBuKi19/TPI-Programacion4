import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  obtenerMensajeApiError,
} from "../../../shared/api/errorHandler";

import EmptyState from "../../../shared/components/EmptyState";
import ErrorState from "../../../shared/components/ErrorState";

import {
  useCategoriasQuery,
} from "../../categorias/hooks/useCategoriasQuery";

import ProductoCard from "../components/ProductoCard";
import ProductoCardSkeleton from "../components/ProductoCardSkeleton";

import {
  useProductosQuery,
} from "../hooks/useProductosQuery";


const PRODUCTOS_POR_PAGINA = 12;
const DEBOUNCE_MS = 400;


function crearPaginasVisibles(
  paginaActual: number,
  totalPaginas: number,
): number[] {
  if (totalPaginas <= 5) {
    return Array.from(
      {
        length: totalPaginas,
      },
      (_, index) => index + 1,
    );
  }

  const paginaUnoBasada =
    paginaActual + 1;

  const inicio = Math.max(
    1,
    Math.min(
      paginaUnoBasada - 2,
      totalPaginas - 4,
    ),
  );

  return Array.from(
    {
      length: 5,
    },
    (_, index) => inicio + index,
  );
}


function CatalogoPage() {
  const [
    searchInput,
    setSearchInput,
  ] = useState("");

  const [
    search,
    setSearch,
  ] = useState("");

  const [
    categoriaId,
    setCategoriaId,
  ] = useState<number | null>(null);

  const [
    pagina,
    setPagina,
  ] = useState(0);


  useEffect(() => {
    const timeoutId = window.setTimeout(
      () => {
        setSearch(
          searchInput.trim(),
        );

        setPagina(0);
      },
      DEBOUNCE_MS,
    );

    return () => {
      window.clearTimeout(
        timeoutId,
      );
    };
  }, [searchInput]);


  const categoriasQuery =
    useCategoriasQuery({
      skip: 0,
      limit: 100,
    });


  const productosQuery =
    useProductosQuery({
      skip:
        pagina
        * PRODUCTOS_POR_PAGINA,

      limit:
        PRODUCTOS_POR_PAGINA,

      search,
      categoriaId,
    });


  const categorias =
    categoriasQuery.data?.items
    ?? [];

  const productos =
    productosQuery.data?.items
    ?? [];

  const totalProductos =
    productosQuery.data?.total
    ?? 0;


  const totalPaginas = Math.ceil(
    totalProductos
    / PRODUCTOS_POR_PAGINA,
  );


  const paginasVisibles = useMemo(
    () =>
      crearPaginasVisibles(
        pagina,
        totalPaginas,
      ),
    [
      pagina,
      totalPaginas,
    ],
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


  function handleCategoriaChange(
    value: string,
  ): void {
    if (!value) {
      setCategoriaId(null);
    } else {
      setCategoriaId(
        Number(value),
      );
    }

    setPagina(0);
  }


  function limpiarFiltros(): void {
    setSearchInput("");
    setSearch("");
    setCategoriaId(null);
    setPagina(0);
  }


  function irAPagina(
    nuevaPagina: number,
  ): void {
    if (
      nuevaPagina < 0
      || nuevaPagina >= totalPaginas
      || nuevaPagina === pagina
    ) {
      return;
    }

    setPagina(nuevaPagina);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }


  const hayFiltros =
    searchInput.trim().length > 0
    || categoriaId !== null;


  const mensajeProductosError =
    productosQuery.isError
      ? obtenerMensajeApiError(
          productosQuery.error,
          "No se pudo cargar el catálogo.",
        )
      : null;


  const mensajeCategoriasError =
    categoriasQuery.isError
      ? obtenerMensajeApiError(
          categoriasQuery.error,
          "No se pudieron cargar las categorías.",
        )
      : null;


  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <section className="rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900 px-6 py-10 text-white shadow-lg sm:px-10">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-300">
          Food Store
        </p>

        <h1 className="mt-3 max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl">
          Productos para tu próxima compra
        </h1>

        <p className="mt-4 max-w-2xl text-base text-slate-300 sm:text-lg">
          Explorá el catálogo, filtrá por categoría y
          agregá los productos al carrito.
        </p>
      </section>


      <section
        aria-label="Filtros del catálogo"
        className="mt-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
      >
        <div className="grid gap-4 md:grid-cols-[1fr_260px_auto] md:items-end">
          <div>
            <label
              htmlFor="catalogo-search"
              className="block text-sm font-semibold text-slate-700"
            >
              Buscar productos
            </label>

            <input
              id="catalogo-search"
              type="search"
              value={searchInput}
              onChange={(event) => {
                setSearchInput(
                  event.target.value,
                );
              }}
              placeholder="Ejemplo: café, arroz, galletitas"
              className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            />
          </div>


          <div>
            <label
              htmlFor="catalogo-categoria"
              className="block text-sm font-semibold text-slate-700"
            >
              Categoría
            </label>

            <select
              id="catalogo-categoria"
              value={
                categoriaId
                ?? ""
              }
              onChange={(event) => {
                handleCategoriaChange(
                  event.target.value,
                );
              }}
              disabled={
                categoriasQuery.isPending
              }
              className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200 disabled:cursor-not-allowed disabled:bg-slate-100"
            >
              <option value="">
                Todas las categorías
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
            onClick={limpiarFiltros}
            disabled={!hayFiltros}
            className="rounded-lg border border-slate-300 px-5 py-3 font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Limpiar
          </button>
        </div>


        {mensajeCategoriasError !== null && (
          <p
            role="alert"
            className="mt-3 text-sm text-red-600"
          >
            {mensajeCategoriasError}
          </p>
        )}
      </section>


      <section className="mt-8">
        <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">
              Catálogo
            </h2>

            {!productosQuery.isPending && (
              <p className="mt-1 text-sm text-slate-600">
                {totalProductos === 1
                  ? "1 producto disponible"
                  : (
                    `${totalProductos} productos disponibles`
                  )}
              </p>
            )}
          </div>

          {productosQuery.isFetching
            && !productosQuery.isPending && (
              <span
                role="status"
                className="text-sm font-semibold text-blue-600"
              >
                Actualizando resultados...
              </span>
            )}
        </div>


        {mensajeProductosError !== null ? (
          <ErrorState
            message={mensajeProductosError}
            onRetry={() => {
              void productosQuery.refetch();
            }}
          />
        ) : productosQuery.isPending ? (
          <div
            aria-label="Cargando productos"
            className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
          >
            {Array.from(
              {
                length:
                  PRODUCTOS_POR_PAGINA,
              },
              (_, index) => (
                <ProductoCardSkeleton
                  key={index}
                />
              ),
            )}
          </div>
        ) : productos.length === 0 ? (
          <EmptyState
            title="No encontramos productos"
            description={
              hayFiltros
                ? (
                  "No hay productos que coincidan con "
                  + "los filtros aplicados. Probá con "
                  + "otra búsqueda o categoría."
                )
                : (
                  "Todavía no hay productos activos "
                  + "disponibles en el catálogo."
                )
            }
          />
        ) : (
          <>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {productos.map(
                (producto) => (
                  <ProductoCard
                    key={producto.id}
                    producto={producto}
                  />
                ),
              )}
            </div>


            {totalPaginas > 1 && (
              <nav
                aria-label="Paginación del catálogo"
                className="mt-10 flex flex-wrap items-center justify-center gap-2"
              >
                <button
                  type="button"
                  onClick={() => {
                    irAPagina(
                      pagina - 1,
                    );
                  }}
                  disabled={pagina === 0}
                  className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Anterior
                </button>


                {paginasVisibles.map(
                  (numeroPagina) => {
                    const indicePagina =
                      numeroPagina - 1;

                    const estaActiva =
                      indicePagina
                      === pagina;

                    return (
                      <button
                        key={numeroPagina}
                        type="button"
                        aria-current={
                          estaActiva
                            ? "page"
                            : undefined
                        }
                        onClick={() => {
                          irAPagina(
                            indicePagina,
                          );
                        }}
                        className={[
                          "min-w-10 rounded-lg px-3 py-2 text-sm font-semibold transition",
                          estaActiva
                            ? (
                              "bg-blue-600 "
                              + "text-white"
                            )
                            : (
                              "border "
                              + "border-slate-300 "
                              + "bg-white "
                              + "text-slate-700 "
                              + "hover:bg-slate-100"
                            ),
                        ].join(" ")}
                      >
                        {numeroPagina}
                      </button>
                    );
                  },
                )}


                <button
                  type="button"
                  onClick={() => {
                    irAPagina(
                      pagina + 1,
                    );
                  }}
                  disabled={
                    pagina
                    >= totalPaginas - 1
                  }
                  className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Siguiente
                </button>
              </nav>
            )}
          </>
        )}
      </section>
    </main>
  );
}


export default CatalogoPage;