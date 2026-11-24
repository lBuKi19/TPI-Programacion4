import {
  useEffect,
  useState,
} from "react";

import type {
  Producto,
  ProductoStockUpdate,
} from "../types/producto.types";


interface ProductoStockModalProps {
  isOpen: boolean;
  producto: Producto | null;
  isSubmitting: boolean;
  error: string | null;
  onClose: () => void;
  onSubmit: (
    datos: ProductoStockUpdate,
  ) => Promise<void>;
}


function ProductoStockModal({
  isOpen,
  producto,
  isSubmitting,
  error,
  onClose,
  onSubmit,
}: ProductoStockModalProps) {
  const [stock, setStock] =
    useState("0");

  const [
    disponible,
    setDisponible,
  ] = useState(true);


  useEffect(() => {
    if (
      !isOpen
      || producto === null
    ) {
      return;
    }

    setStock(
      String(producto.stock),
    );

    setDisponible(
      producto.disponible,
    );
  }, [
    isOpen,
    producto,
  ]);


  if (
    !isOpen
    || producto === null
  ) {
    return null;
  }


  async function handleSubmit(): Promise<void> {
    const stockNumber = Number(stock);

    if (
      !Number.isInteger(stockNumber)
      || stockNumber < 0
    ) {
      return;
    }

    await onSubmit({
      stock: stockNumber,
      disponible,
    });
  }


  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4">
      <section className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
        <h2 className="text-2xl font-bold text-slate-900">
          Stock de {producto.nombre}
        </h2>

        {error !== null && (
          <div className="mt-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="mt-6 space-y-5">
          <div>
            <label
              htmlFor="stock-producto"
              className="block text-sm font-semibold text-slate-700"
            >
              Stock
            </label>

            <input
              id="stock-producto"
              type="number"
              min="0"
              step="1"
              value={stock}
              onChange={(event) => {
                setStock(
                  event.target.value,
                );
              }}
              disabled={isSubmitting}
              className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            />
          </div>

          <label className="flex items-center gap-3 rounded-lg border border-slate-200 p-4">
            <input
              type="checkbox"
              checked={disponible}
              onChange={(event) => {
                setDisponible(
                  event.target.checked,
                );
              }}
              disabled={isSubmitting}
            />

            <span className="font-semibold text-slate-700">
              Disponible para la venta
            </span>
          </label>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="rounded-lg border border-slate-300 px-4 py-2 font-semibold text-slate-700 hover:bg-slate-100"
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={() => {
              void handleSubmit();
            }}
            disabled={isSubmitting}
            className="rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700 disabled:bg-blue-300"
          >
            {isSubmitting
              ? "Guardando..."
              : "Guardar stock"}
          </button>
        </div>
      </section>
    </div>
  );
}


export default ProductoStockModal;