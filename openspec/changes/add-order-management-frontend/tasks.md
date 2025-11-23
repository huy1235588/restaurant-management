# Implementation Tasks - Order Management Frontend

## 1. Module Setup & Foundation
- [x] 1.1 Create module directory structure (`app/client/src/modules/order/`)
- [x] 1.2 Create barrel exports (`index.ts` files in each subdirectory)
- [x] 1.3 Define TypeScript types and interfaces (`types/order.types.ts`)
- [x] 1.4 Create API service layer (`services/order.service.ts`)
- [x] 1.5 Add module README documentation
- [x] 1.6 Create frontend routes:
  - [x] `/orders` (list page)
  - [x] `/orders/new` (create page)
  - [x] `/orders/[id]` (detail page)
  - [x] `/orders/[id]/edit` (edit page)

## 2. API Service Layer
- [x] 2.1 Implement `orderApi.getAll()` - Fetch orders with filters
- [x] 2.2 Implement `orderApi.getById()` - Fetch single order
- [x] 2.3 Implement `orderApi.create()` - Create new order
- [x] 2.4 Implement `orderApi.addItems()` - Add items to order
- [x] 2.5 Implement `orderApi.cancelItem()` - Cancel order item
- [x] 2.6 Implement `orderApi.cancelOrder()` - Cancel entire order
- [x] 2.7 Implement `orderApi.updateStatus()` - Update order status
- [x] 2.8 Implement `orderApi.markItemServed()` - Mark item as served
- [x] 2.9 Add error handling and TypeScript types for all API calls

## 3. React Hooks
- [x] 3.1 Create `useOrders()` hook - Query orders list with filters
- [x] 3.2 Create `useOrder(id)` hook - Query single order by ID
- [x] 3.3 Create `useCreateOrder()` hook - Mutation for creating order
- [x] 3.4 Create `useAddItems()` hook - Mutation for adding items
- [x] 3.5 Create `useCancelItem()` hook - Mutation for cancelling item
- [x] 3.6 Create `useCancelOrder()` hook - Mutation for cancelling order
- [x] 3.7 Create `useMarkItemServed()` hook - Mutation for marking served
- [x] 3.8 Create `useUpdateOrderStatus()` hook - Mutation for status update
- [x] 3.9 Create `useOrderSocket()` hook - WebSocket real-time updates
- [x] 3.10 Configure React Query cache and refetch strategies

## 4. Shared Components
- [x] 4.1 Create `OrderStatusBadge` - Visual status indicator
  - [x] 4.1.1 Status color mapping (pending, confirmed, ready, serving, completed, cancelled)
  - [x] 4.1.2 Responsive design
- [x] 4.2 Create `OrderCard` - Order summary card for list view
  - [x] 4.2.1 Display order number, table, status, total
  - [x] 4.2.2 Show timestamps and waiter info
  - [x] 4.2.3 Add action buttons (view, add items - navigate to edit, cancel)
- [x] 4.3 Create `OrderItemList` - List items in order
  - [x] 4.3.1 Item name, quantity, price, total
  - [x] 4.3.2 Special requests display (highlighted)
  - [x] 4.3.3 Item status badges
  - [x] 4.3.4 Action buttons (cancel item, mark served)
- [x] 4.4 Create `OrderSummaryCard` - Financial summary
  - [x] 4.4.1 Subtotal, service charge, tax, discount
  - [x] 4.4.2 Final total with formatting
- [x] 4.5 Create `OrderTimeline` - Activity history
  - [x] 4.5.1 Status changes with timestamps
  - [x] 4.5.2 Items added/cancelled events
  - [x] 4.5.3 User attribution
- [x] 4.6 Create `TableSelector` - Table selection component
  - [x] 4.6.1 Visual grid layout
  - [x] 4.6.2 Filter by floor, section, status
  - [x] 4.6.3 Show table details on hover/select
- [x] 4.7 Create `MenuItemSelector` - Menu item selection component
  - [x] 4.7.1 Category tabs
  - [x] 4.7.2 Item grid with images
  - [x] 4.7.3 Quantity selector
  - [x] 4.7.4 Add to cart button
  - [x] 4.7.5 Search and filter
- [x] 4.8 Create `ShoppingCart` - Cart sidebar component
  - [x] 4.8.1 List selected items
  - [x] 4.8.2 Edit quantity
  - [x] 4.8.3 Remove item
  - [x] 4.8.4 Show running total
- [x] 4.9 Create `StepIndicator` - Progress stepper component
  - [x] 4.9.1 Show current step
  - [x] 4.9.2 Show completed steps
  - [x] 4.9.3 Click to navigate (if allowed)

## 5. Order List View
- [x] 5.1 Create `OrderListView` component
- [x] 5.2 Implement filters section
  - [x] 5.2.1 Status filter (multi-select)
  - [ ] 5.2.2 Table filter (dropdown) - Not implemented yet
  - [ ] 5.2.3 Staff filter (dropdown) - Not implemented yet
  - [ ] 5.2.4 Date range filter (date picker) - Not implemented yet
  - [x] 5.2.5 Search input (order number, customer name, phone)
- [ ] 5.3 Implement sorting controls - Not implemented yet
  - [ ] 5.3.1 Sort by: time, total amount, status
  - [ ] 5.3.2 Sort order: ascending/descending
- [x] 5.4 Implement pagination
  - [x] 5.4.1 Page navigation buttons
  - [ ] 5.4.2 Items per page selector - Not implemented yet
  - [x] 5.4.3 Total count display
- [x] 5.5 Implement order list rendering
  - [ ] 5.5.1 Grid/list layout toggle - Grid only implemented
  - [x] 5.5.2 Empty state when no orders
  - [x] 5.5.3 Loading skeleton
- [x] 5.6 Add "Create Order" button → Navigate to /orders/new
- [x] 5.7 Implement responsive design (mobile, tablet, desktop)

## 6. Create Order Page (`/orders/new`)
- [x] 6.1 Create `CreateOrderView` component (multi-step form)
- [x] 6.2 Implement Step Indicator (progress stepper)
- [x] 6.3 Implement form state management (React Hook Form + Zod)
- [x] 6.4 Implement Step 1: Table Selection
  - [x] 6.4.1 Use TableSelector component
  - [x] 6.4.2 Filter by floor, section, status
  - [x] 6.4.3 Validate table availability
  - [ ] 6.4.4 Handle "Skip" for takeaway (future) - Not implemented
- [x] 6.5 Implement Step 2: Customer Information
  - [x] 6.5.1 Customer name input (optional)
  - [x] 6.5.2 Phone number input with validation (optional)
  - [x] 6.5.3 Party size input (required, default: 1)
  - [ ] 6.5.4 Link to reservation search - Not implemented
  - [ ] 6.5.5 Auto-fill from reservation - Not implemented
- [x] 6.6 Implement Step 3: Menu Items Selection
  - [x] 6.6.1 Use MenuItemSelector component
  - [x] 6.6.2 Category tabs
  - [x] 6.6.3 Add items to cart with quantity
  - [x] 6.6.4 Special requests per item
  - [x] 6.6.5 Shopping cart sidebar
  - [x] 6.6.6 Running subtotal
  - [x] 6.6.7 Edit/remove items from cart
  - [x] 6.6.8 Validate at least 1 item
- [x] 6.7 Implement Step 4: Review & Confirm
  - [x] 6.7.1 Display table summary
  - [x] 6.7.2 Display customer info
  - [x] 6.7.3 Display all items with special requests
  - [ ] 6.7.4 Order notes input (optional) - Uses specialRequests instead
  - [x] 6.7.5 Price breakdown (subtotal, service, tax, total)
  - [x] 6.7.6 Edit buttons (go back to specific step)
  - [x] 6.7.7 Create Order button (submit)
  - [x] 6.7.8 Cancel button (navigate to /orders)
- [x] 6.8 Implement navigation between steps
  - [x] 6.8.1 Next button (validate current step)
  - [x] 6.8.2 Back button (preserve data)
  - [x] 6.8.3 Step indicator navigation
- [x] 6.9 Implement form state preservation
  - [x] 6.9.1 Save to component state
  - [x] 6.9.2 Optional: localStorage backup
- [ ] 6.10 Implement breadcrumb navigation - Not implemented
- [x] 6.11 Add "unsaved changes" warning before leaving page
- [x] 6.12 Handle form submission
  - [x] 6.12.1 Validate all steps
  - [x] 6.12.2 Submit to API
  - [x] 6.12.3 Show loading state
  - [x] 6.12.4 Handle success (redirect to order detail)
  - [x] 6.12.5 Handle errors (show message, allow retry)
- [x] 6.13 Implement responsive design

## 7. Order Detail View
- [x] 7.1 Create `OrderDetailView` component (rename from 6.1)
- [x] 7.2 Implement order header section (rename from 6.2)
  - [x] 7.2.1 Order number, status badge
  - [x] 7.2.2 Table info, waiter info
  - [x] 7.2.3 Customer info (name, phone, party size)
  - [x] 7.2.4 Timestamps (created, confirmed, completed)
- [x] 7.3 Implement order items section
  - [x] 7.3.1 Use OrderItemList component
  - [x] 7.3.2 Add cancel item action
  - [x] 7.3.3 Add mark served action
- [x] 7.4 Implement order summary section
  - [x] 7.4.1 Use OrderSummaryCard component
  - [x] 7.4.2 Show all financial calculations
- [x] 7.5 Implement action buttons section
  - [x] 7.5.1 "Add Items" button → Navigate to /orders/[id]/edit
  - [x] 7.5.2 "Cancel Order" button → Open CancelOrderDialog
  - [x] 7.5.3 "Print Order" button (future)
  - [x] 7.5.4 "Create Bill" button (link to billing)
- [x] 7.6 Implement order timeline/history
  - [x] 7.6.1 Use OrderTimeline component
  - [x] 7.6.2 Show all events chronologically
- [ ] 7.7 Add breadcrumb navigation - Not implemented
- [x] 7.8 Implement responsive design

## 8. Edit Order Page (`/orders/[id]/edit`)
- [x] 8.1 Create `EditOrderView` component
- [x] 8.2 Implement current order summary header (read-only)
  - [x] 8.2.1 Order number, table, status
  - [x] 8.2.2 Current items list (collapsed/expandable)
  - [x] 8.2.3 Current total
- [x] 8.3 Implement add new items section
  - [x] 8.3.1 Reuse MenuItemSelector component
  - [x] 8.3.2 Category tabs and item grid
  - [x] 8.3.3 Add to cart with quantities
  - [x] 8.3.4 Special requests per item
  - [x] 8.3.5 Shopping cart for new items (separate)
- [x] 8.4 Implement review changes section
  - [x] 8.4.1 Show current items (grayed out, read-only)
  - [x] 8.4.2 Show new items to add (highlighted)
  - [x] 8.4.3 Updated total calculation
  - [x] 8.4.4 Show price difference (+X VND)
- [x] 8.5 Implement action buttons
  - [x] 8.5.1 "Add Items to Order" button (submit)
  - [x] 8.5.2 "Cancel" button (navigate back)
- [ ] 8.6 Add validation - Partial implementation
  - [ ] 8.6.1 Check order status (not completed/cancelled) - Not implemented
  - [ ] 8.6.2 Check if bill exists - Not implemented
  - [ ] 8.6.3 Show warning if kitchen cooking - Not implemented
- [ ] 8.7 Add breadcrumb navigation - Not implemented
- [x] 8.8 Add "unsaved changes" warning
- [x] 8.9 Handle form submission
  - [x] 8.9.1 Validate items
  - [x] 8.9.2 Submit to API
  - [x] 8.9.3 Show loading state
  - [x] 8.9.4 Handle success (redirect to order detail)
  - [x] 8.9.5 Handle errors
- [x] 8.10 Implement responsive design

## 9. Cancel Item Dialog (Confirmation Only)
- [x] 9.1 Create `CancelItemDialog` component
- [x] 9.2 Show item details (name, quantity, price)
- [x] 9.3 Implement reason selection (required)
  - [x] 9.3.1 Predefined reasons (radio buttons)
    - Customer changed mind
    - Item out of stock
    - Wrong order
    - Customer doesn't want to wait
    - Other (with text input)
- [ ] 9.4 Check item status (can't cancel if served) - Not implemented
- [ ] 9.5 Show updated total after cancellation - Not implemented
- [x] 9.6 Confirmation step
- [x] 9.7 Submit cancellation
- [x] 9.8 Show success message
- [x] 9.9 Handle errors

## 10. Cancel Order Dialog (Confirmation Only)
- [x] 10.1 Create `CancelOrderDialog` component
- [x] 10.2 Show order summary (items, total, table)
- [x] 10.3 Implement reason input (required)
  - [x] 10.3.1 Predefined reasons (dropdown)
    - Customer cancelled
    - Wrong order created
    - Customer left without waiting
    - Restaurant issue
    - Other (with text input)
- [x] 10.4 Show warning if items already cooking
- [ ] 10.5 Request manager approval (if needed) - Not implemented
- [ ] 10.6 Show cancellation fee calculation (if applicable) - Not implemented
- [x] 10.7 Confirmation step with double-check
- [x] 10.8 Submit cancellation
- [x] 10.9 Show success message
- [x] 10.10 Redirect to order list or dashboard
- [x] 10.11 Handle errors

## 11. WebSocket Integration
- [x] 11.1 Create WebSocket service/hook (`useOrderSocket`)
- [x] 11.2 Connect to Socket.io server
- [x] 11.3 Listen to order events
  - [x] 11.3.1 `order:created` - Refetch order list
  - [x] 11.3.2 `order:status-changed` - Update specific order
  - [x] 11.3.3 `order:updated` - Refetch order detail
  - [x] 11.3.4 `order:items-added` - Refetch order
  - [x] 11.3.5 `order:item-cancelled` - Refetch order
  - [x] 11.3.6 `order:cancelled` - Refetch order list
  - [x] 11.3.7 `kitchen:order-ready` - Show notification
- [ ] 11.4 Implement event deduplication logic - Not implemented
- [ ] 11.5 Handle WebSocket reconnection - Basic implementation
- [ ] 11.6 Show connection status indicator - Not implemented
- [x] 11.7 Integrate with React Query refetch

## 12. Utilities & Helpers
- [x] 12.1 Create `formatOrderNumber()` - Format order number for display
- [x] 12.2 Create `calculateOrderTotal()` - Calculate totals from items
- [x] 12.3 Create `getStatusColor()` - Get color for status badge
- [x] 12.4 Create `getStatusLabel()` - Get human-readable status label
- [x] 12.5 Create `canCancelOrder()` - Check if order can be cancelled
- [x] 12.6 Create `canAddItems()` - Check if items can be added
- [x] 12.7 Create `formatCurrency()` - Format VND currency
- [x] 12.8 Create `formatDateTime()` - Format timestamps
- [x] 12.9 Create validation schemas (Zod)
  - [x] 12.9.1 CreateOrderSchema
  - [x] 12.9.2 AddItemsSchema
  - [x] 12.9.3 CancelItemSchema
  - [x] 12.9.4 CancelOrderSchema

## 13. Navigation & Routing
- [x] 13.1 Create `/orders` page (Order list)
- [x] 13.2 Create `/orders/new` page (Create order)
- [x] 13.3 Create `/orders/[id]` page (Order detail)
- [x] 13.4 Create `/orders/[id]/edit` page (Edit order / Add items)
- [x] 13.5 Add "Orders" item to sidebar navigation - Already exists
- [x] 13.6 Configure permission-based route access - Already configured
- [ ] 13.7 Add breadcrumb support for all pages - Not implemented
- [ ] 13.8 Test navigation flow between all pages - Needs testing
- [x] 13.9 Implement "unsaved changes" warning for create/edit pages

## 14. Permissions & Access Control
- [ ] 14.1 Verify `orders.read` permission for viewing
- [ ] 14.2 Verify `orders.create` permission for creating
- [ ] 14.3 Verify `orders.update` permission for modifying
- [ ] 14.4 Verify `orders.delete` permission for cancelling
- [ ] 14.5 Hide/disable buttons based on permissions
- [ ] 14.6 Test with different roles (admin, manager, waiter, chef, cashier)

## 15. Responsive Design & UI Polish
- [ ] 15.1 Test on mobile devices (320px - 768px)
- [ ] 15.2 Test on tablets (768px - 1024px)
- [ ] 15.3 Test on desktop (1024px+)
- [ ] 15.4 Optimize table layout for mobile (cards instead of table)
- [ ] 15.5 Add loading skeletons for all async operations
- [ ] 15.6 Add empty states with helpful messages
- [ ] 15.7 Add error states with retry buttons
- [ ] 15.8 Ensure all buttons have proper focus states
- [ ] 15.9 Add keyboard navigation support
- [ ] 15.10 Test accessibility (screen readers, keyboard-only)

## 16. Notifications & Feedback
- [ ] 16.1 Add toast notifications for:
  - [ ] 16.1.1 Order created successfully
  - [ ] 16.1.2 Items added successfully
  - [ ] 16.1.3 Item cancelled
  - [ ] 16.1.4 Order cancelled
  - [ ] 16.1.5 Item marked as served
  - [ ] 16.1.6 New order from kitchen (ready)
- [ ] 16.2 Add sound notifications (optional, user preference)
- [ ] 16.3 Add confirmation dialogs for destructive actions
- [ ] 16.4 Show loading spinners during async operations
- [ ] 16.5 Display error messages clearly

## 17. Integration with Existing Modules
- [ ] 17.1 **Tables Module**: Add "Create Order" action from table detail/list
  - [ ] 17.1.1 Navigate to /orders/new with table pre-selected
  - [ ] 17.1.2 Show active order on table card
  - [ ] 17.1.3 Link to order detail from table
- [ ] 17.2 **Menu Module**: Ensure menu items can be selected for orders
  - [ ] 17.2.1 Reuse MenuItemCard or create simplified version
  - [ ] 17.2.2 Filter by category
  - [ ] 17.2.3 Show availability status
- [ ] 17.3 **Kitchen Module**: No changes needed (already receives orders)
- [ ] 17.4 **Reservations Module**: Link reservation to order
  - [ ] 17.4.1 Show "Create Order" button in reservation detail → Navigate to /orders/new
  - [ ] 17.4.2 Auto-fill customer info from reservation
- [ ] 17.5 **Billing Module** (future): Create bill from order
  - [ ] 17.5.1 Add "Create Bill" button in order detail
  - [ ] 17.5.2 Redirect to bill creation with order data

## 18. Testing & Quality Assurance
- [ ] 18.1 Test order list with various filters
- [ ] 18.2 Test create order flow (happy path)
  - [ ] 18.2.1 All 4 steps work correctly
  - [ ] 18.2.2 Navigation between steps preserves data
  - [ ] 18.2.3 Validation works at each step
  - [ ] 18.2.4 Submit creates order successfully
- [ ] 18.3 Test create order with errors (table occupied, item unavailable)
- [ ] 18.4 Test edit order (add items) flow
  - [ ] 18.4.1 Can add items to existing order
  - [ ] 18.4.2 Cannot edit completed/cancelled orders
  - [ ] 18.4.3 Cannot edit if bill created
- [ ] 18.5 Test cancelling items (with all reasons)
- [ ] 18.6 Test cancelling entire order
- [ ] 18.7 Test marking items as served
- [ ] 18.8 Test WebSocket real-time updates
- [ ] 18.9 Test pagination and sorting
- [ ] 18.10 Test search functionality
- [ ] 18.11 Test permission-based access
- [ ] 18.12 Test on different browsers (Chrome, Firefox, Safari, Edge)
- [ ] 18.13 Test offline behavior (graceful degradation)
- [ ] 18.14 Test with slow network (loading states)
- [ ] 18.15 Verify all error scenarios are handled
- [ ] 18.16 Test "unsaved changes" warnings work correctly
- [ ] 18.17 Test breadcrumb navigation on all pages

## 19. Documentation
- [x] 19.1 Write module README with:
  - [x] 19.1.1 Overview and features
  - [x] 19.1.2 Component documentation
  - [x] 19.1.3 Hook documentation
  - [x] 19.1.4 Usage examples
  - [x] 19.1.5 Integration guide
- [x] 19.2 Add inline code comments for complex logic
- [x] 19.3 Document TypeScript types and interfaces
- [ ] 19.4 Create user guide for waiters/managers - Not created
- [ ] 19.5 Add screenshots to documentation - Not added
- [ ] 19.6 Update main project README - Not updated

## 20. Deployment & Monitoring
- [ ] 20.1 Code review
- [ ] 20.2 Merge to main branch
- [ ] 20.3 Deploy to staging/production
- [ ] 20.4 Monitor for errors in production
- [ ] 20.5 Gather user feedback
- [ ] 20.6 Create tickets for bugs/improvements

---

**Total Tasks**: ~180 tasks
**Estimated Effort**: 3-5 days (depending on complexity and testing rigor)
**Priority**: High (Core Feature)
