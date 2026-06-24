import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { message } from 'antd'
import { supabase } from '../lib/supabase'
import type { CartItem, Order, OrderItem, OrderItemInsert } from '../types'

const ORDER_KEY = 'orders'

// ─── Fetch all orders (newest first) ────────────────────────────────────────
export function useOrders() {
  return useQuery<Order[]>({
    queryKey: [ORDER_KEY],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false })
      if (error) throw error
      return data as Order[]
    },
  })
}

// ─── Fetch order items for a specific order ──────────────────────────────────
export function useOrderItems(orderId: string | null) {
  return useQuery<OrderItem[]>({
    queryKey: [ORDER_KEY, orderId, 'items'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('order_items')
        .select('*')
        .eq('order_id', orderId!)
        .order('id', { ascending: true })
      if (error) throw error
      return data as OrderItem[]
    },
    enabled: !!orderId,
  })
}

// ─── Create order (with items + deduct stock) ────────────────────────────────
interface CreateOrderPayload {
  items: CartItem[]
  note?: string
}

export function useCreateOrder() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async ({ items, note }: CreateOrderPayload) => {
      const totalPrice = items.reduce(
        (sum, i) => sum + i.product.price * i.quantity,
        0
      )

      // 1. Insert order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({ total_price: totalPrice, note: note ?? null })
        .select()
        .single()
      if (orderError) throw orderError

      // 2. Insert order_items (snapshot tên, đơn vị tính, giá tại thời điểm bán)
      const orderItems: OrderItemInsert[] = items.map((i) => ({
        order_id: order.id,
        product_id: i.product.id,
        product_name: i.product.name,
        product_unit: i.product.unit || 'cái',
        quantity: i.quantity,
        price_at_time: i.product.price,
      }))

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems)
      if (itemsError) throw itemsError

      // 3. Deduct stock for each product (trừ theo hệ số quy đổi: số lượng bán * ratio)
      for (const item of items) {
        const deductQty = item.quantity * item.selected_unit.ratio
        const newQty = Math.max(0, item.product.quantity - deductQty)
        const { error: stockError } = await supabase
          .from('products')
          .update({ quantity: newQty })
          .eq('id', item.product.id)
        if (stockError) throw stockError
      }

      return order as Order
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [ORDER_KEY] })
      qc.invalidateQueries({ queryKey: ['products'] })
      message.success('Thanh toán thành công! 🎉')
    },
    onError: (err) => {
      message.error(`Lỗi thanh toán: ${err.message}`)
    },
  })
}
