# Design Document: Order and Kitchen Management System

## Context

The restaurant management system needs a complete order workflow that connects front-of-house (waiters) and back-of-house (kitchen). Currently, the system has menu management and staff management, but no way to create orders or track food preparation.

**Stakeholders:**
- **Waiters**: Need to quickly create orders, track status, and know when food is ready
- **Kitchen Staff**: Need clear display of orders, ability to update status, and manage workload
- **Managers**: Need visibility into order flow, performance metrics, and bottlenecks
- **Customers**: Indirectly benefit from faster service and fewer mistakes

**Constraints:**
- This is a graduation project demo, not a production system
- Limited testing infrastructure (manual testing only)
- Single restaurant (no multi-tenancy)
- Development on Windows with Docker for local database
- Real-time updates required (WebSocket)

## Goals / Non-Goals

### Goals
- ✅ Enable waiters to digitally create and manage orders
- ✅ Provide real-time kitchen display system for chefs
- ✅ Bidirectional communication between front and back of house
- ✅ Track order lifecycle from creation to completion
- ✅ Support priority ordering (VIP, Express, Normal)
- ✅ Calculate order totals automatically
- ✅ Provide basic performance metrics (prep time, completion rate)

### Non-Goals
- ❌ Self-ordering by customers (QR code at table)
- ❌ Mobile app for waiters (web-only)
- ❌ Advanced analytics (ML predictions, trend analysis)
- ❌ Automated inventory deduction (future enhancement)
- ❌ Production-grade load handling (>100 concurrent orders)
- ❌ Multi-language kitchen instructions (only display names)
- ❌ Video/photo documentation of prepared dishes

## Architecture Decisions

### Decision 1: Two Separate Capabilities
**Choice**: Create two distinct capabilities (`order-management` and `kitchen-management`) instead of one combined capability.

**Rationale**:
- Different user personas (waiters vs chefs)
- Different UI paradigms (form-heavy vs display-heavy)
- Different permissions and workflows
- Easier to understand and maintain
- Allows parallel development

**Alternatives Considered**:
- Single "order-kitchen" capability: Rejected because it mixes concerns and would create confusion
- Three capabilities (order, kitchen, integration): Rejected as over-engineering for this scope

### Decision 2: WebSocket for Real-time Updates
**Choice**: Use Socket.io for bidirectional real-time communication between Order and Kitchen systems.

**Rationale**:
- Project already uses Socket.io (infrastructure exists)
- Bidirectional: Kitchen updates affect Order UI and vice versa
- Low latency: Chefs need instant notification of new orders
- Presence: Can detect if kitchen display is online
- Event-based: Clean separation of concerns

**Alternatives Considered**:
- Polling: Rejected due to high latency and unnecessary load
- Server-Sent Events (SSE): Rejected because we need bidirectional communication
- HTTP long-polling: Rejected due to complexity and resource usage

### Decision 3: Separate Kitchen Order Table
**Choice**: Create a `kitchen_orders` table separate from `orders` table.

**Rationale**:
- Kitchen needs different fields (chef assignment, station, prep times)
- Separates concerns (order business logic vs kitchen production)
- Allows independent schema evolution
- Prevents kitchen data from cluttering order records
- 1:1 relationship is clean and performant

**Alternatives Considered**:
- Add kitchen fields to `orders` table: Rejected because it mixes domain concerns
- Use order status only: Rejected because kitchen needs more detailed tracking
- Separate `order_items_kitchen` table: Rejected as unnecessarily complex for this scope

### Decision 4: Item-Level Status Tracking
**Choice**: Track cooking status per item in `order_items` table, not just at order level.

**Rationale**:
- Different items finish at different times
- Chefs need granular progress tracking
- Waiters want to know which specific items are ready
- Supports partial order readiness (some items done, others cooking)

**Alternatives Considered**:
- Order-level status only: Rejected because it's too coarse-grained
- Separate tracking table: Rejected as over-engineering
- Multiple status columns: Rejected due to complexity

### Decision 5: Priority as Enum
**Choice**: Use `NORMAL | EXPRESS | VIP` enum for order priority, not numeric scores.

**Rationale**:
- Simple and understandable
- Matches real restaurant workflows (VIP customers, rush orders)
- Easy to filter and sort
- Clear semantics (no ambiguity like "priority 5")

**Alternatives Considered**:
- Numeric priority (1-10): Rejected because it's unclear and needs documentation
- Boolean urgent flag: Rejected because it doesn't support VIP distinction
- Timestamp-based only: Rejected because some orders need explicit priority

### Decision 6: Timer in Frontend
**Choice**: Calculate elapsed time in frontend components using JavaScript timers, not polling backend.

**Rationale**:
- Reduces server load (no constant requests for "time since created")
- More accurate (updates every second)
- Works offline briefly (if WebSocket disconnected)
- Simple client-side calculation

**Alternatives Considered**:
- Backend calculates and sends time: Rejected due to unnecessary complexity and load
- No timer: Rejected because kitchen needs to see wait time

## Data Model

### Core Entities

```prisma
model Order {
  id            String   @id @default(uuid())
  orderNumber   String   @unique  // e.g., "#001"
  tableId       String
  staffId       String   // Waiter who created the order
  customerName  String?
  customerPhone String?
  headCount     Int      @default(1)
  notes         String?
  status        OrderStatus @default(PENDING)
  totalAmount   Decimal  @db.Decimal(12, 2)
  discountAmount Decimal @db.Decimal(12, 2) @default(0)
  taxAmount     Decimal  @db.Decimal(12, 2) @default(0)
  finalAmount   Decimal  @db.Decimal(12, 2)
  
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  confirmedAt   DateTime?
  completedAt   DateTime?
  cancelledAt   DateTime?
  cancellationReason String?
  
  table         Table    @relation(fields: [tableId], references: [id])
  staff         User     @relation("OrderStaff", fields: [staffId], references: [id])
  items         OrderItem[]
  kitchenOrder  KitchenOrder?
  bill          Bill?
}

model OrderItem {
  id             String   @id @default(uuid())
  orderId        String
  menuItemId     String
  quantity       Int
  unitPrice      Decimal  @db.Decimal(12, 2)
  totalPrice     Decimal  @db.Decimal(12, 2)
  specialRequest String?
  status         OrderItemStatus @default(PENDING)
  
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
  
  order          Order    @relation(fields: [orderId], references: [id], onDelete: Cascade)
  menuItem       FoodItem @relation(fields: [menuItemId], references: [id])
}

model KitchenOrder {
  id                  String   @id @default(uuid())
  orderId             String   @unique
  status              KitchenOrderStatus @default(PENDING)
  priority            OrderPriority @default(NORMAL)
  chefId              String?
  stationId           String?
  prepTimeEstimated   Int      // in minutes
  prepTimeActual      Int?     // in minutes
  
  startedAt           DateTime?
  completedAt         DateTime?
  createdAt           DateTime @default(now())
  updatedAt           DateTime @updatedAt
  
  order               Order    @relation(fields: [orderId], references: [id], onDelete: Cascade)
  chef                User?    @relation("KitchenChef", fields: [chefId], references: [id])
  station             KitchenStation? @relation(fields: [stationId], references: [id])
}

model KitchenStation {
  id          String   @id @default(uuid())
  name        String
  type        StationType // GRILL, FRY, STEAM, DESSERT
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
  
  orders      KitchenOrder[]
}

enum OrderStatus {
  PENDING      // Just created, not sent to kitchen
  CONFIRMED    // Sent to kitchen, awaiting preparation
  PREPARING    // Kitchen is cooking
  READY        // All items ready, waiting for pickup
  SERVING      // Delivered to table, customer eating
  COMPLETED    // Finished and paid
  CANCELLED    // Cancelled by waiter or kitchen
}

enum OrderItemStatus {
  PENDING      // Not started
  PREPARING    // Being cooked
  READY        // Finished
  SERVED       // Delivered to customer
  CANCELLED    // Cancelled
}

enum KitchenOrderStatus {
  PENDING      // New order, not yet acknowledged
  CONFIRMED    // Chef acknowledged, preparing ingredients
  PREPARING    // Actively cooking
  ALMOST_READY // Most items done, final touches
  READY        // All items complete, ready for pickup
  COMPLETED    // Waiter picked up order
  CANCELLED    // Order cancelled
}

enum OrderPriority {
  NORMAL       // Standard order
  EXPRESS      // Rush order (customer in hurry)
  VIP          // VIP customer
}

enum StationType {
  GRILL
  FRY
  STEAM
  DESSERT
  DRINKS
}
```

### Relationships
- `Order` ↔ `Table` (many-to-one)
- `Order` ↔ `User` (waiter) (many-to-one)
- `Order` ↔ `OrderItem` (one-to-many)
- `Order` ↔ `KitchenOrder` (one-to-one)
- `OrderItem` ↔ `FoodItem` (many-to-one)
- `KitchenOrder` ↔ `User` (chef) (many-to-one)
- `KitchenOrder` ↔ `KitchenStation` (many-to-one)

## WebSocket Events

### Order → Kitchen Events
```typescript
// When waiter creates and sends order to kitchen
interface OrderCreatedEvent {
  event: 'order:created'
  data: {
    orderId: string
    orderNumber: string
    table: number
    items: Array<{
      name: string
      quantity: number
      specialRequest?: string
    }>
    priority: 'NORMAL' | 'EXPRESS' | 'VIP'
    createdAt: string
  }
}

// When waiter adds items to existing order
interface OrderItemAddedEvent {
  event: 'order:item_added'
  data: {
    orderId: string
    item: {
      id: string
      name: string
      quantity: number
      specialRequest?: string
    }
  }
}

// When waiter requests cancellation
interface OrderCancelRequestEvent {
  event: 'order:cancel_request'
  data: {
    orderId: string
    itemId?: string  // If cancelling specific item
    reason: string
  }
}
```

### Kitchen → Order Events
```typescript
// When kitchen updates order status
interface KitchenStatusChangedEvent {
  event: 'kitchen:status_changed'
  data: {
    orderId: string
    oldStatus: KitchenOrderStatus
    newStatus: KitchenOrderStatus
    chefName?: string
  }
}

// When specific item is ready
interface KitchenItemReadyEvent {
  event: 'kitchen:item_ready'
  data: {
    orderId: string
    itemId: string
    itemName: string
  }
}

// When entire order is ready for pickup
interface KitchenOrderReadyEvent {
  event: 'kitchen:order_ready'
  data: {
    orderId: string
    orderNumber: string
    table: number
    prepTimeActual: number  // in minutes
  }
}

// When kitchen accepts cancellation
interface KitchenCancelAcceptedEvent {
  event: 'kitchen:cancel_accepted'
  data: {
    orderId: string
    itemId?: string
  }
}

// When kitchen rejects cancellation
interface KitchenCancelRejectedEvent {
  event: 'kitchen:cancel_rejected'
  data: {
    orderId: string
    itemId?: string
    reason: string  // e.g., "Already cooking"
  }
}
```

## API Design Patterns

### Consistent Response Format
```typescript
interface ApiResponse<T> {
  success: boolean
  data?: T
  message?: string
  errors?: Array<{ field: string; message: string }>
}
```

### Status Transition Validation
```typescript
// Order status can only progress forward
const VALID_TRANSITIONS = {
  PENDING: ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['PREPARING', 'CANCELLED'],
  PREPARING: ['READY', 'CANCELLED'],
  READY: ['SERVING', 'CANCELLED'],
  SERVING: ['COMPLETED'],
  COMPLETED: [],
  CANCELLED: []
}
```

### Permission Checks
```typescript
// Waiters can only edit their own orders (unless admin/manager)
async function canEditOrder(userId: string, orderId: string): Promise<boolean> {
  const user = await getUser(userId)
  if (['admin', 'manager'].includes(user.role)) return true
  
  const order = await getOrder(orderId)
  return order.staffId === userId
}

// Only chefs can update kitchen orders
async function canUpdateKitchenOrder(userId: string): Promise<boolean> {
  const user = await getUser(userId)
  return ['chef', 'admin', 'manager'].includes(user.role)
}
```

## UI/UX Patterns

### Order Management (Waiter Interface)
- **Layout**: Dashboard-style with sidebar navigation
- **Colors**: Status-based (red=pending, yellow=preparing, green=ready, blue=serving)
- **Interactions**: Click to view details, inline edit for small changes
- **Notifications**: Toast notifications for kitchen updates, audio alert for "order ready"

### Kitchen Management (Chef Interface)
- **Layout**: Fullscreen KDS with minimal navigation (focus on orders)
- **Colors**: Same as waiter + priority badges (gold=VIP, red=Express)
- **Interactions**: Large touch targets (tablet-friendly), drag-and-drop for reordering (future)
- **Notifications**: Loud audio alert for new orders, visual flash animation

### Responsive Breakpoints
- Desktop (>1024px): 3-column grid for orders
- Tablet (768-1024px): 2-column grid
- Mobile (<768px): Single column, compact cards

## Performance Considerations

### Database Optimization
- Index on `orders.status` (frequent filtering)
- Index on `orders.createdAt` (sorting)
- Index on `orders.tableId` (joining)
- Index on `kitchen_orders.status` (KDS filtering)
- Composite index on `(status, createdAt)` for order listing

### Caching Strategy
- Cache menu items (rarely change)
- Don't cache orders (real-time data)
- Cache kitchen station list (infrequent changes)

### Query Optimization
- Use `select` to fetch only needed fields
- Eager load related data (`include: { items: true }`)
- Paginate order lists (20 per page)
- Limit kitchen display to active orders only (not completed/cancelled)

## Risks / Trade-offs

### Risk 1: WebSocket Connection Drops
**Mitigation**:
- Implement reconnection logic with exponential backoff
- Show connection status indicator to users
- Fall back to polling API if WebSocket fails repeatedly
- Store pending events and replay on reconnection

### Risk 2: Order Number Collision
**Mitigation**:
- Use unique constraint on `orderNumber` column
- Generate order numbers sequentially with database sequence or UUID suffix
- Retry with new number if collision detected
- Reset counter daily (e.g., #001 starts fresh each day)

### Risk 3: Kitchen Display Lag with Many Orders
**Mitigation**:
- Limit display to last 50 active orders
- Implement virtual scrolling for long lists
- Auto-remove completed orders after 30 seconds
- Optimize re-renders with React.memo and useCallback

### Risk 4: Status Sync Between Order and Kitchen
**Mitigation**:
- Use database transactions for status updates
- Emit WebSocket events after successful DB commit
- Implement eventual consistency checks (periodic sync job)
- Log all status changes for debugging

### Risk 5: Concurrent Edits
**Mitigation**:
- Optimistic locking with `updatedAt` timestamp
- Show error if order changed by another user
- Refresh order data before allowing edit
- Use WebSocket to notify other users of changes

## Migration Plan

### Phase 1: Database Setup (Day 1)
1. Run Prisma migrations to create tables
2. Add indexes for performance
3. Seed sample data for testing
4. Verify relationships and constraints

### Phase 2: Backend API (Days 2-4)
1. Implement Order APIs (CRUD)
2. Implement Kitchen APIs (status updates)
3. Set up WebSocket event handlers
4. Test with Postman/Swagger

### Phase 3: Frontend - Orders (Days 5-7)
1. Build order list page
2. Create order form
3. Implement order detail view
4. Add WebSocket listeners

### Phase 4: Frontend - Kitchen (Days 8-10)
1. Build KDS layout
2. Create order cards with timers
3. Implement status update controls
4. Add WebSocket listeners

### Phase 5: Integration & Polish (Days 11-12)
1. End-to-end testing
2. Fix bugs and edge cases
3. Add audio/visual notifications
4. Performance tuning

### Rollback Plan
- If critical bug found, revert database migration
- Disable order creation via feature flag
- Fall back to manual order taking
- Fix and redeploy within 24 hours

## Open Questions

1. **Q**: Should we support split orders (multiple bills from one order)?  
   **A**: Not in initial version - add in future iteration

2. **Q**: How to handle order modifications after kitchen starts cooking?  
   **A**: Allow cancellation of individual items, but require kitchen confirmation

3. **Q**: Should completed orders stay visible in KDS?  
   **A**: Yes, for 30 seconds, then auto-hide (configurable in settings)

4. **Q**: What happens if kitchen is offline when waiter sends order?  
   **A**: Order is created in database, kitchen will see it when reconnected (show warning to waiter)

5. **Q**: Should we track who completed each order (which waiter picked up)?  
   **A**: Not in initial version - use `updatedBy` field in future

6. **Q**: How to handle table transfers (customer moves to different table)?  
   **A**: Allow table change via order edit, notify kitchen if needed

7. **Q**: Should prep time be editable by chef?  
   **A**: No - calculated from menu item settings, but show actual time in reports
