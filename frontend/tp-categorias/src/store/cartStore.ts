import { create } from "zustand";

import {
  createJSONStorage,
  persist,
} from "zustand/middleware";


export interface CartItem {
  producto_id: number;
  nombre: string;
  precio_unitario: number;
  cantidad: number;
  stock_disponible: number;
  imagen_url: string | null;
}


export interface AgregarProductoData {
  producto_id: number;
  nombre: string;
  precio_unitario: number;
  stock_disponible: number;
  imagen_url: string | null;
}


interface CartState {
  items: CartItem[];

  agregar: (
    producto: AgregarProductoData,
  ) => void;

  quitar: (
    productoId: number,
  ) => void;

  cambiarCantidad: (
    productoId: number,
    cantidad: number,
  ) => void;

  vaciar: () => void;
}


function limitarCantidad(
  cantidad: number,
  stockDisponible: number,
): number {
  return Math.max(
    1,
    Math.min(
      Math.trunc(cantidad),
      stockDisponible,
    ),
  );
}


export const useCartStore =
  create<CartState>()(
    persist(
      (set) => ({
        items: [],

        agregar: (
          producto: AgregarProductoData,
        ): void => {
          if (producto.stock_disponible < 1) {
            return;
          }

          set((state) => {
            const itemExistente =
              state.items.find(
                (item) =>
                  item.producto_id
                  === producto.producto_id,
              );

            if (itemExistente === undefined) {
              return {
                items: [
                  ...state.items,
                  {
                    ...producto,
                    cantidad: 1,
                  },
                ],
              };
            }

            const nuevaCantidad =
              limitarCantidad(
                itemExistente.cantidad + 1,
                producto.stock_disponible,
              );

            return {
              items: state.items.map(
                (item) =>
                  item.producto_id
                    === producto.producto_id
                    ? {
                        ...item,
                        nombre:
                          producto.nombre,
                        precio_unitario:
                          producto.precio_unitario,
                        stock_disponible:
                          producto.stock_disponible,
                        imagen_url:
                          producto.imagen_url,
                        cantidad:
                          nuevaCantidad,
                      }
                    : item,
              ),
            };
          });
        },

        quitar: (
          productoId: number,
        ): void => {
          set((state) => ({
            items: state.items.filter(
              (item) =>
                item.producto_id
                !== productoId,
            ),
          }));
        },

        cambiarCantidad: (
          productoId: number,
          cantidad: number,
        ): void => {
          set((state) => ({
            items: state.items.map(
              (item) => {
                if (
                  item.producto_id
                  !== productoId
                ) {
                  return item;
                }

                return {
                  ...item,
                  cantidad: limitarCantidad(
                    cantidad,
                    item.stock_disponible,
                  ),
                };
              },
            ),
          }));
        },

        vaciar: (): void => {
          set({
            items: [],
          });
        },
      }),

      {
        name: "food-store-cart",

        storage: createJSONStorage(
          () => localStorage,
        ),

        partialize: (state) => ({
          items: state.items,
        }),
      },
    ),
  );


export function seleccionarCantidadTotal(
  state: CartState,
): number {
  return state.items.reduce(
    (total, item) =>
      total + item.cantidad,
    0,
  );
}


export function seleccionarTotalCarrito(
  state: CartState,
): number {
  return state.items.reduce(
    (total, item) =>
      total
      + (
        item.precio_unitario
        * item.cantidad
      ),
    0,
  );
}