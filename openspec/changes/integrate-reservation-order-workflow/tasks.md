# Implementation Tasks: Reservation-Order Integration

## 1. Database Migration

- [x] 1.1 Create migration file for unique constraint
  - File: `app/server/prisma/migrations/YYYYMMDDHHMMSS_add_order_reservation_unique/migration.sql`
  - Add partial unique index: `CREATE UNIQUE INDEX idx_orders_reservation_unique ON orders(reservationId) WHERE reservationId IS NOT NULL AND status NOT IN ('cancelled')`
  - Test migration on local database
  - Verify constraint works: attempt duplicate insert, expect error

- [x] 1.2 Update Prisma schema (if needed)
  - File: `app/server/prisma/schema.prisma`
  - Add `@@unique` directive on `Order.reservationId` with condition
  - Run `npx prisma format` to validate
  - Run `npx prisma generate` to update client

## 2. Backend - Order Module (New)

- [x] 2.1 Create order module structure
  - Create directory: `app/server/src/modules/order/`
  - Create files: `order.controller.ts`, `order.service.ts`, `order.repository.ts`, `order.module.ts`
  - Create DTOs: `dto/create-order.dto.ts`, `dto/update-order.dto.ts`, `dto/query-order.dto.ts`
  - Create types: `types/order.types.ts`

- [x] 2.2 Define Order DTOs with Zod validation
  - `CreateOrderDto`: tableId (required), reservationId (optional), customerName, customerPhone, partySize, staffId, notes
  - `UpdateOrderDto`: Partial of CreateOrderDto
  - `QueryOrderDto`: filters (status, tableId, reservationId, dateRange), pagination
  - Validate using Zod schemas

- [x] 2.3 Implement Order Repository
  - `findAll(filters, pagination)` - Query orders with filters
  - `findById(id)` - Get single order with relations (table, reservation, items)
  - `findByNumber(orderNumber)` - Lookup by order number
  - `findByReservation(reservationId)` - Get order for reservation
  - `create(data)` - Insert new order
  - `update(id, data)` - Update order
  - `delete(id)` - Soft delete or hard delete

- [x] 2.4 Implement Order Service core methods
  - `findAll(query)` - Get orders with filters and pagination
  - `findById(id)` - Get single order with validation
  - `findByReservation(reservationId)` - Check if order exists for reservation
  - `create(dto, userId)` - Create order with validation (manual or auto)
  - `update(id, dto, userId)` - Update order
  - `complete(id, userId)` - Mark order completed, calculate totals
  - `cancel(id, reason, userId)` - Cancel order with reason

- [x] 2.5 Implement Order Number generation
  - Helper function: `generateOrderNumber()` returns `ORD-YYYYMMDD-XXXX`
  - Use date-fns for date formatting
  - Fallback to UUID if collision (unlikely)

- [x] 2.6 Implement Order Controller endpoints
  - `GET /api/orders` - List orders with filters
  - `GET /api/orders/:id` - Get order details
  - `GET /api/orders/number/:orderNumber` - Lookup by number
  - `POST /api/orders` - Create order manually
  - `PUT /api/orders/:id` - Update order
  - `PATCH /api/orders/:id/complete` - Complete order
  - `PATCH /api/orders/:id/cancel` - Cancel order
  - Add Swagger/OpenAPI decorators

- [x] 2.7 Register Order Module
  - Update `app/server/src/app.module.ts` to import `OrderModule`
  - Verify module dependencies (PrismaModule)

## 3. Backend - Reservation Service Modification

- [x] 3.1 Modify Reservation Service `seat()` method
  - File: `app/server/src/modules/reservation/reservation.service.ts`
  - Wrap operation in `this.prisma.$transaction()`
  - Step 1: Update reservation status to `seated`, set `seatedAt`
  - Step 2: Update table status to `occupied`
  - Step 3: Create order using `orderService.create()` or direct Prisma call
  - Step 4: Create reservation audit log
  - Return `{ reservation, order }` instead of just `reservation`
  - Add error handling: log error, rollback transaction, throw InternalServerErrorException

- [x] 3.2 Handle duplicate order creation gracefully
  - In `seat()` method, catch Prisma `P2002` error (unique constraint violation)
  - If duplicate, fetch existing order: `await this.prisma.order.findFirst({ where: { reservationId } })`
  - Return `{ reservation, order: existingOrder }` instead of error
  - Log warning: "Order already exists for reservation"

- [x] 3.3 Modify Reservation Service `complete()` method
  - Check if reservation has associated order: `const order = await this.prisma.order.findFirst({ where: { reservationId } })`
  - If order exists and status not `completed`: throw BadRequestException "Cannot complete reservation while order is active"
  - If order completed or null: proceed with completion
  - Update table status to `available`
  - Update reservation status to `completed`

- [x] 3.4 Modify Reservation Service `cancel()` method
  - Check if reservation is `seated` and has order
  - If order has items: throw BadRequestException "Cannot cancel reservation with active order items"
  - If order is `pending` (no items): cancel order in transaction
  - Update table status, reservation status
  - Create audit logs for both

- [x] 3.5 Update Reservation Controller `seat()` endpoint
  - File: `app/server/src/modules/reservation/reservation.controller.ts`
  - Update response message: "Reservation checked-in and order created"
  - Update return type to include both `reservation` and `order`
  - Update Swagger response schema

## 4. Backend - Order Item Management

- [ ] 4.1 Create OrderItem DTOs
  - `CreateOrderItemDto`: orderId, itemId (menuItemId), quantity, specialRequest
  - `UpdateOrderItemDto`: quantity, specialRequest
  - Validate with Zod

- [ ] 4.2 Implement OrderItem Service methods
  - `addItems(orderId, items[])` - Add multiple items to order
  - `updateItem(itemId, dto)` - Update quantity or special request
  - `removeItem(itemId)` - Remove item from order
  - Recalculate order totals after each operation

- [ ] 4.3 Add OrderItem endpoints to Order Controller
  - `POST /api/orders/:id/items` - Add items to order
  - `PATCH /api/orders/:id/items/:itemId` - Update item
  - `DELETE /api/orders/:id/items/:itemId` - Remove item

## 5. Backend - Audit Logging

- [ ] 5.1 Create Order Audit schema/table (if not exists)
  - Model: `OrderAudit` with fields: auditId, orderId, action, userId, changes (JSON), createdAt
  - Add to `prisma/schema.prisma`
  - Run migration if needed

- [ ] 5.2 Implement Order Audit Service
  - `create(orderId, action, userId, changes)` - Log order action
  - Called from OrderService methods (create, update, complete, cancel)

- [ ] 5.3 Update Reservation Audit for integrated operations
  - In `seat()` audit log, add field: `orderCreated: true, orderId: X`
  - In `cancel()` audit log, add field: `orderCancelled: true` if order cancelled

## 6. Frontend - Order Module (New)

- [x] 6.1 Create order module structure
  - Create directory: `app/client/src/modules/orders/`
  - Subdirectories: `components/`, `views/`, `dialogs/`, `services/`, `hooks/`, `types/`, `utils/`
  - Create `index.ts` barrel export

- [x] 6.2 Define Order TypeScript types
  - File: `types/order.types.ts`
  - Interface `Order`: match backend schema
  - Interface `OrderItem`: match backend schema
  - Enum `OrderStatus`: pending, confirmed, completed, cancelled
  - DTOs: `CreateOrderDto`, `UpdateOrderDto`, `QueryOrderDto`

- [x] 6.3 Create Order API Service
  - File: `services/order.service.ts`
  - Methods: `getAll(params)`, `getById(id)`, `create(dto)`, `update(id, dto)`, `complete(id)`, `cancel(id, reason)`
  - Use Axios instance from `@/lib/axios`

- [x] 6.4 Create Order custom hooks
  - `hooks/useOrders.ts` - Fetch paginated list with filters
  - `hooks/useOrder.ts` - Fetch single order by ID
  - `hooks/useOrderActions.ts` - Mutations (create, update, complete, cancel)

- [x] 6.5 Create Order UI components
  - `components/OrderCard.tsx` - Card displaying order summary
  - `components/OrderList.tsx` - Grid of order cards with loading/empty states
  - `components/OrderStatusBadge.tsx` - Color-coded status indicator
  - `components/OrderItemList.tsx` - Table of order items

- [x] 6.6 Create Order views
  - `views/OrderListView.tsx` - Main list page with filters (updated with Reservation column)
  - `views/OrderDetailView.tsx` - Detail page with items, totals, actions

- [x] 6.7 Create Order dialogs
  - `dialogs/CreateOrderDialog.tsx` - Form to create manual order
  - `dialogs/AddItemsDialog.tsx` - Select menu items to add
  - `dialogs/CompleteOrderDialog.tsx` - Confirm completion
  - `dialogs/CancelOrderDialog.tsx` - Cancel with reason

- [x] 6.8 Add Order pages to App Router
  - Create `app/client/src/app/(dashboard)/orders/page.tsx` - List view
  - Create `app/client/src/app/(dashboard)/orders/[id]/page.tsx` - Detail view

## 7. Frontend - Reservation Module Updates

- [x] 7.1 Update Reservation types for new response
  - File: `app/client/src/modules/reservations/types/reservation.types.ts`
  - Add type: `SeatReservationResponse = { reservation: Reservation, order: Order }`
  - Update `reservation.service.ts` `seat()` return type

- [x] 7.2 Update CheckInDialog component
  - File: `app/client/src/modules/reservations/dialogs/CheckInDialog.tsx`
  - Handle new response structure: `{ reservation, order }`
  - Display success message: "Reservation checked-in. Order #XXX created."
  - Add button: "View Order" redirecting to `/orders/[order.id]`

- [x] 7.3 Update Reservation detail view
  - File: `app/client/src/modules/reservations/views/ReservationDetailView.tsx`
  - Display linked order if reservation is `seated` and order exists
  - Show order number, status, items count
  - Add button: "View Order Details"

- [x] 7.4 Update Reservation card component
  - File: `app/client/src/modules/reservations/components/ReservationCard.tsx`
  - Show badge "Has Order" if order linked
  - Display order number if available

## 8. Frontend - Internationalization

- [ ] 8.1 Add Order translations to English
  - File: `app/client/locales/en.json`
  - Add keys: `order.title`, `order.create`, `order.status.pending`, `order.actions.complete`, etc.
  - Add messages: "Order created automatically", "Cannot complete reservation while order is active"

- [ ] 8.2 Add Order translations to Vietnamese
  - File: `app/client/locales/vi.json`
  - Translate all English keys to Vietnamese

## 9. Testing & Validation

- [ ] 9.1 Manual test: Happy path reservation to order
  - Create reservation → Confirm → Check-in
  - Verify order created automatically
  - Verify response includes both reservation and order
  - Check database: reservation.status=seated, order.reservationId set, table.status=occupied

- [ ] 9.2 Manual test: Duplicate check-in prevention
  - Create reservation → Check-in successfully
  - Attempt check-in again
  - Verify returns existing order, no duplicate created
  - Check database: only 1 order exists

- [ ] 9.3 Manual test: Transaction rollback
  - Manually trigger error (e.g., disconnect DB mid-transaction)
  - Verify reservation status unchanged
  - Verify no order created
  - Verify table status unchanged

- [ ] 9.4 Manual test: Walk-in order creation
  - Create order manually without reservation
  - Verify `reservationId` is NULL
  - Verify order displayed as "Walk-in" in UI

- [ ] 9.5 Manual test: Complete order then reservation
  - Create reservation → Check-in (order created)
  - Add items to order → Complete order
  - Complete reservation
  - Verify both completed, table available

- [ ] 9.6 Manual test: Cancel seated reservation
  - Create reservation → Check-in (order created)
  - Attempt cancel reservation without adding items
  - Verify both reservation and order cancelled
  - Add items to order → Attempt cancel
  - Verify error: "Cannot cancel reservation with active order items"

- [ ] 9.7 Test API endpoints with Postman/Swagger
  - Test all Order endpoints (GET, POST, PATCH)
  - Test modified Reservation endpoints (seat, complete, cancel)
  - Verify response schemas match documentation

## 10. Documentation

- [ ] 10.1 Create integration guide
  - File: `docs/implementation/RESERVATION_ORDER_INTEGRATION.md`
  - Document transaction flow, error handling, API changes
  - Include code examples for backend and frontend

- [ ] 10.2 Update reservation system documentation
  - File: `docs/architecture/RESERVATION_SYSTEM.md`
  - Mark section 7 "Tích hợp với hệ thống đặt món" as "✅ Implemented"
  - Add note: "See RESERVATION_ORDER_INTEGRATION.md for details"

- [ ] 10.3 Update API documentation
  - File: `docs/api/RESERVATION_API_FRONTEND.md`
  - Update `PATCH /reservations/:id/seated` response schema
  - Add note about breaking change

- [ ] 10.4 Create Order API documentation
  - File: `docs/api/ORDER_API_FRONTEND.md` (new)
  - Document all Order endpoints
  - Include request/response examples
  - Document error codes

## 11. Deployment Preparation

- [ ] 11.1 Review all changed files
  - Backend: ReservationService, OrderService, Controllers
  - Frontend: CheckInDialog, ReservationDetailView, Order module
  - Database: Migration file

- [ ] 11.2 Update environment variables (if needed)
  - No new env vars required

- [ ] 11.3 Prepare deployment checklist
  - Step 1: Run database migration
  - Step 2: Deploy backend (backward compatible)
  - Step 3: Test backend endpoints
  - Step 4: Deploy frontend
  - Step 5: Test end-to-end flow
  - Step 6: Monitor logs for errors

## Dependencies

**Parallel work (can do simultaneously):**
- Section 2 (Order Module) and Section 6 (Order Frontend) can start together
- Section 4 (Order Items) can start after Section 2.4
- Section 8 (i18n) can start anytime

**Sequential dependencies:**
- Section 1 (Migration) → Must complete before Section 2, 3
- Section 3 (Reservation modification) → Depends on Section 2 (OrderService exists)
- Section 7 (Reservation Frontend) → Depends on Section 3 (API changes deployed)
- Section 9 (Testing) → After Section 1-8 complete

**Critical path:**
1 → 2 → 3 → 7 → 9 (Database → Backend Order → Backend Reservation → Frontend → Testing)
