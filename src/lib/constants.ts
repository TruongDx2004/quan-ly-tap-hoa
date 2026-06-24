// ─── Danh mục sản phẩm ───────────────────────────────────────────────────────
export const PRODUCT_CATEGORIES = [
  'Thực phẩm',
  'Đồ uống',
  'Bánh kẹo & Snack',
  'Đồ gia dụng',
  'Hóa mỹ phẩm',
  'Vật liệu xây dựng',
  'Điện - Nước',
  'Văn phòng phẩm',
  'Khác',
] as const

export type ProductCategory = (typeof PRODUCT_CATEGORIES)[number]

// Icon cho danh mục
export const CATEGORY_ICONS: Record<string, string> = {
  'Thực phẩm': '🍚',
  'Đồ uống': '🥤',
  'Bánh kẹo & Snack': '🍬',
  'Đồ gia dụng': '🏠',
  'Hóa mỹ phẩm': '🧴',
  'Vật liệu xây dựng': '🧱',
  'Điện - Nước': '💡',
  'Văn phòng phẩm': '📎',
  'Khác': '📦',
}

// ─── Đơn vị tính ──────────────────────────────────────────────────────────────
export const PRODUCT_UNITS = [
  'cái',
  'lon',
  'chai',
  'gói',
  'lốc',
  'hộp',
  'thùng',
  'bao',
  'kg',
  'mét',
  'cuộn',
  'tấm',
  'viên',
  'bộ',
  'đôi',
  'lít',
] as const

export type ProductUnit = (typeof PRODUCT_UNITS)[number]
