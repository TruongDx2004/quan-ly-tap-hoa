# Hướng Dẫn Thiết Lập Supabase & Chạy Dự Án

Hệ thống quản lý tạp hóa / vật liệu xây dựng (Mini POS) hoạt động bằng cách gọi trực tiếp API của Supabase từ Frontend.
Hãy làm theo các bước dưới đây để thiết lập cơ sở dữ liệu và chạy dự án.

---

## Bước 1: Tạo dự án Supabase
1. Truy cập [Supabase Dashboard](https://supabase.com/) và đăng nhập (miễn phí).
2. Chọn **New Project** → Tạo một dự án mới (chọn Region gần Việt Nam nhất như Singapore).
3. Đợi vài phút để Supabase khởi tạo dự án của bạn.

---

## Bước 2: Tạo các Bảng dữ liệu và Storage Bucket (SQL Editor)
1. Trong thanh điều hướng bên trái của Supabase Dashboard, click chọn **SQL Editor**.
2. Chọn **New Query** (hoặc tạo một Editor trống mới).
3. Sao chép toàn bộ nội dung file SQL dưới đây và dán vào Editor:
   *(File SQL này nằm tại: `supabase/migrations/001_init.sql`)*
4. Nhấn nút **Run** (chạy) để thực thi.
   - Các bảng `products`, `orders`, `order_items` và các triggers, chính sách RLS sẽ được tự động tạo.
   - **Đặc biệt**: File SQL này cũng sẽ tự động tạo bucket `product-images` trên Supabase Storage và cấu hình chính sách đọc/ghi công khai (Public Read/Write) cho bucket đó. Bạn không cần làm thủ công bước tạo Storage nữa!

---

## Bước 2.5: Cấu hình Tính năng Quy đổi Đơn vị tính (Hộp, Lốc, Thùng...)
Nếu bạn đã tạo database trước đó, hoặc vừa tạo xong ở Bước 2, bạn cần chạy thêm file này để kích hoạt bảng đơn vị quy đổi phụ:
1. Tạo một Editor mới trong **SQL Editor**.
2. Copy và chạy nội dung file SQL sau:
   *(File SQL này nằm tại: `supabase/migrations/003_product_conversions.sql`)*
3. Nhấn nút **Run** (chạy). Bảng `product_units` sẽ được thêm vào database để lưu trữ giá và hệ số quy đổi cho các đơn vị phụ.

---

## Bước 3: Kiểm tra Storage Bucket (Tùy chọn)
Nếu bạn muốn kiểm tra xem Bucket và Policies đã được tạo đúng chưa:
1. Click chọn **Storage** ở thanh bên trái của Supabase Dashboard.
2. Bạn sẽ thấy bucket tên là: `product-images`.
3. Bucket này phải ở trạng thái **Public** (Công khai).
4. Các chính sách RLS (Policies) đã được tự động thêm để cho phép người dùng ẩn danh (anonymous) đọc và tải ảnh lên. Nếu quá trình upload ảnh từ web vẫn báo lỗi, hãy kiểm tra xem bạn đã chạy đúng toàn bộ file SQL ở Bước 2 chưa.

---

## Bước 4: Cấu hình Environment Variables (`.env.local`)
1. Click vào icon **Settings** (bánh răng) ở góc dưới cùng bên trái Supabase Dashboard.
2. Chọn mục **API**.
3. Tìm phần **Project API keys** và copy:
   - **Project URL**
   - **anon public key**
4. Mở file `.env.local` ở thư mục gốc của dự án này và dán giá trị tương ứng vào:
   ```env
   VITE_SUPABASE_URL=https://<your-project-id>.supabase.co
   VITE_SUPABASE_ANON_KEY=<your-anon-public-key>
   ```

---

## Bước 5: Cài đặt và Chạy Dự Án
Do Claude Code chưa được cấp quyền chạy lệnh bash `npm install` trên máy của bạn, bạn hãy tự chạy lệnh này trên terminal của máy mình:

1. **Cài đặt các gói phụ thuộc mới**:
   ```bash
   npm install
   ```
   *(Lệnh này sẽ tự động cài thêm `react-hook-form`, `@hookform/resolvers`, `@ant-design/icons` và các thư viện khác đã được cập nhật trong `package.json`)*

2. **Chạy ứng dụng ở chế độ phát triển (Dev Mode)**:
   ```bash
   npm run dev
   ```

3. **Xây dựng ứng dụng để triển khai thực tế (Build)**:
   ```bash
   npm run build
   ```

---

## Bước 6: Deploy miễn phí
Sau khi kiểm tra dự án chạy mượt mà trên máy cục bộ, bạn có thể triển khai miễn phí lên Vercel hoặc Cloudflare Pages:

### Deploy lên Vercel (Khuyên dùng):
1. Cài đặt Vercel CLI: `npm install -g vercel`
2. Chạy lệnh: `vercel`
3. Thiết lập các biến môi trường `VITE_SUPABASE_URL` và `VITE_SUPABASE_ANON_KEY` trong phần Settings của project trên Vercel Dashboard.

Chúc cửa hàng kinh doanh hồng phát! 🏪🚀
