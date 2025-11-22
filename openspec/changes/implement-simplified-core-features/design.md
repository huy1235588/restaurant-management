# Design Document: Simplified Core Features

## Context

This is a **graduation project** for a single developer demonstrating full-stack restaurant management capabilities. The original use case documentation (RESERVATION_MANAGEMENT.md, ORDER_MANAGEMENT.md, BILL_PAYMENT_MANAGEMENT.md) describes production-grade features with complex automation, algorithms, and workflows that would take months to implement properly.

**Constraints:**
- Single developer with limited time
- Must demonstrate competency across frontend, backend, database, real-time
- Academic demo context (not production commercial software)
- Database schema already designed with advanced features in mind
- Must be demonstrable end-to-end within 5-10 minute presentation

**Stakeholders:**
- Developer (graduation requirement)
- Academic reviewers (evaluating technical competency)
- Demo audience (understanding core restaurant workflows)

## Goals / Non-Goals

### Goals
1. **Demonstrate full-stack competency** across React, Next.js, NestJS, PostgreSQL, WebSocket
2. **Implement four complete workflows** (order, reservation, kitchen, billing) end-to-end
3. **Show real-time capabilities** with kitchen order updates
4. **Follow clean architecture** with proper separation of frontend modules, backend modules, database schema
5. **Enable easy demonstration** with straightforward happy-path flows from customer arrival to payment
6. **Maintain scalability story** for academic board (schema supports future features)

### Non-Goals
1. Production-grade edge case handling (partial payments, split bills, automated refunds)
2. Complex algorithms (smart table assignment, kitchen station routing, priority queues)
3. Automated workflows (cron jobs for reminders, auto-cancellations)
4. Multi-tenant support or enterprise features
5. Comprehensive test coverage (manual testing sufficient for demo)
6. Performance optimization for high-scale (demo-level data volumes only)

## Decisions

### Decision 1: Simplify All Four Features Uniformly

**Choice:** Apply consistent simplification principles across order, reservation, kitchen, and billing features

**Rationale:**
- Manual over automated: Staff explicitly performs actions (create order, select table, mark no-show, confirm payment)
- Linear workflows: No branching logic, conditional flows, or approval chains
- Single path: One way to complete each task (no order modification after kitchen, no split bills, no partial payments)
- Essential fields only: Use core database fields, leave advanced fields null/default

**Alternatives Considered:**
- Implement one or two features fully, skip others → Rejected: Need all four for complete customer journey demo
- Mix complex and simple features → Rejected: Inconsistent complexity harder to explain
- Use mocked/fake data → Rejected: Need real database operations for academic credibility

### Decision 2: Keep Database Schema Unchanged

**Choice:** Use existing comprehensive schema from `schema.prisma` without modifications

**Rationale:**
- **Academic Story**: "System designed for scalability - schema supports advanced features we didn't implement yet"
- **No Migration Risk**: Avoid Prisma migration complexity and potential data loss
- **Future-Ready**: Fields like `priority`, `stationId`, `prepTimeEstimated` documented but unused
- **Validates Design Skills**: Shows ability to design normalized, extensible schemas

**Implementation:**
- Set unused fields to `null` or default values
- Document which fields are used vs. reserved for future
- API responses include all fields (frontend ignores unused ones)

### Decision 3: Manual Table Selection (No Smart Algorithm)

**Choice:** Display filtered list of available tables, staff clicks to assign

**Rationale:**
- **Complexity Avoided**: Smart assignment requires capacity matching, location preferences, occupancy prediction
- **Transparency**: Staff understands exactly why table was chosen (they chose it)
- **Flexibility**: Staff can override for special cases (VIP seating, layout changes)
- **Simple Implementation**: SQL query with WHERE clauses, no algorithm logic

**UI Flow:**
```
1. Staff enters: date, time, party size
2. System filters: tables WHERE capacity >= partySize AND status = 'available'
3. Display list with: table number, capacity, floor, section
4. Staff clicks preferred table
5. Create reservation with selected tableId
```

**Alternatives Considered:**
- Auto-assign first available → Rejected: Removes staff judgment for VIP/special requests
- Suggest best match → Rejected: Adds complexity without clear demo value

### Decision 4: Unified Kitchen Display (No Station Routing)

**Choice:** Single screen shows all orders, chefs self-assign items

**Rationale:**
- **Eliminates Routing Logic**: No need to categorize items by station (grill, fry, dessert)
- **Real-World Flexibility**: Small kitchens often have multi-skilled chefs
- **Simpler Real-Time**: One WebSocket channel for all updates vs. per-station channels
- **FIFO Display**: Orders sorted by `createdAt` (first-come-first-served)

**UI Flow:**
```
1. Kitchen screen auto-refreshes via WebSocket
2. Display all KitchenOrders WHERE status IN ('pending', 'preparing')
3. Sort by createdAt ASC
4. Chef clicks "Start" → status = 'preparing', startedAt = now()
5. Chef clicks "Done" → status = 'ready', completedAt = now()
6. Waiter clicks "Served" → status = 'completed'
```

**Database Fields Used:**
- `status` (pending → preparing → ready → completed)
- `startedAt`, `completedAt` (for reporting)

**Database Fields Unused:**
- `stationId` (null or default to 1)
- `priority` (always 'normal')
- `prepTimeEstimated` (null)

### Decision 5: One Bill = One Payment (No Split Bills)

**Choice:** Each order generates exactly one bill, paid in full with one payment method

**Rationale:**
- **Avoids Complex UI**: Split bill requires item picker, balance tracking, multiple payments
- **Simplifies Backend**: No need to calculate partial amounts, track who paid what
- **Real-World Alternative**: Customers can split payment externally (Venmo, cash between themselves)
- **Clean Data Model**: 1:1 relationship Order → Bill simplifies queries

**UI Flow:**
```
1. Staff clicks "Create Bill" from completed order
2. System calculates: subtotal + tax + service - discount = total
3. Display bill details (read-only)
4. Staff selects ONE payment method (cash, card, mobile, voucher)
5. Enter amount (must equal total, no partial)
6. Confirm payment → bill.paymentStatus = 'paid', table.status = 'available'
```

**Database Schema (1-to-many exists for future, UI restricts to 1):**
- Bill 1 → * Payment (schema allows multiple)
- UI enforces: only ONE Payment record per Bill
- Single `paymentMethod` on Bill record for quick queries

**Alternatives Considered:**
- Allow multiple payment methods → Rejected: Adds UI complexity without demo value
- Partial payments → Rejected: Requires debt tracking, follow-up reminders

### Decision 6: No Automated Notifications (Manual Only)

**Choice:** Send only ONE confirmation email when reservation created, no follow-ups

**Rationale:**
- **No Cron Jobs**: Avoid node-cron complexity, background process management
- **Email Service Simplicity**: Single template, single trigger point
- **Manual Reminders**: Staff can call customers if needed (real-world backup)
- **Demo Focus**: Email sending not core to restaurant operations demo

**Implementation:**
- Use existing email service (if available) or console.log for demo
- Trigger: POST /reservations → send email with reservation code
- Template: Confirmation with date, time, table, reservation code
- No scheduled jobs, no retry logic, no delivery tracking

**Alternatives Considered:**
- Multiple reminder emails (24h, 4h, 1h before) → Rejected: Cron complexity
- SMS notifications → Rejected: Requires third-party service, costs
- Push notifications → Rejected: Mobile app out of scope

### Decision 7: Manual No-Show Handling

**Choice:** Staff explicitly clicks "No-Show" or "Cancel" button if customer doesn't arrive

**Rationale:**
- **No Timeout Logic**: Avoids scheduled tasks checking reservation times
- **Grace Period Flexibility**: Staff can wait 15-30 mins before marking no-show
- **Clear Audit Trail**: Explicit user action with timestamp and userId
- **Simple State Machine**: pending → confirmed → seated → completed/no_show/cancelled

**UI Flow:**
```
1. Reservation time passes
2. Staff checks if customer arrived
3. If yes: Click "Seat Customer" → status = 'seated', seatedAt = now()
4. If no: Click "Mark No-Show" → status = 'no_show', cancelledAt = now()
5. Table remains 'reserved' until staff action
```

**ReservationAudit logging:**
- Every status change logs: reservationId, action, userId, timestamp

### Decision 8: Admin-Only Refunds (No Workflow)

**Choice:** Only users with `role = 'admin'` can void/delete bills, no approval process

**Rationale:**
- **Role-Based Access Control**: Leverage existing RBAC system
- **No Approval Flow**: Avoids building request → review → approve workflow
- **Audit Logging**: Winston logs all bill deletions for accountability
- **Real-World Practice**: Only managers handle refunds in most restaurants

**Implementation:**
```typescript
// Backend middleware
@UseGuards(RolesGuard)
@Roles('admin')
@Delete('bills/:id')
async deleteBill(@Param('id') id: number) {
  // Log action
  logger.warn(`Bill ${id} deleted by ${user.id}`);
  // Soft delete or hard delete
  return this.billService.delete(id);
}
```

**Frontend:**
- "Void Bill" button only visible if `user.role === 'admin'`
- API returns 403 Forbidden for non-admin users

## Architecture Patterns

### Frontend Module Structure

Follow existing `modules/` pattern from menu implementation:

```
app/client/src/modules/reservations/
├── components/        # ReservationCard, TablePicker, etc.
├── views/             # ReservationListView, CreateReservationView
├── dialogs/           # Single/bulk operations
│   ├── single/        # CreateReservationDialog, EditReservationDialog
│   └── bulk/          # (future: bulk cancellation)
├── services/          # reservation.service.ts (Axios calls)
├── hooks/             # useReservations, useAvailableTables
├── types/             # index.ts - Reservation, CreateReservationDto
├── utils/             # formatReservationTime, validatePartySize
├── README.md          # Module documentation
└── index.ts           # Barrel exports

app/client/src/modules/orders/
├── components/        # OrderCard, MenuItemPicker, OrderItemList
├── views/             # OrderListView, CreateOrderView, OrderDetailsView
├── dialogs/           # Single/bulk operations
│   └── single/        # CreateOrderDialog, AddItemDialog, ConfirmOrderDialog
├── services/          # order.service.ts (Axios calls)
├── hooks/             # useOrders, useOrderDetails, useCreateOrder
├── types/             # index.ts - Order, OrderItem, CreateOrderDto
├── utils/             # calculateTotal, formatOrderNumber
├── README.md          # Module documentation
└── index.ts           # Barrel exports

app/client/src/modules/kitchen/
├── components/        # KitchenOrderCard, OrderStatusBadge
├── views/             # KitchenDashboardView
├── services/          # kitchen.service.ts
├── hooks/             # useKitchenOrders, useKitchenSocket
├── types/             # index.ts
├── utils/             # index.ts
├── README.md
└── index.ts

app/client/src/modules/billing/
├── components/        # BillSummary, PaymentMethodPicker
├── views/             # BillingListView, BillDetailsView
├── dialogs/           # CreateBillDialog, ProcessPaymentDialog, VoidBillDialog
│   └── single/
├── services/          # billing.service.ts
├── hooks/             # useBills, useProcessPayment
├── types/             # index.ts
├── utils/             # printBill.ts, formatCurrency.ts
├── README.md
└── index.ts
```

**Key Points:**
- Self-contained modules with all feature code (like menu, categories, tables)
- Shared components in `src/components/shared/`
- Shared services in `src/services/` (auth, upload)
- API calls in module `services/` layer using centralized Axios client (`src/lib/axios.ts`)
- Real-time hooks in module `hooks/` (Socket.io)
- Each module has README.md for documentation
- Barrel exports via index.ts for clean imports

### Backend Module Structure

Follow existing NestJS module pattern (auth, menu, category, table, storage):

```
app/server/src/modules/orders/
├── dto/                      # create-order.dto.ts, update-order.dto.ts, add-item.dto.ts
├── order.controller.ts       # REST endpoints
├── order.service.ts          # Business logic
├── order.repository.ts       # Prisma queries
├── order.module.ts           # Module definition
└── (optional) order.utils.ts

app/server/src/modules/reservations/
├── dto/                           # create-reservation.dto.ts, update-reservation.dto.ts
├── reservation.controller.ts      # REST endpoints
├── reservation.service.ts         # Business logic
├── reservation.repository.ts      # Prisma queries
├── reservation.module.ts          # Module definition
└── (optional) reservation.utils.ts

app/server/src/modules/kitchen/
├── dto/                      # update-kitchen-order.dto.ts
├── kitchen.controller.ts     # REST endpoints
├── kitchen.service.ts        # Business logic
├── kitchen.repository.ts     # Prisma queries
├── kitchen.gateway.ts        # WebSocket gateway
└── kitchen.module.ts

app/server/src/modules/billing/
├── dto/                      # create-bill.dto.ts, process-payment.dto.ts
├── bill.controller.ts        # Bill endpoints
├── payment.controller.ts     # Payment endpoints (or combined)
├── bill.service.ts           # Bill business logic
├── payment.service.ts        # Payment processing
├── bill.repository.ts        # Prisma queries
├── payment.repository.ts     # (if needed)
└── billing.module.ts
```

**Shared Utilities:**
- `app/server/src/shared/types/` - Shared TypeScript types
- `app/server/src/shared/utils/` - Helper functions
- `app/server/src/shared/websocket/` - WebSocket utilities
- `app/server/src/common/` - Guards, decorators, filters, pipes
- `app/server/src/config/` - Configuration modules
- `app/server/src/database/` - Prisma service

### Real-Time Updates (Kitchen)

**Pattern:** WebSocket Gateway for kitchen orders

```typescript
// kitchen.gateway.ts
@WebSocketGateway({ namespace: '/kitchen' })
export class KitchenGateway {
  @WebSocketServer() server: Server;

  // Emit to all connected kitchen clients
  notifyOrderUpdate(kitchenOrder: KitchenOrder) {
    this.server.emit('order:update', kitchenOrder);
  }
}

// Frontend hook
function useKitchenSocket() {
  useEffect(() => {
    const socket = io('/kitchen');
    socket.on('order:update', (order) => {
      // Update local state (Zustand or React Query)
      updateKitchenOrders(order);
    });
    return () => socket.disconnect();
  }, []);
}
```

**Events:**
- `order:new` - New order sent to kitchen
- `order:update` - Status changed (pending → preparing → ready)
- `order:complete` - Order picked up by waiter

### Data Flow

**Order Creation and Management:**
```
1. Frontend: Waiter selects available table
2. POST /api/v1/orders { tableId, customerName?, partySize }
3. Backend: OrderService.create()
   a. Validate table is available
   b. Create Order record (status = 'pending', orderNumber = UUID)
   c. Update Table status to 'occupied'
   d. Return order with orderNumber
4. Frontend: Display order form with empty items list

5. Frontend: Waiter adds menu items
6. POST /api/v1/orders/:id/items { itemId, quantity, specialRequest? }
7. Backend: OrderService.addItem()
   a. Validate order status is 'pending'
   b. Get MenuItem price (lock at current price)
   c. Create OrderItem (totalPrice = quantity × unitPrice)
   d. Recalculate order.totalAmount
   e. Return updated order
8. Frontend: Display updated order with new item

9. Frontend: Waiter confirms order
10. POST /api/v1/orders/:id/confirm
11. Backend: OrderService.confirm()
    a. Validate order has items
    b. Update order.status = 'confirmed', confirmedAt = now()
    c. Create KitchenOrder (1-to-1 link)
    d. Emit WebSocket event 'order:new' to kitchen
    e. Return confirmed order
12. Frontend: Show success, disable editing
13. Kitchen Frontend: Receives WebSocket event, displays new order
```

**Order Cancellation:**
```
1. Frontend: Waiter clicks cancel, enters reason
2. DELETE /api/v1/orders/:id { reason }
3. Backend: OrderService.cancel()
   a. Validate order not being prepared (check KitchenOrder status)
   b. Update order.status = 'cancelled', cancelledAt = now(), cancellationReason
   c. Update Table status = 'available'
   d. Emit WebSocket 'order:cancelled' to kitchen
   e. Return cancelled order
4. Frontend: Update UI, show table as available
```

**Reservation Creation:**
```
1. Frontend: User fills form → validates with Zod
2. POST /api/v1/reservations { customerName, phoneNumber, tableId, date, time, partySize }
3. Backend: ReservationService.create()
   a. Validate table available at that time
   b. Create Reservation record (status = 'pending')
   c. Send confirmation email (async)
   d. Return reservation with reservationCode
4. Frontend: Display confirmation, show reservation code
```

**Kitchen Order Flow:**
```
1. Waiter creates Order → OrderService.create()
2. OrderService calls KitchenService.createKitchenOrder()
3. KitchenGateway.notifyOrderUpdate() → WebSocket emit
4. Kitchen frontend receives real-time update → displays new order
5. Chef clicks "Start" → PATCH /api/v1/kitchen/:id { status: 'preparing' }
6. Chef clicks "Done" → PATCH /api/v1/kitchen/:id { status: 'ready' }
7. Each update emits WebSocket event → all clients refresh
```

**Bill Payment:**
```
1. Waiter clicks "Create Bill" from Order
2. POST /api/v1/bills { orderId }
3. BillService.create():
   a. Calculate subtotal (sum order items)
   b. Apply tax, service charge, discount
   c. Create Bill record (status = 'pending')
   d. Create BillItem records
4. Frontend displays bill summary
5. Waiter clicks "Pay" → POST /api/v1/bills/:id/payment { method, amount }
6. BillService.processPayment():
   a. Validate amount === bill.totalAmount
   b. Create Payment record
   c. Update bill.paymentStatus = 'paid'
   d. Update table.status = 'available'
   e. Update order.status = 'completed'
```

### State Machines

**Order Status Transitions:**
```
pending ──confirm──> confirmed ──kitchen complete + payment──> completed
  │                                                                ↑
  └──────────────────────cancel────────────────────────────────┘
  
Valid transitions:
- pending → confirmed (waiter confirms order)
- pending → cancelled (cancel before kitchen)
- confirmed → completed (payment processed)
- confirmed → cancelled (cancel only if kitchen not started)

Invalid transitions:
- pending → completed (must confirm first)
- confirmed → pending (cannot revert)
- completed → * (terminal state)
```

**Reservation Status Transitions:**
```
pending ──confirm──> confirmed ──seat──> seated ──complete──> completed
  │                     │                   │
  │                     │                   └──> no_show
  └─────────cancel──────┴───────────────────┘

Valid transitions:
- pending → confirmed (admin confirms)
- pending → cancelled (customer cancels early)
- confirmed → seated (customer arrives, waiter seats)
- confirmed → cancelled (cancel before arrival)
- confirmed → no_show (customer didn't arrive)
- seated → completed (service finished, bill paid)

Invalid transitions:
- pending → seated (must confirm first)
- seated → confirmed (cannot go back)
- completed/cancelled/no_show → * (terminal states)
```

**Kitchen Order Status Transitions:**
```
pending ──start──> preparing ──ready──> ready ──complete──> completed
  │                                                             ↑
  └───────────────────cancel────────────────────────────────┘

Valid transitions:
- pending → preparing (chef starts cooking)
- pending → cancelled (order cancelled before chef starts)
- preparing → ready (food ready for pickup)
- ready → completed (waiter picks up order)

Invalid transitions:
- preparing → pending (cannot unstart prep)
- ready → preparing (cannot go back)
- completed → * (terminal state)
```

**Bill Payment Status Transitions:**
```
pending ──pay──> paid
  │               ↑
  └───void────────┘

Valid transitions:
- pending → paid (payment processed successfully)
- pending → voided (admin cancels bill)
- paid → voided (admin refund - rare case)

Note: Only admins can void bills
```

## Risks / Trade-offs

### Risk 1: Feature Completeness vs. Time Constraints

**Trade-off:** Simplified features may appear "incomplete" to reviewers expecting production-level complexity

**Mitigation:**
- **Documentation**: Clearly explain simplification decisions in README and presentation
- **Scalability Story**: Emphasize database schema supports future enhancements
- **Focus on Quality**: Ensure implemented features are bug-free, well-tested, clean code

**Acceptance Criteria:**
- All four features have complete happy-path workflows
- Code is clean, well-structured, follows best practices
- Demo runs smoothly without errors

### Risk 2: Schema Fields Unused

**Trade-off:** Database has fields (priority, stationId, prepTimeEstimated) that remain null

**Mitigation:**
- **Academic Justification**: "Demonstrates forward-thinking database design"
- **Documentation Comments**: Mark unused fields with `// Reserved for future: XYZ feature`
- **No Harm**: Nullable fields don't break functionality or waste significant space

**Acceptance:**
- Reviewers understand this is a design choice, not oversight
- Schema validates with Prisma Studio showing all fields

### Risk 3: No Automated Testing

**Trade-off:** Manual testing only, no unit/integration test suite

**Mitigation:**
- **Time Reality**: Writing comprehensive tests doubles development time
- **Manual QA Checklist**: Create detailed test scenarios document
- **Live Demo**: Academic reviewers see features working in real-time
- **Future Work**: Can mention automated testing as "next step" in presentation

**Acceptance:**
- All features work correctly during demo
- No critical bugs in happy-path flows
- Edge cases documented as "out of scope"

### Risk 4: Single Payment Method Limitation

**Trade-off:** Cannot handle customers paying with multiple methods (e.g., cash + card)

**Mitigation:**
- **Real-World Alternative**: Staff can process as two separate bills if needed (manual workaround)
- **Schema Supports It**: Database has 1-to-many Bill → Payment (show design foresight)
- **Demo Script**: Avoid scenario requiring split payment method

**Acceptance:**
- Clearly document "one bill = one payment method" constraint
- Academic reviewers understand scope limitation

## Migration Plan

**Not Applicable** - Fresh feature implementation, no existing data or functionality to migrate.

**Deployment Steps:**
1. Merge OpenSpec proposal after review
2. Implement features following tasks.md checklist
3. Test locally with Docker Compose
4. Seed database with sample data for demo
5. Prepare demo script with step-by-step scenarios

## Open Questions

### Q1: Email Service for Reservation Confirmations

**Question:** Use real email service (SendGrid, Mailgun) or console.log simulation?

**Options:**
- A. Integrate real email service (requires API keys, credit card)
- B. Console.log emails in development, show in logs during demo
- C. Use local SMTP (Mailhog) for development testing

**Recommendation:** Start with console.log (Option B), upgrade to Mailhog (Option C) if time permits. Explain to reviewers as "email service abstraction layer - easily swappable in production."

### Q2: Reservation Time Slots

**Question:** Allow any time or restrict to 30-minute intervals (6:00, 6:30, 7:00)?

**Options:**
- A. Free-form time input (00:00 - 23:59)
- B. Dropdown with 30-min slots
- C. Dropdown with 1-hour slots

**Recommendation:** Option B (30-min slots) for demo clarity and realistic UX, but allow database to store any time for flexibility.

### Q3: WebSocket Namespace Organization

**Question:** Use separate namespaces for kitchen vs. orders vs. reservations?

**Options:**
- A. Single namespace `/` for all real-time events
- B. Separate namespaces: `/kitchen`, `/orders`, `/tables`
- C. Single connection, different event names

**Recommendation:** Option B for clean separation and scalability story, follows Socket.io best practices.

### Q4: Currency Formatting

**Question:** Store currency as integers (cents) or decimals (dollars)?

**Options:**
- A. Integer cents (e.g., 10000 = $100.00) - avoids floating point errors
- B. Decimal (e.g., 100.00) - easier to read in database
- C. String (e.g., "100.00") - no precision issues

**Recommendation:** Option B (Decimal in Prisma) - already defined in schema.prisma, use `@db.Decimal(12, 2)`. Format as VND in frontend (no decimal places for Vietnamese Dong).

### Q5: Soft Delete vs. Hard Delete for Cancellations

**Question:** When reservation/order/bill is cancelled, delete record or mark as cancelled?

**Options:**
- A. Hard delete - remove from database
- B. Soft delete - keep record, set status = 'cancelled'
- C. Archive - move to separate archive table

**Recommendation:** Option B (soft delete) - preserves audit trail, supports reporting, already in schema with `status` and `cancelledAt` fields.

## Summary

This design prioritizes **demonstrable functionality over production complexity**, choosing manual processes over automation, single-path workflows over branching logic, and essential features over advanced algorithms. The approach respects project constraints (single developer, graduation timeline) while demonstrating full-stack competency across all major technical areas.

**Key Success Metrics:**
1. All three features (reservation, kitchen, billing) work end-to-end
2. Real-time kitchen updates demonstrate WebSocket capability
3. Code is clean, well-organized, follows architectural patterns
4. Demo runs smoothly with prepared test data
5. Academic reviewers understand design decisions and trade-offs
