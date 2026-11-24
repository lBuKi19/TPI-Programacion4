import {
  Link,
  useNavigate,
} from "react-router-dom";

import EmptyState from "../../../shared/components/EmptyState";

import {
  seleccionarCantidadTotal,
  seleccionarTotalCarrito,
  useCartStore,
} from "../../../store/cartStore";


function formatearPrecio(
  precio: number,
): string {
  return new Intl.NumberFormat(
    "es-AR",
    {
      style: "currency",
      currency: "ARS",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    },
  ).format(precio);
}


function CarritoPage() {
  const navigate = useNavigate();

  const items = useCartStore(
    (state) => state.items,
  );

  const cambiarCantidad = useCartStore(
    (state) => state.cambiarCantidad,
  );

  const quitar = useCartStore(
    (state) => state.quitar,
  );

  const vaciar = useCartStore(
    (state) => state.vaciar,
  );

  const cantidadTotal = useCartStore(
    seleccionarCantidadTotal,
  );

  const totalCarrito = useCartStore(
    seleccionarTotalCarrito,
  );


  function handleCantidadChange(
    productoId: number,
    value: string,
  ): void {
    const cantidad = Number(value);

    if (
      !Number.isFinite(cantidad)
      || cantidad < 1
    ) {
      return;
    }

    cambiarCantidad(
      productoId,
      cantidad,
    );
  }


  function handleVaciar(): void {
    const confirmado = window.confirm(
      "¿Querés quitar todos los productos del carrito?",
    );

    if (!confirmado) {
      return;
    }

    vaciar();
  }


  function handleContinuarCompra(): void {
    navigate("/checkout");
  }


  if (items.length === 0) {
    return (
      <main className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <EmptyState
          title="Tu carrito está vacío"
          description="Explorá el catálogo y agregá productos para comenzar tu compra."
        />

        <div className="mt-6 text-center">
          <Link
            to="/"
            className="inline-flex rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700"
          >
            Ver catálogo
          </Link>
        </div>
      </main>
    );
  }


  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">
          Tu compra
        </p>

        <h1 className="mt-1 text-3xl font-bold text-slate-900">
          Carrito
        </h1>

        <p className="mt-2 text-slate-600">
          Revisá los productos y las cantidades antes de confirmar el pedido.
        </p>
      </header>


      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
        <section
          aria-label="Productos del carrito"
          className="space-y-4"
        >
          {items.map((item) => {
            const subtotal =
              item.precio_unitario
              * item.cantidad;

            return (
              <article
                key={item.producto_id}
                className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5"
              >
                <div className="flex flex-col gap-5 sm:flex-row">
                  <div className="h-32 w-full shrink-0 overflow-hidden rounded-xl bg-slate-100 sm:h-28 sm:w-32">
                    {item.imagen_url !== null ? (
                      <img
                        src={item.imagen_url}
                        alt={item.nombre}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-4xl">
                        📦
                      </div>
                    )}
                  </div>


                  <div className="flex min-w-0 flex-1 flex-col">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <h2 className="text-lg font-bold text-slate-900">
                          {item.nombre}
                        </h2>

                        <p className="mt-1 text-sm text-slate-600">
                          Precio unitario:{" "}
                          <span className="font-semibold text-slate-800">
                            {formatearPrecio(
                              item.precio_unitario,
                            )}
                          </span>
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          Stock informado:{" "}
                          {item.stock_disponible}
                        </p>
                      </div>

                      <p className="text-xl font-bold text-slate-900">
                        {formatearPrecio(
                          subtotal,
                        )}
                      </p>
                    </div>


                    <div className="mt-auto flex flex-col gap-3 pt-5 sm:flex-row sm:items-end sm:justify-between">
                      <div>
                        <label
                          htmlFor={`cantidad-${item.producto_id}`}
                          className="block text-sm font-semibold text-slate-700"
                        >
                          Cantidad
                        </label>

                        <div className="mt-2 inline-flex items-center overflow-hidden rounded-lg border border-slate-300 bg-white">
                          <button
                            type="button"
                            aria-label={`Disminuir cantidad de ${item.nombre}`}
                            onClick={() => {
                              cambiarCantidad(
                                item.producto_id,
                                item.cantidad - 1,
                              );
                            }}
                            disabled={
                              item.cantidad <= 1
                            }
                            className="h-10 w-10 text-lg font-bold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:text-slate-300"
                          >
                            −
                          </button>

                          <input
                            id={`cantidad-${item.producto_id}`}
                            type="number"
                            min={1}
                            max={
                              item.stock_disponible
                            }
                            step={1}
                            value={item.cantidad}
                            onChange={(event) => {
                              handleCantidadChange(
                                item.producto_id,
                                event.target.value,
                              );
                            }}
                            className="h-10 w-16 border-x border-slate-300 text-center font-semibold text-slate-900 outline-none"
                          />

                          <button
                            type="button"
                            aria-label={`Aumentar cantidad de ${item.nombre}`}
                            onClick={() => {
                              cambiarCantidad(
                                item.producto_id,
                                item.cantidad + 1,
                              );
                            }}
                            disabled={
                              item.cantidad
                              >= item.stock_disponible
                            }
                            className="h-10 w-10 text-lg font-bold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:text-slate-300"
                          >
                            +
                          </button>
                        </div>

                        {item.cantidad
                          >= item.stock_disponible && (
                          <p className="mt-1 text-xs font-medium text-amber-700">
                            Alcanzaste el stock disponible.
                          </p>
                        )}
                      </div>


                      <button
                        type="button"
                        onClick={() => {
                          quitar(
                            item.producto_id,
                          );
                        }}
                        className="self-start rounded-lg border border-red-300 px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-50 sm:self-auto"
                      >
                        Quitar
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}


          <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center sm:justify-between">
            <Link
              to="/"
              className="text-sm font-semibold text-blue-600 transition hover:text-blue-700"
            >
              ← Seguir comprando
            </Link>

            <button
              type="button"
              onClick={handleVaciar}
              className="self-start rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 sm:self-auto"
            >
              Vaciar carrito
            </button>
          </div>
        </section>


        <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:sticky lg:top-6">
          <h2 className="text-xl font-bold text-slate-900">
            Resumen de compra
          </h2>

          <dl className="mt-6 space-y-4">
            <div className="flex items-center justify-between gap-4">
              <dt className="text-sm text-slate-600">
                Productos
              </dt>

              <dd className="font-semibold text-slate-900">
                {cantidadTotal}
              </dd>
            </div>

            <div className="flex items-center justify-between gap-4">
              <dt className="text-sm text-slate-600">
                Subtotal estimado
              </dt>

              <dd className="font-semibold text-slate-900">
                {formatearPrecio(
                  totalCarrito,
                )}
              </dd>
            </div>

            <div className="border-t border-slate-200 pt-4">
              <div className="flex items-end justify-between gap-4">
                <dt className="font-bold text-slate-900">
                  Total estimado
                </dt>

                <dd className="text-2xl font-bold text-blue-700">
                  {formatearPrecio(
                    totalCarrito,
                  )}
                </dd>
              </div>
            </div>
          </dl>


          <p className="mt-5 rounded-lg bg-slate-50 p-3 text-xs leading-5 text-slate-600">
            El precio y el stock definitivos serán validados por el servidor al confirmar el pedido.
          </p>


          <button
            type="button"
            onClick={handleContinuarCompra}
            className="mt-6 w-full rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700"
          >
            Confirmar compra
          </button>
        </aside>
      </div>
    </main>
  );
}


export default CarritoPage;