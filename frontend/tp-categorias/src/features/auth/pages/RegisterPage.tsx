import {
  useState,
  type FormEvent,
} from "react";

import { useForm } from "@tanstack/react-form";

import {
  Link,
  Navigate,
  useNavigate,
} from "react-router-dom";

import {
  registrarUsuario,
} from "../api/authService";

import {
  obtenerMensajeApiError,
} from "../../../shared/api/errorHandler";

import {
  useAuthStore,
} from "../../../store/authStore";


interface RegisterFormData {
  username: string;
  full_name: string;
  email: string;
  password: string;
  confirmPassword: string;
}


function validarUsername(
  value: string,
): string | undefined {
  const username = value.trim();

  if (!username) {
    return "El nombre de usuario es obligatorio.";
  }

  if (username.length < 3) {
    return (
      "El nombre de usuario debe tener "
      + "al menos 3 caracteres."
    );
  }

  if (username.length > 50) {
    return (
      "El nombre de usuario no puede superar "
      + "los 50 caracteres."
    );
  }

  if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    return (
      "El nombre de usuario solo puede contener "
      + "letras, números y guion bajo."
    );
  }

  return undefined;
}


function validarNombreCompleto(
  value: string,
): string | undefined {
  const fullName = value.trim();

  if (!fullName) {
    return "El nombre completo es obligatorio.";
  }

  if (fullName.length < 2) {
    return (
      "El nombre completo debe tener "
      + "al menos 2 caracteres."
    );
  }

  if (fullName.length > 150) {
    return (
      "El nombre completo no puede superar "
      + "los 150 caracteres."
    );
  }

  return undefined;
}


function validarEmail(
  value: string,
): string | undefined {
  const email = value.trim();

  if (!email) {
    return "El email es obligatorio.";
  }

  const emailPattern =
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailPattern.test(email)) {
    return "Ingresá un email válido.";
  }

  return undefined;
}


function validarPassword(
  value: string,
): string | undefined {
  if (!value) {
    return "La contraseña es obligatoria.";
  }

  if (value.length < 8) {
    return (
      "La contraseña debe tener "
      + "al menos 8 caracteres."
    );
  }

  const passwordBytes =
    new TextEncoder().encode(value).length;

  if (passwordBytes > 72) {
    return (
      "La contraseña no puede superar "
      + "los 72 bytes en UTF-8."
    );
  }

  return undefined;
}


function RegisterPage() {
  const navigate = useNavigate();

  const [
    submitError,
    setSubmitError,
  ] = useState<string | null>(null);

  const user = useAuthStore(
    (state) => state.user,
  );


  const form = useForm({
    defaultValues: {
      username: "",
      full_name: "",
      email: "",
      password: "",
      confirmPassword: "",
    } satisfies RegisterFormData,

    onSubmit: async ({ value }) => {
      setSubmitError(null);

      try {
        await registrarUsuario({
          username: value.username
            .trim()
            .toLowerCase(),

          full_name:
            value.full_name.trim(),

          email: value.email
            .trim()
            .toLowerCase(),

          password: value.password,
        });

        navigate(
          "/login",
          {
            replace: true,
            state: {
              registrationSuccess: true,
            },
          },
        );
      } catch (error) {
        setSubmitError(
          obtenerMensajeApiError(
            error,
            "No se pudo crear la cuenta.",
          ),
        );
      }
    },
  });


  if (user !== null) {
    return (
      <Navigate
        to="/"
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


  function limpiarErrorSubmit(): void {
    if (submitError !== null) {
      setSubmitError(null);
    }
  }


  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-12">
      <section className="w-full max-w-xl rounded-2xl bg-white p-8 shadow-xl">
        <header>
          <p className="text-sm font-semibold text-blue-600">
            Food Store
          </p>

          <h1 className="mt-1 text-3xl font-bold text-slate-900">
            Crear una cuenta
          </h1>

          <p className="mt-2 text-sm text-slate-600">
            Registrate para confirmar compras y consultar tus pedidos.
          </p>
        </header>


        {submitError !== null && (
          <div
            role="alert"
            className="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            {submitError}
          </div>
        )}


        <form
          onSubmit={handleSubmit}
          className="mt-6 space-y-5"
          noValidate
        >
          <form.Field
            name="username"
            validators={{
              onBlur: ({ value }) =>
                validarUsername(value),

              onSubmit: ({ value }) =>
                validarUsername(value),
            }}
          >
            {(field) => (
              <div>
                <label
                  htmlFor={field.name}
                  className="block text-sm font-semibold text-slate-700"
                >
                  Nombre de usuario
                </label>

                <input
                  id={field.name}
                  name={field.name}
                  type="text"
                  autoComplete="username"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(event) => {
                    limpiarErrorSubmit();

                    field.handleChange(
                      event.target.value,
                    );
                  }}
                  maxLength={50}
                  autoFocus
                  className={[
                    "mt-2 w-full rounded-lg border px-4 py-3 outline-none transition focus:ring-2",
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

                <p className="mt-1 text-xs text-slate-500">
                  Letras, números y guion bajo.
                </p>

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
            name="full_name"
            validators={{
              onBlur: ({ value }) =>
                validarNombreCompleto(value),

              onSubmit: ({ value }) =>
                validarNombreCompleto(value),
            }}
          >
            {(field) => (
              <div>
                <label
                  htmlFor={field.name}
                  className="block text-sm font-semibold text-slate-700"
                >
                  Nombre completo
                </label>

                <input
                  id={field.name}
                  name={field.name}
                  type="text"
                  autoComplete="name"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(event) => {
                    limpiarErrorSubmit();

                    field.handleChange(
                      event.target.value,
                    );
                  }}
                  maxLength={150}
                  className={[
                    "mt-2 w-full rounded-lg border px-4 py-3 outline-none transition focus:ring-2",
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
            name="email"
            validators={{
              onBlur: ({ value }) =>
                validarEmail(value),

              onSubmit: ({ value }) =>
                validarEmail(value),
            }}
          >
            {(field) => (
              <div>
                <label
                  htmlFor={field.name}
                  className="block text-sm font-semibold text-slate-700"
                >
                  Email
                </label>

                <input
                  id={field.name}
                  name={field.name}
                  type="email"
                  autoComplete="email"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(event) => {
                    limpiarErrorSubmit();

                    field.handleChange(
                      event.target.value,
                    );
                  }}
                  className={[
                    "mt-2 w-full rounded-lg border px-4 py-3 outline-none transition focus:ring-2",
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


          <div className="grid gap-5 sm:grid-cols-2">
            <form.Field
              name="password"
              validators={{
                onBlur: ({ value }) =>
                  validarPassword(value),

                onSubmit: ({ value }) =>
                  validarPassword(value),
              }}
            >
              {(field) => (
                <div>
                  <label
                    htmlFor={field.name}
                    className="block text-sm font-semibold text-slate-700"
                  >
                    Contraseña
                  </label>

                  <input
                    id={field.name}
                    name={field.name}
                    type="password"
                    autoComplete="new-password"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(event) => {
                      limpiarErrorSubmit();

                      field.handleChange(
                        event.target.value,
                      );
                    }}
                    className={[
                      "mt-2 w-full rounded-lg border px-4 py-3 outline-none transition focus:ring-2",
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
              name="confirmPassword"
              validators={{
                onBlur: ({
                  value,
                  fieldApi,
                }) => {
                  const password =
                    fieldApi.form.getFieldValue(
                      "password",
                    );

                  if (!value) {
                    return (
                      "Confirmá la contraseña."
                    );
                  }

                  if (value !== password) {
                    return (
                      "Las contraseñas no coinciden."
                    );
                  }

                  return undefined;
                },

                onSubmit: ({
                  value,
                  fieldApi,
                }) => {
                  const password =
                    fieldApi.form.getFieldValue(
                      "password",
                    );

                  if (!value) {
                    return (
                      "Confirmá la contraseña."
                    );
                  }

                  if (value !== password) {
                    return (
                      "Las contraseñas no coinciden."
                    );
                  }

                  return undefined;
                },
              }}
            >
              {(field) => (
                <div>
                  <label
                    htmlFor={field.name}
                    className="block text-sm font-semibold text-slate-700"
                  >
                    Confirmar contraseña
                  </label>

                  <input
                    id={field.name}
                    name={field.name}
                    type="password"
                    autoComplete="new-password"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(event) => {
                      limpiarErrorSubmit();

                      field.handleChange(
                        event.target.value,
                      );
                    }}
                    className={[
                      "mt-2 w-full rounded-lg border px-4 py-3 outline-none transition focus:ring-2",
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
          </div>


          <form.Subscribe
            selector={(state) => ({
              canSubmit: state.canSubmit,
              isSubmitting:
                state.isSubmitting,
            })}
          >
            {({
              canSubmit,
              isSubmitting,
            }) => (
              <button
                type="submit"
                disabled={
                  !canSubmit
                  || isSubmitting
                }
                className="w-full rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
              >
                {isSubmitting
                  ? "Creando cuenta..."
                  : "Crear cuenta"}
              </button>
            )}
          </form.Subscribe>
        </form>


        <p className="mt-6 text-center text-sm text-slate-600">
          ¿Ya tenés una cuenta?{" "}

          <Link
            to="/login"
            className="font-semibold text-blue-600 transition hover:text-blue-700"
          >
            Iniciá sesión
          </Link>
        </p>


        <p className="mt-4 text-center text-sm">
          <Link
            to="/"
            className="font-medium text-slate-500 transition hover:text-slate-700"
          >
            Volver al catálogo
          </Link>
        </p>
      </section>
    </main>
  );
}


export default RegisterPage;