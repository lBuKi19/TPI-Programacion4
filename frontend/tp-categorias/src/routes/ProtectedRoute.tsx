import type {
  ReactNode,
} from "react";

import {
  Navigate,
  useLocation,
} from "react-router-dom";

import {
  useAuthStore,
} from "../store/authStore";

import LoadingState from "../shared/components/LoadingState";

import type {
  RolUsuario,
} from "../features/auth/types/auth.types";


interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: RolUsuario[];
}


function ProtectedRoute({
  children,
  allowedRoles,
}: ProtectedRouteProps) {
  const location = useLocation();

  const user = useAuthStore(
    (state) => state.user,
  );

  const isChecking = useAuthStore(
    (state) => state.isChecking,
  );


  if (isChecking) {
    return (
      <main className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <LoadingState
          message="Comprobando sesión..."
        />
      </main>
    );
  }


  if (user === null) {
    const destination = [
      location.pathname,
      location.search,
      location.hash,
    ].join("");

    return (
      <Navigate
        to="/login"
        replace
        state={{
          from: destination,
        }}
      />
    );
  }


  const tieneRolPermitido =
    allowedRoles === undefined
    || allowedRoles.includes(
      user.role,
    );


  if (!tieneRolPermitido) {
    return (
      <Navigate
        to="/unauthorized"
        replace
      />
    );
  }


  return children;
}


export default ProtectedRoute;