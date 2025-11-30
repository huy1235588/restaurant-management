# Proposal: Admin Quản Lý Thông Tin Nhà Hàng

## Why

Hiện tại thông tin nhà hàng (tên, địa chỉ, SĐT, giờ mở cửa, social links...) được hardcode trong file `restaurant.config.ts` ở frontend. Admin không thể thay đổi các thông tin này mà không cần developer can thiệp vào code.

Cần tạo module admin để quản lý thông tin nhà hàng động, lưu trữ trong database và hiển thị trên trang chủ khách hàng.

## What Changes

### Database (Backend)
- **ADDED**: Model `RestaurantSettings` - Lưu trữ cài đặt nhà hàng dạng key-value với JSON
- **ADDED**: Seed data mặc định cho settings

### Backend API
- **ADDED**: Module `restaurant-settings` với controller, service, repository
- **ADDED**: Endpoints:
  - `GET /api/restaurant-settings` - Lấy tất cả settings (public)
  - `GET /api/restaurant-settings/:key` - Lấy setting theo key (public)
  - `PUT /api/restaurant-settings/:key` - Cập nhật setting (admin only)
  - `PUT /api/restaurant-settings` - Bulk update settings (admin only)

### Frontend
- **ADDED**: Module `admin/settings` với:
  - Settings form để chỉnh sửa thông tin
  - Service gọi API
  - Hooks quản lý state
- **MODIFIED**: Trang chủ sử dụng dữ liệu từ API thay vì config file
- **ADDED**: Admin sidebar menu item "Cài đặt" / "Settings"

## Impact

### Affected Code
- `app/server/prisma/schema.prisma` - Thêm model
- `app/server/src/modules/` - Thêm module mới
- `app/client/src/modules/admin/` - Thêm settings module
- `app/client/src/modules/home/` - Sử dụng API thay vì config
- `app/client/src/components/layouts/Sidebar.tsx` - Thêm menu item
- `locales/en.json`, `locales/vi.json` - Thêm translations

### Breaking Changes
- Không có breaking changes
- `restaurant.config.ts` vẫn được giữ làm fallback

### Dependencies
- Dựa trên implementation của `add-customer-homepage` proposal

## Scope

### In Scope
- CRUD settings cơ bản
- Form chỉnh sửa với validation
- Hiển thị preview trước khi lưu
- Responsive design cho admin form
- i18n (EN/VI)

### Out of Scope
- Upload logo/images (sử dụng URL có sẵn)
- Version history của settings
- Multi-tenant settings
- Import/Export settings

## Risk Assessment

| Risk | Mitigation |
|------|------------|
| Migration data loss | Seed default data từ existing config |
| API endpoint security | Phân quyền admin-only cho write operations |
| Cache invalidation | Không cần cache phức tạp cho demo |

## Estimated Effort

- **Database + Backend**: 2-3 giờ
- **Admin Frontend**: 3-4 giờ
- **Integration với Homepage**: 1-2 giờ
- **Testing + Polish**: 1-2 giờ
- **Tổng**: ~8-10 giờ

