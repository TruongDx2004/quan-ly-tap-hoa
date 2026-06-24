import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { message } from 'antd'
import { supabase } from '../lib/supabase'
import type { Product, ProductInsert, ProductUpdate, ProductUnitConversion } from '../types'

const QUERY_KEY = 'products'

// ─── Fetch all products (with optional search, category filter, and nested units) ──
export function useProducts(search?: string, category?: string) {
  return useQuery<Product[]>({
    queryKey: [QUERY_KEY, search, category],
    queryFn: async () => {
      let query = supabase
        .from('products')
        .select('*, product_units(*)')
        .order('created_at', { ascending: false })

      if (category && category !== 'Tất cả') {
        query = query.eq('category', category)
      }

      if (search && search.trim()) {
        const term = search.trim()

        // Cần tìm kiếm theo cả mã vạch của đơn vị quy đổi phụ
        // Nhờ Postgres RLS/Join hoặc ta filter Client. Để đơn giản, ta tìm theo barcode sản phẩm mẹ
        // hoặc tìm sản phẩm có unit phụ trùng barcode.
        // Đầu tiên, lấy list product_ids khớp barcode phụ
        const { data: matchedSubUnits } = await supabase
          .from('product_units')
          .select('product_id')
          .eq('barcode', term)

        const subProductIds = (matchedSubUnits ?? []).map(u => u.product_id)

        if (subProductIds.length > 0) {
          query = query.or(`name.ilike.%${term}%,barcode.eq.${term},id.in.(${subProductIds.join(',')})`)
        } else {
          query = query.or(`name.ilike.%${term}%,barcode.eq.${term}`)
        }
      }

      const { data, error } = await query
      if (error) throw error
      return data as Product[]
    },
  })
}

// ─── Fetch single product ────────────────────────────────────────────────────
export function useProduct(id: string | null) {
  return useQuery<Product>({
    queryKey: [QUERY_KEY, id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*, product_units(*)')
        .eq('id', id!)
        .single()
      if (error) throw error
      return data as Product
    },
    enabled: !!id,
  })
}

// ─── Create product (Support nested product_units) ──────────────────────────
export function useCreateProduct() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (productPayload: ProductInsert & { product_units?: Omit<ProductUnitConversion, 'id' | 'product_id'>[] }) => {
      const { product_units, ...product } = productPayload

      // 1. Thêm sản phẩm mẹ
      const { data: newProduct, error } = await supabase
        .from('products')
        .insert(product)
        .select()
        .single()
      if (error) throw error

      // 2. Thêm các đơn vị quy đổi phụ nếu có
      if (product_units && product_units.length > 0) {
        const units = product_units.map((u) => ({
          ...u,
          product_id: newProduct.id,
          barcode: u.barcode?.trim() || null,
        }))
        const { error: unitsError } = await supabase
          .from('product_units')
          .insert(units)
        if (unitsError) throw unitsError
      }

      return newProduct as Product
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [QUERY_KEY] })
      message.success('Thêm sản phẩm thành công!')
    },
    onError: (err) => {
      message.error(`Lỗi: ${err.message}`)
    },
  })
}

// ─── Update product (Support nested product_units) ──────────────────────────
export function useUpdateProduct() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: ProductUpdate & { product_units?: ProductUnitConversion[] } }) => {
      const { product_units, ...product } = data

      // 1. Cập nhật thông tin sản phẩm mẹ
      const { data: updated, error } = await supabase
        .from('products')
        .update(product)
        .eq('id', id)
        .select()
        .single()
      if (error) throw error

      // 2. Cập nhật đơn vị quy đổi (Xóa tất cả đơn vị cũ của sản phẩm này và thêm mới)
      const { error: deleteError } = await supabase
        .from('product_units')
        .delete()
        .eq('product_id', id)
      if (deleteError) throw deleteError

      if (product_units && product_units.length > 0) {
        const units = product_units.map(({ id: _, ...u }) => ({
          ...u,
          product_id: id,
          barcode: u.barcode?.trim() || null,
        }))
        const { error: insertError } = await supabase
          .from('product_units')
          .insert(units)
        if (insertError) throw insertError
      }

      return updated as Product
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [QUERY_KEY] })
      qc.invalidateQueries({ queryKey: ['dashboard'] }) // Cập nhật cả dashboard
      message.success('Cập nhật sản phẩm thành công!')
    },
    onError: (err) => {
      message.error(`Lỗi: ${err.message}`)
    },
  })
}

// ─── Delete product ──────────────────────────────────────────────────────────
export function useDeleteProduct() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('products').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [QUERY_KEY] })
      qc.invalidateQueries({ queryKey: ['dashboard'] })
      message.success('Đã xóa sản phẩm!')
    },
    onError: (err) => {
      message.error(`Lỗi: ${err.message}`)
    },
  })
}

// ─── Upload product image ─────────────────────────────────────────────────────
export async function uploadProductImage(file: File): Promise<string> {
  const ext = file.name.split('.').pop()
  const fileName = `${Date.now()}.${ext}`
  const { error } = await supabase.storage
    .from('product-images')
    .upload(fileName, file, { upsert: false })
  if (error) throw error

  const { data } = supabase.storage
    .from('product-images')
    .getPublicUrl(fileName)
  return data.publicUrl
}
