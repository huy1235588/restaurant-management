# Audit RBAC Permissions

## Why

Dự án đã triển khai hệ thống Role-Based Access Control (RBAC) với 5 vai trò (admin, manager, waiter, chef, cashier), nhưng chưa có quy trình kiểm tra toàn diện để đảm bảo việc phân quyền đã được triển khai đúng theo tài liệu thiết kế. Cần audit để:
- Xác định các endpoint chưa được bảo vệ đúng cách
- Đảm bảo tính nhất quán giữa tài liệu use case và implementation thực tế
- Phát hiện các lỗ hổng bảo mật tiềm ẩn trong phân quyền

## What Changes

### 1. Audit Backend Controllers
- Kiểm tra tất cả controllers trong `app/server/src/modules/`
- So sánh với ma trận phân quyền trong tài liệu
- Xác định các endpoint thiếu `@Roles()` decorator

### 2. Các Module Cần Kiểm Tra
| Module | Hiện trạng | Vấn đề phát hiện |
|--------|-----------|------------------|
| **Menu** | `@UseGuards(JwtAuthGuard)` | Thiếu `@Roles()` - Tất cả user đều có thể CRUD menu |
| **Category** | `@UseGuards(JwtAuthGuard)` | Thiếu `@Roles()` - Tất cả user đều có thể CRUD category |
| **Staff** | `@UseGuards(JwtAuthGuard)` | Thiếu `@Roles()` - Waiter có thể tạo/xóa nhân viên |
| **Table** | `@UseGuards(JwtAuthGuard)` | Thiếu `@Roles()` - Chef có thể CRUD table |
| **Reservation** | `@UseGuards(JwtAuthGuard)` | Cần phân quyền chi tiết hơn |
| **Order** | `@UseGuards(JwtAuthGuard)` | Cần phân quyền cho các operation khác nhau |
| **Kitchen** | `@UseGuards(JwtAuthGuard)` | Cần giới hạn cho chef |
| **Billing** | Có `@Roles('admin')` cho delete | Cần thêm cho các operation khác |
| **Reports** | Có `@Roles()` đầy đủ | ✅ OK |
| **Restaurant Settings** | Có `@Roles()` cho update | Cần kiểm tra các endpoint khác |

### 3. Các Sửa Đổi Cần Thực Hiện

#### 3.1 Menu Controller
- GET: Tất cả roles
- POST/PUT/DELETE: admin, manager

#### 3.2 Category Controller  
- GET: Tất cả roles
- POST/PUT/DELETE: admin, manager

#### 3.3 Staff Controller
- GET (list): admin, manager
- GET (detail): admin, manager, hoặc chính user đó
- POST/PUT/DELETE: admin
- PATCH role: admin

#### 3.4 Table Controller
- GET: Tất cả roles
- POST/PUT/DELETE: admin, manager

#### 3.5 Order Controller
- GET: Tất cả roles
- POST (create): admin, manager, waiter
- PATCH (add items): admin, manager, waiter
- DELETE (cancel): admin, manager, waiter (owner)
- PATCH (status): admin, manager

#### 3.6 Kitchen Controller
- GET: admin, manager, chef
- PATCH (update status): admin, manager, chef

#### 3.7 Billing Controller
- GET: admin, manager, cashier, waiter
- POST (create): admin, manager, cashier, waiter
- PATCH (discount): admin, manager
- POST (payment): admin, manager, cashier
- DELETE (void): admin

#### 3.8 Reservation Controller
- GET: Tất cả roles
- POST: admin, manager, waiter
- PATCH (status): admin, manager, waiter
- DELETE: admin, manager

## Impact

- **Affected specs**: backend-framework, authentication (nếu có)
- **Affected code**:
  - `app/server/src/modules/menu/menu.controller.ts`
  - `app/server/src/modules/category/category.controller.ts`
  - `app/server/src/modules/staff/staff.controller.ts`
  - `app/server/src/modules/table/table.controller.ts`
  - `app/server/src/modules/order/order.controller.ts`
  - `app/server/src/modules/kitchen/kitchen.controller.ts`
  - `app/server/src/modules/billing/billing.controller.ts`
  - `app/server/src/modules/reservation/reservation.controller.ts`
- **Breaking changes**: Không, nhưng một số user có thể mất quyền truy cập endpoint mà trước đó họ có thể gọi được
- **Security impact**: Cao - Fix các lỗ hổng phân quyền

## Ma Trận Phân Quyền Mục Tiêu

| Resource | Action | Admin | Manager | Waiter | Chef | Cashier |
|----------|--------|-------|---------|--------|------|---------|
| **Menu** | Read | ✓ | ✓ | ✓ | ✓ | ✓ |
| **Menu** | Create/Update/Delete | ✓ | ✓ | ✗ | ✗ | ✗ |
| **Category** | Read | ✓ | ✓ | ✓ | ✓ | ✓ |
| **Category** | Create/Update/Delete | ✓ | ✓ | ✗ | ✗ | ✗ |
| **Staff** | Read All | ✓ | ✓ | ✗ | ✗ | ✗ |
| **Staff** | Read Self | ✓ | ✓ | ✓ | ✓ | ✓ |
| **Staff** | Create/Update/Delete | ✓ | ✗ | ✗ | ✗ | ✗ |
| **Staff** | Change Role | ✓ | ✗ | ✗ | ✗ | ✗ |
| **Staff** | Activate/Deactivate | ✓ | ✓ | ✗ | ✗ | ✗ |
| **Table** | Read | ✓ | ✓ | ✓ | ✓ | ✓ |
| **Table** | Create/Update/Delete | ✓ | ✓ | ✗ | ✗ | ✗ |
| **Order** | Read | ✓ | ✓ | ✓ | ✓ | ✓ |
| **Order** | Create | ✓ | ✓ | ✓ | ✗ | ✗ |
| **Order** | Add Items | ✓ | ✓ | ✓ | ✗ | ✗ |
| **Order** | Cancel | ✓ | ✓ | ✓* | ✗ | ✗ |
| **Order** | Update Status | ✓ | ✓ | ✗ | ✗ | ✗ |
| **Kitchen** | Read | ✓ | ✓ | ✓ | ✓ | ✗ |
| **Kitchen** | Update Status | ✓ | ✓ | ✗ | ✓ | ✗ |
| **Billing** | Read | ✓ | ✓ | ✓ | ✗ | ✓ |
| **Billing** | Create | ✓ | ✓ | ✓ | ✗ | ✓ |
| **Billing** | Apply Discount | ✓ | ✓ | ✗ | ✗ | ✗ |
| **Billing** | Process Payment | ✓ | ✓ | ✗ | ✗ | ✓ |
| **Billing** | Void | ✓ | ✗ | ✗ | ✗ | ✗ |
| **Reservation** | Read | ✓ | ✓ | ✓ | ✓ | ✓ |
| **Reservation** | Create/Update | ✓ | ✓ | ✓ | ✗ | ✗ |
| **Reservation** | Delete/Cancel | ✓ | ✓ | ✗ | ✗ | ✗ |
| **Reports** | Read | ✓ | ✓ | ✗ | ✗ | ✓** |
| **Settings** | Read | ✓ | ✓ | ✓ | ✓ | ✓ |
| **Settings** | Update | ✓ | ✓ | ✗ | ✗ | ✗ |

*Waiter chỉ cancel được order của chính mình
**Cashier chỉ xem được Revenue Report

## References

- `/docs/use_case/AUTHENTICATION_MANAGEMENT.md` - Ma trận phân quyền chi tiết
- `/docs/use_case/STAFF_MANAGEMENT.md` - Quyền hạn quản lý nhân viên
- `/docs/use_case/MENU_MANAGEMENT.md` - Quyền quản lý menu
- `/docs/use_case/ORDER_MANAGEMENT.md` - Quyền quản lý đơn hàng
- `/docs/use_case/BILL_PAYMENT_MANAGEMENT.md` - Quyền thanh toán
- `/docs/use_case/RESERVATION_MANAGEMENT.md` - Quyền đặt bàn
