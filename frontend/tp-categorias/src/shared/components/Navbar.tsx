import {
  useState,
} from "react";

import {
  Link,
  NavLink,
  useNavigate,
} from "react-router-dom";

import {
  useQueryClient,
} from "@tanstack/react-query";

import {
  useAuthStore,
} from "../../store/authStore";

import {
  seleccionarCantidadTotal,
  useCartStore,
} from "../../store/cartStore";


function obtenerClaseNavLink({
  isActive,
}: {
  isActive: boolean;
}): string {
  const base =
    "rounded-lg px-3 py-2 text-sm font-semibold transition";

  if (isActive) {
    return [
      base,
      "bg-blue-600 text-white",
    ].join(" ");
  }

  return [
    base,
    "text-slate-300",
    "hover:bg-slate-800",
    "hover:text-white",
  ].join(" ");
}


function Navbar() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [menuAbierto, setMenuAbierto] =
    useState(false);

  const user = useAuthStore(
    (state) => state.user,
  );

  const logout = useAuthStore(
    (state) => state.logout,
  );

  const isSubmitting = useAuthStore(
    (state) => state.isSubmitting,
  );

  const cantidadCarrito = useCartStore(
    seleccionarCantidadTotal,
  );

  const esAdmin =
    user?.role === "admin";


  function cerrarMenu(): void {
    setMenuAbierto(false);
  }


  async function handleLogout(): Promise<void> {
    try {
      await logout();
    } catch {
      /*
       * El store limpia la copia local incluso
       * si el servidor no responde.
       */
    } finally {
      queryClient.clear();
      cerrarMenu();

      navigate(
        "/login",
        {
          replace: true,
        },
      );
    }
  }


  return (
    <header className="bg-slate-900 text-white shadow-md">
      <nav className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4">
          <Link
            to="/"
            onClick={cerrarMenu}
            className="shrink-0"
          >
            <p className="text-xs font-semibold uppercase tracking-widest text-blue-300">
              Food Store
            </p>

            <p className="mt-1 text-xl font-bold text-white">
              Tienda en línea
            </p>
          </Link>


          <button
            type="button"
            aria-label="Abrir menú de navegación"
            aria-expanded={menuAbierto}
            aria-controls="navbar-content"
            onClick={() => {
              setMenuAbierto(
                (estadoActual) =>
                  !estadoActual,
              );
            }}
            className="rounded-lg border border-slate-700 px-3 py-2 text-sm font-semibold text-slate-200 transition hover:bg-slate-800 lg:hidden"
          >
            Menú
          </button>


          <div
            id="navbar-content"
            className={[
              "absolute left-0 right-0 top-[80px] z-50 border-t border-slate-700 bg-slate-900 px-4 py-4 shadow-lg",
              "lg:static lg:z-auto lg:flex lg:flex-1 lg:items-center lg:justify-end lg:gap-5 lg:border-0 lg:bg-transparent lg:p-0 lg:shadow-none",
              menuAbierto
                ? "block"
                : "hidden lg:flex",
            ].join(" ")}
          >
            <div className="flex flex-col gap-2 lg:flex-row lg:items-center">
              <NavLink
                to="/"
                end
                className={obtenerClaseNavLink}
                onClick={cerrarMenu}
              >
                Catálogo
              </NavLink>

              <NavLink
                to="/carrito"
                className={obtenerClaseNavLink}
                onClick={cerrarMenu}
              >
                <span className="inline-flex items-center gap-2">
                  Carrito

                  {cantidadCarrito > 0 && (
                    <span className="inline-flex min-w-6 items-center justify-center rounded-full bg-amber-400 px-1.5 py-0.5 text-xs font-bold text-slate-900">
                      {cantidadCarrito}
                    </span>
                  )}
                </span>
              </NavLink>

              {user !== null && (
                <NavLink
                  to="/mis-pedidos"
                  className={obtenerClaseNavLink}
                  onClick={cerrarMenu}
                >
                  Mis pedidos
                </NavLink>
              )}

              {esAdmin && (
                <>
                  <NavLink
                    to="/admin/resumen"
                    className={obtenerClaseNavLink}
                    onClick={cerrarMenu}
                  >
                    Resumen
                  </NavLink>

                  <NavLink
                    to="/admin/categorias"
                    className={obtenerClaseNavLink}
                    onClick={cerrarMenu}
                  >
                    Categorías
                  </NavLink>

                  <NavLink
                    to="/admin/productos"
                    className={obtenerClaseNavLink}
                    onClick={cerrarMenu}
                  >
                    Productos
                  </NavLink>

                  <NavLink
                    to="/admin/pedidos"
                    className={obtenerClaseNavLink}
                    onClick={cerrarMenu}
                  >
                    Pedidos
                  </NavLink>

                  <NavLink
                    to="/admin/usuarios"
                    className={obtenerClaseNavLink}
                    onClick={cerrarMenu}
                  >
                    Usuarios
                  </NavLink>
                </>
              )}
            </div>


            {user === null ? (
              <div className="mt-4 flex flex-col gap-2 border-t border-slate-700 pt-4 lg:mt-0 lg:flex-row lg:border-l lg:border-t-0 lg:pl-5 lg:pt-0">
                <Link
                  to="/login"
                  onClick={cerrarMenu}
                  className="rounded-lg border border-blue-400 px-4 py-2 text-center text-sm font-semibold text-blue-300 transition hover:bg-blue-500 hover:text-white"
                >
                  Iniciar sesión
                </Link>

                <Link
                  to="/register"
                  onClick={cerrarMenu}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-center text-sm font-semibold text-white transition hover:bg-blue-700"
                >
                  Registrarse
                </Link>
              </div>
            ) : (
              <div className="mt-4 flex flex-col gap-3 border-t border-slate-700 pt-4 lg:mt-0 lg:flex-row lg:items-center lg:border-l lg:border-t-0 lg:pl-5 lg:pt-0">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-white">
                    {user.full_name}
                  </p>

                  <p className="truncate text-xs text-slate-400">
                    @{user.username}
                  </p>

                  <span
                    className={[
                      "mt-1 inline-flex rounded-full px-2 py-0.5 text-xs font-semibold",
                      user.role === "admin"
                        ? (
                          "bg-purple-100 "
                          + "text-purple-700"
                        )
                        : (
                          "bg-blue-100 "
                          + "text-blue-700"
                        ),
                    ].join(" ")}
                  >
                    {user.role}
                  </span>
                </div>

                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => {
                    void handleLogout();
                  }}
                  className="rounded-lg border border-red-400 px-4 py-2 text-sm font-semibold text-red-300 transition hover:bg-red-500 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isSubmitting
                    ? "Cerrando..."
                    : "Cerrar sesión"}
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
}


export default Navbar;