# Order Management Specification

## ADDED Requirements

### Requirement: Order Creation
The system SHALL allow authorized staff to create orders with table assignment, menu items, quantities, special requests, and customer information.

#### Scenario: Create basic order successfully
- **WHEN** waiter selects table, adds menu items with quantities, and confirms order
- **THEN** system generates unique order number, saves order with PENDING status, assigns staff, and returns order details

#### Scenario: Create order with special requests
- **WHEN** waiter creates order and adds special requests to items (e.g., "no onions", "less spicy")
- **THEN** system saves special requests with order items and displays them prominently to kitchen

#### Scenario: Create order with customer information
- **WHEN** waiter creates order and provides customer name and phone number
- **THEN** system saves customer information linked to order for tracking and history

#### Scenario: Prevent order creation with invalid data
- **WHEN** waiter attempts to create order without table selection or with empty cart
- **THEN** system displays validation error and prevents order creation

#### Scenario: Prevent order on unavailable table
- **WHEN** waiter attempts to create order on table with status "MAINTENANCE" or "RESERVED"
- **THEN** system displays error message and prevents order creation

### Requirement: Order Item Management
The system SHALL allow authorized staff to add, remove, and update quantities of items in existing orders.

#### Scenario: Add item to existing order
- **WHEN** waiter adds new item to order with status PENDING or CONFIRMED
- **THEN** system adds item to order, recalculates total, and updates order

#### Scenario: Remove item from order
- **WHEN** waiter removes item from order that has not been sent to kitchen
- **THEN** system removes item, recalculates total, and updates order without charge

#### Scenario: Remove item already in kitchen
- **WHEN** waiter removes item already sent to kitchen (status PREPARING or READY)
- **THEN** system requires cancellation reason, notifies kitchen, and may apply cancellation fee based on preparation status

#### Scenario: Update item quantity
- **WHEN** waiter increases quantity of item in order
- **THEN** system updates quantity, recalculates total, and sends additional quantity to kitchen if order already confirmed

#### Scenario: Prevent removing all items
- **WHEN** waiter attempts to remove last item from order
- **THEN** system suggests cancelling entire order instead

### Requirement: Order Status Management
The system SHALL track and transition orders through defined status lifecycle: PENDING → CONFIRMED → PREPARING → READY → SERVED → COMPLETED.

#### Scenario: Confirm pending order
- **WHEN** waiter confirms order with status PENDING
- **THEN** system changes status to CONFIRMED, records confirmation timestamp, creates kitchen order, and notifies kitchen via WebSocket

#### Scenario: Kitchen starts preparing order
- **WHEN** chef accepts kitchen order and starts preparation
- **THEN** system changes order status to PREPARING, assigns chef, records start time, and notifies waiter

#### Scenario: Kitchen completes order
- **WHEN** chef marks all order items as ready
- **THEN** system changes order status to READY, records completion time, and sends real-time notification to waiter with sound alert

#### Scenario: Mark order as served
- **WHEN** waiter confirms items delivered to customer
- **THEN** system changes order status to SERVED, records service time, and enables bill creation

#### Scenario: Complete order after payment
- **WHEN** order is paid and bill is completed
- **THEN** system changes order status to COMPLETED, records completion time, frees table for new customers

#### Scenario: Prevent invalid status transitions
- **WHEN** user attempts invalid status transition (e.g., PREPARING → PENDING)
- **THEN** system rejects transition and displays error message

### Requirement: Order Cancellation
The system SHALL allow authorized staff to cancel orders with reason tracking and conditional fees based on preparation status.

#### Scenario: Cancel order before kitchen confirmation
- **WHEN** waiter or manager cancels order with status PENDING or CONFIRMED
- **THEN** system changes status to CANCELLED, records cancellation reason, frees table, and applies no charges

#### Scenario: Cancel order during preparation
- **WHEN** manager cancels order with status PREPARING
- **THEN** system requires manager authorization, records cancellation reason, notifies kitchen to stop, charges 50% of order value, and frees table

#### Scenario: Reject cancellation of served order
- **WHEN** user attempts to cancel order with status SERVED or COMPLETED
- **THEN** system rejects cancellation and suggests refund process instead

#### Scenario: Track cancellation statistics
- **WHEN** order is cancelled
- **THEN** system records cancellation reason, responsible staff, timestamp, and affected items for reporting

#### Scenario: Require cancellation reason
- **WHEN** staff attempts to cancel order without providing reason
- **THEN** system displays validation error requiring reason selection or text input

### Requirement: Kitchen Order Management
The system SHALL provide kitchen staff with dedicated interface to view, accept, track, and complete order preparation.

#### Scenario: Display new kitchen orders
- **WHEN** confirmed order is sent to kitchen
- **THEN** system displays order in "Pending" section with table number, items, quantities, special requests, and order age

#### Scenario: Chef accepts kitchen order
- **WHEN** chef selects order and clicks "Start Preparing"
- **THEN** system moves order to "In Progress" section, assigns chef, records start time, and notifies waiter

#### Scenario: Update individual item status
- **WHEN** chef marks specific item as ready
- **THEN** system updates item status independently and shows preparation progress

#### Scenario: Complete kitchen order
- **WHEN** chef marks all items as ready
- **THEN** system moves order to "Ready" section, sends real-time notification to waiter, plays alert sound

#### Scenario: Display order priority
- **WHEN** order has high priority or customer waiting time exceeds threshold (20 minutes)
- **THEN** system displays order with red highlight and moves to top of queue

#### Scenario: Handle order cancellation request
- **WHEN** waiter requests item cancellation from kitchen
- **THEN** system displays cancellation request popup, allows chef to confirm or reject based on preparation status

### Requirement: Order Search and Filtering
The system SHALL provide comprehensive search and filtering capabilities for orders across all statuses.

#### Scenario: Search orders by order number
- **WHEN** user enters order number in search field
- **THEN** system filters orders matching exact or partial order number

#### Scenario: Search orders by customer information
- **WHEN** user enters customer name or phone number
- **THEN** system filters orders where customer information contains search term

#### Scenario: Filter orders by status
- **WHEN** user selects one or more statuses from filter dropdown
- **THEN** system displays only orders matching selected statuses

#### Scenario: Filter orders by table
- **WHEN** user selects specific table from filter dropdown
- **THEN** system displays only orders assigned to that table

#### Scenario: Filter orders by staff
- **WHEN** user selects specific staff member from filter dropdown
- **THEN** system displays only orders assigned to that staff member

#### Scenario: Filter orders by date range
- **WHEN** user selects date range (today, this week, this month, custom)
- **THEN** system displays orders created within selected date range

#### Scenario: Combine multiple filters
- **WHEN** user applies multiple filters simultaneously
- **THEN** system displays orders matching ALL filter criteria (AND logic)

#### Scenario: Sort orders by various criteria
- **WHEN** user selects sort option (time newest/oldest, amount high/low, table number)
- **THEN** system reorders order list accordingly

### Requirement: Real-time Order Updates
The system SHALL provide real-time synchronization of order status changes across all connected clients via WebSocket.

#### Scenario: Broadcast order creation
- **WHEN** new order is created
- **THEN** system broadcasts order details to kitchen display and manager dashboard immediately

#### Scenario: Broadcast status changes
- **WHEN** order status changes (e.g., PREPARING → READY)
- **THEN** system broadcasts update to all relevant clients (waiter app, kitchen display, manager dashboard)

#### Scenario: Notify waiter of ready items
- **WHEN** kitchen marks items as ready
- **THEN** system sends push notification to assigned waiter with sound alert and displays popup

#### Scenario: Notify kitchen of new orders
- **WHEN** order is confirmed and sent to kitchen
- **THEN** system sends notification to kitchen display with sound alert and visual highlight

#### Scenario: Handle disconnected clients
- **WHEN** client reconnects after disconnection
- **THEN** system resynchronizes order state and missed updates

### Requirement: Order Statistics and Reporting
The system SHALL provide comprehensive statistics and analytics for order management and performance tracking.

#### Scenario: Display order overview metrics
- **WHEN** manager views order dashboard
- **THEN** system displays total orders, revenue, average order value, and cancellation rate for selected period

#### Scenario: Show order status distribution
- **WHEN** manager views statistics
- **THEN** system displays count of orders in each status (pending, preparing, ready, served, completed, cancelled)

#### Scenario: Analyze preparation time
- **WHEN** manager views performance metrics
- **THEN** system displays average preparation time from order confirmation to ready status

#### Scenario: Identify popular menu items
- **WHEN** manager views sales report
- **THEN** system displays top 10 most ordered items with quantities and revenue

#### Scenario: Track staff performance
- **WHEN** manager views staff analytics
- **THEN** system displays orders handled per staff member, average service time, and cancellation rate

#### Scenario: Analyze cancellation trends
- **WHEN** manager views cancellation report
- **THEN** system displays cancellation count, reasons, financial impact, and trends over time

#### Scenario: Generate time-based reports
- **WHEN** manager selects reporting period (day, week, month)
- **THEN** system aggregates order data for selected period and displays comparative metrics

#### Scenario: Export order reports
- **WHEN** manager clicks export button
- **THEN** system generates CSV or PDF report with order data for selected filters and date range

### Requirement: Order Permissions and Authorization
The system SHALL enforce role-based access control for order operations based on staff roles.

#### Scenario: Waiter creates and manages own orders
- **WHEN** waiter creates or modifies order
- **THEN** system allows operation and assigns order to that waiter

#### Scenario: Prevent waiter from canceling entire order
- **WHEN** waiter attempts to cancel complete order
- **THEN** system displays error requiring manager authorization

#### Scenario: Manager cancels any order
- **WHEN** manager cancels order with valid reason
- **THEN** system allows cancellation and records manager authorization

#### Scenario: Chef views only kitchen orders
- **WHEN** chef accesses kitchen interface
- **THEN** system displays only confirmed orders requiring preparation, hiding other operational details

#### Scenario: Cashier views orders for billing
- **WHEN** cashier accesses order list
- **THEN** system displays orders with status SERVED or COMPLETED for bill creation, with read-only access

#### Scenario: Admin performs all operations
- **WHEN** admin accesses order management
- **THEN** system allows all operations including viewing, creating, modifying, canceling, and deleting orders

#### Scenario: Prevent unauthorized status changes
- **WHEN** staff attempts status transition without required role
- **THEN** system rejects operation and displays authorization error

### Requirement: Order Validation and Error Handling
The system SHALL validate order data and handle errors gracefully with clear user feedback.

#### Scenario: Validate menu item availability
- **WHEN** waiter adds menu item to order
- **THEN** system checks item availability and displays error if item is out of stock

#### Scenario: Validate order total calculation
- **WHEN** order is created or modified
- **THEN** system calculates total from item prices and quantities, validates against expected total

#### Scenario: Handle kitchen connection failure
- **WHEN** system fails to send order to kitchen via WebSocket
- **THEN** system retries 3 times with exponential backoff, displays error to waiter, and suggests manual notification

#### Scenario: Prevent duplicate order submission
- **WHEN** user clicks confirm button multiple times rapidly
- **THEN** system processes only first request and ignores subsequent duplicate requests

#### Scenario: Validate table availability
- **WHEN** waiter creates order for table
- **THEN** system checks table status and prevents order if table is not AVAILABLE or OCCUPIED

#### Scenario: Handle concurrent order modifications
- **WHEN** multiple staff modify same order simultaneously
- **THEN** system uses optimistic locking to detect conflicts and prompts user to refresh and retry

### Requirement: Order Time Tracking
The system SHALL track and display time metrics for each stage of order lifecycle to monitor service quality.

#### Scenario: Track order creation time
- **WHEN** order is created
- **THEN** system records orderTime timestamp in UTC

#### Scenario: Track confirmation time
- **WHEN** order is confirmed
- **THEN** system records confirmedAt timestamp

#### Scenario: Track kitchen start time
- **WHEN** chef starts preparing order
- **THEN** system records startTime in kitchen order

#### Scenario: Track completion time
- **WHEN** order is marked as ready
- **THEN** system records completedAt timestamp

#### Scenario: Calculate and display waiting time
- **WHEN** user views order details
- **THEN** system calculates and displays elapsed time from creation to current moment for pending orders

#### Scenario: Highlight overdue orders
- **WHEN** order waiting time exceeds threshold (20 minutes for pending, 30 minutes for preparing)
- **THEN** system highlights order in red and displays warning indicator

#### Scenario: Calculate average service time
- **WHEN** manager views performance metrics
- **THEN** system calculates average time from order creation to served status for completed orders

### Requirement: Order Detail Management
The system SHALL provide comprehensive order detail view with all associated information and action buttons.

#### Scenario: Display complete order information
- **WHEN** user opens order detail page
- **THEN** system displays order number, status badge, table info, staff name, customer info, item list with special requests, timestamps, and total amount

#### Scenario: Show order history timeline
- **WHEN** user views order details
- **THEN** system displays chronological timeline of status changes with timestamps and responsible staff

#### Scenario: Display item preparation status
- **WHEN** user views order with status PREPARING or READY
- **THEN** system displays individual status for each item (preparing, ready, served)

#### Scenario: Show modification history
- **WHEN** order has been modified (items added/removed)
- **THEN** system displays modification log with changes, timestamps, and staff who made changes

#### Scenario: Provide contextual actions
- **WHEN** user views order details
- **THEN** system displays action buttons appropriate for order status (add item, cancel item, print order, create bill)

### Requirement: Order Notification Preferences
The system SHALL allow staff to configure notification preferences for order events.

#### Scenario: Configure notification types
- **WHEN** staff member accesses notification settings
- **THEN** system allows enabling/disabling push notifications, sound alerts, and visual badges for different event types

#### Scenario: Customize sound alerts
- **WHEN** staff configures sound preferences
- **THEN** system allows selecting notification sound and volume level

#### Scenario: Set notification priority
- **WHEN** staff views notification settings
- **THEN** system allows configuring which order statuses trigger high-priority notifications

#### Scenario: Test notification delivery
- **WHEN** staff clicks test notification button
- **THEN** system sends sample notification to verify configuration

### Requirement: Order Print Functionality
The system SHALL support printing order tickets for kitchen and customer records.

#### Scenario: Print kitchen order ticket
- **WHEN** order is confirmed
- **THEN** system sends order details to configured thermal printer with table number, items, quantities, special requests, and order time

#### Scenario: Manually print order
- **WHEN** waiter clicks print button on order details
- **THEN** system generates and sends order ticket to printer

#### Scenario: Handle printer errors
- **WHEN** printer is offline or encounters error
- **THEN** system displays error message, logs incident, and allows retry or manual processing

#### Scenario: Configure printer settings
- **WHEN** admin accesses printer configuration
- **THEN** system allows selecting printer device, paper size, and print content preferences
