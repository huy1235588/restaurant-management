# Order Management Specification

## ADDED Requirements

### Requirement: Order Creation by Staff
The system SHALL allow authorized staff (waiters) to create orders for customers at tables with menu item selection, quantity, special requests, and customer information.

#### Scenario: Waiter creates order for occupied table
- **WHEN** waiter selects an available or occupied table
- **AND** adds menu items with quantities and optional special requests
- **AND** submits the order
- **THEN** system creates order with unique order number
- **AND** sets order status to "pending"
- **AND** links order to selected table
- **AND** logs waiter who created the order

#### Scenario: Add items to existing unpaid order
- **WHEN** waiter selects table with existing unpaid order
- **AND** adds additional menu items
- **AND** submits the changes
- **THEN** system adds new items to existing order
- **AND** recalculates total amount
- **AND** sends new items to kitchen queue

#### Scenario: Order creation with customer details
- **WHEN** waiter enters customer name and phone number (optional)
- **AND** enters party size
- **AND** adds menu items and submits order
- **THEN** system stores customer information with order
- **AND** creates order successfully

### Requirement: Simple Item Cancellation
The system SHALL allow staff to cancel individual items or entire orders without fee calculation or approval workflow, logging cancellation reason only.

#### Scenario: Cancel item before payment
- **WHEN** waiter selects item from unpaid order
- **AND** requests cancellation with reason
- **AND** confirms cancellation
- **THEN** system removes item from order
- **AND** recalculates order total
- **AND** logs cancellation with reason and staff ID
- **AND** notifies kitchen if item was already sent

#### Scenario: Cancel entire order before payment
- **WHEN** waiter selects unpaid order
- **AND** requests order cancellation with reason
- **AND** confirms cancellation
- **THEN** system marks all items as cancelled
- **AND** sets order status to "cancelled"
- **AND** logs cancellation reason
- **AND** releases table to available status
- **AND** notifies kitchen to stop preparation

#### Scenario: Cannot cancel after payment created
- **WHEN** waiter attempts to cancel item from order with associated bill
- **THEN** system prevents cancellation
- **AND** displays error "Cannot cancel items after bill creation"

### Requirement: Kitchen Queue Management
The system SHALL provide a simplified kitchen queue interface displaying orders with two states only: "Chờ chế biến" (Waiting) and "Đã xong" (Done), with single-click status transitions.

#### Scenario: Chef views kitchen queue
- **WHEN** chef accesses kitchen display
- **THEN** system shows all orders in queue sorted by creation time (oldest first)
- **AND** displays order number, table number, items, quantities, special requests
- **AND** highlights priority orders (if marked VIP or express)
- **AND** shows elapsed wait time for each order

#### Scenario: Chef marks order as done
- **WHEN** chef selects order in "Chờ chế biến" status
- **AND** clicks "Xong" (Done) button
- **THEN** system updates order status to "ready"
- **AND** records completion timestamp
- **AND** notifies waiters via real-time update
- **AND** moves order to completed section

#### Scenario: Kitchen auto-receives new orders
- **WHEN** waiter creates and submits new order
- **THEN** kitchen display automatically shows new order in queue without refresh
- **AND** plays notification sound (optional)
- **AND** increments order count badge

### Requirement: Order Serving Confirmation
The system SHALL allow waiters to confirm items have been served to customers, tracking service completion and enabling bill creation.

#### Scenario: Waiter marks items as served
- **WHEN** waiter delivers food to table
- **AND** marks items as served in order details
- **THEN** system updates item status to "served"
- **AND** records serving timestamp
- **AND** enables bill creation when all items served

#### Scenario: All items served enables billing
- **WHEN** all items in order have "served" status
- **THEN** system sets order status to "completed"
- **AND** displays "Create Bill" button to waiter
- **AND** allows proceeding to payment

### Requirement: Invoice Preview without Thermal Printing
The system SHALL provide an invoice preview feature displaying bill details in print-friendly HTML/PDF format instead of direct thermal printer integration.

#### Scenario: Preview invoice before payment
- **WHEN** waiter clicks "Xem phiếu in" (Preview Invoice) button
- **AND** order has all items served
- **THEN** system opens popup displaying invoice in HTML format
- **AND** shows restaurant header, order details, itemized list, taxes, total
- **AND** provides print button for browser print dialog
- **AND** allows closing preview without printing

#### Scenario: Generate PDF invoice
- **WHEN** waiter selects "Download PDF" option in invoice preview
- **THEN** system generates PDF version of invoice
- **AND** triggers browser download
- **AND** includes all itemized details, taxes, and totals

### Requirement: Simplified Real-time Updates
The system SHALL provide real-time updates via WebSocket for critical order flow only: order creation to kitchen queue display, with other updates handled by manual refresh or page transitions.

#### Scenario: New order appears on kitchen display
- **WHEN** waiter creates and submits order
- **THEN** kitchen display receives WebSocket event
- **AND** new order appears in queue without page refresh
- **AND** notification sound plays (optional)

#### Scenario: Kitchen completion updates waiter view
- **WHEN** chef marks order as done
- **THEN** system sends WebSocket event to relevant waiter
- **AND** waiter's order list shows updated status without refresh (if on orders page)
- **AND** notification badge increments

#### Scenario: Manual refresh for other updates
- **WHEN** waiter navigates to order list page
- **THEN** system fetches latest order statuses from server
- **AND** displays current state without relying on WebSocket

### Requirement: Order Status Tracking
The system SHALL track order lifecycle through simplified statuses: pending (created), confirmed (sent to kitchen), ready (kitchen done), serving (delivered to table), completed (all served), cancelled.

#### Scenario: Order progresses through statuses
- **WHEN** waiter creates order
- **THEN** status is "pending"
- **WHEN** order sent to kitchen
- **THEN** status changes to "confirmed"
- **WHEN** chef marks done
- **THEN** status changes to "ready"
- **WHEN** waiter delivers to table
- **THEN** status changes to "serving"
- **WHEN** all items marked served
- **THEN** status changes to "completed"

#### Scenario: Filter orders by status
- **WHEN** staff views order list
- **AND** applies status filter (e.g., "ready")
- **THEN** system displays only orders with "ready" status
- **AND** updates count badge for each status category

### Requirement: Basic Revenue and Best-Seller Reporting
The system SHALL provide simplified reporting limited to daily/monthly revenue summaries and best-selling items, excluding advanced analytics like staff performance, wait time analysis, or demand forecasting.

#### Scenario: Generate daily revenue report
- **WHEN** manager selects "Daily Revenue" report
- **AND** chooses date range
- **THEN** system displays total revenue, order count, average order value
- **AND** groups data by day
- **AND** provides export to CSV option

#### Scenario: View monthly revenue summary
- **WHEN** manager selects "Monthly Revenue" report
- **AND** chooses month and year
- **THEN** system shows monthly total revenue, order count, peak days
- **AND** displays simple bar chart of daily revenue

#### Scenario: View best-selling items
- **WHEN** manager selects "Best Sellers" report
- **AND** chooses date range
- **THEN** system lists top 20 menu items by quantity sold
- **AND** shows item name, category, quantity, total revenue
- **AND** sorts by quantity descending

#### Scenario: No advanced analytics available
- **WHEN** manager searches for staff performance or wait time reports
- **THEN** system does not provide these features
- **AND** displays message "Advanced analytics not available in this version"

### Requirement: Order Item Management
The system SHALL track individual items within orders with quantity, unit price, special requests, and item-level status (pending, ready, served, cancelled).

#### Scenario: Add item with special request
- **WHEN** waiter adds menu item to order
- **AND** enters special request "No onions"
- **AND** sets quantity to 2
- **THEN** system creates order item with special request
- **AND** calculates total price (unit price × quantity)
- **AND** displays special request prominently in kitchen queue

#### Scenario: Update item quantity before confirmation
- **WHEN** waiter changes item quantity in pending order
- **THEN** system recalculates item total price
- **AND** recalculates order total amount
- **AND** updates database

#### Scenario: Item status transitions independently
- **WHEN** chef marks one item as done in multi-item order
- **THEN** system updates only that item's status to "ready"
- **AND** other items remain in previous status
- **AND** order status remains "confirmed" until all items ready

### Requirement: Table-Order Linking
The system SHALL enforce one-to-one relationship between active orders and tables, preventing multiple unpaid orders on the same table and releasing table on order completion or cancellation.

#### Scenario: One active order per table
- **WHEN** waiter attempts to create new order for table with unpaid order
- **THEN** system opens existing order for editing
- **AND** prevents creating duplicate order

#### Scenario: Table released on order cancellation
- **WHEN** waiter cancels entire order
- **THEN** system sets table status to "available"
- **AND** removes table-order association

#### Scenario: Table remains occupied until payment
- **WHEN** order status is "completed" (all items served)
- **AND** no bill created yet
- **THEN** table status remains "occupied"
- **WHEN** bill is paid
- **THEN** table status changes to "available"

### Requirement: Order Search and Filtering
The system SHALL provide search and filter capabilities for orders by order number, table number, status, date range, and waiter.

#### Scenario: Search by order number
- **WHEN** staff enters order number in search box
- **THEN** system displays matching order with full details
- **AND** highlights search term

#### Scenario: Filter by status and date
- **WHEN** staff selects status "ready" and date range "today"
- **THEN** system displays orders with "ready" status created today
- **AND** sorts by creation time descending

#### Scenario: Filter by waiter
- **WHEN** manager filters orders by specific waiter
- **AND** date range "this week"
- **THEN** system shows all orders created by that waiter this week
- **AND** displays order count and total revenue

### Requirement: Order Audit Logging
The system SHALL log all order lifecycle events including creation, modifications, status changes, and cancellations with timestamp, actor, and reason (for cancellations).

#### Scenario: Log order creation
- **WHEN** waiter creates order
- **THEN** system logs event with order ID, waiter ID, table ID, timestamp, items

#### Scenario: Log item cancellation with reason
- **WHEN** waiter cancels item with reason "Customer changed mind"
- **THEN** system logs cancellation event with order ID, item ID, waiter ID, reason, timestamp

#### Scenario: Log status transitions
- **WHEN** order status changes from "confirmed" to "ready"
- **THEN** system logs status change with order ID, old status, new status, chef ID, timestamp

#### Scenario: View order history
- **WHEN** staff views order details
- **THEN** system displays chronological log of all events for that order
- **AND** shows who performed each action and when
