# Implementation Tasks

## 1. Database Schema & Migrations

- [ ] 1.1 Create `orders` table with fields: id, orderNumber, tableId, staffId, customerName, customerPhone, headCount, notes, status (enum), totalAmount, discountAmount, taxAmount, finalAmount, timestamps
- [ ] 1.2 Create `order_items` table with fields: id, orderId, menuItemId, quantity, unitPrice, totalPrice, specialRequest, status (enum), timestamps
- [ ] 1.3 Create `kitchen_orders` table with fields: id, orderId, status (enum), priority (enum), chefId, stationId, prepTimeEstimated, prepTimeActual, startedAt, completedAt, timestamps
- [ ] 1.4 Create `kitchen_stations` table (optional): id, name, type (GRILL, FRY, STEAM, DESSERT), isActive
- [ ] 1.5 Define enums: OrderStatus, OrderItemStatus, KitchenOrderStatus, OrderPriority
- [ ] 1.6 Run Prisma migrations and verify schema in database
- [ ] 1.7 Add indexes on frequently queried fields (status, tableId, staffId, createdAt)
- [ ] 1.8 Create seed data for testing (sample orders, kitchen stations)

## 2. Backend - Order Management API

### 2.1 Order Routes & Controllers
- [ ] 2.1.1 POST `/api/v1/orders` - Create new order
- [ ] 2.1.2 GET `/api/v1/orders` - List orders with filters (status, table, waiter, date range)
- [ ] 2.1.3 GET `/api/v1/orders/:id` - Get order details with items
- [ ] 2.1.4 PATCH `/api/v1/orders/:id` - Update order (add/remove items, change info)
- [ ] 2.1.5 PATCH `/api/v1/orders/:id/status` - Update order status
- [ ] 2.1.6 DELETE `/api/v1/orders/:id` - Cancel order (soft delete)
- [ ] 2.1.7 POST `/api/v1/orders/:id/items` - Add items to existing order
- [ ] 2.1.8 DELETE `/api/v1/orders/:id/items/:itemId` - Remove/cancel item from order

### 2.2 Order Business Logic
- [ ] 2.2.1 Validation: Ensure table exists, menu items exist and available
- [ ] 2.2.2 Calculate totals: item prices, discount, tax, final amount
- [ ] 2.2.3 Generate unique order number (e.g., #001, #002)
- [ ] 2.2.4 Status transitions: PENDING → CONFIRMED → PREPARING → READY → SERVING → COMPLETED
- [ ] 2.2.5 Cancel logic: Check if can cancel based on status, notify kitchen if needed
- [ ] 2.2.6 Permission checks: Waiters can only edit own orders (unless admin/manager)

### 2.3 Order Reports API
- [ ] 2.3.1 GET `/api/v1/orders/reports/by-table` - Sales by table
- [ ] 2.3.2 GET `/api/v1/orders/reports/popular-items` - Top selling items
- [ ] 2.3.3 GET `/api/v1/orders/reports/by-waiter` - Waiter performance
- [ ] 2.3.4 GET `/api/v1/orders/reports/customer-history` - Customer order history by phone

## 3. Backend - Kitchen Management API

### 3.1 Kitchen Routes & Controllers
- [ ] 3.1.1 GET `/api/v1/kitchen/orders` - List kitchen orders with filters (status, priority, chef)
- [ ] 3.1.2 GET `/api/v1/kitchen/orders/:id` - Get kitchen order details
- [ ] 3.1.3 PATCH `/api/v1/kitchen/orders/:id/start` - Chef starts preparing order
- [ ] 3.1.4 PATCH `/api/v1/kitchen/orders/:id/items/:itemId/status` - Update item cooking status
- [ ] 3.1.5 PATCH `/api/v1/kitchen/orders/:id/complete` - Mark order ready
- [ ] 3.1.6 POST `/api/v1/kitchen/orders/:id/cancel` - Kitchen cancels order (with reason)
- [ ] 3.1.7 PATCH `/api/v1/kitchen/orders/:id/assign` - Assign order to chef/station

### 3.2 Kitchen Business Logic
- [ ] 3.2.1 Auto-create kitchen_order when order status changes to CONFIRMED
- [ ] 3.2.2 Calculate estimated prep time based on menu item prep times
- [ ] 3.2.3 Track actual prep time (startedAt → completedAt)
- [ ] 3.2.4 Priority sorting: VIP > Express > Normal, then by createdAt (oldest first)
- [ ] 3.2.5 Alert detection: Orders waiting >20 minutes
- [ ] 3.2.6 Status sync: Kitchen status changes update Order status

### 3.3 Kitchen Reports API
- [ ] 3.3.1 GET `/api/v1/kitchen/reports/performance` - Overall kitchen metrics (completion rate, avg prep time)
- [ ] 3.3.2 GET `/api/v1/kitchen/reports/by-chef` - Chef performance (orders completed, avg time, overdue count)
- [ ] 3.3.3 GET `/api/v1/kitchen/reports/by-item` - Item prep time analysis
- [ ] 3.3.4 GET `/api/v1/kitchen/stations` - List stations and current workload

## 4. Backend - WebSocket Integration

### 4.1 WebSocket Events - Order to Kitchen
- [ ] 4.1.1 Event: `order:created` - Emitted when waiter creates order
- [ ] 4.1.2 Event: `order:confirmed` - Emitted when order sent to kitchen
- [ ] 4.1.3 Event: `order:item_added` - Emitted when items added to active order
- [ ] 4.1.4 Event: `order:cancel_request` - Emitted when waiter requests item/order cancellation

### 4.2 WebSocket Events - Kitchen to Order
- [ ] 4.2.1 Event: `kitchen:status_changed` - Emitted when kitchen updates order status
- [ ] 4.2.2 Event: `kitchen:item_ready` - Emitted when specific item is ready
- [ ] 4.2.3 Event: `kitchen:order_ready` - Emitted when entire order is ready
- [ ] 4.2.4 Event: `kitchen:cancel_accepted` - Emitted when kitchen accepts cancellation
- [ ] 4.2.5 Event: `kitchen:cancel_rejected` - Emitted when kitchen rejects cancellation

### 4.3 WebSocket Rooms & Broadcasting
- [ ] 4.3.1 Create room: `kitchen` - All kitchen staff join this room
- [ ] 4.3.2 Create room: `waiters` - All waiters join this room
- [ ] 4.3.3 Create room: `order:{orderId}` - Per-order room for targeted updates
- [ ] 4.3.4 Implement broadcasting logic for each event type
- [ ] 4.3.5 Add error handling and reconnection logic

## 5. Frontend - Order Management UI

### 5.1 Order List Page (`/orders`)
- [ ] 5.1.1 Create order list component with table/grid view toggle
- [ ] 5.1.2 Implement search bar (by order number, customer name, phone)
- [ ] 5.1.3 Add filter dropdowns (status, table, waiter, date range)
- [ ] 5.1.4 Display statistics cards (pending, preparing, ready, completed counts)
- [ ] 5.1.5 Add sort options (date, total, status)
- [ ] 5.1.6 Implement pagination (20 orders per page)
- [ ] 5.1.7 Add action buttons per order (View, Edit, Cancel)
- [ ] 5.1.8 Real-time updates: Listen to order events and update list

### 5.2 Create Order Form (`/orders/new`)
- [ ] 5.2.1 Step 1: Table selection UI (grid of available tables)
- [ ] 5.2.2 Step 2: Menu browsing with category tabs
- [ ] 5.2.3 Step 3: Shopping cart with item quantities and special requests
- [ ] 5.2.4 Step 4: Customer info form (name, phone, head count, notes)
- [ ] 5.2.5 Add validation using React Hook Form + Zod
- [ ] 5.2.6 Calculate totals dynamically (items, discount, tax)
- [ ] 5.2.7 Submit button: Create order and send to kitchen
- [ ] 5.2.8 Success: Redirect to order detail page
- [ ] 5.2.9 Error handling: Display validation errors

### 5.3 Order Detail Page (`/orders/:id`)
- [ ] 5.3.1 Display order header (number, table, status, timestamps)
- [ ] 5.3.2 Show customer information
- [ ] 5.3.3 List order items with quantities, prices, special requests
- [ ] 5.3.4 Display status timeline (created → confirmed → preparing → ready → serving → completed)
- [ ] 5.3.5 Add action buttons (Edit, Add Items, Send to Kitchen, Cancel)
- [ ] 5.3.6 Show total calculations breakdown
- [ ] 5.3.7 Real-time updates: Status changes, item readiness
- [ ] 5.3.8 Edit mode: Allow adding/removing items if status allows

### 5.4 Order Components
- [ ] 5.4.1 OrderCard component (summary view for list)
- [ ] 5.4.2 OrderStatusBadge component (color-coded status indicator)
- [ ] 5.4.3 OrderItemList component (table of items)
- [ ] 5.4.4 MenuItemSelector component (browse and add items)
- [ ] 5.4.5 TableSelector component (visual table grid)
- [ ] 5.4.6 OrderTimeline component (status progression)

### 5.5 Order Hooks & State
- [ ] 5.5.1 `useOrders` hook - Fetch and manage order list
- [ ] 5.5.2 `useOrder` hook - Fetch single order details
- [ ] 5.5.3 `useCreateOrder` hook - Create order mutation
- [ ] 5.5.4 `useUpdateOrder` hook - Update order mutation
- [ ] 5.5.5 `useCancelOrder` hook - Cancel order mutation
- [ ] 5.5.6 Integrate with Zustand store for global order state (optional)

## 6. Frontend - Kitchen Management UI

### 6.1 Kitchen Display System Page (`/kitchen`)
- [ ] 6.1.1 Create KDS layout: Header + Statistics + Tab Navigation + Order Grid
- [ ] 6.1.2 Header: Title, search, filters (priority, item type, chef), refresh button
- [ ] 6.1.3 Statistics cards: Orders waiting, in progress, ready (with avg times)
- [ ] 6.1.4 Tab navigation: Waiting (PENDING/CONFIRMED), Cooking (PREPARING), Ready (READY)
- [ ] 6.1.5 Order grid: Display order cards in columns by status
- [ ] 6.1.6 Auto-refresh every 5 seconds + manual refresh button
- [ ] 6.1.7 Responsive: Desktop (3 columns), Tablet (2 columns), Mobile (1 column)
- [ ] 6.1.8 Full-screen mode toggle for dedicated kitchen screen

### 6.2 Kitchen Order Card Component
- [ ] 6.2.1 Card header: Order number, table, priority badge, wait time
- [ ] 6.2.2 Special requests section (highlighted if present)
- [ ] 6.2.3 Item list with quantities and per-item status checkboxes
- [ ] 6.2.4 Item notes (special requests per item)
- [ ] 6.2.5 Assigned chef display
- [ ] 6.2.6 Action buttons: Start Cooking, Mark Ready, Cancel
- [ ] 6.2.7 Timer display (elapsed time, color-coded: green <10min, yellow 10-20min, red >20min)
- [ ] 6.2.8 Progress bar for overall completion

### 6.3 Kitchen Dialogs & Modals
- [ ] 6.3.1 Start Cooking dialog: Select chef, confirm start
- [ ] 6.3.2 Mark Ready dialog: Confirm all items ready, show actual prep time
- [ ] 6.3.3 Cancel dialog: Select reason (out of ingredients, dish failed, etc.), confirm
- [ ] 6.3.4 Chef assignment dialog: List available chefs with current workload
- [ ] 6.3.5 Cancel request from waiter: Accept/Reject with reason

### 6.4 Kitchen Components
- [ ] 6.4.1 KitchenOrderCard component (full order display)
- [ ] 6.4.2 KitchenHeader component (stats and filters)
- [ ] 6.4.3 OrderTimer component (real-time elapsed time)
- [ ] 6.4.4 PriorityBadge component (VIP 👑, Express 🔴, Normal ⚪)
- [ ] 6.4.5 ItemStatusCheckbox component (toggle item ready state)
- [ ] 6.4.6 ChefAssignment component (dropdown with chef list)

### 6.5 Kitchen Hooks & State
- [ ] 6.5.1 `useKitchenOrders` hook - Fetch kitchen orders with filters
- [ ] 6.5.2 `useStartCooking` hook - Start preparing order
- [ ] 6.5.3 `useUpdateItemStatus` hook - Update individual item status
- [ ] 6.5.4 `useCompleteOrder` hook - Mark order ready
- [ ] 6.5.5 `useCancelKitchenOrder` hook - Cancel from kitchen
- [ ] 6.5.6 `useAssignChef` hook - Assign order to chef
- [ ] 6.5.7 Integrate with Zustand for kitchen state management

## 7. Frontend - WebSocket Integration

### 7.1 Socket Context Setup
- [ ] 7.1.1 Extend SocketContext to handle order and kitchen events
- [ ] 7.1.2 Connect to socket server on app mount (for authenticated users)
- [ ] 7.1.3 Join appropriate rooms based on user role (waiters → `waiters`, chefs → `kitchen`)
- [ ] 7.1.4 Implement reconnection logic with exponential backoff
- [ ] 7.1.5 Add connection status indicator (connected, disconnected, reconnecting)

### 7.2 Event Listeners - Orders
- [ ] 7.2.1 Listen: `order:created` - Update order list, show notification
- [ ] 7.2.2 Listen: `order:status_changed` - Update order status in UI
- [ ] 7.2.3 Listen: `kitchen:order_ready` - Alert waiter with sound + popup
- [ ] 7.2.4 Listen: `kitchen:item_ready` - Update item status indicator
- [ ] 7.2.5 Listen: `kitchen:cancel_accepted` - Update order, show confirmation
- [ ] 7.2.6 Listen: `kitchen:cancel_rejected` - Show rejection message with reason

### 7.3 Event Listeners - Kitchen
- [ ] 7.3.1 Listen: `order:confirmed` - Add order to KDS, play notification sound
- [ ] 7.3.2 Listen: `order:item_added` - Update order card with new items
- [ ] 7.3.3 Listen: `order:cancel_request` - Show cancel request dialog
- [ ] 7.3.4 Listen: `kitchen:status_changed` - Update order card status
- [ ] 7.3.5 Auto-remove completed orders from KDS after 30 seconds

### 7.4 Notifications System
- [ ] 7.4.1 Browser notification permission request
- [ ] 7.4.2 Audio alerts: New order (kitchen), Order ready (waiter)
- [ ] 7.4.3 Visual toast notifications for events
- [ ] 7.4.4 Settings: Mute/unmute audio, adjust volume
- [ ] 7.4.5 Desktop notification for urgent orders (VIP, overdue)

## 8. Testing & Validation

### 8.1 Backend Testing
- [ ] 8.1.1 Manual API testing with Postman/Swagger for all endpoints
- [ ] 8.1.2 Test order creation with valid and invalid data
- [ ] 8.1.3 Test order status transitions and validation rules
- [ ] 8.1.4 Test kitchen order workflow (start, update items, complete)
- [ ] 8.1.5 Test cancellation workflows (from waiter and kitchen)
- [ ] 8.1.6 Test WebSocket events emit correctly
- [ ] 8.1.7 Verify database constraints and relationships

### 8.2 Frontend Testing
- [ ] 8.2.1 Manual testing of order creation flow
- [ ] 8.2.2 Test order list filtering and searching
- [ ] 8.2.3 Test order detail view and editing
- [ ] 8.2.4 Test KDS display and order card interactions
- [ ] 8.2.5 Test real-time updates via WebSocket
- [ ] 8.2.6 Test notifications (audio + visual)
- [ ] 8.2.7 Test responsive layouts on different screen sizes

### 8.3 Integration Testing
- [ ] 8.3.1 End-to-end flow: Waiter creates order → Kitchen receives → Chef cooks → Waiter notified
- [ ] 8.3.2 Test with multiple simultaneous orders
- [ ] 8.3.3 Test priority ordering (VIP orders appear first)
- [ ] 8.3.4 Test cancel request flow from waiter to kitchen
- [ ] 8.3.5 Test WebSocket reconnection after network interruption
- [ ] 8.3.6 Load testing: 50+ concurrent orders

## 9. Documentation & Polish

- [ ] 9.1 Update API documentation (Swagger) for all new endpoints
- [ ] 9.2 Add code comments for complex business logic
- [ ] 9.3 Create user guide for waiters (how to create orders)
- [ ] 9.4 Create user guide for kitchen staff (how to use KDS)
- [ ] 9.5 Document WebSocket events and payloads
- [ ] 9.6 Add README sections for order and kitchen modules
- [ ] 9.7 Create demo video showing complete workflow
- [ ] 9.8 Add keyboard shortcuts documentation (if implemented)

## 10. Deployment Preparation

- [ ] 10.1 Run database migrations on production database
- [ ] 10.2 Verify environment variables set correctly
- [ ] 10.3 Test WebSocket connection in production environment
- [ ] 10.4 Verify Cloudflare R2 integration works (if images used)
- [ ] 10.5 Check browser compatibility (Chrome, Firefox, Safari, Edge)
- [ ] 10.6 Set up monitoring/logging for order and kitchen events
- [ ] 10.7 Create backup strategy for orders data
- [ ] 10.8 Plan rollback procedure if issues arise

## Dependencies Between Tasks

**Critical Path:**
1. Database schema (1.x) → Backend APIs (2.x, 3.x)
2. Backend APIs → WebSocket integration (4.x)
3. Backend + WebSocket → Frontend UI (5.x, 6.x, 7.x)
4. All implementation → Testing (8.x)

**Parallel Work:**
- Order Management (2.x + 5.x) and Kitchen Management (3.x + 6.x) can be developed in parallel
- Frontend components (5.4, 6.4) can be built while APIs are being developed
- Documentation (9.x) can be written alongside implementation

**Blockers:**
- Task 5.x requires 2.x to be completed (Order UI needs Order API)
- Task 6.x requires 3.x to be completed (Kitchen UI needs Kitchen API)
- Task 7.x requires 4.x to be completed (Frontend WebSocket needs backend events)
- Task 8.3 requires all 1.x-7.x to be completed (Integration testing needs full system)
