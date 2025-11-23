## Context

Module Order và Kitchen hiện có nhiều vấn đề về logic nghiệp vụ, performance và type safety. Phân tích chi tiết từ `docs/analysis/ORDER_KITCHEN_ISSUES_ANALYSIS.md` đã xác định 13 vấn đề cần sửa.

**Stakeholders**: 
- Nhân viên bếp (kitchen staff) - Sử dụng Kitchen Display để nhận và xử lý đơn
- Nhân viên phục vụ (waiters) - Tạo order và theo dõi trạng thái
- Quản lý (manager) - Giám sát flow order-kitchen

**Constraints**:
- Đây là dự án tốt nghiệp sinh viên → Đơn giản hóa, không cần tính năng phức tạp
- Không có automated tests → Manual testing
- Backend: NestJS với Prisma ORM và PostgreSQL
- Frontend: Next.js 16 với React Query và Socket.io

## Goals / Non-Goals

### Goals
1. **Đơn giản hóa kitchen flow** - Giảm từ 4 bước xuống 3 bước (pending → preparing → completed)
2. **Fix critical bugs** - Kitchen order creation timing, WebSocket namespace mismatch
3. **Type safety** - Đồng bộ types giữa frontend-backend
4. **Status validation** - Prevent invalid status transitions
5. **Real-time sync** - WebSocket events hoạt động đúng cho cả 2 modules

### Non-Goals
- ❌ Không implement kitchen stations (quá phức tạp)
- ❌ Không implement prep time estimate
- ❌ Không implement auto-cancel timeout
- ❌ Không implement max concurrent orders limit
- ❌ Không optimize cho high-scale performance (>1000 orders/day)
- ❌ Không viết automated tests (manual testing only)
- ❌ Không implement advanced features (reports, analytics)

## Decisions

### Decision 1: Simplify Kitchen Status Flow

**What**: Remove `ready` status from KitchenOrderStatus enum, keep only: `pending`, `preparing`, `completed`, `cancelled`

**Why**:
- Giảm complexity cho bếp - chỉ 2 thao tác: Start → Complete
- Loại bỏ confusion giữa "ready" (món xong) vs "completed" (đã giao)
- Phù hợp với quy mô dự án tốt nghiệp
- Giảm số lượng WebSocket events cần handle

**Alternatives considered**:
- Keep `ready` status: Rejected - quá phức tạp, nhiều thao tác
- Add more statuses (e.g., `in_oven`, `plating`): Rejected - không cần thiết cho demo

**Trade-offs**:
- ✅ Pros: Đơn giản hơn, ít bugs hơn, dễ maintain
- ❌ Cons: Less granular tracking (không biết món "sẵn sàng" vs "đã giao")
- ⚖️ Decision: Pros outweigh cons cho dự án sinh viên

### Decision 2: Create Kitchen Order on Confirm (Not on Creation)

**What**: Kitchen order chỉ được tạo khi Order status = `confirmed`, không tạo ngay khi create order

**Why**:
- Đúng theo business logic: Bếp chỉ nhận đơn đã xác nhận
- Tránh spam kitchen với pending orders
- Cho phép edit order trước khi gửi bếp
- Match với tài liệu API và use case

**Alternatives considered**:
- Create immediately on order creation: Current buggy implementation
- Create manually by staff: Rejected - thêm thao tác không cần thiết

**Implementation**:
```typescript
// order.service.ts
async updateOrderStatus(orderId: number, data: UpdateOrderStatusDto) {
    // Update order
    const updatedOrder = await this.orderRepository.update(orderId, data);
    
    // Trigger kitchen order creation when confirmed
    if (data.status === OrderStatus.confirmed) {
        await this.kitchenService.createKitchenOrder(orderId);
    }
    
    return updatedOrder;
}
```

### Decision 3: Standardize WebSocket Event Structure

**What**: All WebSocket events follow consistent structure:
```typescript
{
    event: string;        // 'order:created', 'kitchen:preparing', etc.
    data: T;             // OrderEventData | KitchenEventData
    timestamp: string;   // ISO 8601
    source: 'order' | 'kitchen';
}
```

**Why**:
- Consistent parsing logic in frontend
- Easier debugging with source field
- Standard timestamp format
- Type-safe event data

**Event naming convention**:
- `order:created` - New order created
- `order:confirmed` - Order confirmed, sent to kitchen
- `kitchen:preparing` - Chef started preparing
- `kitchen:completed` - Dish ready, served
- `order:cancelled` - Order cancelled

**Alternatives considered**:
- Keep current inconsistent structure: Rejected - causes confusion
- Use different event names for Order vs Kitchen: Current problem - fixing it

### Decision 4: Fix Frontend Type Definitions

**What**: 
- Financial fields use `string` type (not `number`) to match Prisma Decimal serialization
- Add helper function `parseDecimal(value: string): number` for calculations
- Update all enums to match backend exactly

**Why**:
- Prisma serializes Decimal as string in JSON
- Prevent runtime type errors: `"150000" + 1000 = "1500001000"`
- Type safety at compile time
- Correct calculations at runtime

**Implementation**:
```typescript
// order.types.ts
export interface Order {
    totalAmount: string;      // Changed from number
    discountAmount: string;
    taxAmount: string;
    finalAmount: string;
}

// order.utils.ts
export const parseDecimal = (value: string): number => {
    return parseFloat(value) || 0;
};

// Usage
const total = parseDecimal(order.totalAmount) + parseDecimal(order.taxAmount);
```

### Decision 5: Apply Singleton Pattern to All WebSocket Hooks

**What**: Both `useOrderSocket` and `useKitchenSocket` use singleton pattern to share one socket instance per namespace

**Why**:
- Prevent multiple connections to same namespace
- Reduce server load
- Consistent pattern across modules
- Proper cleanup on unmount

**Current state**:
- Order module: Uses singleton ✅
- Kitchen module: Creates new socket per component ❌

**Implementation**: Apply Order's pattern to Kitchen module

### Decision 6: Use Optimistic Locking for Concurrent Chef Claims

**What**: Use Prisma's `updateMany` with conditions to prevent race conditions

**Why**:
- Prevent multiple chefs claiming same order
- No external locking mechanism needed (Redis, etc.)
- Simple implementation with Prisma
- Sufficient for dự án tốt nghiệp scale

**Implementation**:
```typescript
async startPreparing(kitchenOrderId: number, staffId: number) {
    const result = await this.prisma.kitchenOrder.updateMany({
        where: {
            kitchenOrderId,
            chefId: null,  // Only update if unclaimed
            status: KitchenOrderStatus.pending
        },
        data: {
            chefId: staffId,
            status: KitchenOrderStatus.preparing,
            startedAt: new Date()
        }
    });
    
    if (result.count === 0) {
        throw new OrderAlreadyClaimedException();
    }
}
```

**Alternatives considered**:
- Distributed locks with Redis: Overkill cho dự án sinh viên
- Database row-level locks: Phức tạp hơn cần thiết
- First-come-first-served (no locking): Current bug - causes issues

## Risks / Trade-offs

### Risk 1: Breaking Changes for Existing Data

**Risk**: Existing kitchen orders with `ready` status will break after migration

**Mitigation**:
1. Create data migration script to convert `ready` → `completed`
2. Run migration in development first
3. Document migration steps in migration guide
4. Test thoroughly before applying

**Impact**: Medium - Affects all existing kitchen orders, but migration is straightforward

### Risk 2: Frontend Type Changes May Break Existing Code

**Risk**: Changing financial fields from `number` to `string` may break existing calculations

**Mitigation**:
1. Search codebase for all uses of financial fields: `rg "totalAmount|finalAmount" app/client`
2. Update all calculations to use `parseDecimal()` helper
3. Test all forms and displays
4. TypeScript will catch most issues at compile time

**Impact**: Low - TypeScript provides compile-time safety

### Risk 3: WebSocket Namespace Changes

**Risk**: Frontend may not connect correctly after namespace changes

**Mitigation**:
1. Update frontend and backend together in same PR
2. Test WebSocket connections in development
3. Add connection status indicators in UI
4. Document correct namespaces: `/orders` and `/kitchen`

**Impact**: Low - Easy to test and verify

### Trade-off 1: Simplicity vs Granularity

**Trade-off**: Removing `ready` status reduces granularity of kitchen tracking

**Accepted**: Yes - Simplicity more important for dự án tốt nghiệp
- Students can still demo core functionality
- Less code to maintain and debug
- Faster development time

### Trade-off 2: Manual Testing vs Automated Tests

**Trade-off**: No automated tests means manual testing required

**Accepted**: Yes - Standard for đồ án tốt nghiệp
- Manual testing plan documented in tasks.md
- Focus on demonstrating functionality
- Automated tests not required for graduation

## Migration Plan

### Phase 1: Database Migration (Required First)

1. **Create migration file**:
```bash
cd app/server
npx prisma migrate dev --name simplify-kitchen-status
```

2. **Migration content**:
```sql
-- Update enum to remove 'ready' status
ALTER TYPE "KitchenOrderStatus" RENAME TO "KitchenOrderStatus_old";
CREATE TYPE "KitchenOrderStatus" AS ENUM ('pending', 'preparing', 'completed', 'cancelled');

-- Migrate existing data: ready → completed
UPDATE "KitchenOrder" 
SET status = 'completed'::text::"KitchenOrderStatus"
WHERE status = 'ready'::text::"KitchenOrderStatus_old";

-- Apply new enum
ALTER TABLE "KitchenOrder" 
ALTER COLUMN status TYPE "KitchenOrderStatus" 
USING status::text::"KitchenOrderStatus";

DROP TYPE "KitchenOrderStatus_old";

-- Update KitchenPriority enum
ALTER TYPE "OrderPriority" RENAME TO "KitchenPriority";

-- Add unique constraint
ALTER TABLE "KitchenOrder" ADD CONSTRAINT "KitchenOrder_orderId_key" UNIQUE ("orderId");

-- Add cascade delete
ALTER TABLE "KitchenOrder" 
DROP CONSTRAINT "KitchenOrder_orderId_fkey",
ADD CONSTRAINT "KitchenOrder_orderId_fkey" 
FOREIGN KEY ("orderId") REFERENCES "Order"("orderId") ON DELETE CASCADE;
```

3. **Verify migration**:
```bash
npx prisma studio  # Check data
```

### Phase 2: Backend Code Updates

1. Update constants, helpers, services
2. Update controllers and DTOs
3. Update WebSocket gateways
4. Test endpoints with Postman/Swagger

### Phase 3: Frontend Code Updates

1. Update type definitions
2. Update WebSocket hooks
3. Update validation schemas
4. Update UI components
5. Test in browser

### Rollback Plan

If issues occur:

1. **Database**: Revert migration
```bash
npx prisma migrate resolve --rolled-back <migration-name>
npx prisma migrate dev  # Reapply previous state
```

2. **Code**: Revert Git commits
```bash
git revert <commit-hash>
```

3. **Emergency**: Restore database backup (if taken before migration)

## Open Questions

1. **Q**: Should we keep priority field or remove it entirely?
   **A**: Keep it - Simple enum (`low`, `normal`, `high`, `urgent`) is useful and not complex

2. **Q**: Do we need to migrate production data or just development?
   **A**: Development only - Đồ án không deploy production

3. **Q**: Should validation be strict or lenient for demo purposes?
   **A**: Strict enough to prevent bugs, lenient enough to demo easily (e.g., phone validation but not required)

4. **Q**: Need Redis for WebSocket rooms or use Socket.io memory adapter?
   **A**: Use Socket.io memory adapter (default) - Sufficient for development/demo
