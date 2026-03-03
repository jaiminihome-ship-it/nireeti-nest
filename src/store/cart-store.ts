'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Product, CartItem, Coupon } from '@/types';

interface CartStore {
  items: CartItem[];
  coupon: Coupon | null;
  discount: number;

  // Actions
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  applyCoupon: (coupon: Coupon, discount: number) => void;
  removeCoupon: () => void;

  // Computed
  getTotal: () => number;
  getSubtotal: () => number;
  getItemCount: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      coupon: null,
      discount: 0,

      addItem: (product: Product, quantity = 1) => {
        set((state) => {
          const existingItem = state.items.find((item) => item.id === product.id);

          if (existingItem) {
            return {
              items: state.items.map((item) =>
                item.id === product.id
                  ? { ...item, quantity: Math.min(item.quantity + quantity, product.stock) }
                  : item
              ),
            };
          }

          return {
            items: [...state.items, { id: product.id, product, quantity: Math.min(quantity, product.stock) }],
          };
        });
      },

      removeItem: (productId: string) => {
        set((state) => ({
          items: state.items.filter((item) => item.id !== productId),
        }));
      },

      updateQuantity: (productId: string, quantity: number) => {
        set((state) => {
          if (quantity <= 0) {
            return {
              items: state.items.filter((item) => item.id !== productId),
            };
          }

          return {
            items: state.items.map((item) =>
              item.id === productId
                ? { ...item, quantity: Math.min(quantity, item.product.stock) }
                : item
            ),
          };
        });
      },

      clearCart: () => {
        set({ items: [], coupon: null, discount: 0 });
      },

      applyCoupon: (coupon: Coupon, discount: number) => {
        set({ coupon, discount });
      },

      removeCoupon: () => {
        set({ coupon: null, discount: 0 });
      },

      getTotal: () => {
        const state = get();
        const subtotal = state.items.reduce(
          (total, item) => total + item.product.price * item.quantity,
          0
        );
        return Math.max(0, subtotal - state.discount);
      },

      getSubtotal: () => {
        const state = get();
        return state.items.reduce(
          (total, item) => total + item.product.price * item.quantity,
          0
        );
      },

      getItemCount: () => {
        const state = get();
        return state.items.reduce((count, item) => count + item.quantity, 0);
      },
    }),
    {
      name: 'homedecor-cart',
    }
  )
);
