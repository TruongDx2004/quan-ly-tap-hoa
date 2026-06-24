-- ============================================================
-- MIGRATION 003: Bảng Đơn vị quy đổi
-- Chạy trong Supabase Dashboard > SQL Editor
-- ============================================================

CREATE TABLE IF NOT EXISTS product_units (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  unit_name text NOT NULL,        -- e.g. 'lốc', 'thùng', 'hộp'
  ratio numeric(10,2) NOT NULL,   -- e.g. 1 lốc = 4 hộp (ratio = 4), 1 thùng = 30 gói (ratio = 30)
  price numeric(12,0) NOT NULL check (price >= 0), -- Giá của đơn vị này
  barcode text unique,            -- Barcode riêng cho thùng/lốc nếu có
  created_at timestamptz DEFAULT now()
);

-- Index tối ưu truy vấn
CREATE INDEX IF NOT EXISTS idx_product_units_product_id ON product_units(product_id);
CREATE INDEX IF NOT EXISTS idx_product_units_barcode ON product_units(barcode);

-- Cho phép đọc/ghi với anon key (RLS)
alter table product_units enable row level security;
create policy "Allow all for anon" on product_units for all using (true) with check (true);
