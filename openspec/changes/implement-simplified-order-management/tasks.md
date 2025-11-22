# Implementation Tasks: Simplified Order Management

## 1. Database Schema

- [ ] 1.1 Review and update Order model with simplified status enum (pending, confirmed, ready, serving, completed, cancelled)
- [ ] 1.2 Review and update OrderItem model with status enum (pending, ready, served, cancelled)
- [ ] 1.3 Review and update KitchenOrder model with simplified status enum (pending, ready, completed, cancelled)
- [ ] 1.4 Remove or deprecate unused fields related to cancellation fees, approval workflows, detailed time tracking
- [ ] 1.5 Add audit log fields: cancellationReason, cancelledBy, cancelledAt to Order and OrderItem models
- [ ] 1.6 Create database migration script for schema changes
- [ ] 1.7 Run migration on development database
- [ ] 1.8 Verify schema changes with Prisma Studio

## 2. Backend API Development

- [ ] 2.1 Create order management module structure: `app/server/src/features/orders/`
- [ ] 2.2 Implement POST `/api/orders` - create order endpoint
- [ ] 2.3 Implement GET `/api/orders` - list orders with filtering (status, date, table, waiter)
- [ ] 2.4 Implement GET `/api/orders/:id` - get order details endpoint
- [ ] 2.5 Implement PATCH `/api/orders/:id/items` - add items to existing order
- [ ] 2.6 Implement DELETE `/api/orders/:id/items/:itemId` - cancel item endpoint (with reason logging)
- [ ] 2.7 Implement DELETE `/api/orders/:id` - cancel entire order endpoint (with reason logging)
- [ ] 2.8 Implement PATCH `/api/orders/:id/status` - update order status endpoint
- [ ] 2.9 Implement GET `/api/kitchen/queue` - get kitchen queue endpoint (orders with status "confirmed")
- [ ] 2.10 Implement PATCH `/api/kitchen/orders/:id/complete` - mark order as done endpoint
- [ ] 2.11 Implement PATCH `/api/orders/:id/items/:itemId/serve` - mark item as served endpoint
- [ ] 2.12 Implement GET `/api/orders/:id/invoice-preview` - generate invoice preview HTML endpoint
- [ ] 2.13 Implement GET `/api/orders/:id/invoice-pdf` - generate PDF invoice endpoint
- [ ] 2.14 Add input validation with Zod schemas for all endpoints
- [ ] 2.15 Add authorization middleware (role-based: waiter, chef, manager)
- [ ] 2.16 Implement audit logging for all order lifecycle events
- [ ] 2.17 Write unit tests for order service layer
- [ ] 2.18 Write integration tests for order API endpoints

## 3. Backend Real-time WebSocket

- [ ] 3.1 Create WebSocket event types: `order:created`, `order:status-changed`, `kitchen:order-done`
- [ ] 3.2 Implement `order:created` event emission when order is created
- [ ] 3.3 Implement `kitchen:order-done` event emission when chef marks order complete
- [ ] 3.4 Set up WebSocket room per kitchen display for targeted broadcasts
- [ ] 3.5 Test WebSocket events with Socket.io client
- [ ] 3.6 Add error handling and reconnection logic

## 4. Backend Reporting

- [ ] 4.1 Create reports module: `app/server/src/features/reports/`
- [ ] 4.2 Implement GET `/api/reports/revenue/daily` - daily revenue report endpoint
- [ ] 4.3 Implement GET `/api/reports/revenue/monthly` - monthly revenue summary endpoint
- [ ] 4.4 Implement GET `/api/reports/best-sellers` - top selling items report endpoint
- [ ] 4.5 Add query parameters for date range filtering
- [ ] 4.6 Optimize database queries with proper indexes
- [ ] 4.7 Add CSV export functionality for reports
- [ ] 4.8 Write tests for report calculations

## 5. Frontend Module Structure

- [x] 5.1 Create orders module: `app/client/src/modules/orders/`
- [x] 5.2 Set up module directory structure: `components/`, `views/`, `dialogs/`, `services/`, `hooks/`, `types/`, `utils/`
- [x] 5.3 Create TypeScript types for Order, OrderItem, KitchenOrder, OrderStatus enums
- [x] 5.4 Create API service: `modules/orders/services/order.service.ts` with Axios calls
- [x] 5.5 Create custom hooks: `useOrders`, `useOrderDetails`, `useKitchenQueue`
- [x] 5.6 Set up i18n translation keys for orders module in `locales/en.json` and `locales/vi.json`

## 6. Frontend - Waiter Order Management

- [x] 6.1 Create `OrderListView` component - display orders with search/filter
- [x] 6.2 Create `CreateOrderDialog` component - select table, add items, submit order
- [x] 6.3 Create `OrderDetailsView` component - show order details, items, status
- [x] 6.4 Create `AddItemsDialog` component - add items to existing order
- [x] 6.5 Create `CancelItemDialog` component - cancel item with reason input
- [x] 6.6 Create `CancelOrderDialog` component - cancel entire order with reason
- [x] 6.7 Implement order search by order number, table number
- [x] 6.8 Implement order filtering by status, date range, waiter
- [x] 6.9 Create `OrderItemCard` component - display item with quantity, price, special request
- [x] 6.10 Create `OrderStatusBadge` component - color-coded status indicator
- [x] 6.11 Integrate with menu API to fetch available items for order creation
- [x] 6.12 Implement form validation for order creation and item addition
- [x] 6.13 Add loading states and error handling
- [x] 6.14 Test order creation, item addition, and cancellation flows

## 7. Frontend - Kitchen Queue Interface

- [x] 7.1 Create `KitchenQueueView` component - single queue list
- [x] 7.2 Create `KitchenOrderCard` component - display order with items, table, elapsed time
- [x] 7.3 Implement "Xong" (Done) button with one-click status update
- [x] 7.4 Display order number, table number, items, quantities, special requests prominently
- [x] 7.5 Highlight special requests in red/bold styling
- [x] 7.6 Show elapsed wait time for each order (calculated from creation time)
- [x] 7.7 Sort orders by creation time (oldest first)
- [x] 7.8 Highlight VIP/express priority orders with icon/badge
- [x] 7.9 Implement auto-refresh or WebSocket subscription for real-time updates
- [ ] 7.10 Add notification sound when new order arrives (optional, with mute toggle)
- [ ] 7.11 Separate completed orders into collapsible "Done" section
- [x] 7.12 Test kitchen queue display and status updates

## 8. Frontend - Invoice Preview

- [x] 8.1 Create `InvoicePreviewDialog` component - display invoice in popup
- [x] 8.2 Design print-friendly invoice HTML template with restaurant header, itemized list, totals
- [x] 8.3 Implement "Xem phiếu in" (Preview Invoice) button on order details page
- [x] 8.4 Fetch invoice data from API and render in dialog
- [x] 8.5 Add browser print button triggering window.print()
- [ ] 8.6 Add "Download PDF" button calling PDF generation API endpoint
- [x] 8.7 Style invoice for A4/receipt paper sizing with CSS @media print
- [x] 8.8 Test invoice preview, print, and PDF download

## 9. Frontend - Serving Confirmation

- [ ] 9.1 Create `ServeItemsDialog` component - checklist of items to mark as served
- [ ] 9.2 Add "Mark Served" button on order details for waiters
- [ ] 9.3 Implement batch serving (select multiple items and mark all served)
- [ ] 9.4 Display serving timestamp after items marked served
- [ ] 9.5 Enable "Create Bill" button when all items served
- [ ] 9.6 Test serving workflow and bill creation enablement

## 10. Frontend - Real-time Integration

- [x] 10.1 Set up Socket.io client connection in `app/client/src/lib/socket.ts`
- [x] 10.2 Subscribe to `order:created` event in kitchen queue view
- [x] 10.3 Update kitchen queue UI when new order event received
- [x] 10.4 Subscribe to `kitchen:order-done` event in waiter order list
- [x] 10.5 Update order list UI when order done event received
- [x] 10.6 Add notification badge increment on new orders
- [ ] 10.7 Play notification sound on kitchen new order (optional, configurable)
- [x] 10.8 Handle WebSocket reconnection and state sync
- [x] 10.9 Test real-time updates across waiter and kitchen interfaces

## 11. Frontend - Basic Reporting

- [ ] 11.1 Create reports module: `app/client/src/modules/reports/`
- [ ] 11.2 Create `DailyRevenueView` component - daily revenue chart and table
- [ ] 11.3 Create `MonthlyRevenueView` component - monthly revenue summary
- [ ] 11.4 Create `BestSellersView` component - top items list
- [ ] 11.5 Implement date range picker for report filtering
- [ ] 11.6 Use Recharts for simple bar charts (daily/monthly revenue)
- [ ] 11.7 Add CSV export button calling backend export API
- [ ] 11.8 Display "Advanced analytics not available" message for unavailable features
- [ ] 11.9 Test report generation and data accuracy

## 12. Testing and Validation

- [ ] 12.1 Test order creation flow end-to-end (waiter → kitchen → serve)
- [ ] 12.2 Test item cancellation with different reasons
- [ ] 12.3 Test order cancellation before and after bill creation
- [ ] 12.4 Test kitchen queue updates in real-time
- [ ] 12.5 Test invoice preview and PDF generation
- [ ] 12.6 Test serving confirmation and bill enablement
- [ ] 12.7 Test search and filtering functionality
- [ ] 12.8 Test multi-user scenarios (multiple waiters, chefs)
- [ ] 12.9 Test error handling (network errors, invalid data)
- [ ] 12.10 Verify audit logs for all order events
- [ ] 12.11 Performance test with 50+ concurrent orders
- [ ] 12.12 Cross-browser testing (Chrome, Firefox, Edge)

## 13. Documentation

- [ ] 13.1 Create module README: `app/client/src/modules/orders/README.md`
- [ ] 13.2 Document API endpoints in Swagger/OpenAPI spec
- [ ] 13.3 Add JSDoc comments to all service functions
- [ ] 13.4 Create user guide for waiter order management workflow
- [ ] 13.5 Create user guide for kitchen queue interface
- [ ] 13.6 Update main project README with order management feature description
- [ ] 13.7 Document WebSocket events and payloads
- [ ] 13.8 Create troubleshooting guide for common issues

## 14. Deployment Preparation

- [ ] 14.1 Run database migration on staging environment
- [ ] 14.2 Seed test data (sample orders, menu items, tables)
- [ ] 14.3 Test WebSocket connectivity in staging
- [ ] 14.4 Verify invoice PDF generation works in server environment
- [ ] 14.5 Test CSV export file generation and download
- [ ] 14.6 Check all API endpoints return correct CORS headers
- [ ] 14.7 Verify error logging and monitoring
- [ ] 14.8 Prepare demo script for academic presentation
