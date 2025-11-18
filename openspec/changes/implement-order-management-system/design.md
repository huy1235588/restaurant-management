# Order Management System - Technical Design

## Context
The Order Management System is the operational core of the restaurant management application, orchestrating the flow of customer orders from creation through kitchen preparation to service completion. The system must handle high-frequency real-time updates, maintain data consistency across concurrent operations, and provide role-based views for different staff types (waiters, chefs, managers). The existing database schema is already defined in Prisma, so this implementation focuses on building business logic, API endpoints, real-time communication, and user interfaces.

## Goals / Non-Goals

**Goals:**
- Implement complete order lifecycle management (PENDING → CONFIRMED → PREPARING → READY → SERVED → COMPLETED)
- Provide real-time synchronization between waiter apps, kitchen displays, and manager dashboards
- Enable efficient kitchen operations with prioritized order queues and item-level status tracking
- Support flexible order modifications (add/remove items, cancellations) with proper authorization
- Deliver comprehensive reporting and analytics for operational insights
- Ensure data consistency during concurrent operations
- Maintain audit trails for all order operations

**Non-Goals:**
- Self-ordering via customer QR codes (future feature, out of scope)
- AI-powered menu recommendations (future enhancement)
- Voice-based order entry (future enhancement)
- Integration with external delivery platforms (separate feature)
- Multi-restaurant/multi-location support (current scope is single restaurant)
- Payment processing (handled by separate bill-payment-management capability)

## Decisions

### Decision 1: WebSocket for Real-time Updates
**What:** Use Socket.io for bidirectional real-time communication between clients and server.

**Why:**
- Order status changes must be instantly visible to all relevant parties (waiters, chefs, managers)
- Kitchen displays require immediate notification of new orders with sound alerts
- Waiters need instant notification when orders are ready for pickup
- HTTP polling would introduce latency and increase server load
- Socket.io provides automatic reconnection, room-based broadcasting, and fallback to long-polling

**Alternatives Considered:**
- **Server-Sent Events (SSE):** Unidirectional only, no client-to-server communication without separate HTTP requests
- **HTTP Long Polling:** High latency, inefficient resource usage, complex to scale
- **GraphQL Subscriptions:** Adds complexity and requires GraphQL infrastructure

**Implementation:**
- Socket.io server runs alongside Express server
- Clients subscribe to rooms based on role (e.g., `kitchen`, `waiter-{staffId}`, `manager`)
- Events: `order:created`, `order:status_changed`, `order:item_added`, `kitchen_order:ready`, etc.
- Reconnection logic on client side to handle temporary disconnections

### Decision 2: Order Status State Machine
**What:** Implement explicit state machine for order status transitions with validation.

**Why:**
- Prevents invalid status transitions (e.g., PREPARING → PENDING)
- Enforces business rules (e.g., cannot cancel COMPLETED orders)
- Makes status flow predictable and auditable
- Simplifies frontend logic by rejecting invalid transitions at API level

**State Transition Rules:**
```
PENDING → CONFIRMED → PREPARING → READY → SERVED → COMPLETED
   ↓          ↓           ↓          ↓        ↓
 CANCELLED  CANCELLED   CANCELLED  (cannot cancel)
```

**Implementation:**
- Create `OrderStatusTransition` utility class with `isValidTransition(from, to)` method
- Enforce in order service before updating database
- Return 400 error with clear message for invalid transitions
- Log all status transitions with timestamp and staff ID

### Decision 3: Soft Delete for Cancelled Orders
**What:** Use soft delete pattern (status = CANCELLED) instead of physical deletion.

**Why:**
- Preserve order history for analytics and audit trails
- Track cancellation reasons and patterns
- Enable financial analysis of wasted preparation (items already in kitchen)
- Support potential order restoration if cancelled by mistake
- Maintain referential integrity with bills and reports

**Implementation:**
- Orders with status CANCELLED remain in database
- `cancelledAt` timestamp and `cancellationReason` fields record details
- Default queries filter out cancelled orders unless explicitly requested
- Separate cancellation analytics endpoints include cancelled orders

### Decision 4: Kitchen Order Priority Algorithm
**What:** Calculate priority score for kitchen orders based on waiting time, table priority, and order size.

**Formula:**
```
priority_score = (waiting_minutes * 2) + table_vip_bonus + rush_hour_multiplier
```

**Why:**
- VIP tables and long-waiting customers should be prioritized
- Rush hours require adaptive prioritization
- Simple algorithm easy to understand and tune
- Avoids complex ML models for initial implementation

**Implementation:**
- Priority calculated on kitchen order creation and updated every minute
- Orders sorted by priority score in kitchen display
- Visual indicators (red highlight) for high priority (score > 40)
- Configurable thresholds via environment variables

### Decision 5: Optimistic Locking for Concurrent Updates
**What:** Use Prisma's `@@updatedAt` field and version checking to detect concurrent modifications.

**Why:**
- Multiple waiters may add items to same order simultaneously
- Kitchen may complete order while waiter adds item
- Prevents lost updates and data corruption
- Better user experience than pessimistic locking (no blocking)

**Implementation:**
- Include `updatedAt` timestamp in read responses
- Require `updatedAt` in update requests
- Compare with database value before update
- Return 409 Conflict if mismatch detected
- Client retries with fresh data

### Decision 6: API Structure and Versioning
**What:** RESTful API with versioned endpoints under `/api/v1/orders`.

**Endpoints:**
```
POST   /api/v1/orders                    - Create order
GET    /api/v1/orders                    - List orders (with filters)
GET    /api/v1/orders/:id                - Get order details
PATCH  /api/v1/orders/:id                - Update order
DELETE /api/v1/orders/:id                - Cancel order
POST   /api/v1/orders/:id/items          - Add item
DELETE /api/v1/orders/:id/items/:itemId  - Remove item
PATCH  /api/v1/orders/:id/items/:itemId  - Update item quantity
GET    /api/v1/orders/statistics         - Order statistics
GET    /api/v1/kitchen-orders             - Kitchen orders list
POST   /api/v1/kitchen-orders/:id/accept - Accept kitchen order
PATCH  /api/v1/kitchen-orders/:id/status - Update status
POST   /api/v1/kitchen-orders/:id/complete - Complete order
```

**Why:**
- RESTful design familiar to frontend developers
- Versioning allows breaking changes in future
- Clear resource hierarchy (orders contain items)
- Separation of order management and kitchen operations

### Decision 7: Frontend State Management with Zustand
**What:** Use Zustand for global state management of orders and filters.

**Why:**
- Lighter weight than Redux, simpler API
- Good TypeScript support
- Easy to integrate with WebSocket updates
- No boilerplate for actions and reducers
- Already used in project (consistent with existing patterns)

**Store Structure:**
```typescript
interface OrderStore {
  orders: Order[]
  currentOrder: Order | null
  filters: OrderFilters
  loading: boolean
  error: string | null
  
  // Actions
  setOrders: (orders: Order[]) => void
  addOrder: (order: Order) => void
  updateOrder: (id: string, updates: Partial<Order>) => void
  removeOrder: (id: string) => void
  setFilters: (filters: OrderFilters) => void
  // ... more actions
}
```

### Decision 8: Order Number Generation Strategy
**What:** Use sequential number with daily reset and prefix (e.g., `ORD-2024-001`).

**Format:** `ORD-YYYYMMDD-NNN`

**Why:**
- Human-readable for staff communication
- Easy to reference verbally ("order 2024 dash 001")
- Daily reset keeps numbers manageable
- Date prefix helps with record keeping
- Sortable chronologically

**Implementation:**
- Database function or application logic to generate next number
- Atomic operation to prevent duplicates
- Fallback to UUID if sequential generation fails
- Store both formatted number and UUID in database

### Decision 9: Permission Model
**What:** Role-based access control (RBAC) with middleware authorization checks.

**Roles and Permissions:**
```
WAITER:
  - Create orders
  - View own orders
  - Add/remove items from own orders
  - Cannot cancel entire orders

CHEF:
  - View kitchen orders
  - Accept orders
  - Update item status
  - Complete orders
  - Cannot modify order details

MANAGER:
  - All WAITER permissions
  - View all orders
  - Cancel any order
  - View analytics
  - Generate reports

ADMIN:
  - All permissions
  - Delete orders
  - Modify any order
  - Configure system settings
```

**Implementation:**
- JWT token includes role claim
- Middleware functions: `requireRole(['waiter', 'manager'])`
- Ownership checks: `ensureOrderOwnership(userId, orderId)`
- Authorization errors return 403 Forbidden with clear message

### Decision 10: Notification System Architecture
**What:** Multi-channel notification system (WebSocket, browser push, sound alerts).

**Channels:**
1. **WebSocket:** Real-time in-app notifications (primary)
2. **Browser Push:** Background notifications when app not focused
3. **Sound Alerts:** Audio cues for critical events (kitchen orders ready)

**Why:**
- WebSocket alone insufficient if user on different tab
- Sound alerts crucial for busy kitchen environment
- Browser push enables notifications even when app minimized
- Multiple channels ensure no missed critical updates

**Implementation:**
- WebSocket events trigger UI updates and optional sounds
- Service Worker handles background push notifications
- User preferences stored in local storage (sound on/off, volume)
- Notification priority levels determine which channels activate

## Risks / Trade-offs

### Risk 1: WebSocket Scalability
**Risk:** WebSocket connections consume server resources; may not scale to hundreds of concurrent connections.

**Mitigation:**
- Current scope is single restaurant (max ~50 concurrent staff)
- Monitor WebSocket connection count and memory usage
- If needed, implement horizontal scaling with Redis adapter for Socket.io
- Consider switching to serverless WebSocket (AWS API Gateway WebSocket) if scaling issues arise

**Trade-off:** Complexity of distributed WebSocket vs current simplicity for small scale.

### Risk 2: Real-time Update Conflicts
**Risk:** Race conditions between WebSocket updates and manual refreshes may cause UI inconsistencies.

**Mitigation:**
- Use optimistic locking (updatedAt timestamp) to detect conflicts
- Implement reconciliation logic to merge server state with local state
- Show conflict resolution UI if simultaneous edits detected
- Log conflicts for monitoring and debugging

**Trade-off:** Added complexity in state management vs data consistency guarantees.

### Risk 3: Kitchen Display Reliability
**Risk:** Network interruptions could cause kitchen to miss new orders.

**Mitigation:**
- Implement exponential backoff reconnection with visual indicator
- Queue missed events server-side and replay on reconnection
- Fallback to thermal printer for order tickets if WebSocket fails
- Sound alert + visual warning if disconnected > 30 seconds

**Trade-off:** Redundant notification mechanisms add complexity but critical for operations.

### Risk 4: Database Performance Under Load
**Risk:** Complex order queries with joins (table, staff, items, menu) may slow down under load.

**Mitigation:**
- Add database indexes on frequently queried fields (status, orderTime, tableId, staffId)
- Implement query result caching with short TTL (10 seconds) for list views
- Use database connection pooling (Prisma default)
- Monitor query performance and optimize slow queries
- Consider read replicas if needed

**Trade-off:** Some queries may return slightly stale data (up to 10s) due to caching.

### Risk 5: Order Modification Authorization
**Risk:** Waiters may accidentally modify other waiters' orders causing confusion.

**Mitigation:**
- Default permission: waiters can only modify own orders
- Clear visual indicator of order ownership (assigned waiter name)
- Confirmation dialog for sensitive operations (cancel order, remove prepared items)
- Audit log tracks who made each change
- Manager override available for emergency corrections

**Trade-off:** Reduced flexibility vs operational safety and accountability.

## Migration Plan

**Phase 1: Backend Implementation (Week 1-2)**
1. Implement order and kitchen order API endpoints
2. Add WebSocket event handlers
3. Implement permission middleware
4. Write unit and integration tests
5. Deploy to staging environment

**Phase 2: Frontend Core UI (Week 3-4)**
1. Build order list page with filters
2. Build order creation flow
3. Build order detail page
4. Integrate WebSocket for real-time updates
5. Test on staging with sample data

**Phase 3: Kitchen Display System (Week 5)**
1. Build kitchen display interface
2. Implement kitchen order actions
3. Add sound notifications
4. Test kitchen workflow end-to-end
5. Deploy to staging kitchen display

**Phase 4: Statistics & Reporting (Week 6)**
1. Implement statistics endpoints
2. Build analytics dashboard
3. Add report export functionality
4. Test report accuracy
5. Deploy to staging

**Phase 5: Testing & Rollout (Week 7)**
1. Comprehensive E2E testing
2. Load testing with simulated orders
3. User acceptance testing with staff
4. Fix critical bugs
5. Production deployment
6. Monitor for 48 hours
7. Collect feedback and iterate

**Rollback Plan:**
- Feature flag to disable order management UI (redirect to old system if exists)
- Database migrations are additive only (no data loss)
- WebSocket server can be stopped independently without affecting REST API
- Rollback to previous deployment version if critical bugs found

## Open Questions

1. **Q:** Should we implement automatic order timeout (auto-cancel if pending too long)?
   **A:** Not in initial implementation. Add as future enhancement after monitoring typical order times.

2. **Q:** How should we handle split bills (multiple payments for one order)?
   **A:** Out of scope for order management. Handled by bill-payment-management capability.

3. **Q:** Should kitchen staff see customer names or just table numbers?
   **A:** Table numbers only for privacy. Customer names visible only to waiters and managers.

4. **Q:** What happens if menu item is deleted while referenced in pending orders?
   **A:** Soft delete menu items. Mark as unavailable but keep in database for order history integrity.

5. **Q:** Should we support order notes at both order level and item level?
   **A:** Yes. Order-level notes (e.g., "customer in a hurry") and item-level special requests (e.g., "no onions").

6. **Q:** How to handle printer failures for kitchen tickets?
   **A:** Display prominent error in UI, log incident, allow manual retry. Kitchen display remains primary system; printer is backup.

7. **Q:** Should we implement order templates for frequently ordered combinations?
   **A:** Not in initial scope. Add as "Quick Order" feature in future iteration based on user feedback.

8. **Q:** What data retention policy for completed/cancelled orders?
   **A:** Keep indefinitely for analytics. Implement archival to separate table after 1 year if performance degrades.
