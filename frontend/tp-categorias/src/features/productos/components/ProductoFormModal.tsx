import {
  useEffect,
  type FormEvent,
} from "react";

import {
  useForm,
} from "@tanstack/react-form";

import type {
  Categoria,
} from "../../categorias/types/categoria.types";

import type {
  Producto,
  ProductoCreate,
} from "../types/producto.types";


interface ProductoFormModalProps {
  isOpen: boolean;
  producto: Producto | null;
  categorias: Categoria[];
  isSubmitting: boolean;
  error: string | null;
  onClose: () => void;
  onSubmit: (
    datos: ProductoCreate,
  ) => Promise<void>;
}


interface ProductoFormData {
  nombre: string;
  descripcion: string;
  precio_base: string;
  imagen_url: string;
  categoria_id: string;
  stock: string;
  disponible: boolean;
}


const valoresIniciales: ProductoFormData = {
  nombre: "",
  descripcion: "",
  precio_base: "",
  imagen_url: "",
  categoria_id: "",
  stock: "0",
  disponible: true,
};


function validarNombre(
  value: string,
): string | undefined {
  const nombre = value.trim();

  if (!nombre) {
    return "El nombre es obligatorio.";
  }

  if (nombre.length > 150) {
    return (
      "El nombre no puede superar "
      + "los 150 caracteres."
    );
  }

  return undefined;
}


function validarDescripcion(
  value: string,
): string | undefined {
  if (value.length > 1000) {
    return (
      "La descripción no puede superar "
      + "los 1000 caracteres."
    );
  }

  return undefined;
}


function validarPrecio(
  value: string,
): string | undefined {
  if (!value.trim()) {
    return "El precio es obligatorio.";
  }

  const precio = Number(value);

  if (
    !Number.isFinite(precio)
    || precio <= 0
  ) {
    return (
      "El precio debe ser un número "
      + "mayor que cero."
    );
  }

  return undefined;
}


function validarCategoria(
  value: string,
): string | undefined {
  const categoriaId = Number(value);

  if (
    !Number.isInteger(categoriaId)
    || categoriaId <= 0
  ) {
    return "Seleccioná una categoría.";
  }

  return undefined;
}


function validarStock(
  value: string,
): string | undefined {
  if (!value.trim()) {
    return "El stock es obligatorio.";
  }

  const stock = Number(value);

  if (
    !Number.isInteger(stock)
    || stock < 0
  ) {
    return (
      "El stock debe ser un número "
      + "entero mayor o igual que cero."
    );
  }

  return undefined;
}


function validarImagenUrl(
  value: string,
): string | undefined {
  const url = value.trim();

  if (!url) {
    return undefined;
  }

  if (
    !url.startsWith("http://")
    && !url.startsWith("https://")
  ) {
    return (
      "La URL debe comenzar con "
      + "http:// o https://."
    );
  }

  if (url.length > 500) {
    return (
      "La URL no puede superar "
      + "los 500 caracteres."
    );
  }

  return undefined;
}


function ProductoFormModal({
  isOpen,
  producto,
  categorias,
  isSubmitting,
  error,
  onClose,
  onSubmit,
}: ProductoFormModalProps) {
  const form = useForm({
    defaultValues: valoresIniciales,

    onSubmit: async ({ value }) => {
      await onSubmit({
        nombre: value.nombre.trim(),

        descripcion:
          value.descripcion.trim()
          || null,

        precio_base:
          value.precio_base,

        imagen_url:
          value.imagen_url.trim()
          || null,

        categoria_id: Number(
          value.categoria_id,
        ),

        stock: Number(
          value.stock,
        ),

        disponible:
          value.disponible,
      });
    },
  });


  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const valoresFormulario:
      ProductoFormData = {
        nombre:
          producto?.nombre ?? "",

        descripcion:
          producto?.descripcion ?? "",

        precio_base:
          producto !== null
            ? String(
                producto.precio_base,
              )
            : "",

        imagen_url:
          producto?.imagen_url ?? "",

        categoria_id:
          producto !== null
            ? String(
                producto.categoria_id,
              )
            : "",

        stock:
          producto !== null
            ? String(
                producto.stock,
              )
            : "0",

        disponible:
          producto?.disponible
          ?? true,
      };

    form.reset(
      valoresFormulario,
    );
  }, [
    form,
    isOpen,
    producto,
  ]);


  useEffect(() => {
    if (!isOpen) {
      return;
    }

    function handleKeyDown(
      event: KeyboardEvent,
    ): void {
      if (
        event.key === "Escape"
        && !isSubmitting
      ) {
        onClose();
      }
    }

    window.addEventListener(
      "keydown",
      handleKeyDown,
    );

    return () => {
      window.removeEventListener(
        "keydown",
        handleKeyDown,
      );
    };
  }, [
    isOpen,
    isSubmitting,
    onClose,
  ]);


  if (!isOpen) {
    return null;
  }


  const esEdicion =
    producto !== null;


  function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ): void {
    event.preventDefault();
    event.stopPropagation();

    void form.handleSubmit();
  }


  return (
    <div
      role="presentation"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4"
      onMouseDown={(event) => {
        if (
          event.target === event.currentTarget
          && !isSubmitting
        ) {
          onClose();
        }
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="producto-modal-title"
        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl sm:p-8"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-blue-600">
              Panel administrativo
            </p>

            <h2
              id="producto-modal-title"
              className="mt-1 text-2xl font-bold text-slate-900"
            >
              {esEdicion
                ? "Editar producto"
                : "Nuevo producto"}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            aria-label="Cerrar formulario"
            className="rounded-lg px-3 py-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
          >
            ✕
          </button>
        </div>


        {error !== null && (
          <div
            role="alert"
            className="mt-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            {error}
          </div>
        )}


        <form
          onSubmit={handleSubmit}
          className="mt-6 space-y-5"
          noValidate
        >
          <form.Field
            name="nombre"
            validators={{
              onBlur: ({ value }) =>
                validarNombre(value),

              onSubmit: ({ value }) =>
                validarNombre(value),
            }}
          >
            {(field) => (
              <div>
                <label
                  htmlFor={field.name}
                  className="block text-sm font-semibold text-slate-700"
                >
                  Nombre
                </label>

                <input
                  id={field.name}
                  name={field.name}
                  type="text"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(event) => {
                    field.handleChange(
                      event.target.value,
                    );
                  }}
                  maxLength={150}
                  autoFocus
                  disabled={isSubmitting}
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


          <form.Field
            name="descripcion"
            validators={{
              onBlur: ({ value }) =>
                validarDescripcion(value),

              onSubmit: ({ value }) =>
                validarDescripcion(value),
            }}
          >
            {(field) => (
              <div>
                <label
                  htmlFor={field.name}
                  className="block text-sm font-semibold text-slate-700"
                >
                  Descripción
                </label>

                <textarea
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(event) => {
                    field.handleChange(
                      event.target.value,
                    );
                  }}
                  rows={4}
                  maxLength={1000}
                  disabled={isSubmitting}
                  placeholder="Descripción opcional"
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
                    {field.state.value.length}
                    /1000
                  </span>
                </div>
              </div>
            )}
          </form.Field>


          <div className="grid gap-5 sm:grid-cols-2">
            <form.Field
              name="precio_base"
              validators={{
                onBlur: ({ value }) =>
                  validarPrecio(value),

                onSubmit: ({ value }) =>
                  validarPrecio(value),
              }}
            >
              {(field) => (
                <div>
                  <label
                    htmlFor={field.name}
                    className="block text-sm font-semibold text-slate-700"
                  >
                    Precio
                  </label>

                  <input
                    id={field.name}
                    name={field.name}
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(event) => {
                      field.handleChange(
                        event.target.value,
                      );
                    }}
                    disabled={isSubmitting}
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


            <form.Field
              name="categoria_id"
              validators={{
                onBlur: ({ value }) =>
                  validarCategoria(value),

                onSubmit: ({ value }) =>
                  validarCategoria(value),
              }}
            >
              {(field) => (
                <div>
                  <label
                    htmlFor={field.name}
                    className="block text-sm font-semibold text-slate-700"
                  >
                    Categoría
                  </label>

                  <select
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(event) => {
                      field.handleChange(
                        event.target.value,
                      );
                    }}
                    disabled={isSubmitting}
                    className={[
                      "mt-2 w-full rounded-lg border bg-white px-4 py-3 outline-none transition focus:ring-2 disabled:cursor-not-allowed disabled:bg-slate-100",
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
                  >
                    <option value="">
                      Seleccionar categoría
                    </option>

                    {categorias.map(
                      (categoria) => (
                        <option
                          key={categoria.id}
                          value={String(
                            categoria.id,
                          )}
                        >
                          {categoria.nombre}
                        </option>
                      ),
                    )}
                  </select>

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
          </div>


          <form.Field
            name="imagen_url"
            validators={{
              onBlur: ({ value }) =>
                validarImagenUrl(value),

              onSubmit: ({ value }) =>
                validarImagenUrl(value),
            }}
          >
            {(field) => (
              <div>
                <label
                  htmlFor={field.name}
                  className="block text-sm font-semibold text-slate-700"
                >
                  URL de imagen
                </label>

                <input
                  id={field.name}
                  name={field.name}
                  type="url"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(event) => {
                    field.handleChange(
                      event.target.value,
                    );
                  }}
                  maxLength={500}
                  disabled={isSubmitting}
                  placeholder="https://..."
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


          {!esEdicion && (
            <div className="grid gap-5 sm:grid-cols-2">
              <form.Field
                name="stock"
                validators={{
                  onBlur: ({ value }) =>
                    validarStock(value),

                  onSubmit: ({ value }) =>
                    validarStock(value),
                }}
              >
                {(field) => (
                  <div>
                    <label
                      htmlFor={field.name}
                      className="block text-sm font-semibold text-slate-700"
                    >
                      Stock inicial
                    </label>

                    <input
                      id={field.name}
                      name={field.name}
                      type="number"
                      min="0"
                      step="1"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(event) => {
                        field.handleChange(
                          event.target.value,
                        );
                      }}
                      disabled={isSubmitting}
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


              <form.Field name="disponible">
                {(field) => (
                  <label className="flex h-full items-center gap-3 rounded-lg border border-slate-200 p-4">
                    <input
                      type="checkbox"
                      checked={field.state.value}
                      onChange={(event) => {
                        field.handleChange(
                          event.target.checked,
                        );
                      }}
                      disabled={isSubmitting}
                    />

                    <span className="font-semibold text-slate-700">
                      Disponible para la venta
                    </span>
                  </label>
                )}
              </form.Field>
            </div>
          )}


          <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-lg border border-slate-300 px-5 py-3 font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancelar
            </button>

            <form.Subscribe
              selector={(state) => ({
                canSubmit:
                  state.canSubmit,

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
                    || isSubmitting
                    || formIsSubmitting
                  }
                  className="rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
                >
                  {isSubmitting
                    || formIsSubmitting
                    ? "Guardando..."
                    : esEdicion
                      ? "Guardar cambios"
                      : "Crear producto"}
                </button>
              )}
            </form.Subscribe>
          </div>
        </form>
      </section>
    </div>
  );
}


export default ProductoFormModal;