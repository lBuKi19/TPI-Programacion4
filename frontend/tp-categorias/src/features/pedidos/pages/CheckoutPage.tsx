import { useState, type FormEvent } from "react";
import { useForm } from "@tanstack/react-form";
import {
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import {
  Link,
  Navigate,
  useNavigate,
} from "react-router-dom";

import { obtenerMensajeApiError } from "../../../shared/api/errorHandler";
import {
  seleccionarCantidadTotal,
  seleccionarTotalCarrito,
  useCartStore,
} from "../../../store/cartStore";
import { crearPedido } from "../api/pedidosService";

import type {
  FormaPago,
  PedidoCreate,
} from "../types/pedido.types";


interface CheckoutFormData {
  direccion_entrega: string;
  forma_pago: FormaPago;
  notas: string;
}


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


function validarDireccion(
  value: string,
): string | undefined {
  const direccion = value.trim();

  if (!direccion) {
    return "La dirección de entrega es obligatoria.";
  }

  if (direccion.length < 5) {
    return (
      "La dirección debe tener "
      + "al menos 5 caracteres."
    );
  }

  if (direccion.length > 200) {
    return (
      "La dirección no puede superar "
      + "los 200 caracteres."
    );
  }

  return undefined;
}


function validarNotas(
  value: string,
): string | undefined {
  if (value.length > 500) {
    return (
      "Las notas no pueden superar "
      + "los 500 caracteres."
    );
  }

  return undefined;
}


function CheckoutPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [submitError, setSubmitError] =
    useState<string | null>(null);

  const items = useCartStore(
    (state) => state.items,
  );

  const vaciar = useCartStore(
    (state) => state.vaciar,
  );

  const cantidadTotal = useCartStore(
    seleccionarCantidadTotal,
  );

  const totalEstimado = useCartStore(
    seleccionarTotalCarrito,
  );


  const crearPedidoMutation = useMutation({
    mutationFn: crearPedido,

    onSuccess: async (pedido) => {
      vaciar();

      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["pedidos"],
        }),

        queryClient.invalidateQueries({
          queryKey: ["productos"],
        }),

        queryClient.invalidateQueries({
          queryKey: ["pedido-resumen"],
        }),
      ]);

      navigate(
        "/mis-pedidos",
        {
          replace: true,
          state: {
            pedidoCreadoId: pedido.id,
          },
        },
      );
    },
  });


  const form = useForm({
    defaultValues: {
      direccion_entrega: "",
      forma_pago: "EFECTIVO" as FormaPago,
      notas: "",
    } satisfies CheckoutFormData,

    onSubmit: async ({ value }) => {
      if (items.length === 0) {
        setSubmitError(
          "El carrito está vacío.",
        );

        return;
      }

      setSubmitError(null);

      const datosPedido: PedidoCreate = {
        items: items.map((item) => ({
          producto_id: item.producto_id,
          cantidad: item.cantidad,
        })),

        forma_pago: value.forma_pago,

        direccion_entrega:
          value.direccion_entrega.trim(),

        notas:
          value.notas.trim() || null,
      };

      try {
        await crearPedidoMutation.mutateAsync(
          datosPedido,
        );
      } catch (error) {
        setSubmitError(
          obtenerMensajeApiError(
            error,
            "No se pudo confirmar el pedido.",
          ),
        );
      }
    },
  });


  if (items.length === 0) {
    return (
      <Navigate
        to="/carrito"
        replace
      />
    );
  }


  function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ): void {
    event.preventDefault();
    event.stopPropagation();

    void form.handleSubmit();
  }


  function limpiarError(): void {
    if (submitError !== null) {
      setSubmitError(null);
    }
  }


  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">
          Último paso
        </p>

        <h1 className="mt-1 text-3xl font-bold text-slate-900">
          Confirmar compra
        </h1>

        <p className="mt-2 text-slate-600">
          Ingresá la dirección de entrega y elegí la forma de pago.
        </p>
      </header>


      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_380px]">
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <h2 className="text-xl font-bold text-slate-900">
            Datos del pedido
          </h2>


          {submitError !== null && (
            <div
              role="alert"
              className="mt-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
            >
              {submitError}
            </div>
          )}


          <form
            onSubmit={handleSubmit}
            className="mt-6 space-y-6"
            noValidate
          >
            <form.Field
              name="direccion_entrega"
              validators={{
                onBlur: ({ value }) =>
                  validarDireccion(value),

                onSubmit: ({ value }) =>
                  validarDireccion(value),
              }}
            >
              {(field) => (
                <div>
                  <label
                    htmlFor={field.name}
                    className="block text-sm font-semibold text-slate-700"
                  >
                    Dirección de entrega
                  </label>

                  <input
                    id={field.name}
                    name={field.name}
                    type="text"
                    autoComplete="street-address"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(event) => {
                      limpiarError();

                      field.handleChange(
                        event.target.value,
                      );
                    }}
                    maxLength={200}
                    placeholder="Ejemplo: Av. Corrientes 1234, 4° B"
                    disabled={
                      crearPedidoMutation.isPending
                    }
                    className={[
                      "mt-2 w-full rounded-lg border px-4 py-3 outline-none transition focus:ring-2 disabled:cursor-not-allowed disabled:bg-slate-100",
                      field.state.meta.errors.length > 0
                        ? (
                          "border-red-400 "
                          + "focus:border-red-500 "
                          + "focus:ring-red-200"
                        )
                        : (
                          "border-slate-300 "
                          + "focus:border-blue-500 "
                          + "focus:ring-blue-200"
                        ),
                    ].join(" ")}
                  />

                  {field.state.meta.errors.length > 0 && (
                    <p
                      role="alert"
                      className="mt-1 text-sm text-red-600"
                    >
                      {field.state.meta.errors.join(
                        ", ",
                      )}
                    </p>
                  )}
                </div>
              )}
            </form.Field>


            <form.Field name="forma_pago">
              {(field) => (
                <fieldset>
                  <legend className="text-sm font-semibold text-slate-700">
                    Forma de pago
                  </legend>

                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    <label
                      className={[
                        "cursor-pointer rounded-xl border p-4 transition",
                        field.state.value === "EFECTIVO"
                          ? (
                            "border-blue-500 "
                            + "bg-blue-50 "
                            + "ring-2 "
                            + "ring-blue-100"
                          )
                          : (
                            "border-slate-200 "
                            + "hover:bg-slate-50"
                          ),
                      ].join(" ")}
                    >
                      <span className="flex items-start gap-3">
                        <input
                          type="radio"
                          name={field.name}
                          value="EFECTIVO"
                          checked={
                            field.state.value
                            === "EFECTIVO"
                          }
                          onChange={() => {
                            limpiarError();

                            field.handleChange(
                              "EFECTIVO",
                            );
                          }}
                          disabled={
                            crearPedidoMutation.isPending
                          }
                          className="mt-1"
                        />

                        <span>
                          <span className="block font-semibold text-slate-900">
                            Efectivo
                          </span>

                          <span className="mt-1 block text-sm text-slate-600">
                            Pago al recibir el pedido.
                          </span>
                        </span>
                      </span>
                    </label>


                    <label
                      className={[
                        "cursor-pointer rounded-xl border p-4 transition",
                        field.state.value
                          === "TRANSFERENCIA"
                          ? (
                            "border-blue-500 "
                            + "bg-blue-50 "
                            + "ring-2 "
                            + "ring-blue-100"
                          )
                          : (
                            "border-slate-200 "
                            + "hover:bg-slate-50"
                          ),
                      ].join(" ")}
                    >
                      <span className="flex items-start gap-3">
                        <input
                          type="radio"
                          name={field.name}
                          value="TRANSFERENCIA"
                          checked={
                            field.state.value
                            === "TRANSFERENCIA"
                          }
                          onChange={() => {
                            limpiarError();

                            field.handleChange(
                              "TRANSFERENCIA",
                            );
                          }}
                          disabled={
                            crearPedidoMutation.isPending
                          }
                          className="mt-1"
                        />

                        <span>
                          <span className="block font-semibold text-slate-900">
                            Transferencia
                          </span>

                          <span className="mt-1 block text-sm text-slate-600">
                            Coordinación posterior de los datos de pago.
                          </span>
                        </span>
                      </span>
                    </label>
                  </div>
                </fieldset>
              )}
            </form.Field>


            <form.Field
              name="notas"
              validators={{
                onBlur: ({ value }) =>
                  validarNotas(value),

                onSubmit: ({ value }) =>
                  validarNotas(value),
              }}
            >
              {(field) => (
                <div>
                  <label
                    htmlFor={field.name}
                    className="block text-sm font-semibold text-slate-700"
                  >
                    Notas
                  </label>

                  <textarea
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(event) => {
                      limpiarError();

                      field.handleChange(
                        event.target.value,
                      );
                    }}
                    maxLength={500}
                    rows={4}
                    placeholder="Indicaciones adicionales para la entrega (opcional)"
                    disabled={
                      crearPedidoMutation.isPending
                    }
                    className={[
                      "mt-2 w-full resize-y rounded-lg border px-4 py-3 outline-none transition focus:ring-2 disabled:cursor-not-allowed disabled:bg-slate-100",
                      field.state.meta.errors.length > 0
                        ? (
                          "border-red-400 "
                          + "focus:border-red-500 "
                          + "focus:ring-red-200"
                        )
                        : (
                          "border-slate-300 "
                          + "focus:border-blue-500 "
                          + "focus:ring-blue-200"
                        ),
                    ].join(" ")}
                  />

                  <div className="mt-1 flex items-center justify-between gap-4">
                    {field.state.meta.errors.length > 0 ? (
                      <p
                        role="alert"
                        className="text-sm text-red-600"
                      >
                        {field.state.meta.errors.join(
                          ", ",
                        )}
                      </p>
                    ) : (
                      <span />
                    )}

                    <span className="text-xs text-slate-500">
                      {field.state.value.length}/500
                    </span>
                  </div>
                </div>
              )}
            </form.Field>


            <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-6 sm:flex-row sm:items-center sm:justify-between">
              <Link
                to="/carrito"
                className="text-center text-sm font-semibold text-slate-600 transition hover:text-slate-900"
              >
                ← Volver al carrito
              </Link>


              <form.Subscribe
                selector={(state) => ({
                  canSubmit: state.canSubmit,
                  formIsSubmitting:
                    state.isSubmitting,
                })}
              >
                {({
                  canSubmit,
                  formIsSubmitting,
                }) => (
                  <button
                    type="submit"
                    disabled={
                      !canSubmit
                      || formIsSubmitting
                      || crearPedidoMutation.isPending
                    }
                    className="rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
                  >
                    {crearPedidoMutation.isPending
                      || formIsSubmitting
                      ? "Confirmando..."
                      : "Confirmar pedido"}
                  </button>
                )}
              </form.Subscribe>
            </div>
          </form>
        </section>


        <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:sticky lg:top-6">
          <h2 className="text-xl font-bold text-slate-900">
            Resumen
          </h2>


          <ul className="mt-5 max-h-80 space-y-4 overflow-y-auto pr-1">
            {items.map((item) => (
              <li
                key={item.producto_id}
                className="flex gap-3 border-b border-slate-100 pb-4 last:border-0"
              >
                <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-slate-100">
                  {item.imagen_url !== null ? (
                    <img
                      src={item.imagen_url}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-xl">
                      📦
                    </div>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-slate-900">
                    {item.nombre}
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    {item.cantidad}
                    {" × "}
                    {formatearPrecio(
                      item.precio_unitario,
                    )}
                  </p>
                </div>

                <p className="whitespace-nowrap text-sm font-semibold text-slate-900">
                  {formatearPrecio(
                    item.precio_unitario
                    * item.cantidad,
                  )}
                </p>
              </li>
            ))}
          </ul>


          <dl className="mt-5 space-y-3 border-t border-slate-200 pt-5">
            <div className="flex items-center justify-between gap-4">
              <dt className="text-sm text-slate-600">
                Unidades
              </dt>

              <dd className="font-semibold text-slate-900">
                {cantidadTotal}
              </dd>
            </div>

            <div className="flex items-end justify-between gap-4">
              <dt className="font-bold text-slate-900">
                Total estimado
              </dt>

              <dd className="text-2xl font-bold text-blue-700">
                {formatearPrecio(
                  totalEstimado,
                )}
              </dd>
            </div>
          </dl>


          <p className="mt-5 rounded-lg bg-slate-50 p-3 text-xs leading-5 text-slate-600">
            El servidor volverá a validar precios,
            disponibilidad y stock antes de confirmar.
          </p>
        </aside>
      </div>
    </main>
  );
}


export default CheckoutPage;