# Fix Order and Kitchen Management Issues

## Why

Phân tích kỹ thuật module Order và Kitchen đã phát hiện 13 vấn đề nghiêm trọng ảnh hưởng đến logic nghiệp vụ, hiệu suất và trải nghiệm người dùng. Các vấn đề chính bao gồm:

1. **Logic nghiệp vụ sai** - Status flow không đồng bộ, kitchen order tạo sai thời điểm
2. **Flow phức tạp không cần thiết** - Bếp phải thao tác quá nhiều bước (4 trạng thái thay vì 3)
3. **WebSocket không nhất quán** - Events khác nhau giữa Order và Kitchen, namespace mismatch
4. **Type definitions không khớp** - Frontend-backend type mismatch gây runtime errors
5. **Thiếu validation** - Không validate status transitions, business rules

Đây là dự án tốt nghiệp sinh viên nên cần đơn giản hóa flow và loại bỏ các tính năng phức tạp không cần thiết (kitchen stations, prep time estimate, auto-timeout, concurrent limits).

## What Changes

### Backend Changes (NestJS Server)

#### Critical Fixes
- **Đơn giản hóa KitchenOrderStatus enum** - Loại bỏ trạng thái `ready`, chỉ giữ: `pending → preparing → completed`
- **Fix kitchen order creation timing** - Chỉ tạo kitchen order khi order status = `confirmed`, không tạo ngay lập tức
- **Add status transition validation** - Validate transitions hợp lệ trước khi update status
- **Standardize WebSocket events** - Thống nhất event structure và naming convention

#### Database Schema Updates
- **Update KitchenOrderStatus enum** - Remove `ready` status
- **Update KitchenPriority enum** - Align với API docs: `low | normal | high | urgent`
- **Remove redundant fields** - Xóa `prepTimeEstimate`, `stationId`, `notes` trong KitchenOrder (quá phức tạp)
- **Add unique constraint** - `orderId` unique trong KitchenOrder table

#### Code Improvements
- **Simplify kitchen operations** - 2 thao tác chính: `startPreparing()` và `completeOrder()`
- **Add cascade delete** - Kitchen order tự động xóa khi order bị xóa
- **Implement optimistic locking** - Prevent concurrent chef claims
- **Add pagination** - Phân trang cho kitchen orders list

### Frontend Changes (Next.js Client)

#### Critical Fixes
- **Fix WebSocket namespaces** - Order module connect đúng `/orders` namespace
- **Update type definitions** - Financial fields dùng `string` thay vì `number` (match Prisma Decimal)
- **Simplify KitchenOrderStatus enum** - Remove `READY`, chỉ còn `PENDING → PREPARING → COMPLETED`
- **Add validation schemas** - Phone format, partySize max, quantity validation

#### Code Improvements
- **Implement error handling** - Consistent error handling trong hooks và services
- **Add memoization** - useMemo cho filtered/sorted lists
- **Debounce operations** - localStorage saves và query invalidations
- **Singleton pattern** - Apply cho Kitchen socket hooks

### Removed/Simplified Features
- ❌ Kitchen stations (grill, fry, steam) - Không cần phân chia
- ❌ Prep time estimate - Chỉ ghi nhận thời gian thực tế
- ❌ Auto-cancel timeout - Quản lý manual
- ❌ Max concurrent orders limit - Không giới hạn
- ❌ Kitchen notes field - Dùng chung specialRequest

## Impact

### Affected Specs
- `order-management` - Status flow, creation timing, WebSocket events
- `kitchen-management` - Status simplification, operations reduction, real-time updates

### Affected Code

#### Backend (app/server/src)
- `features/order/order.service.ts` - Remove kitchen order creation from createOrder()
- `features/order/order.controller.ts` - Add kitchen order trigger on confirm
- `features/kitchen/kitchen.service.ts` - Simplify operations, remove unused code
- `features/kitchen/kitchen.gateway.ts` - Standardize WebSocket events
- `features/kitchen/constants/kitchen.constants.ts` - Update status flow
- `features/kitchen/helpers/kitchen.helper.ts` - Update validation logic
- `prisma/schema.prisma` - Update enums and constraints

#### Frontend (app/client/src)
- `modules/order/hooks/useOrderSocket.ts` - Fix namespace to `/orders`
- `modules/kitchen/hooks/useKitchenSocket.ts` - Apply singleton pattern
- `modules/order/types/order.types.ts` - Update financial fields to string
- `modules/kitchen/types/kitchen.types.ts` - Simplify status enum
- `modules/order/schemas/order.schemas.ts` - Add validation constraints
- `modules/kitchen/views/KitchenDisplayView.tsx` - Add memoization
- `modules/order/views/CreateOrderView.tsx` - Debounce localStorage

### Database Migration Required
- **BREAKING**: Migration to update `KitchenOrderStatus` enum values
- **BREAKING**: Migration to update `KitchenPriority` enum values
- **Migration**: Add unique constraint on `KitchenOrder.orderId`
- **Migration**: Add cascade delete on `KitchenOrder.orderId` foreign key

### API Changes
- **BREAKING**: Kitchen order status values changed (`ready` removed)
- **Event names standardized**: `kitchen:preparing`, `kitchen:completed` (no `ready`)
- **WebSocket namespace**: Clients must connect to `/orders` and `/kitchen` correctly

### User Impact
- **Positive**: Bếp chỉ cần 2 thao tác thay vì 3-4 thao tác
- **Positive**: Real-time updates hoạt động đúng
- **Positive**: UI hiển thị status chính xác
- **Neutral**: Priority system đơn giản hơn
- **Breaking**: Existing kitchen orders with `ready` status need migration

### Testing Impact
- Manual testing các flow: create order → confirm → kitchen prepare → complete
- Test WebSocket events cho cả Order và Kitchen modules
- Test status transition validation
- Test concurrent chef claims
- Không có automated tests (đồ án tốt nghiệp)

### Documentation Impact
- Update API docs: ORDER_API.md, KITCHEN_API.md
- Update use case docs: ORDER_MANAGEMENT.md
- Update technical docs: WEBSOCKET_INTEGRATION.md
- Add migration guide for status enum changes
