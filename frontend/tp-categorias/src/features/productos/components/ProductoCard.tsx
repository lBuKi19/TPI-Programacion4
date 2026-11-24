import {
  useCartStore,
} from "../../../store/cartStore";

import type {
  Producto,
} from "../types/producto.types";


interface ProductoCardProps {
  producto: Producto;
}


function formatearPrecio(
  precio: string | number,
): string {
  return new Intl.NumberFormat(
    "es-AR",
    {
      style: "currency",
      currency: "ARS",
      maximumFractionDigits: 2,
    },
  ).format(
    Number(precio),
  );
}


function ProductoCard({
  producto,
}: ProductoCardProps) {
  const agregar = useCartStore(
    (state) => state.agregar,
  );

  const itemCarrito = useCartStore(
    (state) =>
      state.items.find(
        (item) =>
          item.producto_id
          === producto.id,
      ),
  );

  const sinStock =
    producto.stock <= 0;

  const puedeComprar =
    producto.activo
    && producto.disponible
    && !sinStock;

  const alcanzoLimite =
    itemCarrito !== undefined
    && itemCarrito.cantidad
      >= producto.stock;


  function handleAgregar(): void {
    if (
      !puedeComprar
      || alcanzoLimite
    ) {
      return;
    }

    agregar({
      producto_id: producto.id,
      nombre: producto.nombre,
      precio_unitario: Number(
        producto.precio_base,
      ),
      stock_disponible:
        producto.stock,
      imagen_url:
        producto.imagen_url,
    });
  }


  return (
    <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
      <div className="aspect-[4/3] bg-slate-100">
        {producto.imagen_url !== null ? (
          <img
            src={producto.imagen_url}
            alt={producto.nombre}
            loading="lazy"
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-5xl">
            📦
          </div>
        )}
      </div>


      <div className="flex flex-1 flex-col p-5">
        <span className="text-xs font-semibold uppercase tracking-wide text-blue-600">
          {producto.categoria.nombre}
        </span>

        <h2 className="mt-2 text-xl font-bold text-slate-900">
          {producto.nombre}
        </h2>

        <p className="mt-2 line-clamp-3 text-sm text-slate-600">
          {producto.descripcion
            ?? "Sin descripción"}
        </p>


        <div className="mt-4">
          <p className="text-2xl font-bold text-slate-900">
            {formatearPrecio(
              producto.precio_base,
            )}
          </p>

          <p
            className={[
              "mt-1 text-sm font-medium",
              puedeComprar
                ? "text-green-700"
                : "text-red-600",
            ].join(" ")}
          >
            {sinStock
              ? "Sin stock"
              : producto.disponible
                ? (
                  `Stock disponible: ${producto.stock}`
                )
                : "No disponible"}
          </p>
        </div>


        <button
          type="button"
          onClick={handleAgregar}
          disabled={
            !puedeComprar
            || alcanzoLimite
          }
          className="mt-5 w-full rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-600"
        >
          {alcanzoLimite
            ? "Stock máximo en el carrito"
            : puedeComprar
              ? "Agregar al carrito"
              : "No disponible"}
        </button>
      </div>
    </article>
  );
}


export default ProductoCard;