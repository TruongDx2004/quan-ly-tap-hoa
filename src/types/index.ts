// ============================================================
// Shared TypeScript Types for Grocery POS
// ============================================================

export interface ProductUnitConversion {
  id?: string // Optional for new unsaved units
  product_id?: string
  unit_name: string
  ratio: number
  price: number
  barcode: string | null
}

export interface Product {
  id: string
  name: string
  price: number
  cost_price: number | null
  quantity: number
  category: string
  unit: string
  barcode: string | null
  image_url: string | null
  created_at: string
  updated_at: string
  product_units?: ProductUnitConversion[]
}

export type ProductInsert = Omit<Product, 'id' | 'created_at' | 'updated_at' | 'product_units'>
export type ProductUpdate = Partial<ProductInsert>

export interface Order {
  id: string
  total_price: number
  note: string | null
  created_at: string
}

export type OrderInsert = Omit<Order, 'id' | 'created_at'>

export interface OrderItem {
  id: string
  order_id: string
  product_id: string | null
  product_name: string
  product_unit: string | null
  quantity: number
  price_at_time: number
}

export type OrderItemInsert = Omit<OrderItem, 'id'>

// Order with items joined (for detail view)
export interface OrderWithItems extends Order {
  order_items: OrderItem[]
}

// Snapped unit info inside CartItem
export interface SelectedUnit {
  name: string
  price: number
  ratio: number
}

// Cart item used in POS store
export interface CartItem {
  product: Product
  quantity: number
  selected_unit: SelectedUnit
}

// Form values
export interface ProductFormValues {
  name: string
  price: number
  cost_price?: number | null
  quantity: number
  category: string
  unit: string
  barcode?: string | null
  image_url?: string | null
  product_units?: ProductUnitConversion[] // Optional sub-units
}
