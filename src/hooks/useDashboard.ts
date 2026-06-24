import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'

export interface DashboardStats {
  totalProducts: number
  totalStock: number
  lowStockCount: number
  outOfStockCount: number
  totalInventoryValue: number
  todayRevenue: number
  todayOrders: number
  monthRevenue: number
  monthOrders: number
  recentOrders: RecentOrder[]
  topProducts: TopProduct[]
  categoryStats: CategoryStat[]
}

export interface RecentOrder {
  id: string
  total_price: number
  created_at: string
}

export interface TopProduct {
  product_name: string
  total_sold: number
  total_revenue: number
}

export interface CategoryStat {
  category: string
  productCount: number
  totalStock: number
  inventoryValue: number
}

const LOW_STOCK = 5

export function useDashboard() {
  return useQuery<DashboardStats>({
    queryKey: ['dashboard'],
    queryFn: async () => {
      const now = new Date()
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString()
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

      // Run all queries in parallel
      const [productsRes, todayOrdersRes, monthOrdersRes, recentOrdersRes, topProductsRes] =
        await Promise.all([
          // All products (select * để tương thích nếu migration chưa chạy)
          supabase.from('products').select('*'),

          // Today's orders
          supabase
            .from('orders')
            .select('id, total_price')
            .gte('created_at', todayStart),

          // This month's orders
          supabase
            .from('orders')
            .select('id, total_price')
            .gte('created_at', monthStart),

          // Recent 5 orders
          supabase
            .from('orders')
            .select('id, total_price, created_at')
            .order('created_at', { ascending: false })
            .limit(5),

          // Top 5 sold products (this month) — join with orders to filter by date
          supabase
            .from('order_items')
            .select('product_name, quantity, price_at_time, orders!inner(created_at)')
            .gte('orders.created_at', monthStart),
        ])

      if (productsRes.error) throw productsRes.error
      if (todayOrdersRes.error) throw todayOrdersRes.error
      if (monthOrdersRes.error) throw monthOrdersRes.error
      if (recentOrdersRes.error) throw recentOrdersRes.error
      if (topProductsRes.error) throw topProductsRes.error

      const products = productsRes.data ?? []
      const todayOrders = todayOrdersRes.data ?? []
      const monthOrders = monthOrdersRes.data ?? []
      const recentOrders = (recentOrdersRes.data ?? []) as RecentOrder[]
      const orderItems = topProductsRes.data ?? []

      // Aggregate top products by name
      const productMap = new Map<string, { total_sold: number; total_revenue: number }>()
      for (const item of orderItems) {
        const existing = productMap.get(item.product_name)
        if (existing) {
          existing.total_sold += item.quantity
          existing.total_revenue += item.quantity * item.price_at_time
        } else {
          productMap.set(item.product_name, {
            total_sold: item.quantity,
            total_revenue: item.quantity * item.price_at_time,
          })
        }
      }
      const topProducts: TopProduct[] = [...productMap.entries()]
        .map(([product_name, stats]) => ({ product_name, ...stats }))
        .sort((a, b) => b.total_sold - a.total_sold)
        .slice(0, 5)

      // Thống kê theo danh mục
      const catMap = new Map<string, { productCount: number; totalStock: number; inventoryValue: number }>()
      for (const p of products) {
        const cat = (p as any).category || 'Khác'
        const existing = catMap.get(cat)
        if (existing) {
          existing.productCount += 1
          existing.totalStock += p.quantity
          existing.inventoryValue += p.price * p.quantity
        } else {
          catMap.set(cat, {
            productCount: 1,
            totalStock: p.quantity,
            inventoryValue: p.price * p.quantity,
          })
        }
      }
      const categoryStats: CategoryStat[] = [...catMap.entries()]
        .map(([category, s]) => ({ category, ...s }))
        .sort((a, b) => b.inventoryValue - a.inventoryValue)

      return {
        totalProducts: products.length,
        totalStock: products.reduce((s, p) => s + p.quantity, 0),
        lowStockCount: products.filter((p) => p.quantity > 0 && p.quantity < LOW_STOCK).length,
        outOfStockCount: products.filter((p) => p.quantity === 0).length,
        totalInventoryValue: products.reduce((s, p) => s + p.price * p.quantity, 0),
        todayRevenue: todayOrders.reduce((s, o) => s + o.total_price, 0),
        todayOrders: todayOrders.length,
        monthRevenue: monthOrders.reduce((s, o) => s + o.total_price, 0),
        monthOrders: monthOrders.length,
        recentOrders,
        topProducts,
        categoryStats,
      }
    },
    refetchInterval: 60_000, // auto-refresh every 1 minute
  })
}
