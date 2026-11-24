import { create } from "zustand";

import {
  createJSONStorage,
  persist,
} from "zustand/middleware";

import {
  cerrarSesion,
  iniciarSesion,
  obtenerSesionActual,
} from "../features/auth/api/authService";

import {
  obtenerMensajeApiError,
} from "../shared/api/errorHandler";

import type {
  LoginData,
  UsuarioAuth,
} from "../features/auth/types/auth.types";


interface AuthState {
  user: UsuarioAuth | null;
  isChecking: boolean;
  isSubmitting: boolean;
  error: string | null;

  login: (
    datos: LoginData,
  ) => Promise<UsuarioAuth>;

  logout: () => Promise<void>;

  checkSession: () => Promise<void>;

  clearUser: () => void;

  clearError: () => void;
}


export const useAuthStore =
  create<AuthState>()(
    persist(
      (set) => ({
        user: null,
        isChecking: true,
        isSubmitting: false,
        error: null,

        login: async (
          datos: LoginData,
        ): Promise<UsuarioAuth> => {
          set({
            isSubmitting: true,
            error: null,
          });

          try {
            const user =
              await iniciarSesion(datos);

            set({
              user,
              isChecking: false,
              isSubmitting: false,
              error: null,
            });

            return user;
          } catch (error) {
            const message =
              obtenerMensajeApiError(
                error,
                "No se pudo iniciar sesión.",
              );

            set({
              user: null,
              isChecking: false,
              isSubmitting: false,
              error: message,
            });

            throw error;
          }
        },

        logout: async (): Promise<void> => {
          set({
            isSubmitting: true,
            error: null,
          });

          try {
            await cerrarSesion();

            set({
              user: null,
              isChecking: false,
              isSubmitting: false,
              error: null,
            });
          } catch (error) {
            const message =
              obtenerMensajeApiError(
                error,
                "No se pudo cerrar la sesión.",
              );

            set({
              user: null,
              isChecking: false,
              isSubmitting: false,
              error: message,
            });

            throw error;
          }
        },

        checkSession:
          async (): Promise<void> => {
            set({
              isChecking: true,
            });

            try {
              const user =
                await obtenerSesionActual();

              set({
                user,
                isChecking: false,
                isSubmitting: false,
                error: null,
              });
            } catch {
              set({
                user: null,
                isChecking: false,
                isSubmitting: false,
                error: null,
              });
            }
          },

        clearUser: (): void => {
          set({
            user: null,
            isChecking: false,
            isSubmitting: false,
            error: null,
          });
        },

        clearError: (): void => {
          set({
            error: null,
          });
        },
      }),

      {
        name: "food-store-auth",

        storage: createJSONStorage(
          () => sessionStorage,
        ),

        partialize: (state) => ({
          user: state.user,
        }),

        onRehydrateStorage: () => (
          state,
          error,
        ) => {
          if (error !== undefined) {
            console.error(
              "No se pudo recuperar "
              + "la sesión local:",
              error,
            );
          }

          if (state !== undefined) {
            state.isChecking = true;
            state.isSubmitting = false;
            state.error = null;
          }
        },
      },
    ),
  );