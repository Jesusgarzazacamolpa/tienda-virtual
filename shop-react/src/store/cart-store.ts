import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { cartLineKey, clampQuantity, type CartLine } from '@/models/cart';

interface CartState {
  lines: CartLine[];
  addLine: (productId: string, color: string, quantity?: number) => void;
  increment: (key: string) => void;
  decrement: (key: string) => void;
  removeLine: (key: string) => void;
  clear: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      lines: [],
      addLine: (productId, color, quantity = 1) =>
        set((state) => {
          const key = cartLineKey(productId, color);
          const existing = state.lines.find((line) => line.key === key);

          if (existing) {
            return {
              lines: state.lines.map((line) =>
                line.key === key
                  ? { ...line, quantity: clampQuantity(line.quantity + quantity) }
                  : line
              )
            };
          }

          return {
            lines: [...state.lines, { key, productId, color, quantity: clampQuantity(quantity) }]
          };
        }),
      increment: (key) =>
        set((state) => ({
          lines: state.lines.map((line) =>
            line.key === key ? { ...line, quantity: clampQuantity(line.quantity + 1) } : line
          )
        })),
      decrement: (key) =>
        set((state) => ({
          lines: state.lines.map((line) =>
            line.key === key ? { ...line, quantity: clampQuantity(line.quantity - 1) } : line
          )
        })),
      removeLine: (key) =>
        set((state) => ({ lines: state.lines.filter((line) => line.key !== key) })),
      clear: () => set({ lines: [] })
    }),
    {
      name: 'orbita-cart-v1',
      partialize: (state) => ({ lines: state.lines })
    }
  )
);

export const selectCartCount = (state: CartState): number =>
  state.lines.reduce((sum, line) => sum + line.quantity, 0);
