import {
  useEffect,
  type ReactNode,
} from "react";

import {
  clearUnauthorizedHandler,
  setUnauthorizedHandler,
} from "../authSessionController";

import {
  useAuthStore,
} from "../../../store/authStore";


interface AuthInitializerProps {
  children: ReactNode;
}


function AuthInitializer({
  children,
}: AuthInitializerProps) {
  const checkSession = useAuthStore(
    (state) => state.checkSession,
  );

  const clearUser = useAuthStore(
    (state) => state.clearUser,
  );


  useEffect(() => {
    setUnauthorizedHandler(
      clearUser,
    );

    void checkSession();

    return () => {
      clearUnauthorizedHandler();
    };
  }, [
    checkSession,
    clearUser,
  ]);


  return children;
}


export default AuthInitializer;