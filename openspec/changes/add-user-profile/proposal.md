# Proposal: Hồ Sơ Cá Nhân (User Profile)

## Why

Hiện tại UserMenu đã có link tới `/admin/profile` nhưng chưa có trang/module tương ứng. Nhân viên không thể:
- Xem thông tin cá nhân của mình
- Cập nhật thông tin liên hệ (email, SĐT)
- Đổi mật khẩu

Đây là chức năng cơ bản cần thiết cho bất kỳ hệ thống quản lý nào, đặc biệt quan trọng cho đồ án tốt nghiệp.

## What Changes

### Backend API
- **ADDED**: Endpoint `PUT /auth/profile` - Cập nhật thông tin cá nhân
- **ADDED**: Endpoint `PUT /auth/change-password` - Đổi mật khẩu (DTO đã có)
- **ADDED**: DTO `UpdateProfileDto` - Validation cho cập nhật profile

### Frontend
- **ADDED**: Module `admin/profile` với:
  - `ProfileView` - Trang chính hiển thị profile
  - `ProfileInfoCard` - Card hiển thị thông tin cá nhân
  - `EditProfileDialog` - Dialog chỉnh sửa thông tin
  - `ChangePasswordDialog` - Dialog đổi mật khẩu
  - Service gọi API
  - Hooks quản lý state
  - Types và validation schemas

- **ADDED**: Route `/admin/profile` trong app router

- **ADDED**: Translations cho module profile (vi.json, en.json)

## Impact

### Affected Code
- `app/server/src/modules/auth/auth.controller.ts` - Thêm endpoints
- `app/server/src/modules/auth/auth.service.ts` - Thêm business logic
- `app/server/src/modules/auth/dto/` - Thêm UpdateProfileDto
- `app/client/src/modules/admin/profile/` - Module mới
- `app/client/src/app/(admin)/admin/profile/page.tsx` - Trang mới
- `app/client/locales/vi.json`, `en.json` - Thêm translations

### Breaking Changes
- Không có breaking changes

### Dependencies
- Sử dụng API `GET /auth/me` đã có sẵn
- Sử dụng DTO `ChangePasswordDto` đã có sẵn
- Dựa trên auth module hiện tại

## Scope

### In Scope
- Xem thông tin cá nhân (account + staff info)
- Chỉnh sửa email, SĐT, họ tên, địa chỉ
- Đổi mật khẩu với xác nhận mật khẩu cũ
- Responsive design
- i18n (EN/VI)
- Toast notifications cho success/error

### Out of Scope
- Upload/thay đổi avatar (có thể mở rộng sau)
- Two-factor authentication
- Session management (xem các thiết bị đã đăng nhập)
- Email verification khi đổi email
- Activity log

## Risk Assessment

| Risk | Mitigation |
|------|------------|
| Trùng email/SĐT khi cập nhật | Validate unique trong service |
| Mật khẩu yếu | Sử dụng validation minLength 6 |
| XSS trong input | Sanitize input ở cả frontend và backend |

## Estimated Effort

- **Backend API**: 1-2 giờ
- **Frontend Module**: 3-4 giờ
- **Testing + Polish**: 1 giờ
- **Tổng**: ~5-7 giờ

