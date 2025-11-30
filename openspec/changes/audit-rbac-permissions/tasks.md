## 1. Audit & Analysis

- [x] 1.1 Audit Menu Controller - Kiểm tra và ghi nhận các endpoint thiếu RBAC
- [x] 1.2 Audit Category Controller - Kiểm tra và ghi nhận các endpoint thiếu RBAC
- [x] 1.3 Audit Staff Controller - Kiểm tra và ghi nhận các endpoint thiếu RBAC
- [x] 1.4 Audit Table Controller - Kiểm tra và ghi nhận các endpoint thiếu RBAC
- [x] 1.5 Audit Order Controller - Kiểm tra và ghi nhận các endpoint thiếu RBAC
- [x] 1.6 Audit Kitchen Controller - Kiểm tra và ghi nhận các endpoint thiếu RBAC
- [x] 1.7 Audit Billing Controller - Kiểm tra và ghi nhận các endpoint thiếu RBAC
- [x] 1.8 Audit Reservation Controller - Kiểm tra và ghi nhận các endpoint thiếu RBAC
- [x] 1.9 Tạo báo cáo audit hoàn chỉnh với các vấn đề phát hiện

## 2. Fix Menu Module RBAC

- [x] 2.1 Thêm `RolesGuard` và `@Roles('admin', 'manager')` cho POST `/menu` (create)
- [x] 2.2 Thêm `@Roles('admin', 'manager')` cho PUT `/menu/:id` (update)
- [x] 2.3 Thêm `@Roles('admin', 'manager')` cho DELETE `/menu/:id` (delete)
- [x] 2.4 Thêm `@Roles('admin', 'manager')` cho PATCH `/menu/:id/availability`

## 3. Fix Category Module RBAC

- [x] 3.1 Thêm `RolesGuard` và `@Roles('admin', 'manager')` cho POST `/categories` (create)
- [x] 3.2 Thêm `@Roles('admin', 'manager')` cho PUT `/categories/:id` (update)
- [x] 3.3 Thêm `@Roles('admin', 'manager')` cho DELETE `/categories/:id` (delete)

## 4. Fix Staff Module RBAC

- [x] 4.1 Thêm `RolesGuard` cấp controller
- [x] 4.2 Thêm `@Roles('admin', 'manager')` cho GET `/staff` (list all)
- [x] 4.3 Thêm `@Roles('admin', 'manager')` cho GET `/staff/available-accounts`
- [x] 4.4 Thêm `@Roles('admin', 'manager')` cho GET `/staff/role/:role`
- [x] 4.5 Implement logic cho GET `/staff/:id` - cho phép user xem thông tin của chính mình
- [x] 4.6 Thêm `@Roles('admin')` cho POST `/staff` (create)
- [x] 4.7 Thêm `@Roles('admin')` cho PUT `/staff/:id` (update) - hoặc cho phép user sửa info của mình
- [x] 4.8 Thêm `@Roles('admin', 'manager')` cho PATCH `/staff/:id/deactivate`
- [x] 4.9 Thêm `@Roles('admin', 'manager')` cho PATCH `/staff/:id/activate`
- [x] 4.10 Thêm `@Roles('admin')` cho PATCH `/staff/:id/role`
- [x] 4.11 Thêm `@Roles('admin')` cho DELETE `/staff/:id`

## 5. Fix Table Module RBAC

- [x] 5.1 Thêm `RolesGuard` cấp controller
- [x] 5.2 Thêm `@Roles('admin', 'manager')` cho POST `/tables` (create)
- [x] 5.3 Thêm `@Roles('admin', 'manager')` cho PUT `/tables/:id` (update)
- [x] 5.4 Thêm `@Roles('admin', 'manager')` cho DELETE `/tables/:id` (delete)
- [x] 5.5 Xem xét cho phép waiter cập nhật status bàn

## 6. Fix Order Module RBAC

- [x] 6.1 Thêm `RolesGuard` cấp controller
- [x] 6.2 Thêm `@Roles('admin', 'manager', 'waiter')` cho POST `/orders` (create)
- [x] 6.3 Thêm `@Roles('admin', 'manager', 'waiter')` cho PATCH `/orders/:id/items` (add items)
- [x] 6.4 Thêm `@Roles('admin', 'manager')` cho DELETE `/orders/:id` (cancel order)
  - Hoặc implement logic cho waiter cancel order của mình
- [x] 6.5 Thêm `@Roles('admin', 'manager')` cho PATCH `/orders/:id/status`
- [x] 6.6 Thêm `@Roles('admin', 'manager', 'waiter')` cho DELETE `/orders/:id/items/:itemId`
- [x] 6.7 Thêm `@Roles('admin', 'manager', 'waiter')` cho PATCH `/orders/:id/items/:itemId/serve`

## 7. Fix Kitchen Module RBAC

- [x] 7.1 Thêm `RolesGuard` cấp controller
- [x] 7.2 Thêm `@Roles('admin', 'manager', 'chef', 'waiter')` cho GET endpoints
- [x] 7.3 Thêm `@Roles('admin', 'manager', 'chef')` cho PATCH (update status)

## 8. Fix Billing Module RBAC

- [x] 8.1 Đã có `@Roles('admin')` cho DELETE - ✅
- [x] 8.2 Thêm `@Roles('admin', 'manager', 'waiter', 'cashier')` cho GET endpoints
- [x] 8.3 Thêm `@Roles('admin', 'manager', 'waiter', 'cashier')` cho POST `/bills` (create)
- [x] 8.4 Thêm `@Roles('admin', 'manager')` cho PATCH `/bills/:id/discount`
- [x] 8.5 Thêm `@Roles('admin', 'manager', 'cashier')` cho POST `/bills/:id/payment`

## 9. Fix Reservation Module RBAC

- [x] 9.1 Thêm `RolesGuard` cấp controller
- [x] 9.2 Giữ GET endpoints public cho tất cả authenticated users
- [x] 9.3 Thêm `@Roles('admin', 'manager', 'waiter')` cho POST `/reservations` (create)
- [x] 9.4 Thêm `@Roles('admin', 'manager', 'waiter')` cho PATCH endpoints (update status)
- [x] 9.5 Thêm `@Roles('admin', 'manager')` cho DELETE `/reservations/:id`

## 10. Testing & Verification

> **Skipped**: Testing thủ công được bỏ qua theo yêu cầu. Nên thực hiện integration tests tự động trong tương lai.

- [x] ~~10.1 Test Menu endpoints với các roles khác nhau~~ (skipped)
- [x] ~~10.2 Test Category endpoints với các roles khác nhau~~ (skipped)
- [x] ~~10.3 Test Staff endpoints với các roles khác nhau~~ (skipped)
- [x] ~~10.4 Test Table endpoints với các roles khác nhau~~ (skipped)
- [x] ~~10.5 Test Order endpoints với các roles khác nhau~~ (skipped)
- [x] ~~10.6 Test Kitchen endpoints với các roles khác nhau~~ (skipped)
- [x] ~~10.7 Test Billing endpoints với các roles khác nhau~~ (skipped)
- [x] ~~10.8 Test Reservation endpoints với các roles khác nhau~~ (skipped)
- [x] ~~10.9 Verify tất cả endpoints trả về 403 Forbidden khi user không có quyền~~ (skipped)

## 11. Documentation Update

- [x] 11.1 Cập nhật Swagger documentation với thông tin roles cho mỗi endpoint
- [x] 11.2 Cập nhật API docs trong `/docs/api/`
- [x] 11.3 Tạo bảng tổng hợp RBAC matrix cuối cùng (docs/technical/RBAC_MATRIX.md)

## 12. Frontend RBAC Implementation

- [x] 12.1 Cập nhật `lib/axios.ts` - Thêm xử lý lỗi 403 Forbidden với toast message
- [x] 12.2 Cập nhật `types/permissions.ts` - Đồng bộ ROLE_PERMISSIONS với backend RBAC matrix
- [x] 12.3 Cập nhật Menu page - Ẩn/disable nút Create, Edit, Delete theo role
- [x] 12.4 Cập nhật Categories page - Ẩn/disable nút Create, Edit, Delete theo role
- [x] 12.5 Cập nhật Tables page - Ẩn/disable nút Create, Edit, Delete, Bulk actions theo role
- [x] 12.6 Cập nhật Orders page - Ẩn/disable nút Create, Cancel theo role
- [x] 12.7 Cập nhật Reservations page - Ẩn/disable nút Create, Update, Cancel theo role
