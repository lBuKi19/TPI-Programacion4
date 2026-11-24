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
  UsuarioAdmin,
} from "../types/usuario.types";


interface AdminUsuariosTableProps {
  usuarios: UsuarioAdmin[];
  currentUserId: number;
  isMutating: boolean;
  usuarioMutandoId: number | null;
  onActivate: (
    usuario: UsuarioAdmin,
  ) => void;
  onDeactivate: (
    usuario: UsuarioAdmin,
  ) => void;
}


function formatearFecha(
  value: string,
): string {
  const fecha = new Date(value);

  if (Number.isNaN(fecha.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat(
    "es-AR",
    {
      dateStyle: "medium",
      timeStyle: "short",
    },
  ).format(fecha);
}


function AdminUsuariosTable({
  usuarios,
  currentUserId,
  isMutating,
  usuarioMutandoId,
  onActivate,
  onDeactivate,
}: AdminUsuariosTableProps) {
  const [sorting, setSorting] =
    useState<SortingState>([
      {
        id: "created_at",
        desc: true,
      },
    ]);


  const columns = useMemo<
    ColumnDef<UsuarioAdmin>[]
  >(
    () => [
      {
        accessorKey: "full_name",
        header: "Usuario",

        cell: ({ row }) => (
          <div className="min-w-52">
            <p className="font-semibold text-slate-900">
              {row.original.full_name}
            </p>

            <p className="mt-1 text-xs text-slate-500">
              @{row.original.username}
            </p>

            {row.original.id
              === currentUserId && (
              <span className="mt-2 inline-flex rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-700">
                Sesión actual
              </span>
            )}
          </div>
        ),
      },

      {
        accessorKey: "email",
        header: "Email",

        cell: ({ row }) => (
          <span className="text-sm text-slate-700">
            {row.original.email}
          </span>
        ),
      },

      {
        accessorKey: "role",
        header: "Rol",

        cell: ({ row }) => (
          <span
            className={[
              "inline-flex rounded-full px-3 py-1 text-xs font-semibold",
              row.original.role === "admin"
                ? (
                  "bg-purple-100 "
                  + "text-purple-800"
                )
                : (
                  "bg-blue-100 "
                  + "text-blue-800"
                ),
            ].join(" ")}
          >
            {row.original.role === "admin"
              ? "Administrador"
              : "Usuario"}
          </span>
        ),
      },

      {
        accessorKey: "disabled",
        header: "Estado",

        cell: ({ row }) => {
          const activo =
            !row.original.disabled;

          return (
            <span
              className={[
                "inline-flex rounded-full px-3 py-1 text-xs font-semibold",
                activo
                  ? (
                    "bg-green-100 "
                    + "text-green-800"
                  )
                  : (
                    "bg-red-100 "
                    + "text-red-800"
                  ),
              ].join(" ")}
            >
              {activo
                ? "Activo"
                : "Desactivado"}
            </span>
          );
        },
      },

      {
        accessorKey: "created_at",
        header: "Registro",

        cell: ({ row }) => (
          <span className="whitespace-nowrap text-sm text-slate-600">
            {formatearFecha(
              row.original.created_at,
            )}
          </span>
        ),
      },

      {
        id: "acciones",
        header: "Acciones",
        enableSorting: false,

        cell: ({ row }) => {
          const usuario =
            row.original;

          const esUsuarioActual =
            usuario.id === currentUserId;

          const estaMutando =
            isMutating
            && usuarioMutandoId
              === usuario.id;

          if (esUsuarioActual) {
            return (
              <span className="text-sm text-slate-500">
                Sin acciones
              </span>
            );
          }

          if (usuario.disabled) {
            return (
              <button
                type="button"
                disabled={isMutating}
                onClick={() => {
                  onActivate(usuario);
                }}
                className="rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {estaMutando
                  ? "Activando..."
                  : "Activar"}
              </button>
            );
          }

          return (
            <button
              type="button"
              disabled={isMutating}
              onClick={() => {
                onDeactivate(usuario);
              }}
              className="rounded-lg border border-red-300 px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {estaMutando
                ? "Desactivando..."
                : "Desactivar"}
            </button>
          );
        },
      },
    ],
    [
      currentUserId,
      isMutating,
      onActivate,
      onDeactivate,
      usuarioMutandoId,
    ],
  );


  const table = useReactTable({
    data: usuarios,
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
                    (header) => {
                      const orden =
                        header.column
                          .getIsSorted();

                      return (
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
                                    {orden === "asc"
                                      ? "↑"
                                      : orden === "desc"
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


export default AdminUsuariosTable;