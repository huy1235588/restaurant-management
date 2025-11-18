# Types Structure Documentation

Các types được tổ chức thành các file riêng biệt theo module chức năng để dễ bảo trì và tránh tệp quá lớn.

## Cấu trúc thư mục

```
src/types/
├── index.ts              # Central re-export của tất cả types
├── auth.ts              # Authentication & User types
├── order.ts             # Order & OrderItem types
├── menu.ts              # MenuItem & Category types
├── table.ts             # Table & TableStatus types
├── bill.ts              # Bill & Payment types
├── reservation.ts       # Reservation, Customer, Availability types
├── kitchen.ts           # Kitchen-related types
├── inventory.ts         # Ingredient, Supplier, Stock types
├── dashboard.ts         # Dashboard statistics types
├── api.ts               # API response wrapper types
└── permissions.ts       # RBAC permission constants & functions
```

## Mô tả các file

### `auth.ts`
- User, UserRole, LoginCredentials
- AuthResponse, LoginFormData
- **Sử dụng**: Authentication services, auth store

### `order.ts`
- Order, OrderItem, OrderStatus, OrderType
- OrderFormData, SocketOrder
- **Sử dụng**: Order management features, kitchen display

### `menu.ts`
- MenuItem, Category
- **Sử dụng**: Menu management, item selection

### `table.ts`
- Table, TableStatus, SocketTable
- **Sử dụng**: Table management, floor plan, dining area

### `bill.ts`
- Bill, Payment, PaymentMethod, PaymentStatus
- **Sử dụng**: Billing & payment processing

### `reservation.ts`
- Reservation, Customer, ReservationStatus
- AvailableTable, AvailabilityCheck
- ReservationFormData, DTOs
- **Sử dụng**: Reservation management features

### `kitchen.ts`
- KitchenOrder, KitchenOrderItem
- **Sử dụng**: Kitchen display system (KDS)

### `inventory.ts`
- Ingredient, IngredientCategory, IngredientBatch
- Supplier, PurchaseOrder, PurchaseOrderItem
- StockTransaction, StockAlert
- Create/Update DTOs cho inventory
- **Sử dụng**: Inventory management, stock tracking

### `dashboard.ts`
- DashboardStats, RevenueChartData
- CategorySalesData
- **Sử dụng**: Dashboard analytics & statistics

### `api.ts`
- ApiResponse, PaginatedResponse
- ApiError
- **Sử dụng**: API client services, HTTP responses

### `permissions.ts`
- ROLE_PERMISSIONS constant
- hasPermission() function
- **Sử dụng**: RBAC checking, layout navigation

## Cách sử dụng

### Import từ index (cách cũ vẫn hoạt động)
```typescript
import { 
    Reservation, 
    User, 
    ApiResponse,
    hasPermission 
} from '@/types';
```

### Import từ specific module (tối ưu hơn)
```typescript
// Nếu chỉ dùng reservation types
import type { Reservation, Customer } from '@/types/reservation';

// Nếu dùng auth + permission checking
import { User } from '@/types/auth';
import { hasPermission, ROLE_PERMISSIONS } from '@/types/permissions';

// Nếu dùng API response
import type { ApiResponse, PaginatedResponse } from '@/types/api';
```

## Dependencies giữa các file

```
auth.ts (không phụ thuộc vào ai)
├── reservation.ts (phụ thuộc: User từ auth)
├── order.ts (phụ thuộc: User từ auth)
├── bill.ts (phụ thuộc: User từ auth)
├── inventory.ts (phụ thuộc: User từ auth)
│
table.ts (phụ thuộc: Order từ order.ts)
│
menu.ts (không phụ thuộc vào ai)
│
permissions.ts (phụ thuộc: UserRole từ auth)
│
dashboard.ts (không phụ thuộc vào ai)
│
api.ts (không phụ thuộc vào ai)
│
kitchen.ts (phụ thuộc: OrderStatus từ order.ts)
```

## Lợi ích

1. **Dễ bảo trì**: Mỗi file quản lý một domain riêng
2. **Performance**: IDE load từng file nhỏ hơn
3. **Tree-shaking**: Bundle nhỏ hơn khi import specific types
4. **Organization**: Dễ tìm types theo chức năng
5. **Tái sử dụng**: DTOs & interfaces được organize rõ ràng

## Migration Notes

- Tất cả imports từ `@/types` vẫn hoạt động qua index.ts
- Không cần update imports hiện tại
- Có thể optimize imports trong tương lai bằng cách dùng specific files

## Best Practices

1. **Import cả interface + type**
```typescript
import type { Reservation, ReservationStatus } from '@/types/reservation';
```

2. **Avoid circular imports** - Dùng `any` cho relationships
```typescript
// Thay vì import Table từ table.ts
table?: any; // Table type từ table.ts
```

3. **DTOs ở cùng file với main type**
```typescript
// CreateReservationDto ở reservation.ts cùng với Reservation
// CreateIngredientDto ở inventory.ts cùng với Ingredient
```

4. **Permissions ở file riêng**
```typescript
// permissions.ts chứa ROLE_PERMISSIONS & hasPermission()
import { hasPermission } from '@/types/permissions';
```
