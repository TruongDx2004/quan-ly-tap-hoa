/**
 * Format a number as Vietnamese Dong (VND)
 * Example: 25000 → "25.000 ₫"
 */
export function formatCurrency(value: number | null | undefined): string {
  if (value == null) return '—'
  return value.toLocaleString('vi-VN') + ' ₫'
}

/**
 * Format datetime in Vietnamese style
 * Example: "23/06/2026 14:30"
 */
export function formatDateTime(isoString: string): string {
  const date = new Date(isoString)
  return date.toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

/**
 * Short UUID (first 8 chars) for display
 */
export function shortId(id: string): string {
  return id.slice(0, 8).toUpperCase()
}
