import { create } from 'zustand'
import type { CartItem, Product, SelectedUnit } from '../types'

interface CartStore {
  items: CartItem[]
  addToCart: (product: Product, selectedUnit?: SelectedUnit) => void
  updateQuantity: (productId: string, unitName: string, quantity: number) => void
  removeFromCart: (productId: string, unitName: string) => void
  clearCart: () => void
}

export const useCartStore = create<CartStore>((set, get) => ({
  items: [],

  addToCart: (product: Product, selectedUnit?: SelectedUnit) => {
    const { items } = get()
    const unit = selectedUnit || { name: product.unit, price: product.price, ratio: 1 }

    const existing = items.find(
      (item) => item.product.id === product.id && item.selected_unit.name === unit.name
    )

    if (existing) {
      set({
        items: items.map((item) =>
          item.product.id === product.id && item.selected_unit.name === unit.name
            ? { ...item, quantity: item.quantity + 1 }
            : item
        ),
      })
    } else {
      set({ items: [...items, { product, quantity: 1, selected_unit: unit }] })
    }
  },

  updateQuantity: (productId: string, unitName: string, quantity: number) => {
    if (quantity <= 0) {
      get().removeFromCart(productId, unitName)
      return
    }
    set({
      items: get().items.map((item) =>
        item.product.id === productId && item.selected_unit.name === unitName
          ? { ...item, quantity }
          : item
      ),
    })
  },

  removeFromCart: (productId: string, unitName: string) => {
    set({
      items: get().items.filter(
        (item) => !(item.product.id === productId && item.selected_unit.name === unitName)
      ),
    })
  },

  clearCart: () => set({ items: [] }),
}))

// ─── Selector: tính tổng tiền từ items (theo giá của đơn vị tính được chọn) ─
export const selectCartTotal = (state: CartStore) =>
  state.items.reduce((sum, item) => sum + item.selected_unit.price * item.quantity, 0)
