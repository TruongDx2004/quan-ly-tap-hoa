-- ============================================================
-- GROCERY POS - Database Schema
-- Chạy trong Supabase Dashboard > SQL Editor
-- ============================================================

-- 1. Bảng sản phẩm
create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  price numeric(12,0) not null check (price >= 0),
  cost_price numeric(12,0) check (cost_price >= 0),
  quantity numeric(10,2) not null default 0 check (quantity >= 0),
  category text not null default 'Khác',
  unit text not null default 'cái',
  barcode text unique,
  image_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2. Bảng đơn hàng
create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  total_price numeric(12,0) not null check (total_price >= 0),
  note text,
  created_at timestamptz not null default now()
);

-- 3. Bảng chi tiết đơn hàng
create table if not exists order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  product_id uuid references products(id) on delete set null,
  product_name text not null,   -- snapshot tên tại thời điểm bán
  product_unit text,            -- snapshot đơn vị tính tại thời điểm bán
  quantity numeric(10,2) not null check (quantity > 0),
  price_at_time numeric(12,0) not null check (price_at_time >= 0),
  created_at timestamptz not null default now()
);

-- ============================================================
-- Indexes
-- ============================================================
create index if not exists idx_products_name on products using gin(to_tsvector('simple', name));
create index if not exists idx_products_barcode on products(barcode);
create index if not exists idx_order_items_order_id on order_items(order_id);
create index if not exists idx_orders_created_at on orders(created_at desc);

-- ============================================================
-- Auto-update updated_at trigger
-- ============================================================
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists products_updated_at on products;
create trigger products_updated_at
  before update on products
  for each row execute function update_updated_at();

-- ============================================================
-- Row Level Security (RLS)
-- Cho phép tất cả anon (không cần đăng nhập) - phù hợp 1 cửa hàng
-- Nếu cần bảo mật hơn, bật Auth và thêm policy theo user_id
-- ============================================================
alter table products enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;

-- Cho phép đọc/ghi với anon key
create policy "Allow all for anon" on products for all using (true) with check (true);
create policy "Allow all for anon" on orders for all using (true) with check (true);
create policy "Allow all for anon" on order_items for all using (true) with check (true);

-- ============================================================
-- Supabase Storage Bucket cho ảnh sản phẩm
-- Tự động tạo bucket và phân quyền RLS
-- ============================================================
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do update set public = true;

-- Xóa policy cũ nếu có để tránh lỗi trùng tên
drop policy if exists "Allow public read product-images" on storage.objects;
drop policy if exists "Allow anon upload product-images" on storage.objects;
drop policy if exists "Allow anon delete product-images" on storage.objects;

-- Tạo policy mới cho phép anon đọc/ghi ảnh
create policy "Allow public read product-images" on storage.objects
  for select using (bucket_id = 'product-images');

create policy "Allow anon upload product-images" on storage.objects
  for insert with check (bucket_id = 'product-images');

create policy "Allow anon delete product-images" on storage.objects
  for delete using (bucket_id = 'product-images');
