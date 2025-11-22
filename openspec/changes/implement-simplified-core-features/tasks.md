# Implementation Tasks

## 1. Backend: Reservation Management

### 1.1 Reservation Module Setup
- [x] 1.1.1 Create `app/server/src/modules/reservations/` directory
- [x] 1.1.2 Create `reservation.module.ts` with imports, controllers, providers, exports
- [x] 1.1.3 Register ReservationsModule in `app.module.ts`

### 1.2 Reservation API Controllers
- [x] 1.2.1 Create `reservation.controller.ts`
- [x] 1.2.2 Implement POST /api/v1/reservations (create reservation)
- [x] 1.2.3 Implement GET /api/v1/reservations (list with filters)
- [x] 1.2.4 Implement GET /api/v1/reservations/:id (get details)
- [x] 1.2.5 Implement PATCH /api/v1/reservations/:id (update)
- [x] 1.2.6 Implement DELETE /api/v1/reservations/:id (cancel)
- [x] 1.2.7 Implement POST /api/v1/reservations/:id/confirm (confirm reservation)
- [x] 1.2.8 Implement POST /api/v1/reservations/:id/seat (mark as seated)
- [x] 1.2.9 Implement POST /api/v1/reservations/:id/no-show (mark no-show)
- [x] 1.2.10 Implement POST /api/v1/reservations/:id/complete (mark completed)

### 1.3 Reservation Repository
- [x] 1.3.1 Create `reservation.repository.ts`
- [x] 1.3.2 Inject PrismaService from `@/database/prisma.service`
- [x] 1.3.3 Implement findMany() with filters (status, date range, table)
- [x] 1.3.4 Implement findById() with relations (table, customer, audits)
- [x] 1.3.5 Implement create() method
- [x] 1.3.6 Implement update() method
- [x] 1.3.7 Implement delete() method (soft delete)
- [x] 1.3.8 Implement findOverlapping() for double-booking check
- [x] 1.3.9 Implement getAvailableTables() query

### 1.4 Reservation Service Logic
- [x] 1.4.1 Create `reservation.service.ts`
- [x] 1.4.2 Inject ReservationRepository, PrismaService
- [x] 1.4.3 Implement create() with validation (double-booking check)
- [x] 1.4.4 Implement update() with re-validation if date/time/size changed
- [x] 1.4.5 Implement cancel() with soft delete (status = 'cancelled')
- [x] 1.4.6 Implement confirmReservation() status transition
- [x] 1.4.7 Implement seatCustomer() status transition + table update
- [x] 1.4.8 Implement markNoShow() status transition
- [x] 1.4.9 Create ReservationAudit records on every status change
- [x] 1.4.10 Implement getAvailableTables(date, time, duration, partySize)

### 1.5 Email Service Integration
- [ ] 1.5.1 Check if email service exists in `src/shared/` or create new one
- [ ] 1.5.2 Create reservation confirmation email template
- [ ] 1.5.3 Implement sendConfirmationEmail() method
- [ ] 1.5.4 Trigger email on successful reservation creation
- [ ] 1.5.5 Handle missing email gracefully (skip if null)

### 1.6 DTOs and Validation
- [x] 1.6.1 Create `dto/create-reservation.dto.ts`
- [x] 1.6.2 Use class-validator decorators: @IsString(), @IsNotEmpty(), @IsEmail(), etc.
- [x] 1.6.3 Define fields: customerName, phoneNumber, email, tableId, reservationDate, reservationTime, partySize, specialRequest, depositAmount
- [x] 1.6.4 Create `dto/update-reservation.dto.ts` extending PartialType(CreateReservationDto)
- [x] 1.6.5 Create `dto/available-tables-query.dto.ts` (date, time, duration, partySize)
- [x] 1.6.6 Create `dto/reservation-filters.dto.ts` for query params

### 1.7 Testing
- [ ] 1.7.1 Manual test: Create reservation with available table
- [ ] 1.7.2 Manual test: Attempt double-booking (should fail)
- [ ] 1.7.3 Manual test: Update reservation changes table assignment
- [ ] 1.7.4 Manual test: Cancel reservation releases table
- [ ] 1.7.5 Manual test: Email sent on creation (check logs if console.log)
- [ ] 1.7.6 Test with Postman/Thunder Client all endpoints

---

## 1.5. Backend: Order Management

### 1.5.1 Order Module Setup
- [x] 1.5.1.1 Create `app/server/src/modules/orders/` directory
- [x] 1.5.1.2 Create `order.module.ts` with imports, controllers, providers, exports
- [x] 1.5.1.3 Register OrdersModule in `app.module.ts`

### 1.5.2 Order API Controllers
- [x] 1.5.2.1 Create `order.controller.ts`
- [x] 1.5.2.2 Implement POST /api/v1/orders (create order)
- [x] 1.5.2.3 Implement GET /api/v1/orders (list with filters)
- [x] 1.5.2.4 Implement GET /api/v1/orders/:id (get details)
- [x] 1.5.2.5 Implement PATCH /api/v1/orders/:id (update order - pending only)
- [x] 1.5.2.6 Implement DELETE /api/v1/orders/:id (cancel order)
- [x] 1.5.2.7 Implement POST /api/v1/orders/:id/confirm (confirm order, send to kitchen)
- [x] 1.5.2.8 Implement POST /api/v1/orders/:id/items (add item to order)
- [x] 1.5.2.9 Implement PATCH /api/v1/orders/:id/items/:itemId (update item quantity/special request)
- [x] 1.5.2.10 Implement DELETE /api/v1/orders/:id/items/:itemId (remove item)

### 1.5.3 Order Repository
- [x] 1.5.3.1 Create `order.repository.ts`
- [x] 1.5.3.2 Inject PrismaService
- [x] 1.5.3.3 Implement findMany() with filters (status, table, date, staff)
- [x] 1.5.3.4 Implement findById() with relations (table, orderItems, staff, bill, kitchenOrders)
- [x] 1.5.3.5 Implement create() method
- [x] 1.5.3.6 Implement update() method
- [x] 1.5.3.7 Implement delete() method (soft delete via status)
- [x] 1.5.3.8 Implement findActiveByTable() for table validation

### 1.5.4 Order Item Repository
- [x] 1.5.4.1 Create `order-item.repository.ts` (or integrate into order.repository)
- [x] 1.5.4.2 Implement create() for OrderItem
- [x] 1.5.4.3 Implement update() for quantity/special request
- [x] 1.5.4.4 Implement delete() for removing items
- [x] 1.5.4.5 Implement findByOrderId() to get all items

### 1.5.5 Order Service Logic
- [x] 1.5.5.1 Create `order.service.ts`
- [x] 1.5.5.2 Inject OrderRepository, OrderItemRepository, PrismaService
- [x] 1.5.5.3 Implement create() - validate table available, create order with UUID orderNumber
- [x] 1.5.5.4 Implement addItem() - lock MenuItem price, create OrderItem, recalculate totals
- [x] 1.5.5.5 Implement updateItem() - update quantity/special request, recalculate totals
- [x] 1.5.5.6 Implement removeItem() - delete OrderItem, recalculate totals
- [x] 1.5.5.7 Implement confirm() - validate has items, create KitchenOrder, emit WebSocket
- [x] 1.5.5.8 Implement cancel() - validate not being prepared, update status, free table
- [x] 1.5.5.9 Implement calculateTotals() - sum items, apply tax (10%), update order amounts
- [x] 1.5.5.10 Implement markCompleted() - triggered by payment, update status, free table

### 1.5.6 Integration with Table Module
- [x] 1.5.6.1 Import TableModule into OrdersModule
- [x] 1.5.6.2 On order create: Update table status to 'occupied'
- [x] 1.5.6.3 On order cancel/complete: Update table status to 'available'
- [x] 1.5.6.4 Validate table is available before creating order

### 1.5.7 Integration with MenuItem Module
- [x] 1.5.7.1 Import MenuModule into OrdersModule
- [x] 1.5.7.2 When adding item: Fetch MenuItem to get current price
- [x] 1.5.7.3 Lock price in OrderItem.unitPrice (price at time of order)
- [x] 1.5.7.4 Validate itemId exists before creating OrderItem

### 1.5.8 DTOs and Validation
- [x] 1.5.8.1 Create `dto/create-order.dto.ts` (tableId, customerName?, customerPhone?, partySize?, reservationId?)
- [x] 1.5.8.2 Create `dto/update-order.dto.ts` extending PartialType(CreateOrderDto)
- [x] 1.5.8.3 Create `dto/add-order-item.dto.ts` (itemId, quantity, specialRequest?)
- [x] 1.5.8.4 Create `dto/update-order-item.dto.ts` (quantity?, specialRequest?)
- [x] 1.5.8.5 Create `dto/cancel-order.dto.ts` (cancellationReason)
- [x] 1.5.8.6 Create `dto/order-filters.dto.ts` for query params (status, tableId, date)
- [x] 1.5.8.7 Use class-validator: @IsInt(), @IsPositive(), @IsOptional(), @IsString(), etc.

### 1.5.9 Business Logic Validations
- [x] 1.5.9.1 Validate table is available when creating order
- [x] 1.5.9.2 Validate only one active order per table
- [x] 1.5.9.3 Validate order status is 'pending' before allowing item modifications
- [x] 1.5.9.4 Validate order has at least 1 item before confirmation
- [x] 1.5.9.5 Validate kitchen order status is 'pending' before allowing cancellation
- [x] 1.5.9.6 Validate quantity > 0 when adding/updating items
- [x] 1.5.9.7 Validate cancellationReason is required and min 10 characters

### 1.5.10 Testing
- [ ] 1.5.10.1 Manual test: Create order for available table
- [ ] 1.5.10.2 Manual test: Cannot create order for occupied table
- [ ] 1.5.10.3 Manual test: Add multiple items to order
- [ ] 1.5.10.4 Manual test: Update item quantity, verify total recalculated
- [ ] 1.5.10.5 Manual test: Remove item, verify total updated
- [ ] 1.5.10.6 Manual test: Confirm order with items (should create KitchenOrder)
- [ ] 1.5.10.7 Manual test: Cannot confirm empty order
- [ ] 1.5.10.8 Manual test: Cannot modify order after confirmation
- [ ] 1.5.10.9 Manual test: Cancel pending order, verify table freed
- [ ] 1.5.10.10 Manual test: Cannot cancel order after kitchen started preparing
- [ ] 1.5.10.11 Test all endpoints with Postman/Thunder Client

---

## 3. Backend: Kitchen Operations

### 2.1 Kitchen Module Setup
- [x] 2.1.1 Create `app/server/src/modules/kitchen/` directory
- [x] 2.1.2 Create `kitchen.module.ts` with imports, controllers, providers, exports
- [x] 2.1.3 Register KitchenModule in `app.module.ts`

### 2.2 Kitchen Order API Controllers
- [x] 2.2.1 Create `kitchen.controller.ts`
- [x] 2.2.2 Implement GET /api/v1/kitchen/orders (list all pending/preparing/ready)
- [x] 2.2.3 Implement GET /api/v1/kitchen/orders/:id (get details)
- [x] 2.2.4 Implement PATCH /api/v1/kitchen/orders/:id/start (start preparing)
- [x] 2.2.5 Implement PATCH /api/v1/kitchen/orders/:id/ready (mark ready)
- [x] 2.2.6 Implement PATCH /api/v1/kitchen/orders/:id/complete (mark completed/picked up)
- [x] 2.2.7 Implement PATCH /api/v1/kitchen/orders/:id/cancel (cancel order)

### 2.3 Kitchen Order Repository
- [x] 2.3.1 Create `kitchen.repository.ts`
- [x] 2.3.2 Inject PrismaService
- [x] 2.3.3 Implement findMany() with status filters, FIFO sorting (ORDER BY createdAt ASC)
- [x] 2.3.4 Implement findById() with relations (order, orderItems)
- [x] 2.3.5 Implement create(), update(), delete() methods

### 2.4 Kitchen Order Service
- [x] 2.4.1 Create `kitchen.service.ts`
- [x] 2.4.2 Inject KitchenRepository, PrismaService
- [x] 2.4.3 Implement createKitchenOrder() (called when Order is sent to kitchen)
- [x] 2.4.4 Implement startPreparing() - set startedAt, status = 'preparing'
- [x] 2.4.5 Implement markReady() - set completedAt, calculate prepTimeActual, status = 'ready'
- [x] 2.4.6 Implement markCompleted() - status = 'completed', notify waiter
- [x] 2.4.7 Implement cancelOrder() - status = 'cancelled'
- [x] 2.4.8 Implement list() with FIFO sorting

### 2.5 WebSocket Gateway for Kitchen
- [x] 2.5.1 Create `kitchen.gateway.ts` in modules/kitchen/
- [x] 2.5.2 Define @WebSocketGateway({ namespace: '/kitchen' }) or use shared gateway
- [x] 2.5.3 Emit 'order:new' event when kitchen order created
- [x] 2.5.4 Emit 'order:update' event when status changes (start/ready/complete)
- [x] 2.5.5 Emit 'order:cancelled' event when order cancelled
- [x] 2.5.6 Handle client connections/disconnections
- [x] 2.5.7 Check if WebSocket utilities exist in `src/shared/websocket/`

### 2.6 Integration with Order Module
- [x] 2.6.1 Create Order module if not exists (or use existing)
- [x] 2.6.2 Update Order service to call KitchenService.createKitchenOrder() when order confirmed
- [x] 2.6.3 Link KitchenOrder.orderId to Order.orderId (1-to-1)
- [x] 2.6.4 Update Order status when kitchen order status changes (ready → update order)

### 2.7 DTOs and Validation
- [x] 2.7.1 Create `dto/update-kitchen-order.dto.ts`
- [x] 2.7.2 Define status transitions allowed per current status
- [x] 2.7.3 Validate chef can only claim pending orders
- [x] 2.7.4 Validate status progression (no backward transitions)
- [x] 2.7.5 Create `dto/kitchen-order-filters.dto.ts`

### 2.8 Testing
- [ ] 2.8.1 Manual test: Create order → kitchen order appears in pending
- [ ] 2.8.2 Manual test: Chef clicks start → status updates, WebSocket event received
- [ ] 2.8.3 Manual test: Chef clicks ready → status updates, waiter notified
- [ ] 2.8.4 Manual test: FIFO ordering (oldest orders first)
- [ ] 2.8.5 Manual test: Multiple kitchen screens sync via WebSocket

---

## 4. Backend: Billing & Payment

### 3.1 Billing Module Setup
- [x] 3.1.1 Create `app/server/src/modules/billing/` directory
- [x] 3.1.2 Create `billing.module.ts` with imports, controllers, providers, exports
- [x] 3.1.3 Register BillingModule in `app.module.ts`

### 3.2 Bill API Controllers
- [x] 3.2.1 Create `bill.controller.ts`
- [x] 3.2.2 Implement POST /api/v1/bills (create from orderId)
- [x] 3.2.3 Implement GET /api/v1/bills (list with filters)
- [x] 3.2.4 Implement GET /api/v1/bills/:id (get details)
- [x] 3.2.5 Implement PATCH /api/v1/bills/:id/discount (apply discount)
- [x] 3.2.6 Implement DELETE /api/v1/bills/:id (admin-only void bill)
- [x] 3.2.7 Implement POST /api/v1/bills/:id/payment (process payment - can be in same controller)

### 3.3 Bill Repository
- [x] 3.3.1 Create `bill.repository.ts`
- [x] 3.3.2 Inject PrismaService
- [x] 3.3.3 Implement findMany() with filters (status, date, method)
- [x] 3.3.4 Implement findById() with relations (order, billItems, payments)
- [x] 3.3.5 Implement create(), update(), delete() methods
- [x] 3.3.6 Implement findByOrderId()

### 3.4 Payment Repository
- [x] 3.4.1 Create `payment.repository.ts` (if separate from bill)
- [x] 3.4.2 Implement create(), findByBillId() methods

### 3.5 Bill Service Logic
- [x] 3.5.1 Create `bill.service.ts`
- [x] 3.5.2 Inject BillRepository, PaymentRepository, PrismaService
- [x] 3.5.3 Implement createBill(orderId) - calculate subtotal, tax, service charge, total
- [x] 3.5.4 Create BillItem records from OrderItems
- [x] 3.5.5 Implement applyDiscount() - recalculate totalAmount
- [x] 3.5.6 Validate discount requires manager approval if > 10%
- [x] 3.5.7 Implement voidBill() - admin-only, log action with Winston

### 3.6 Payment Service Logic
- [x] 3.6.1 Create `payment.service.ts` or integrate into bill.service.ts
- [x] 3.6.2 Implement processPayment(billId, paymentData) - create Payment record
- [x] 3.6.3 Update Bill: paidAmount, changeAmount, paymentStatus = 'paid', paidAt
- [x] 3.6.4 Update Bill.paymentMethod field
- [x] 3.6.5 Update Order status to 'completed'
- [x] 3.6.6 Update Table status to 'available'
- [x] 3.6.7 Use Prisma transaction for atomicity ($transaction)

### 3.7 Configuration for Tax and Service Rates
- [x] 3.7.1 Check existing config in `src/config/`
- [x] 3.7.2 Add taxRate and serviceRate to config (e.g., 10% and 5%)
- [x] 3.7.3 Read from environment variables or ConfigService
- [x] 3.7.4 Use in bill calculation formulas

### 3.8 DTOs and Validation
- [x] 3.8.1 Create `dto/create-bill.dto.ts` (orderId)
- [x] 3.8.2 Create `dto/apply-discount.dto.ts` (amount or percentage, reason)
- [x] 3.8.3 Create `dto/process-payment.dto.ts` (method, amount, transactionId, cardNumber)
- [x] 3.8.4 Validate amount > 0 and amount === bill.totalAmount
- [x] 3.8.5 Create `dto/bill-filters.dto.ts` for query params

### 3.9 RBAC for Bill Void
- [x] 3.9.1 Use existing Roles guard from `src/common/guards/` or create if needed
- [x] 3.9.2 Add @Roles('admin') decorator to DELETE /bills/:id endpoint
- [x] 3.9.3 Test non-admin returns 403 Forbidden
- [x] 3.9.4 Log all bill voids with Winston logger (userId, billId, reason)

### 3.10 Testing
- [ ] 3.10.1 Manual test: Create bill from order with items
- [ ] 3.10.2 Manual test: Apply percentage discount, verify total recalculated
- [ ] 3.10.3 Manual test: Pay with cash, verify bill/order/table status updated
- [ ] 3.10.4 Manual test: Pay with card, verify Payment record created
- [ ] 3.10.5 Manual test: Attempt partial payment (should fail)
- [ ] 3.10.6 Manual test: Admin void bill, verify logged
- [ ] 3.10.7 Manual test: Non-admin cannot void bill

---

## 2. Frontend: Order Management Module

### 2.1 Module Structure Setup
- [ ] 2.1.1 Create `app/client/src/modules/orders/` directory
- [ ] 2.1.2 Create subdirectories: components/, views/, dialogs/single/, services/, hooks/, types/, utils/
- [ ] 2.1.3 Create barrel export index.ts
- [ ] 2.1.4 Create README.md documenting module structure

### 2.2 API Service Integration
- [ ] 2.2.1 Create `services/order.service.ts`
- [ ] 2.2.2 Implement createOrder(tableId, customerName?, partySize?) → Promise<Order>
- [ ] 2.2.3 Implement getOrders(filters: {status?, tableId?, date?}) → Promise<Order[]>
- [ ] 2.2.4 Implement getOrderById(orderId) → Promise<Order>
- [ ] 2.2.5 Implement addItemToOrder(orderId, itemId, quantity, specialRequest?) → Promise<OrderItem>
- [ ] 2.2.6 Implement updateOrderItem(orderId, itemId, quantity?, specialRequest?) → Promise<OrderItem>
- [ ] 2.2.7 Implement removeOrderItem(orderId, itemId) → Promise<void>
- [ ] 2.2.8 Implement confirmOrder(orderId) → Promise<Order>
- [ ] 2.2.9 Implement cancelOrder(orderId, reason) → Promise<Order>
- [ ] 2.2.10 Handle API errors with toast notifications

### 2.3 TypeScript Types
- [ ] 2.3.1 Create `types/order.types.ts`
- [ ] 2.3.2 Define Order interface (orderId, orderNumber, tableId, staffId, status, items[], amounts, timestamps)
- [ ] 2.3.3 Define OrderItem interface (orderItemId, orderId, itemId, menuItem, quantity, unitPrice, specialRequest)
- [ ] 2.3.4 Define OrderStatus enum ('pending', 'confirmed', 'completed', 'cancelled')
- [ ] 2.3.5 Define CreateOrderRequest, AddItemRequest, UpdateItemRequest DTOs
- [ ] 2.3.6 Define OrderFilters interface for query params

### 2.4 State Management Hooks
- [ ] 2.4.1 Create `hooks/useOrders.ts` (fetch orders list with filters)
- [ ] 2.4.2 Create `hooks/useOrder.ts` (fetch single order by ID)
- [ ] 2.4.3 Create `hooks/useCreateOrder.ts` (mutation to create order)
- [ ] 2.4.4 Create `hooks/useAddOrderItem.ts` (mutation to add item)
- [ ] 2.4.5 Create `hooks/useRemoveOrderItem.ts` (mutation to remove item)
- [ ] 2.4.6 Create `hooks/useUpdateOrderItem.ts` (mutation to update quantity/special request)
- [ ] 2.4.7 Create `hooks/useConfirmOrder.ts` (mutation to confirm order)
- [ ] 2.4.8 Create `hooks/useCancelOrder.ts` (mutation to cancel order)
- [ ] 2.4.9 Implement optimistic updates for item add/remove/update
- [ ] 2.4.10 Implement cache invalidation on order status changes

### 2.5 Core Components
- [ ] 2.5.1 Create `components/OrderCard.tsx` (display order summary with status badge)
- [ ] 2.5.2 Create `components/OrderItemList.tsx` (list of order items with quantity, price)
- [ ] 2.5.3 Create `components/OrderStatusBadge.tsx` (color-coded status indicator)
- [ ] 2.5.4 Create `components/MenuItemPicker.tsx` (select menu items to add to order)
- [ ] 2.5.5 Create `components/OrderSummary.tsx` (subtotal, tax, total display)
- [ ] 2.5.6 Create `components/OrderActions.tsx` (confirm/cancel buttons with permission checks)
- [ ] 2.5.7 Use shadcn/ui components: Button, Card, Badge, Select, Input
- [ ] 2.5.8 Implement responsive design for all components

### 2.6 Views
- [ ] 2.6.1 Create `views/OrderListView.tsx` (table showing all orders with filters)
- [ ] 2.6.2 Implement filters: status dropdown, table number, date range
- [ ] 2.6.3 Implement search by order number
- [ ] 2.6.4 Implement pagination or infinite scroll
- [ ] 2.6.5 Create `views/OrderDetailsView.tsx` (full order details with items)
- [ ] 2.6.6 Show table info, customer info, staff info, timestamps
- [ ] 2.6.7 Show item list with quantities, prices, special requests
- [ ] 2.6.8 Show order total with tax breakdown
- [ ] 2.6.9 Implement real-time order updates via WebSocket

### 2.7 Dialogs
- [ ] 2.7.1 Create `dialogs/single/CreateOrderDialog.tsx`
- [ ] 2.7.2 Select table from available tables
- [ ] 2.7.3 Optional customer name, phone, party size inputs
- [ ] 2.7.4 Optional link to reservation
- [ ] 2.7.5 Create `dialogs/single/AddItemDialog.tsx`
- [ ] 2.7.6 Browse/search menu items by category
- [ ] 2.7.7 Select quantity (number input with +/- buttons)
- [ ] 2.7.8 Optional special request textarea
- [ ] 2.7.9 Show item price and calculated subtotal
- [ ] 2.7.10 Create `dialogs/single/CancelOrderDialog.tsx` (cancellation reason required)

### 2.8 Routing & Navigation
- [x] 2.8.1 Add `/orders` route in app router (orders list)
- [x] 2.8.2 Add `/orders/:id` route (order details)
- [x] 2.8.3 Add navigation item in main sidebar/menu
- [x] 2.8.4 Implement breadcrumbs: Orders > Order #12345
- [x] 2.8.5 Implement deep linking to order details from other modules

### 2.9 Permissions & Access Control
- [ ] 2.9.1 Check user role before showing Create Order button
- [ ] 2.9.2 Only waiters/admins can create orders
- [ ] 2.9.3 Only waiters/admins can add/remove items
- [ ] 2.9.4 Only waiters/admins can confirm orders
- [ ] 2.9.5 Only admins can cancel confirmed orders
- [ ] 2.9.6 Kitchen staff can view orders but not modify

### 2.10 Testing
- [ ] 2.10.1 Manual test: Create order for available table
- [ ] 2.10.2 Manual test: Add multiple items to order
- [ ] 2.10.3 Manual test: Update item quantity, verify total updated
- [ ] 2.10.4 Manual test: Remove item, verify total recalculated
- [ ] 2.10.5 Manual test: Confirm order, verify status changes and sent to kitchen
- [ ] 2.10.6 Manual test: Cannot modify confirmed order
- [ ] 2.10.7 Manual test: Cancel pending order with reason
- [ ] 2.10.8 Manual test: Filter orders by status, table, date
- [ ] 2.10.9 Manual test: Real-time updates when order status changes
- [ ] 2.10.10 Manual test: Verify permissions work correctly

---

## 3. Frontend: Reservation Management Module

### 3.1 Module Structure Setup
- [x] 3.1.1 Create `app/client/src/modules/reservations/` directory
- [x] 3.1.2 Create subdirectories: components/, views/, dialogs/single/, services/, hooks/, types/, utils/
- [x] 3.1.3 Create barrel export index.ts
- [x] 3.1.4 Create README.md documenting module structure (follow menu README pattern)

### 3.2 API Service Layer
- [x] 3.2.1 Create `services/reservation.service.ts` using centralized Axios client from `@/lib/axios`
- [x] 3.2.2 Implement createReservation(data)
- [x] 3.2.3 Implement getReservations(filters)
- [x] 3.2.4 Implement getReservationById(id)
- [x] 3.2.5 Implement updateReservation(id, data)
- [x] 3.2.6 Implement cancelReservation(id, reason)
- [x] 3.2.7 Implement confirmReservation(id)
- [x] 3.2.8 Implement seatCustomer(id)
- [x] 3.2.9 Implement markNoShow(id)
- [x] 3.2.10 Implement getAvailableTables(date, time, duration, partySize)
- [x] 3.2.11 Export via `services/index.ts`

### 3.3 TypeScript Types
- [x] 3.3.1 Create `types/index.ts` (barrel export)
- [x] 3.3.2 Define Reservation interface matching backend schema
- [x] 3.3.3 Define CreateReservationDto, UpdateReservationDto
- [x] 3.3.4 Define AvailableTable type
- [x] 3.3.5 Define ReservationStatus enum

### 3.4 Custom Hooks
- [x] 3.4.1 Create `hooks/useReservations.ts` (fetch list with filters)
- [x] 3.4.2 Create `hooks/useReservationDetails.ts` (fetch single reservation)
- [x] 3.4.3 Create `hooks/useAvailableTables.ts` (fetch available tables)
- [x] 3.4.4 Create `hooks/useCreateReservation.ts` (mutation hook)
- [x] 3.4.5 Create `hooks/useUpdateReservation.ts` (mutation hook)
- [x] 3.4.6 Use React Query or SWR for caching and optimistic updates
- [x] 3.4.7 Export via `hooks/index.ts`

### 3.5 UI Components
- [x] 3.5.1 Create `components/ReservationCard.tsx` (display single reservation in list)
- [x] 3.5.2 Create `components/ReservationStatusBadge.tsx` (color-coded status using shadcn/ui Badge)
- [x] 3.5.3 Create `components/TablePicker.tsx` (select from available tables)
- [x] 3.5.4 Create `components/ReservationFilters.tsx` (status, date range filters)
- [x] 3.5.5 Create `components/ReservationSearchBar.tsx` (search by code/phone)
- [x] 3.5.6 Create `components/index.ts` barrel export

### 3.6 Dialogs
- [x] 3.6.1 Create `dialogs/single/` directory
- [x] 3.6.2 Create `dialogs/single/CreateReservationDialog.tsx`
- [x] 3.6.3 Use Dialog component from `@/components/ui/dialog`
- [x] 3.6.4 Implement form with React Hook Form + Zod validation
- [x] 3.6.5 Include date/time picker (use existing date-picker component if available)
- [x] 3.6.6 Fetch and display available tables on date/time change
- [x] 3.6.7 Submit and show toast notifications (use `@/components/ui/toast`)
- [x] 3.6.8 Create `dialogs/single/EditReservationDialog.tsx` (similar to create)
- [x] 3.6.9 Create `dialogs/single/CancelReservationDialog.tsx` (reason input)
- [x] 3.6.10 Create `dialogs/single/ConfirmNoShowDialog.tsx`
- [x] 3.6.11 Create `dialogs/single/index.ts` barrel export

### 3.7 Views
- [x] 3.7.1 Create `views/ReservationListView.tsx`
- [x] 3.7.2 Display reservations with filters and search
- [x] 3.7.3 Show "Create Reservation" button (opens dialog)
- [x] 3.7.4 Show action buttons per reservation (Confirm, Seat, No-Show, Edit, Cancel)
- [x] 3.7.5 Create `views/ReservationDetailsView.tsx`
- [x] 3.7.6 Display full reservation info with audit trail
- [x] 3.7.7 Show status transition buttons
- [x] 3.7.8 Export via `views/index.ts`

### 3.8 Routing
- [x] 3.8.1 Create `app/client/src/app/(dashboard)/reservations/page.tsx` → ReservationListView
- [x] 3.8.2 Create `app/client/src/app/(dashboard)/reservations/[id]/page.tsx` → ReservationDetailsView
- [x] 3.8.3 Add sidebar navigation link in `@/components/layouts/Sidebar.tsx` or similar
- [x] 3.8.4 Add icon and label for Reservations
- [x] 3.8.5 Check role-based visibility (waiter, manager, admin can see)

### 3.9 Testing
- [ ] 3.9.1 Manual test: Create reservation via UI
- [ ] 3.9.2 Manual test: Search and filter reservations
- [ ] 3.9.3 Manual test: Confirm reservation changes status
- [ ] 3.9.4 Manual test: Seat customer updates table and status
- [ ] 3.9.5 Manual test: Mark no-show releases table
- [ ] 3.9.6 Manual test: Cancel reservation with reason

---

## 3. Frontend: Kitchen Operations Module

### 4.1 Module Structure Setup
- [x] 4.1.1 Create `app/client/src/modules/kitchen/` directory
- [x] 4.1.2 Create subdirectories: components/, views/, services/, hooks/, types/, utils/
- [x] 4.1.3 Create barrel export index.ts
- [x] 4.1.4 Create README.md documenting module structure

### 4.2 API Service Layer
- [x] 4.2.1 Create `services/kitchen.service.ts` using `@/lib/axios`
- [x] 4.2.2 Implement getKitchenOrders(statusFilter)
- [x] 4.2.3 Implement startOrder(id)
- [x] 4.2.4 Implement markReady(id)
- [x] 4.2.5 Implement markCompleted(id)
- [x] 4.2.6 Implement cancelOrder(id)
- [x] 4.2.7 Export via `services/index.ts`

### 4.3 WebSocket Hook
- [x] 4.3.1 Create `hooks/useKitchenSocket.ts`
- [x] 4.3.2 Import socket.io-client (already in package.json)
- [x] 4.3.3 Connect to Socket.io namespace '/kitchen' using NEXT_PUBLIC_SOCKET_URL env var
- [x] 4.3.4 Listen for 'order:new', 'order:update', 'order:cancelled' events
- [x] 4.3.5 Update local state (consider Zustand store in `@/stores/` if needed)
- [x] 4.3.6 Play notification sound on 'order:new'
- [x] 4.3.7 Cleanup connection on unmount
- [x] 4.3.8 Export via `hooks/index.ts`

### 4.4 TypeScript Types
- [x] 4.4.1 Create `types/index.ts` (barrel export)
- [x] 4.4.2 Define KitchenOrder interface
- [x] 4.4.3 Define KitchenOrderStatus enum
- [x] 4.4.4 Define OrderItem type

### 4.5 Custom Hooks
- [x] 4.5.1 Create `hooks/useKitchenOrders.ts` (fetch and subscribe to updates)
- [x] 4.5.2 Combine API fetch + WebSocket updates
- [x] 4.5.3 Filter orders by status (pending, preparing, ready)
- [x] 4.5.4 Export via `hooks/index.ts`

### 4.6 UI Components
- [x] 4.6.1 Create `components/KitchenOrderCard.tsx` (display single order)
- [x] 4.6.2 Show order number, table, items, special requests
- [x] 4.6.3 Show elapsed time since createdAt (live counter)
- [x] 4.6.4 Show action buttons: Start, Done, based on status
- [x] 4.6.5 Create `components/OrderStatusBadge.tsx` (color-coded status using shadcn/ui)
- [x] 4.6.6 Create `components/KitchenOrderList.tsx` (grouped by status)
- [x] 4.6.7 Export via `components/index.ts`

### 4.7 Views
- [x] 4.7.1 Create `views/KitchenDashboardView.tsx`
- [x] 4.7.2 Display three sections: Pending, Preparing, Ready
- [x] 4.7.3 Each section shows count and list of orders
- [x] 4.7.4 Auto-refresh via WebSocket (no manual refresh needed)
- [x] 4.7.5 Export via `views/index.ts`

### 4.7 Views
- [x] 4.7.1 Create `views/KitchenDashboardView.tsx`
- [x] 4.7.2 Display three sections: Pending, Preparing, Ready
- [x] 4.7.3 Each section shows count and list of orders
- [x] 4.7.4 Auto-refresh via WebSocket (no manual refresh needed)
- [x] 4.7.5 Export via `views/index.ts`

### 4.8 Routing
- [x] 4.8.1 Create `app/client/src/app/(dashboard)/kitchen/page.tsx` → KitchenDashboardView
- [x] 4.8.2 Add sidebar navigation link to Kitchen in layout
- [x] 4.8.3 Restrict visibility to chef role only (role-based UI rendering)
- [x] 4.8.4 Add kitchen icon (ChefHat or similar from lucide-react)

### 4.9 Notification Sound
- [x] 4.9.1 Add notification.mp3 to public/sounds/
- [x] 4.9.2 Play sound when 'order:new' event received
- [ ] 4.9.3 Add mute toggle in kitchen UI

### 4.10 Testing
- [ ] 4.10.1 Manual test: Create order from waiter side → appears in kitchen pending
- [ ] 4.10.2 Manual test: Chef clicks start → moves to preparing section
- [ ] 4.10.3 Manual test: Chef clicks done → moves to ready section
- [ ] 4.10.4 Manual test: Waiter picks up → order removed from kitchen
- [ ] 4.10.5 Manual test: WebSocket sync across multiple kitchen screens
- [ ] 4.10.6 Manual test: Notification sound plays on new order

---

## 4. Frontend: Billing & Payment Module

### 5.1 Module Structure Setup
- [x] 5.1.1 Create `app/client/src/modules/billing/` directory
- [x] 5.1.2 Create subdirectories: components/, views/, dialogs/single/, services/, hooks/, types/, utils/
- [x] 5.1.3 Create barrel export index.ts
- [x] 5.1.4 Create README.md documenting module structure

### 5.2 API Service Layer
- [x] 5.2.1 Create `services/billing.service.ts` using `@/lib/axios`
- [x] 5.2.2 Implement createBill(orderId)
- [x] 5.2.3 Implement getBills(filters)
- [x] 5.2.4 Implement getBillById(id)
- [x] 5.2.5 Implement applyDiscount(billId, discount)
- [x] 5.2.6 Implement processPayment(billId, payment)
- [x] 5.2.7 Implement voidBill(billId, reason) (admin only)
- [x] 5.2.8 Export via `services/index.ts`

### 5.3 TypeScript Types
- [x] 5.3.1 Create `types/index.ts` (barrel export)
- [x] 5.3.2 Define Bill, BillItem, Payment interfaces
- [x] 5.3.3 Define PaymentMethod, PaymentStatus enums
- [x] 5.3.4 Define CreateBillDto, ApplyDiscountDto, ProcessPaymentDto

### 5.4 Custom Hooks
- [x] 5.4.1 Create `hooks/useBills.ts` (fetch list with filters)
- [x] 5.4.2 Create `hooks/useBillDetails.ts` (fetch single bill)
- [x] 5.4.3 Create `hooks/useCreateBill.ts` (mutation)
- [x] 5.4.4 Create `hooks/useProcessPayment.ts` (mutation)
- [x] 5.4.5 Export via `hooks/index.ts`

### 5.5 UI Components
- [x] 5.5.1 Create `components/BillSummary.tsx` (display bill details)
- [x] 5.5.2 Show itemized list, subtotal, tax, service, discount, total
- [x] 5.5.3 Format currency as VND with thousand separators
- [x] 5.5.4 Create `components/PaymentMethodPicker.tsx` (radio buttons: cash, card, momo, bank)
- [x] 5.5.5 Create `components/BillStatusBadge.tsx` using shadcn/ui Badge
- [x] 5.5.6 Export via `components/index.ts`

### 5.6 Dialogs
- [x] 5.6.1 Create `dialogs/single/` directory
- [x] 5.6.2 Create `dialogs/single/CreateBillDialog.tsx` using `@/components/ui/dialog`
- [x] 5.6.3 Show order summary, confirm create bill
- [x] 5.6.4 Create `dialogs/single/ApplyDiscountDialog.tsx`
- [x] 5.6.5 Input percentage or fixed amount, reason
- [x] 5.6.6 Show manager approval prompt if discount > 10%
- [x] 5.6.7 Create `dialogs/single/ProcessPaymentDialog.tsx`
- [x] 5.6.8 Select payment method, enter amount (pre-filled with total)
- [x] 5.6.9 For cash: calculate change if receivedAmount > totalAmount
- [x] 5.6.10 For card: input last 4 digits, transaction ID
- [x] 5.6.11 Confirm payment, show toast success message
- [x] 5.6.12 Create `dialogs/single/VoidBillDialog.tsx` (admin only, reason input)
- [x] 5.6.13 Export via `dialogs/single/index.ts`

### 5.7 Views
- [x] 5.7.1 Create `views/BillingListView.tsx`
- [x] 5.7.2 Display bills with filters (status, date, method)
- [x] 5.7.3 Search by bill number or table
- [x] 5.7.4 Show "Create Bill from Order" flow
- [x] 5.7.5 Create `views/BillDetailsView.tsx`
- [x] 5.7.6 Display full bill with payment history
- [x] 5.7.7 Show "Apply Discount", "Pay", "Void" buttons (role-based)
- [x] 5.7.8 Export via `views/index.ts`

### 5.8 Print Bill Functionality
- [ ] 5.8.1 Create `utils/printBill.ts` helper function
- [ ] 5.8.2 Generate thermal printer HTML format (58mm or 80mm)
- [ ] 5.8.3 Include restaurant header, itemized list, totals, footer
- [ ] 5.8.4 Trigger browser print dialog or send to network printer (if configured)

### 5.9 Routing
- [x] 5.9.1 Create `app/client/src/app/(dashboard)/billing/page.tsx` → BillingListView
- [x] 5.9.2 Create `app/client/src/app/(dashboard)/billing/[id]/page.tsx` → BillDetailsView
- [x] 5.9.3 Add sidebar navigation link to Billing in layout
- [x] 5.9.4 Restrict visibility to cashier, manager, admin roles
- [x] 5.9.5 Add billing icon (Receipt or similar from lucide-react)

### 5.10 Testing
- [ ] 5.10.1 Manual test: Create bill from completed order
- [ ] 5.10.2 Manual test: Verify calculations (subtotal, tax, service, total)
- [ ] 5.10.3 Manual test: Apply 10% discount, verify total recalculated
- [ ] 5.10.4 Manual test: Process cash payment, verify change calculated
- [ ] 5.10.5 Manual test: Process card payment, verify Payment record
- [ ] 5.10.6 Manual test: Attempt payment with wrong amount (should fail)
- [ ] 5.10.7 Manual test: Admin void bill, verify logged and status updated
- [ ] 5.10.8 Manual test: Non-admin cannot access void button
- [ ] 5.10.9 Manual test: Print bill preview looks correct

---

## 5. Integration & End-to-End Testing

### 7.1 Full Workflow Testing
- [ ] 7.1.1 Test Reservation → Order → Kitchen → Bill → Payment flow
- [ ] 7.1.2 Customer calls, staff creates reservation with table
- [ ] 7.1.3 Customer arrives, staff seats them (reservation → seated)
- [ ] 7.1.4 Waiter creates order, sends to kitchen
- [ ] 7.1.5 Chef receives order on kitchen screen, starts preparing
- [ ] 7.1.6 Chef marks ready, waiter sees notification
- [ ] 7.1.7 Waiter serves food, marks order as served
- [ ] 7.1.8 Customer requests bill, waiter creates bill
- [ ] 7.1.9 Waiter applies discount (if any)
- [ ] 7.1.10 Customer pays (cash/card), waiter processes payment
- [ ] 7.1.11 Bill marked paid, order completed, table available

### 7.2 WebSocket Synchronization
- [ ] 7.2.1 Test multiple kitchen screens stay in sync
- [ ] 7.2.2 Test order status changes broadcast immediately
- [ ] 7.2.3 Test connection loss and reconnection handling

### 7.3 Edge Cases
- [ ] 7.3.1 Test double-booking prevention (two staff book same table simultaneously)
- [ ] 7.3.2 Test simultaneous chef claiming same order (only one succeeds)
- [ ] 7.3.3 Test bill void by admin after payment (refund scenario)
- [ ] 7.3.4 Test canceling reservation with deposit (manual refund note)
- [ ] 7.3.5 Test marking no-show releases table for other reservations

### 7.4 Performance
- [ ] 7.4.1 Test with 50+ reservations in list (pagination/loading)
- [ ] 7.4.2 Test with 20+ kitchen orders displayed (smooth UI)
- [ ] 7.4.3 Test bill creation with 30+ items (calculation speed)

---

## 6. Documentation & Demo Preparation

### 8.1 Update README
- [ ] 8.1.1 Add Reservation Management section with feature list
- [ ] 8.1.2 Add Kitchen Operations section
- [ ] 8.1.3 Add Billing & Payment section
- [ ] 8.1.4 Document simplified vs. full-featured approach

### 8.2 API Documentation
- [ ] 8.2.1 Update Swagger docs for reservation endpoints
- [ ] 8.2.2 Update Swagger docs for kitchen endpoints
- [ ] 8.2.3 Update Swagger docs for billing/payment endpoints
- [ ] 8.2.4 Include example requests/responses

### 8.3 Database Seeding
- [ ] 8.3.1 Create seed script for sample reservations in `app/server/prisma/seeds/`
- [ ] 8.3.2 Create seed script for sample kitchen orders
- [ ] 8.3.3 Create seed script for sample bills
- [ ] 8.3.4 Ensure demo data covers all statuses and scenarios

### 8.4 Demo Script
- [ ] 8.4.1 Write step-by-step demo flow document in docs/
- [ ] 8.4.2 Prepare talking points for each feature
- [ ] 8.4.3 Highlight simplifications and design decisions
- [ ] 8.4.4 Practice demo run-through (5-10 minutes)
- [ ] 8.4.5 Create demo video or screenshots for presentation

---

## 7. Code Quality & Best Practices

### 9.1 Code Review
- [ ] 9.1.1 Review all backend code for consistency
- [ ] 9.1.2 Review all frontend code for patterns
- [ ] 9.1.3 Check error handling is comprehensive
- [ ] 9.1.4 Ensure DTOs use class-validator decorators
- [ ] 9.1.5 Verify all modules follow established patterns

### 9.2 Logging
- [ ] 9.2.1 Check existing Winston configuration in backend
- [ ] 9.2.2 Ensure Winston logs all critical actions (create, update, delete, payment)
- [ ] 9.2.3 Log level appropriate (info for normal, warn for issues, error for failures)
- [ ] 9.2.4 Include userId, timestamps, relevant IDs in logs
- [ ] 9.2.5 Logs saved to `app/server/logs/` directory

### 9.3 Security
- [ ] 9.3.1 Verify RBAC guards from `src/common/guards/` applied to all sensitive endpoints
- [ ] 9.3.2 Use class-validator decorators in all DTOs
- [ ] 9.3.3 Sanitize user inputs (customer names, special requests, notes)
- [ ] 9.3.4 Ensure payment details not logged in plain text (card numbers masked)
- [ ] 9.3.5 Check JWT authentication via existing JwtAuthGuard

### 9.4 Performance
- [ ] 9.4.1 Add database indexes on frequently queried fields (reservationDate, status, etc.)
- [ ] 9.4.2 Optimize Prisma queries (avoid N+1, use includes appropriately)
- [ ] 9.4.3 Test WebSocket performance with multiple clients

---

## 8. Final Validation

### 10.1 Spec Compliance
- [ ] 10.1.1 Walk through each requirement in reservation-management spec
- [ ] 10.1.2 Confirm every scenario is implemented and tested
- [ ] 10.1.3 Walk through kitchen-operations spec scenarios
- [ ] 10.1.4 Walk through billing-payment spec scenarios

### 10.2 Deployment Readiness
- [ ] 10.2.1 Verify Docker Compose setup includes all services
- [ ] 10.2.2 Test clean database migration and seeding
- [ ] 10.2.3 Verify environment variables documented
- [ ] 10.2.4 Confirm no critical bugs in happy-path flows

### 10.3 Academic Board Preparation
- [ ] 10.3.1 Prepare slides highlighting simplified design decisions
- [ ] 10.3.2 Explain why manual processes chosen over automation
- [ ] 10.3.3 Highlight database scalability (unused fields for future)
- [ ] 10.3.4 Document time saved by simplifications vs. full implementation

---

## Completion Criteria

All tasks marked `[x]` before considering this change complete. Every requirement in the spec must have corresponding implementation and successful manual test. Demo runs smoothly with prepared data.


