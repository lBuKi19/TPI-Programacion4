import {
  useMemo,
  useState,
} from "react";

import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table";

import type {
  Producto,
} from "../types/producto.types";


interface AdminProductosTableProps {
  productos: Producto[];
  isMutating: boolean;
  onEdit: (producto: Producto) => void;
  onStock: (producto: Producto) => void;
  onDelete: (producto: Producto) => void;
}


function formatearPrecio(
  value: string | number,
): string {
  const precio = Number(value);

  if (!Number.isFinite(precio)) {
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
  ).format(precio);
}


function AdminProductosTable({
  productos,
  isMutating,
  onEdit,
  onStock,
  onDelete,
}: AdminProductosTableProps) {
  const [sorting, setSorting] =
    useState<SortingState>([
      {
        id: "nombre",
        desc: false,
      },
    ]);


  const columns = useMemo<
    ColumnDef<Producto>[]
  >(
    () => [
      {
        accessorKey: "nombre",
        header: "Producto",

        cell: ({ row }) => (
          <div className="flex min-w-52 items-center gap-3">
            <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-slate-100">
              {row.original.imagen_url
                !== null ? (
                <img
                  src={row.original.imagen_url}
                  alt=""
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-xl">
                  📦
                </div>
              )}
            </div>

            <div className="min-w-0">
              <p className="font-semibold text-slate-900">
                {row.original.nombre}
              </p>

              <p className="mt-1 text-xs text-slate-500">
                ID: {row.original.id}
              </p>
            </div>
          </div>
        ),
      },

      {
        id: "categoria",
        accessorFn: (producto) =>
          producto.categoria.nombre,
        header: "Categoría",

        cell: ({ row }) => (
          <span className="text-sm text-slate-700">
            {row.original.categoria.nombre}
          </span>
        ),
      },

      {
        accessorKey: "precio_base",
        header: "Precio",

        sortingFn: (
          rowA,
          rowB,
        ) =>
          Number(
            rowA.original.precio_base,
          )
          - Number(
            rowB.original.precio_base,
          ),

        cell: ({ row }) => (
          <span className="whitespace-nowrap font-semibold text-slate-900">
            {formatearPrecio(
              row.original.precio_base,
            )}
          </span>
        ),
      },

      {
        accessorKey: "stock",
        header: "Stock",

        cell: ({ row }) => (
          <span
            className={[
              "font-semibold",
              row.original.stock > 0
                ? "text-slate-900"
                : "text-red-600",
            ].join(" ")}
          >
            {row.original.stock}
          </span>
        ),
      },

      {
        accessorKey: "disponible",
        header: "Disponibilidad",

        cell: ({ row }) => {
          const disponible =
            row.original.disponible
            && row.original.stock > 0;

          return (
            <span
              className={[
                "inline-flex rounded-full px-3 py-1 text-xs font-semibold",
                disponible
                  ? "bg-green-100 text-green-800"
                  : "bg-amber-100 text-amber-800",
              ].join(" ")}
            >
              {disponible
                ? "Disponible"
                : "No disponible"}
            </span>
          );
        },
      },

      {
        id: "acciones",
        header: "Acciones",
        enableSorting: false,

        cell: ({ row }) => (
          <div className="flex min-w-64 flex-wrap justify-end gap-2">
            <button
              type="button"
              disabled={isMutating}
              onClick={() => {
                onEdit(row.original);
              }}
              className="rounded-lg border border-blue-300 px-3 py-2 text-sm font-semibold text-blue-700 transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Editar
            </button>

            <button
              type="button"
              disabled={isMutating}
              onClick={() => {
                onStock(row.original);
              }}
              className="rounded-lg border border-amber-300 px-3 py-2 text-sm font-semibold text-amber-800 transition hover:bg-amber-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Stock
            </button>

            <button
              type="button"
              disabled={isMutating}
              onClick={() => {
                onDelete(row.original);
              }}
              className="rounded-lg border border-red-300 px-3 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Eliminar
            </button>
          </div>
        ),
      },
    ],
    [
      isMutating,
      onDelete,
      onEdit,
      onStock,
    ],
  );


  const table = useReactTable({
    data: productos,
    columns,

    state: {
      sorting,
    },

    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel:
      getSortedRowModel(),
  });


  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            {table.getHeaderGroups().map(
              (headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map(
                    (header) => (
                      <th
                        key={header.id}
                        scope="col"
                        className={[
                          "px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500",
                          header.column.id
                            === "acciones"
                            ? "text-right"
                            : "",
                        ].join(" ")}
                      >
                        {header.isPlaceholder
                          ? null
                          : header.column
                              .getCanSort()
                            ? (
                              <button
                                type="button"
                                onClick={
                                  header.column
                                    .getToggleSortingHandler()
                                }
                                className="inline-flex items-center gap-2 transition hover:text-slate-900"
                              >
                                {flexRender(
                                  header.column
                                    .columnDef.header,
                                  header.getContext(),
                                )}

                                <span aria-hidden="true">
                                  {header.column
                                    .getIsSorted()
                                    === "asc"
                                    ? "↑"
                                    : header.column
                                          .getIsSorted()
                                        === "desc"
                                      ? "↓"
                                      : "↕"}
                                </span>
                              </button>
                            )
                            : flexRender(
                                header.column
                                  .columnDef.header,
                                header.getContext(),
                              )}
                      </th>
                    ),
                  )}
                </tr>
              ),
            )}
          </thead>

          <tbody className="divide-y divide-slate-200">
            {table.getRowModel().rows.map(
              (row) => (
                <tr
                  key={row.id}
                  className="transition hover:bg-slate-50"
                >
                  {row.getVisibleCells().map(
                    (cell) => (
                      <td
                        key={cell.id}
                        className={[
                          "px-5 py-4 align-middle",
                          cell.column.id
                            === "acciones"
                            ? "text-right"
                            : "",
                        ].join(" ")}
                      >
                        {flexRender(
                          cell.column
                            .columnDef.cell,
                          cell.getContext(),
                        )}
                      </td>
                    ),
                  )}
                </tr>
              ),
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}


export default AdminProductosTable;