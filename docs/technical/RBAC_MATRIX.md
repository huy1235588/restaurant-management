# RBAC Permission Matrix

## Overview

Bảng phân quyền chi tiết cho tất cả API endpoints trong hệ thống Restaurant Management.

**Roles**:
- `admin`: Quản trị viên hệ thống - toàn quyền
- `manager`: Quản lý nhà hàng - hầu hết quyền trừ một số admin-only
- `waiter`: Phục vụ - chủ yếu order và reservation
- `chef`: Đầu bếp - kitchen operations
- `cashier`: Thu ngân - billing và thanh toán

**Legend**:
- ✅ = Có quyền
- ❌ = Không có quyền
- 🔓 = Public (không cần authentication)

---

## Authentication Module

| Endpoint | Method | admin | manager | waiter | chef | cashier | Notes |
|----------|--------|-------|---------|--------|------|---------|-------|
| /auth/login | POST | 🔓 | 🔓 | 🔓 | 🔓 | 🔓 | Public |
| /auth/logout | POST | ✅ | ✅ | ✅ | ✅ | ✅ | All authenticated |
| /auth/refresh | POST | ✅ | ✅ | ✅ | ✅ | ✅ | All authenticated |
| /auth/me | GET | ✅ | ✅ | ✅ | ✅ | ✅ | All authenticated |
| /auth/change-password | POST | ✅ | ✅ | ✅ | ✅ | ✅ | All authenticated |

---

## Menu Module

| Endpoint | Method | admin | manager | waiter | chef | cashier | Notes |
|----------|--------|-------|---------|--------|------|---------|-------|
| /menu | GET | ✅ | ✅ | ✅ | ✅ | ✅ | All authenticated |
| /menu/:id | GET | ✅ | ✅ | ✅ | ✅ | ✅ | All authenticated |
| /menu | POST | ✅ | ✅ | ❌ | ❌ | ❌ | Create menu item |
| /menu/:id | PUT | ✅ | ✅ | ❌ | ❌ | ❌ | Update menu item |
| /menu/:id | DELETE | ✅ | ✅ | ❌ | ❌ | ❌ | Delete menu item |
| /menu/:id/availability | PATCH | ✅ | ✅ | ❌ | ❌ | ❌ | Toggle availability |

---

## Category Module

| Endpoint | Method | admin | manager | waiter | chef | cashier | Notes |
|----------|--------|-------|---------|--------|------|---------|-------|
| /categories | GET | ✅ | ✅ | ✅ | ✅ | ✅ | All authenticated |
| /categories/:id | GET | ✅ | ✅ | ✅ | ✅ | ✅ | All authenticated |
| /categories | POST | ✅ | ✅ | ❌ | ❌ | ❌ | Create category |
| /categories/:id | PUT | ✅ | ✅ | ❌ | ❌ | ❌ | Update category |
| /categories/:id | DELETE | ✅ | ✅ | ❌ | ❌ | ❌ | Delete category |

---

## Staff Module

| Endpoint | Method | admin | manager | waiter | chef | cashier | Notes |
|----------|--------|-------|---------|--------|------|---------|-------|
| /staff | GET | ✅ | ✅ | ❌ | ❌ | ❌ | List all staff |
| /staff/available-accounts | GET | ✅ | ✅ | ❌ | ❌ | ❌ | Available accounts |
| /staff/role/:role | GET | ✅ | ✅ | ❌ | ❌ | ❌ | Staff by role |
| /staff/:id | GET | ✅ | ✅ | ❌ | ❌ | ❌ | Get staff detail |
| /staff | POST | ✅ | ❌ | ❌ | ❌ | ❌ | Create staff |
| /staff/:id | PUT | ✅ | ❌ | ❌ | ❌ | ❌ | Update staff |
| /staff/:id | DELETE | ✅ | ❌ | ❌ | ❌ | ❌ | Delete staff |
| /staff/:id/activate | PATCH | ✅ | ✅ | ❌ | ❌ | ❌ | Activate staff |
| /staff/:id/deactivate | PATCH | ✅ | ✅ | ❌ | ❌ | ❌ | Deactivate staff |
| /staff/:id/role | PATCH | ✅ | ❌ | ❌ | ❌ | ❌ | Change role |

---

## Table Module

| Endpoint | Method | admin | manager | waiter | chef | cashier | Notes |
|----------|--------|-------|---------|--------|------|---------|-------|
| /tables | GET | ✅ | ✅ | ✅ | ✅ | ✅ | All authenticated |
| /tables/:id | GET | ✅ | ✅ | ✅ | ✅ | ✅ | All authenticated |
| /tables | POST | ✅ | ✅ | ❌ | ❌ | ❌ | Create table |
| /tables/:id | PUT | ✅ | ✅ | ❌ | ❌ | ❌ | Update table |
| /tables/:id | DELETE | ✅ | ✅ | ❌ | ❌ | ❌ | Delete table |
| /tables/bulk-status | PATCH | ✅ | ✅ | ❌ | ❌ | ❌ | Bulk update status |

---

## Order Module

| Endpoint | Method | admin | manager | waiter | chef | cashier | Notes |
|----------|--------|-------|---------|--------|------|---------|-------|
| /orders | GET | ✅ | ✅ | ✅ | ✅ | ✅ | All authenticated |
| /orders/count | GET | ✅ | ✅ | ✅ | ✅ | ✅ | All authenticated |
| /orders/:id | GET | ✅ | ✅ | ✅ | ✅ | ✅ | All authenticated |
| /orders | POST | ✅ | ✅ | ✅ | ❌ | ❌ | Create order |
| /orders/:id/items | PATCH | ✅ | ✅ | ✅ | ❌ | ❌ | Add items |
| /orders/:id/items/:itemId | DELETE | ✅ | ✅ | ✅ | ❌ | ❌ | Cancel item |
| /orders/:id | DELETE | ✅ | ✅ | ❌ | ❌ | ❌ | Cancel order |
| /orders/:id/status | PATCH | ✅ | ✅ | ❌ | ❌ | ❌ | Update status |
| /orders/:id/items/:itemId/serve | PATCH | ✅ | ✅ | ✅ | ❌ | ❌ | Mark as served |

---

## Kitchen Module

| Endpoint | Method | admin | manager | waiter | chef | cashier | Notes |
|----------|--------|-------|---------|--------|------|---------|-------|
| /kitchen/orders | GET | ✅ | ✅ | ✅ | ✅ | ❌ | View kitchen queue |
| /kitchen/orders/:id | GET | ✅ | ✅ | ✅ | ✅ | ❌ | View order detail |
| /kitchen/orders/:id/start | PATCH | ✅ | ✅ | ❌ | ✅ | ❌ | Start preparing |
| /kitchen/orders/:id/ready | PATCH | ✅ | ✅ | ❌ | ✅ | ❌ | Mark as ready |
| /kitchen/orders/:id/complete | PATCH | ✅ | ✅ | ❌ | ✅ | ❌ | Mark completed |
| /kitchen/orders/:id/cancel | PATCH | ✅ | ✅ | ❌ | ✅ | ❌ | Cancel order |

---

## Billing Module

| Endpoint | Method | admin | manager | waiter | chef | cashier | Notes |
|----------|--------|-------|---------|--------|------|---------|-------|
| /bills | GET | ✅ | ✅ | ✅ | ❌ | ✅ | List bills |
| /bills/:id | GET | ✅ | ✅ | ✅ | ❌ | ✅ | Get bill detail |
| /bills | POST | ✅ | ✅ | ✅ | ❌ | ✅ | Create bill |
| /bills/:id/discount | PATCH | ✅ | ✅ | ❌ | ❌ | ❌ | Apply discount |
| /bills/:id/payment | POST | ✅ | ✅ | ❌ | ❌ | ✅ | Process payment |
| /bills/:id | DELETE | ✅ | ❌ | ❌ | ❌ | ❌ | Void bill |

---

## Reservation Module

| Endpoint | Method | admin | manager | waiter | chef | cashier | Notes |
|----------|--------|-------|---------|--------|------|---------|-------|
| /reservations | GET | ✅ | ✅ | ✅ | ❌ | ❌ | List reservations |
| /reservations/check-availability | GET | ✅ | ✅ | ✅ | ❌ | ❌ | Check availability |
| /reservations/phone/:phone | GET | ✅ | ✅ | ✅ | ❌ | ❌ | Find by phone |
| /reservations/code/:code | GET | ✅ | ✅ | ✅ | ❌ | ❌ | Find by code |
| /reservations/:id | GET | ✅ | ✅ | ✅ | ❌ | ❌ | Get detail |
| /reservations | POST | ✅ | ✅ | ✅ | ❌ | ❌ | Create |
| /reservations/:id | PUT | ✅ | ✅ | ✅ | ❌ | ❌ | Update |
| /reservations/:id/confirm | PATCH | ✅ | ✅ | ✅ | ❌ | ❌ | Confirm |
| /reservations/:id/seated | PATCH | ✅ | ✅ | ✅ | ❌ | ❌ | Mark seated |
| /reservations/:id/complete | PATCH | ✅ | ✅ | ✅ | ❌ | ❌ | Complete |
| /reservations/:id/cancel | PATCH | ✅ | ✅ | ❌ | ❌ | ❌ | Cancel |
| /reservations/:id/no-show | PATCH | ✅ | ✅ | ❌ | ❌ | ❌ | Mark no-show |

---

## Summary by Role

### Admin
- Full access to all endpoints
- Only role that can:
  - Create/delete staff
  - Change staff roles
  - Void bills
  - Access all management functions

### Manager
- Almost full access except:
  - Cannot create/delete staff
  - Cannot change staff roles
  - Cannot void bills
- Can manage:
  - Menu, categories, tables
  - Orders, kitchen, billing
  - Staff activation/deactivation
  - Reservations (including cancel)

### Waiter
- Front-of-house operations:
  - View menu, tables
  - Create/manage orders
  - View/create bills
  - Manage reservations (except cancel/no-show)
- Cannot:
  - Manage staff, menu items, categories
  - Cancel orders
  - Process payments
  - Kitchen operations

### Chef
- Kitchen-focused access:
  - View menu items
  - Full kitchen display access
  - Start, complete, cancel kitchen orders
- Cannot:
  - Create orders
  - Manage reservations
  - Process payments
  - Staff management

### Cashier
- Payment-focused access:
  - View and create bills
  - Process payments
  - View orders and tables
- Cannot:
  - Create orders
  - Kitchen operations
  - Manage reservations
  - Apply discounts (manager only)

---

## Implementation Notes

### Guards Used
```typescript
@UseGuards(JwtAuthGuard)  // Authentication
@UseGuards(RolesGuard)    // Authorization
```

### Decorator Usage
```typescript
@Roles('admin', 'manager')  // Only these roles allowed
```

### Error Response
When a user doesn't have permission:
```json
{
  "statusCode": 403,
  "message": "Forbidden resource",
  "error": "Forbidden"
}
```

---

## Last Updated
December 2024 - Audit RBAC Permissions implementation
