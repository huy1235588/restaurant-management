## Why

Hệ thống quản lý nhà hàng hiện tại chỉ có trang `/admin` dành cho nhân viên. Cần một trang chủ công khai để khách hàng có thể:
- Xem thông tin nhà hàng và menu
- Đặt bàn trực tuyến
- Liên hệ với nhà hàng

Đây là tính năng quan trọng cho đồ án tốt nghiệp vì demo được khả năng xây dựng landing page hiện đại với Next.js và tích hợp với backend API có sẵn.

## What Changes

### Frontend (app/client)
- Triển khai landing page tại `/` với các section:
  - **Hero**: Banner chính với tên nhà hàng, slogan, CTA đặt bàn
  - **About**: Giới thiệu ngắn về nhà hàng
  - **Menu Preview**: Hiển thị các món ăn nổi bật từ API
  - **Reservation**: Form đặt bàn tích hợp với Reservation API
  - **Contact**: Thông tin liên hệ, bản đồ, giờ mở cửa
  - **Footer**: Links, social media, copyright

- Tạo module `home/` theo cấu trúc feature-based hiện có
- Responsive design cho mobile và desktop
- Hỗ trợ dark/light mode
- Đa ngôn ngữ (EN/VI) với i18next

### Backend (app/server)
- **Không cần thay đổi** - Sử dụng API có sẵn:
  - `GET /api/menu` - Lấy danh sách menu items
  - `GET /api/categories` - Lấy danh mục
  - `POST /api/reservations` - Tạo đặt bàn mới
  - `GET /api/tables` - Kiểm tra bàn trống

### Cấu hình nhà hàng
- Hardcode thông tin nhà hàng trong config file (phù hợp đồ án demo)
- Dễ dàng mở rộng thành API settings sau này nếu cần

## Impact

- **Affected specs**: None (new capability)
- **Affected code**: 
  - `app/client/src/app/page.tsx` (hiện đang empty)
  - `app/client/src/modules/home/` (new)
  - `app/client/locales/` (thêm translations)
- **Dependencies**: Sử dụng Framer Motion, Radix UI có sẵn trong project
- **Risk**: Thấp - không ảnh hưởng đến các tính năng admin hiện có
