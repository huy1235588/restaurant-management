# Implement Simplified Core Features

## Why

The current restaurant management system has detailed use case documentation (RESERVATION_MANAGEMENT.md, ORDER_MANAGEMENT.md, BILL_PAYMENT_MANAGEMENT.md) describing complex business workflows with advanced features like automated refunds, smart table assignment algorithms, kitchen station routing, split bills, and partial payments. While comprehensive, these features are **too complex for a graduation project demonstration** and would require significant development time.

Following the simplification recommendations in LUOC_BO.md, we need to implement **three core subsystems** with simplified workflows that demonstrate fundamental functionality while remaining practical for a single developer to build and demo within project constraints.

## What Changes

This change implements four simplified core features essential for restaurant operations:

### 1. **Simplified Order Management**
- **Manual table opening** - Waiter selects table and creates order manually
- **Simple item selection** - Add items from menu, specify quantity and special requests
- **Order confirmation** - Confirm order to send to kitchen, no complex validation
- **Order modification before kitchen** - Can edit/cancel items only before kitchen starts preparing
- **Status tracking** - Track order lifecycle: pending → confirmed → preparing → ready → completed
- **REMOVED**: Order modification after kitchen starts, complex item swapping, automated suggestions

### 2. **Simplified Reservation Management**
- **Manual table assignment** - Staff selects available tables from a filtered list, no smart algorithm
- **Basic deposit recording** - Store deposit amount only, manual refund decisions by admin
- **Single confirmation email** - One email sent on successful reservation creation
- **Manual no-show handling** - Staff explicitly marks reservations as "no-show" or "cancelled"
- **REMOVED**: Automated refund rules, smart table suggestions, automated reminders (cron jobs), timeout auto-cancellation

### 3. **Simplified Kitchen Operations**
- **Unified kitchen display** - All orders shown on one screen, chefs self-assign
- **Time tracking only** - Record startedAt/completedAt for reporting, no estimated time calculations
- **FIFO order display** - Orders sorted by creation time (first-come-first-served), no priority logic
- **No station routing** - All items visible to all chefs, stationId nullable/default
- **REMOVED**: Multi-station routing, preparation time estimates, VIP priority queues

### 4. **Simplified Billing & Payment**
- **One order = one bill** - No split bill functionality
- **Full payment only** - 100% payment required, no partial payments or debt tracking
- **Single payment method** - One payment method per bill in UI (DB supports 1-n for future)
- **Admin-only refunds** - Only admin can void/delete bills, no approval workflow
- **REMOVED**: Split bill (by person/item), partial payments, multi-method payments, complex refund workflows

### Shared Simplifications
- Keep existing database schema fields (for future scalability story to academic board)
- Use default/null values for unused fields (priority, stationId, etc.)
- Focus on core happy-path workflows for demo
- Manual processes where automation would add complexity

## Impact

### Affected Specs
- **NEW**: `order-management` - Simplified order creation and modification workflows
- **NEW**: `reservation-management` - Simplified reservation workflows
- **NEW**: `kitchen-operations` - Basic kitchen display and order tracking
- **NEW**: `billing-payment` - Straightforward billing and payment processing

### Affected Code
**Backend** (`app/server/src/`):
- `modules/orders/` - New CRUD endpoints for order management
- `modules/reservations/` - New CRUD endpoints with manual table selection
- `modules/kitchen/` - Unified kitchen order display API
- `modules/billing/` - Simplified billing endpoints (no split/partial)

**Frontend** (`app/client/src/`):
- `modules/orders/` - New module for waiter order management UI
- `modules/reservations/` - New module with manual table picker UI
- `modules/kitchen/` - Unified kitchen display dashboard
- `modules/billing/` - Simple bill creation and payment UI

### Database Changes
- **NO schema changes** - Use existing tables (Reservation, KitchenOrder, Bill, Payment)
- Fields like `priority`, `stationId`, `prepTimeEstimated` remain in schema but unused
- Default values and nullable fields leverage existing design

### API Changes
- **NEW** endpoints for order CRUD and status transitions
- **NEW** endpoints for reservation CRUD
- **NEW** endpoints for kitchen order list/update
- **NEW** endpoints for bill creation and payment
- All endpoints follow existing REST patterns

### Breaking Changes
- **NONE** - This is net-new feature implementation, no existing functionality affected

### Migration Required
- **NONE** - Fresh implementation using existing schema

### Documentation Updates
- Update README with simplified feature descriptions
- Add API documentation for new endpoints
- Include simplified workflow diagrams

## Rationale

This approach balances **demonstrating full-stack competency** with **realistic project scope**:

1. **Academic Value**: Shows complete CRUD operations, authentication, real-time updates, and business logic across four major domains (order, reservation, kitchen, billing)
2. **Implementability**: Each feature has clear, linear workflows achievable within graduation project timeframe
3. **Demo-Friendly**: Easy to demonstrate end-to-end flows: Customer arrives → Waiter creates order → Kitchen prepares → Waiter serves → Cashier processes payment
4. **Future-Proof**: Database schema supports advanced features for "scalability discussion" with academic board
5. **Best Practices**: Clean architecture, proper separation of concerns, RESTful API design

The simplified features still demonstrate:
- Frontend: React components, state management, forms, real-time UI updates
- Backend: API design, business logic, database operations, WebSocket for real-time kitchen updates
- Integration: Authentication, authorization, error handling, validation, transaction management
