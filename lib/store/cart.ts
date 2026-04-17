'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type CartItem = {
  productId: string
  productName: string
  productSlug: string
  imageUrl: string | null
  price: number
  color: string | null
  size: string | null
  quantity: number
}

type CartStore = {
  items: CartItem[]
  addItem: (item: Omit<CartItem, 'quantity'>) => void
  removeItem: (productId: string, color: string | null, size: string | null) => void
  updateQuantity: (productId: string, color: string | null, size: string | null, qty: number) => void
  clearCart: () => void
  totalCount: () => number
  totalAmount: () => number
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item) => {
        set((state) => {
          const idx = state.items.findIndex(
            (i) => i.productId === item.productId && i.color === item.color && i.size === item.size
          )
          if (idx !== -1) {
            const updated = [...state.items]
            updated[idx] = { ...updated[idx], quantity: updated[idx].quantity + 1 }
            return { items: updated }
          }
          return { items: [...state.items, { ...item, quantity: 1 }] }
        })
      },

      removeItem: (productId, color, size) => {
        set((state) => ({
          items: state.items.filter(
            (i) => !(i.productId === productId && i.color === color && i.size === size)
          ),
        }))
      },

      updateQuantity: (productId, color, size, qty) => {
        if (qty <= 0) {
          get().removeItem(productId, color, size)
          return
        }
        set((state) => ({
          items: state.items.map((i) =>
            i.productId === productId && i.color === color && i.size === size
              ? { ...i, quantity: qty }
              : i
          ),
        }))
      },

      clearCart: () => set({ items: [] }),

      totalCount: () => get().items.reduce((sum, i) => sum + i.quantity, 0),

      totalAmount: () => get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),
    }),
    { name: 'ongyeol-cart' }
  )
)
