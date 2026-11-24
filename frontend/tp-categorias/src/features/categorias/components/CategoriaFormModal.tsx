import {
  useEffect,
  type FormEvent,
} from "react";

import {
  useForm,
} from "@tanstack/react-form";

import type {
  Categoria,
  CategoriaCreate,
} from "../types/categoria.types";


interface CategoriaFormModalProps {
  isOpen: boolean;
  categoria: Categoria | null;
  isSubmitting: boolean;
  error: string | null;

  onClose: () => void;

  onSubmit: (
    datos: CategoriaCreate,
  ) => Promise<void>;
}


interface CategoriaFormData {
  nombre: string;
  descripcion: string;
}


function validarNombre(
  value: string,
): string | undefined {
  const nombre = value.trim();

  if (!nombre) {
    return (
      "El nombre de la categoría "
      + "es obligatorio."
    );
  }

  if (nombre.length > 100) {
    return (
      "El nombre no puede superar "
      + "los 100 caracteres."
    );
  }

  return undefined;
}


function validarDescripcion(
  value: string,
): string | undefined {
  if (value.length > 500) {
    return (
      "La descripción no puede superar "
      + "los 500 caracteres."
    );
  }

  return undefined;
}


function CategoriaFormModal({
  isOpen,
  categoria,
  isSubmitting,
  error,
  onClose,
  onSubmit,
}: CategoriaFormModalProps) {
  const form = useForm({
    defaultValues: {
      nombre: "",
      descripcion: "",
    } satisfies CategoriaFormData,

    onSubmit: async ({ value }) => {
      await onSubmit({
        nombre: value.nombre.trim(),

        descripcion:
          value.descripcion.trim()
            || null,
      });
    },
  });


  useEffect(() => {
    if (!isOpen) {
      return;
    }

    form.reset({
      nombre:
        categoria?.nombre
        ?? "",

      descripcion:
        categoria?.descripcion
        ?? "",
    });
  }, [
    categoria,
    form,
    isOpen,
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


  function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ): void {
    event.preventDefault();
    event.stopPropagation();

    void form.handleSubmit();
  }


  const esEdicion =
    categoria !== null;


  return (
    <div
      role="presentation"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4"
      onMouseDown={(event) => {
        if (
          event.target
          === event.currentTarget
          && !isSubmitting
        ) {
          onClose();
        }
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="categoria-modal-title"
        className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl sm:p-8"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-blue-600">
              Panel administrativo
            </p>

            <h2
              id="categoria-modal-title"
              className="mt-1 text-2xl font-bold text-slate-900"
            >
              {esEdicion
                ? "Editar categoría"
                : "Nueva categoría"}
            </h2>
          </div>

          <button
            type="button"
            aria-label="Cerrar formulario"
            disabled={isSubmitting}
            onClick={onClose}
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
                  maxLength={100}
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
                  maxLength={500}
                  rows={5}
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
                    /500
                  </span>
                </div>
              </div>
            )}
          </form.Field>


          <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:justify-end">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={onClose}
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
                      : "Crear categoría"}
                </button>
              )}
            </form.Subscribe>
          </div>
        </form>
      </section>
    </div>
  );
}


export default CategoriaFormModal;