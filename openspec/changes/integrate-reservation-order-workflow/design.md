# Design: Reservation-Order Integration

## Context

Hệ thống quản lý nhà hàng hiện có 2 module độc lập:
- **Reservation Management**: Quản lý đặt bàn (implemented, 65/95 tasks)
- **Order Management**: Quản lý đơn hàng (implementing, 45/132 tasks)

Hiện tại quy trình là:
1. Khách đặt bàn → Reservation created (status: `pending`)
2. Nhân viên xác nhận → Reservation confirmed (status: `confirmed`)
3. Khách đến → Staff check-in → Reservation seated (status: `seated`)
4. **Staff manually tạo Order mới** ← Bước này cần automation
5. Khách gọi món → Add items to order
6. Khách thanh toán → Order completed
7. **Staff manually complete reservation** ← Cần automation

Tài liệu `docs/architecture/RESERVATION_SYSTEM.md` (section 7) đã define SQL transaction cho tích hợp này nhưng chưa implement trong code.

## Goals / Non-Goals

### Goals
1. **Auto-create Order khi Check-in**: Khi reservation `seated`, tự động tạo order liên kết
2. **Transaction Atomicity**: Seat + Create Order trong 1 transaction, rollback nếu fail
3. **Data Consistency**: Order luôn có đầy đủ thông tin từ reservation
4. **Prevent Duplicates**: 1 reservation chỉ có tối đa 1 active order
5. **Audit Trail**: Ghi log đầy đủ cho cả 2 actions

### Non-Goals
1. **Real-time Sync**: Không dùng WebSocket (manual refresh)
2. **Complex Rollback**: Không implement saga pattern, chỉ transaction đơn giản
3. **Batch Operations**: Không support check-in nhiều reservations cùng lúc
4. **Order Merging**: Không merge orders từ nhiều reservations

## Decisions

### Decision 1: Prisma Transaction with Sequential Writes

**Choice**: Sử dụng Prisma `$transaction` API với sequential operations thay vì nested writes.

**Rationale**:
- **Pro**: Rõ ràng, dễ debug, dễ thêm logic giữa các bước
- **Pro**: Có thể generate order number, audit logs trong transaction
- **Pro**: Error handling tốt hơn (biết chính xác bước nào fail)
- **Con**: Nhiều round-trips hơn nested writes (nhưng chấp nhận được cho đồ án)

**Implementation**:
```typescript
async seat(reservationId: number, userId?: number) {
  return this.prisma.$transaction(async (tx) => {
    // 1. Update reservation
    const reservation = await tx.reservation.update({...});
    
    // 2. Update table
    await tx.restaurantTable.update({...});
    
    // 3. Create order
    const order = await tx.order.create({...});
    
    // 4. Create audit logs
    await tx.reservationAudit.create({...});
    
    return { reservation, order };
  });
}
```

**Alternatives Considered**:
- **Nested writes**: Không support tạo order từ reservation data trong 1 query
- **Saga pattern**: Overkill cho đồ án, cần orchestration layer phức tạp
- **Event-driven**: Eventual consistency không phù hợp (cần immediate order)

### Decision 2: Unique Constraint on `orders.reservationId`

**Choice**: Add partial unique index: `CREATE UNIQUE INDEX ON orders(reservationId) WHERE reservationId IS NOT NULL AND status != 'cancelled'`

**Rationale**:
- **Pro**: Database-level constraint, không dựa vào application logic
- **Pro**: Prevent race conditions (2 staff check-in cùng lúc)
- **Pro**: Cho phép cancel/recreate order (status `cancelled` excluded)
- **Con**: Cần migration file

**Implementation**:
```prisma
@@unique([reservationId], where: { status: { not: OrderStatus.cancelled } })
```

**Alternatives Considered**:
- **Application-level check**: Dễ bypass, race condition
- **Foreign key UNIQUE**: Không cho phép null, không flexible

### Decision 3: Response Structure Change (Breaking)

**Choice**: `PATCH /reservations/:id/seated` return cả `{ reservation, order }` thay vì chỉ `reservation`.

**Rationale**:
- **Pro**: Frontend có thể redirect ngay đến order detail
- **Pro**: Hiển thị confirmation "Order #XXX created" cho staff
- **Pro**: Giảm API call (không cần GET order riêng)
- **Con**: Breaking change, cần update frontend code

**Migration Plan**:
1. Backend deploy với new response (version 1.1.0)
2. Frontend update TypeScript type + handle new response
3. Backward compatibility: Old frontend vẫn work (chỉ bỏ qua field `order`)

**Alternatives Considered**:
- **Separate endpoint**: `POST /orders/from-reservation/:id` → Nhiều API call hơn
- **Keep old response**: Frontend phải GET order sau → Slow UX

### Decision 4: Order Status on Auto-creation

**Choice**: Order được tạo với status `pending` (not `confirmed`).

**Rationale**:
- **Pro**: Nhất quán với quy trình order thủ công
- **Pro**: Cho phép staff review trước khi confirm (nếu cần)
- **Pro**: Align với simplified order management spec (pending → completed)
- **Con**: Cần 1 bước xác nhận (nhưng có thể skip bằng UI)

**Implementation**:
```typescript
const order = await tx.order.create({
  data: {
    orderNumber: generateOrderNumber(),
    tableId: reservation.tableId,
    reservationId: reservation.reservationId,
    customerName: reservation.customerName,
    customerPhone: reservation.phoneNumber,
    partySize: reservation.partySize,
    status: OrderStatus.pending, // ← Start with pending
    staffId: userId,
  }
});
```

**Alternatives Considered**:
- **Status `confirmed`**: Skip pending, nhưng không match order spec
- **Status `new`**: Không có trong OrderStatus enum

### Decision 5: Rollback Strategy

**Choice**: Full transaction rollback on any error, log error, return 500 to client.

**Rationale**:
- **Pro**: Simple, no partial state
- **Pro**: Staff có thể retry check-in
- **Pro**: Audit log không bị inconsistent
- **Con**: Staff experience bị interrupt (nhưng hiếm khi xảy ra)

**Error Handling**:
```typescript
try {
  const result = await this.prisma.$transaction(async (tx) => {
    // ... operations
  });
  return result;
} catch (error) {
  this.logger.error('Seat reservation failed', error);
  throw new InternalServerErrorException('Check-in failed, please retry');
}
```

**Alternatives Considered**:
- **Compensating transaction**: Phức tạp, cần saga orchestrator
- **Partial success**: Không chấp nhận được (reservation seated nhưng không có order)

## Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                   Check-in Flow (Seated)                    │
└─────────────────────────────────────────────────────────────┘

Client                  Controller              Service                Database
  │                         │                      │                      │
  │ PATCH /reservations/    │                      │                      │
  │ :id/seated              │                      │                      │
  ├────────────────────────>│                      │                      │
  │                         │                      │                      │
  │                         │ seat(id, userId)     │                      │
  │                         ├─────────────────────>│                      │
  │                         │                      │                      │
  │                         │                      │ BEGIN TRANSACTION    │
  │                         │                      ├─────────────────────>│
  │                         │                      │                      │
  │                         │                      │ 1. UPDATE reservation│
  │                         │                      │    SET status=seated │
  │                         │                      ├─────────────────────>│
  │                         │                      │<─────────────────────┤
  │                         │                      │                      │
  │                         │                      │ 2. UPDATE table      │
  │                         │                      │    SET status=occupied│
  │                         │                      ├─────────────────────>│
  │                         │                      │<─────────────────────┤
  │                         │                      │                      │
  │                         │                      │ 3. INSERT order      │
  │                         │                      │    (reservationId FK)│
  │                         │                      ├─────────────────────>│
  │                         │                      │<─────────────────────┤
  │                         │                      │                      │
  │                         │                      │ 4. INSERT audit      │
  │                         │                      ├─────────────────────>│
  │                         │                      │<─────────────────────┤
  │                         │                      │                      │
  │                         │                      │ COMMIT               │
  │                         │                      ├─────────────────────>│
  │                         │                      │<─────────────────────┤
  │                         │                      │                      │
  │                         │ { reservation, order}│                      │
  │                         │<─────────────────────┤                      │
  │                         │                      │                      │
  │ 200 OK                  │                      │                      │
  │ { reservation, order }  │                      │                      │
  │<────────────────────────┤                      │                      │
  │                         │                      │                      │
```

## Database Schema Impact

### New Constraint

```sql
-- Add partial unique index to prevent duplicate orders per reservation
CREATE UNIQUE INDEX idx_orders_reservation_unique 
ON orders(reservationId) 
WHERE reservationId IS NOT NULL 
  AND status NOT IN ('cancelled');
```

### Migration File

```typescript
// prisma/migrations/YYYYMMDDHHMMSS_add_order_reservation_unique/migration.sql
-- CreateIndex
CREATE UNIQUE INDEX "idx_orders_reservation_unique" 
ON "orders"("reservationId") 
WHERE "reservationId" IS NOT NULL 
  AND "status" NOT IN ('cancelled');
```

## API Contract Changes

### Before (Existing)

```typescript
// PATCH /api/reservations/:id/seated
Response: {
  success: true,
  message: "Reservation marked as seated",
  data: Reservation // Only reservation
}
```

### After (New)

```typescript
// PATCH /api/reservations/:id/seated
Response: {
  success: true,
  message: "Reservation checked-in and order created",
  data: {
    reservation: Reservation,
    order: Order // Auto-created order
  }
}
```

## Error Scenarios & Recovery

### Scenario 1: Order Creation Fails (Duplicate)

**Cause**: Staff clicks check-in 2 times rapidly (race condition)

**Detection**: 
- Unique constraint violation on `orders(reservationId)`
- Prisma error: `P2002`

**Recovery**:
```typescript
catch (error) {
  if (error.code === 'P2002') {
    // Order already exists, fetch existing order
    const existingOrder = await this.prisma.order.findFirst({
      where: { reservationId }
    });
    return { reservation, order: existingOrder };
  }
  throw error; // Re-throw other errors
}
```

### Scenario 2: Table Status Update Fails

**Cause**: Table không tồn tại hoặc đã bị xóa

**Detection**: Prisma error khi update table

**Recovery**: Transaction rollback toàn bộ, reservation vẫn `confirmed`

**User Action**: Staff check lại table, reassign table mới, retry check-in

### Scenario 3: Network Timeout mid-Transaction

**Cause**: Database connection lost

**Detection**: Prisma timeout error (>5s)

**Recovery**: 
- Transaction auto-rollback
- Frontend hiển thị error: "Check-in failed, please retry"
- Reservation vẫn ở trạng thái cũ (`confirmed`)

**User Action**: Staff retry check-in

## Performance Considerations

### Transaction Duration

**Estimate**: 4 queries trong transaction = ~50-100ms
- UPDATE reservation: 10ms
- UPDATE table: 10ms
- INSERT order: 20ms
- INSERT audit: 10ms
- Overhead: 10-30ms

**Optimization**: Đã optimize (không cần thêm)

### Concurrent Check-ins

**Scenario**: 10 staff check-in cùng lúc (peak hour)

**Impact**: 
- Transaction isolation (Read Committed) - no deadlock
- Unique constraint prevents duplicates
- Each transaction < 100ms → 10 concurrent OK

**Load Test**: Không cần cho đồ án (single restaurant)

## Testing Strategy (For Implementer)

### Unit Tests (Recommended but Not Required)

```typescript
describe('ReservationService.seat()', () => {
  it('should create order when seating reservation', async () => {
    const result = await service.seat(reservationId, userId);
    expect(result.order).toBeDefined();
    expect(result.order.reservationId).toBe(reservationId);
  });
  
  it('should rollback on error', async () => {
    // Mock table update failure
    jest.spyOn(prisma.table, 'update').mockRejectedValue(new Error('DB error'));
    
    await expect(service.seat(reservationId)).rejects.toThrow();
    
    // Verify reservation still confirmed
    const reservation = await prisma.reservation.findUnique({ where: { id } });
    expect(reservation.status).toBe('confirmed');
  });
});
```

### Manual Testing Scenarios

1. **Happy Path**: Check-in reservation → Verify order created
2. **Double Click**: Click check-in 2 times → Only 1 order created
3. **Network Fail**: Disconnect DB mid-transaction → Verify rollback
4. **Table Occupied**: Check-in while table occupied → Verify error + rollback

## Deployment Plan

### Phase 1: Backend Deployment

1. Run migration to add unique constraint
2. Deploy new reservation service code
3. Monitor logs for transaction errors
4. Verify existing check-in flow still works

### Phase 2: Frontend Deployment

1. Update TypeScript types for new response
2. Update CheckInDialog to handle `order` field
3. Add "View Order" button after successful check-in
4. Deploy frontend

### Phase 3: Verification

1. Check-in test reservation → Verify order auto-created
2. Check database: reservation.seatedAt, order.reservationId, table.status
3. Check audit logs: 2 entries (reservation + order)

## Risks / Trade-offs

| Risk | Impact | Mitigation | Accepted |
|------|--------|------------|----------|
| Transaction timeout | Check-in fails | Use connection pooling, timeout 5s | ✅ Low risk |
| Unique constraint bugs | Duplicate orders | Add comprehensive validation | ✅ DB handles |
| Breaking API change | Frontend breaks | Versioned deployment, testing | ✅ Planned migration |
| Order creation fail | No order exists | Transaction rollback, retry | ✅ Staff retries |
| Race condition | 2 staff check-in | Unique constraint + optimistic locking | ✅ DB handles |

## Open Questions

1. **Q**: Nếu staff cancel order sau khi check-in, có tự động cancel reservation không?
   **A**: Không. Order và reservation lifecycle độc lập sau khi tạo. Staff phải manual cancel cả 2.

2. **Q**: Có cho phép tạo order thủ công cho reservation đã seated không?
   **A**: Có, nhưng unique constraint sẽ reject nếu đã có order. Staff phải edit order hiện tại.

3. **Q**: Khi complete order, có tự động complete reservation không?
   **A**: Yes (implement trong phase 2). Khi order `completed`, check `reservationId`, auto-complete reservation.

4. **Q**: Có support walk-in customers (không có reservation)?
   **A**: Yes. Tạo order với `reservationId = null`. Unique constraint chỉ apply khi `reservationId IS NOT NULL`.
