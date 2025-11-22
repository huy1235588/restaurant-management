# Proposal: Integrate Reservation-Order Workflow

## Why

Hiện tại, hệ thống đặt bàn (Reservation) và hệ thống đặt món (Order) hoạt động độc lập. Khi khách hàng đặt bàn xong và đến check-in, nhân viên phải:
1. Manually check-in reservation (cập nhật status thành `seated`)
2. Manually tạo order mới cho bàn đó
3. Manually nhập lại thông tin khách (tên, SĐT, số người)

Quy trình thủ công này gây ra:
- **Trùng lặp dữ liệu**: Nhập lại thông tin khách 2 lần
- **Lỗi nhập liệu**: Có thể nhập sai thông tin giữa reservation và order
- **Mất thời gian**: Nhân viên mất 2-3 phút cho mỗi check-in
- **Mất trải nghiệm**: Khách đợi lâu để được phục vụ
- **Khó tracking**: Không liên kết rõ ràng giữa reservation và order

Tài liệu `docs/architecture/RESERVATION_SYSTEM.md` đã mô tả quy trình lý tưởng: khi check-in (seated), hệ thống tự động tạo order liên kết. Nhưng code hiện tại chưa implement logic này. Proposal này sẽ triển khai tích hợp tự động giữa hai hệ thống.

## What Changes

### Core Integration
- **Auto-create Order on Check-in**:
  - Khi reservation chuyển từ `confirmed` → `seated`, tự động tạo Order
  - Order chứa thông tin: `tableId`, `reservationId`, `customerName`, `customerPhone`, `partySize` từ reservation
  - Order có status `pending` (chờ gọi món)
  - Bàn tự động chuyển sang `occupied`
  
- **Transaction Safety**:
  - Sử dụng Prisma transaction để đảm bảo atomicity
  - Rollback nếu có lỗi ở bất kỳ bước nào
  - Audit log ghi nhận cả reservation seat và order creation

- **Order Lifecycle Integration**:
  - Order luôn liên kết với reservation qua `reservationId`
  - Khi complete order → tự động complete reservation
  - Khi cancel reservation (seated) → tự động cancel order (nếu chưa có món)

### Modified Features
- **Reservation Service (`seat()` method)**:
  - **BEFORE**: Chỉ cập nhật reservation status và table status
  - **AFTER**: Cập nhật reservation, table, **và tự động tạo order** trong 1 transaction

- **Order Service (`create()` method)**:
  - **BEFORE**: Tạo order standalone không quan tâm reservation
  - **AFTER**: Kiểm tra nếu order được tạo tự động (có `reservationId`), skip duplicate creation

- **Order Completion Flow**:
  - **NEW**: Khi order `completed`, kiểm tra nếu có `reservationId`, tự động complete reservation

### API Changes
- **PATCH /api/reservations/:id/seated**:
  - Response bổ sung thêm field `order` (nested object)
  - Return cả reservation và order vừa tạo
  
- **POST /api/orders**:
  - Validation: Nếu `reservationId` provided, kiểm tra reservation đã có order chưa
  - Prevent duplicate order creation cho cùng 1 reservation

### Database
- **No schema changes**: Sử dụng quan hệ `Order.reservationId` đã có
- **Constraint**: Add unique constraint để 1 reservation chỉ có tối đa 1 order active

### Backend Changes
- **Reservation Service** (`app/server/src/modules/reservation/reservation.service.ts`):
  - Modify `seat()` method: Wrap trong transaction, tạo order, return cả 2
  - Modify `complete()` method: Check nếu có order liên kết, complete order trước
  - Modify `cancel()` method: Check nếu seated + có order, cancel order trước
  
- **Order Service** (chưa có, cần tạo `app/server/src/modules/order/order.service.ts`):
  - Implement `create()`, `complete()`, `cancel()` methods
  - Add `createFromReservation(reservationId)` helper method
  - Validation: Check reservation-order uniqueness

### Frontend Changes
- **Reservation Check-in Dialog**:
  - Sau khi seat thành công, hiển thị thông báo: "Order created automatically"
  - Cung cấp button "Add Items to Order" redirect đến order detail

- **Order List View**:
  - Hiển thị column "Reservation Code" nếu order có liên kết
  - Filter: "From Reservation" vs "Walk-in"

### Simplified Scope (Đồ án)
- **Không implement**: Real-time notification qua WebSocket (manual refresh)
- **Không implement**: Complex rollback recovery (log error, manual fix)
- **Không implement**: Batch check-in cho nhiều reservations
- **Không implement**: Merge orders từ nhiều reservations

## Impact

### Affected Specs
- **MODIFIED**: `reservation-management` - Add auto-create order requirement
- **ADDED**: `order-management` - New capability (chưa có spec)

### Affected Code

**Backend (`app/server/src/`):**
- `modules/reservation/reservation.service.ts` - Modify `seat()`, `complete()`, `cancel()`
- `modules/reservation/reservation.controller.ts` - Update response type cho `seat()`
- `modules/order/` - **NEW feature module**:
  - `order.controller.ts`
  - `order.service.ts`
  - `order.repository.ts`
  - `order.validation.ts`
  - `order.types.ts`
- Database: Add unique index on `orders(reservationId)` where `reservationId IS NOT NULL`

**Frontend (`app/client/src/`):**
- `modules/reservations/dialogs/CheckInDialog.tsx` - Update success message và navigation
- `modules/reservations/services/reservation.service.ts` - Update `seat()` return type
- `modules/orders/` - **NEW module** (basic CRUD):
  - `components/OrderCard.tsx`, `OrderList.tsx`
  - `views/OrderListView.tsx`, `OrderDetailView.tsx`
  - `services/order.service.ts`
  - `types/order.types.ts`

**Documentation:**
- `docs/implementation/RESERVATION_ORDER_INTEGRATION.md` - New integration guide
- Update `docs/architecture/RESERVATION_SYSTEM.md` - Mark section 7 as "Implemented"

### Breaking Changes
- **BREAKING**: Response của `PATCH /api/reservations/:id/seated` thay đổi structure:
  - **Before**: `{ success, message, data: Reservation }`
  - **After**: `{ success, message, data: { reservation: Reservation, order: Order } }`
- **Migration**: Frontend cần update code xử lý response

### Dependencies
- Existing: Prisma transaction API
- No new external packages required

### Migration Plan
1. Add unique index trên `orders.reservationId` (migration file)
2. Deploy backend code (backward compatible - check-in vẫn work)
3. Deploy frontend code (consume new response format)
4. Test end-to-end flow: reservation → check-in → order tự động tạo
5. Monitor logs cho errors trong transaction

### Risks & Mitigation

**Risk 1: Transaction timeout/deadlock**
- **Mitigation**: Prisma transaction có timeout 5s (đủ), retry logic cho conflict

**Risk 2: Order creation fails nhưng reservation đã seated**
- **Mitigation**: Transaction rollback toàn bộ, reservation vẫn `confirmed`, thông báo lỗi cho staff

**Risk 3: Duplicate order nếu staff click check-in 2 lần**
- **Mitigation**: Unique constraint trên DB + validation trong service

**Risk 4: Existing reservations chưa có order**
- **Mitigation**: Check `reservationId IS NULL OR order already exists` khi tạo order manually

### Success Criteria
- ✅ Khi staff check-in reservation, order tự động tạo trong 1 transaction
- ✅ Order chứa đầy đủ thông tin từ reservation (bàn, khách, số người)
- ✅ Transaction rollback nếu có lỗi
- ✅ Frontend hiển thị order vừa tạo và cho phép thêm món ngay
- ✅ Audit trail đầy đủ cho cả reservation và order
- ✅ Không có duplicate order cho cùng 1 reservation
- ✅ Demo được flow đầy đủ: đặt bàn → check-in → gọi món → thanh toán
