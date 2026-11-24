import {
  useMemo,
} from "react";

import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table";

import {
  useState,
} from "react";

import type {
  Categoria,
} from "../types/categoria.types";


interface CategoriasTableProps {
  categorias: Categoria[];
  isMutating: boolean;

  onEdit: (
    categoria: Categoria,
  ) => void;

  onDelete: (
    categoria: Categoria,
  ) => void;
}


function CategoriasTable({
  categorias,
  isMutating,
  onEdit,
  onDelete,
}: CategoriasTableProps) {
  const [sorting, setSorting] =
    useState<SortingState>([
      {
        id: "nombre",
        desc: false,
      },
    ]);


  const columns = useMemo<
    ColumnDef<Categoria>[]
  >(
    () => [
      {
        accessorKey: "id",
        header: "ID",

        cell: ({ row }) => (
          <span className="font-mono text-sm text-slate-600">
            #{row.original.id}
          </span>
        ),
      },

      {
        accessorKey: "nombre",
        header: "Nombre",

        cell: ({ row }) => (
          <span className="font-semibold text-slate-900">
            {row.original.nombre}
          </span>
        ),
      },

      {
        accessorKey: "descripcion",
        header: "Descripción",

        cell: ({ row }) => (
          <span className="block max-w-xl text-sm text-slate-600">
            {row.original.descripcion
              ?? "Sin descripción"}
          </span>
        ),
      },

      {
        accessorKey: "activo",
        header: "Estado",

        cell: ({ row }) => (
          <span
            className={[
              "inline-flex rounded-full px-3 py-1 text-xs font-semibold",
              row.original.activo
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800",
            ].join(" ")}
          >
            {row.original.activo
              ? "Activa"
              : "Inactiva"}
          </span>
        ),
      },

      {
        id: "acciones",
        header: "Acciones",
        enableSorting: false,

        cell: ({ row }) => (
          <div className="flex flex-wrap justify-end gap-2">
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
    ],
  );


  const table = useReactTable({
    data: categorias,
    columns,

    state: {
      sorting,
    },

    onSortingChange: setSorting,

    getCoreRowModel:
      getCoreRowModel(),

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
                    (header) => {
                      const puedeOrdenar =
                        header.column
                          .getCanSort();

                      const orden =
                        header.column
                          .getIsSorted();

                      return (
                        <th
                          key={header.id}
                          scope="col"
                          className={[
                            "px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500",
                            header.id
                              === "acciones"
                              ? "text-right"
                              : "",
                          ].join(" ")}
                        >
                          {header.isPlaceholder
                            ? null
                            : puedeOrdenar
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
                                    header.column.columnDef.header,
                                    header.getContext(),
                                  )}

                                  <span aria-hidden="true">
                                    {orden === "asc"
                                      ? "↑"
                                      : orden === "desc"
                                        ? "↓"
                                        : "↕"}
                                  </span>
                                </button>
                              )
                              : flexRender(
                                  header.column.columnDef.header,
                                  header.getContext(),
                                )}
                        </th>
                      );
                    },
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
                          "px-5 py-4 align-top",
                          cell.column.id
                            === "acciones"
                            ? "text-right"
                            : "",
                        ].join(" ")}
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
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


export default CategoriasTable;