-- ============================================================
-- MIGRATION 002: Thêm Danh mục & Đơn vị tính
-- Chạy trong Supabase Dashboard > SQL Editor
-- Dành cho cơ sở dữ liệu đã tồn tại từ migration 001
-- ============================================================

-- Thêm cột danh mục và đơn vị tính vào bảng sản phẩm
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS category text NOT NULL DEFAULT 'Khác',
  ADD COLUMN IF NOT EXISTS unit text NOT NULL DEFAULT 'cái';

-- Đổi kiểu dữ liệu quantity từ integer sang numeric để hỗ trợ
-- bán theo mét, kg, lít (số thập phân)
ALTER TABLE products
  ALTER COLUMN quantity TYPE numeric(10,2);

-- Thêm snapshot đơn vị tính vào chi tiết đơn hàng
ALTER TABLE order_items
  ADD COLUMN IF NOT EXISTS product_unit text;

-- Đổi kiểu dữ liệu quantity trong order_items sang numeric
ALTER TABLE order_items
  ALTER COLUMN quantity TYPE numeric(10,2);

-- Index cho tìm kiếm theo danh mục
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);

-- Xác nhận hoàn tất
DO $$
BEGIN
  RAISE NOTICE 'Migration 002 hoàn tất: Đã thêm category, unit vào products và product_unit vào order_items.';
END $$;
