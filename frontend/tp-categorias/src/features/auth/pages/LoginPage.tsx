import {
  useEffect,
  type FormEvent,
} from "react";

import { useForm } from "@tanstack/react-form";

import {
  Link,
  Navigate,
  useLocation,
  useNavigate,
} from "react-router-dom";

import {
  useAuthStore,
} from "../../../store/authStore";


interface LoginFormData {
  username: string;
  password: string;
}


interface LoginLocationState {
  from?: string;
  registrationSuccess?: boolean;
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

  if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    return (
      "El nombre de usuario solo puede contener "
      + "letras, números y guion bajo."
    );
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

  return undefined;
}


function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const user = useAuthStore(
    (state) => state.user,
  );

  const login = useAuthStore(
    (state) => state.login,
  );

  const isSubmitting = useAuthStore(
    (state) => state.isSubmitting,
  );

  const error = useAuthStore(
    (state) => state.error,
  );

  const clearError = useAuthStore(
    (state) => state.clearError,
  );


  const locationState =
    location.state as
      | LoginLocationState
      | null;


  useEffect(() => {
    clearError();
  }, [clearError]);


  const form = useForm({
    defaultValues: {
      username: "",
      password: "",
    } satisfies LoginFormData,

    onSubmit: async ({ value }) => {
      try {
        await login({
          username: value.username
            .trim()
            .toLowerCase(),

          password: value.password,
        });

        navigate(
          locationState?.from ?? "/",
          {
            replace: true,
          },
        );
      } catch {
        /*
         * AuthStore transforma el error de Axios
         * y guarda el mensaje en su propiedad error.
         */
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


  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-12">
      <section className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl">
        <header>
          <p className="text-sm font-semibold text-blue-600">
            Food Store
          </p>

          <h1 className="mt-1 text-3xl font-bold text-slate-900">
            Iniciar sesión
          </h1>

          <p className="mt-2 text-sm text-slate-600">
            Ingresá con tu nombre de usuario y contraseña.
          </p>
        </header>


        {locationState?.registrationSuccess === true && (
          <div
            role="status"
            className="mt-6 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700"
          >
            Cuenta creada correctamente. Ya podés iniciar sesión.
          </div>
        )}


        {error !== null && (
          <div
            role="alert"
            className="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
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
                    clearError();

                    field.handleChange(
                      event.target.value,
                    );
                  }}
                  disabled={isSubmitting}
                  autoFocus
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
                  autoComplete="current-password"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(event) => {
                    clearError();

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
                  || isSubmitting
                  || formIsSubmitting
                }
                className="w-full rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
              >
                {isSubmitting
                  || formIsSubmitting
                  ? "Ingresando..."
                  : "Iniciar sesión"}
              </button>
            )}
          </form.Subscribe>
        </form>


        <p className="mt-6 text-center text-sm text-slate-600">
          ¿No tenés una cuenta?{" "}

          <Link
            to="/register"
            className="font-semibold text-blue-600 transition hover:text-blue-700"
          >
            Registrate
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


export default LoginPage;