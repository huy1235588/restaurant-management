# Order Management Specification

## ADDED Requirements

### Requirement: Order Creation
The system SHALL allow waiters to create new orders by selecting a table, adding menu items with quantities, and providing customer information.

#### Scenario: Create order successfully
- **WHEN** waiter selects an available table
- **AND** adds at least one menu item with quantity
- **AND** provides customer head count
- **THEN** system generates unique order number
- **AND** calculates total amount automatically
- **AND** saves order with status PENDING
- **AND** returns order details with order number

#### Scenario: Create order with special requests
- **WHEN** waiter adds menu item
- **AND** specifies special request (e.g., "no onions", "extra spicy")
- **THEN** system saves special request with the order item
- **AND** displays special request prominently in order details

#### Scenario: Create order with customer info
- **WHEN** waiter provides customer name and phone number
- **THEN** system saves customer information
- **AND** enables lookup of customer order history

#### Scenario: Validation failure - empty order
- **WHEN** waiter tries to create order without items
- **THEN** system prevents order creation
- **AND** displays error "Order must contain at least one item"

#### Scenario: Validation failure - invalid table
- **WHEN** waiter selects non-existent or closed table
- **THEN** system prevents order creation
- **AND** displays error "Selected table is not available"

### Requirement: Order Listing and Search
The system SHALL provide a searchable and filterable list of orders for waiters to track and manage.

#### Scenario: View all orders
- **WHEN** waiter navigates to orders page
- **THEN** system displays list of orders sorted by creation date (newest first)
- **AND** shows order number, table, status, total amount, and time elapsed

#### Scenario: Search by order number
- **WHEN** waiter enters order number in search box
- **THEN** system filters list to show matching orders
- **AND** highlights search term in results

#### Scenario: Search by customer
- **WHEN** waiter enters customer name or phone number
- **THEN** system filters list to show orders for that customer
- **AND** displays customer contact information

#### Scenario: Filter by status
- **WHEN** waiter selects status filter (e.g., "PREPARING")
- **THEN** system displays only orders with that status
- **AND** updates count badge to reflect filtered results

#### Scenario: Filter by table
- **WHEN** waiter selects table filter
- **THEN** system displays only orders for that table
- **AND** sorts by most recent first

#### Scenario: Filter by date range
- **WHEN** waiter selects date range (e.g., "Today", "Last 7 days")
- **THEN** system displays orders created within that range
- **AND** shows summary statistics for the period

### Requirement: Order Detail View
The system SHALL display comprehensive order information including items, status, customer details, and action history.

#### Scenario: View order details
- **WHEN** waiter clicks on order in list
- **THEN** system displays order header with number, table, status, timestamps
- **AND** shows list of items with quantities, prices, special requests
- **AND** displays customer information (name, phone, head count)
- **AND** shows order totals (subtotal, discount, tax, final amount)
- **AND** displays status timeline with timestamps

#### Scenario: View real-time status updates
- **WHEN** kitchen updates order status
- **THEN** system updates status badge in real-time
- **AND** updates timeline with new status and timestamp
- **AND** displays notification toast if significant change (e.g., "Order ready")

#### Scenario: View item-level status
- **WHEN** kitchen marks specific items as ready
- **THEN** system displays checkmark or status indicator next to each item
- **AND** shows overall completion percentage

### Requirement: Order Modification
The system SHALL allow waiters to modify orders by adding or removing items, subject to status restrictions.

#### Scenario: Add items to pending order
- **WHEN** order status is PENDING
- **AND** waiter clicks "Add Items"
- **AND** selects additional menu items
- **THEN** system adds items to order
- **AND** recalculates total amount
- **AND** updates order timestamp

#### Scenario: Add items to confirmed order
- **WHEN** order status is CONFIRMED or PREPARING
- **AND** waiter adds new items
- **THEN** system creates new order items
- **AND** sends "order:item_added" event to kitchen
- **AND** kitchen displays new items separately with "NEW" badge

#### Scenario: Remove item from pending order
- **WHEN** order status is PENDING
- **AND** waiter clicks remove on an item
- **THEN** system removes item from order
- **AND** recalculates total amount

#### Scenario: Cancel item from confirmed order
- **WHEN** order status is CONFIRMED or PREPARING
- **AND** waiter requests item cancellation
- **THEN** system sends "order:cancel_request" event to kitchen
- **AND** displays "Awaiting kitchen confirmation" status
- **AND** waits for kitchen response

#### Scenario: Update customer information
- **WHEN** waiter edits customer name or phone
- **THEN** system updates order record
- **AND** saves change history with timestamp

#### Scenario: Modification not allowed
- **WHEN** order status is READY, SERVING, or COMPLETED
- **AND** waiter tries to modify order
- **THEN** system prevents modification
- **AND** displays message "Cannot modify order in current status"

### Requirement: Order Status Management
The system SHALL track order status through its lifecycle and enforce valid status transitions.

#### Scenario: Send order to kitchen
- **WHEN** waiter clicks "Send to Kitchen" on PENDING order
- **THEN** system changes status to CONFIRMED
- **AND** emits "order:confirmed" WebSocket event
- **AND** kitchen receives order in real-time
- **AND** displays confirmation toast "Order sent to kitchen"

#### Scenario: Receive kitchen status update
- **WHEN** kitchen changes order status (e.g., PREPARING → READY)
- **THEN** system receives "kitchen:status_changed" event
- **AND** updates order status in database
- **AND** updates UI immediately
- **AND** triggers notification if status is READY

#### Scenario: Mark order as serving
- **WHEN** order status is READY
- **AND** waiter confirms food picked up from kitchen
- **THEN** system changes status to SERVING
- **AND** records serving timestamp
- **AND** notifies kitchen order can be cleared from KDS

#### Scenario: Mark order as completed
- **WHEN** order status is SERVING
- **AND** customer finished eating and paid
- **THEN** system changes status to COMPLETED
- **AND** records completion timestamp
- **AND** makes order available for billing

#### Scenario: Invalid status transition
- **WHEN** system attempts invalid status change (e.g., PENDING → READY)
- **THEN** system rejects the change
- **AND** logs error with attempted transition
- **AND** displays error message to user

### Requirement: Order Cancellation
The system SHALL allow waiters to cancel orders or individual items with proper authorization and workflow.

#### Scenario: Cancel pending order
- **WHEN** order status is PENDING
- **AND** waiter clicks "Cancel Order"
- **AND** provides cancellation reason
- **THEN** system changes status to CANCELLED
- **AND** records cancellation reason and timestamp
- **AND** does not notify kitchen (order not sent yet)

#### Scenario: Request order cancellation from kitchen
- **WHEN** order status is CONFIRMED or PREPARING
- **AND** waiter requests cancellation
- **AND** provides reason (e.g., "Customer left")
- **THEN** system sends "order:cancel_request" to kitchen
- **AND** waits for kitchen confirmation
- **AND** displays pending status to waiter

#### Scenario: Kitchen accepts cancellation
- **WHEN** kitchen accepts cancellation request
- **THEN** system receives "kitchen:cancel_accepted" event
- **AND** changes order status to CANCELLED
- **AND** notifies waiter "Cancellation approved"

#### Scenario: Kitchen rejects cancellation
- **WHEN** kitchen rejects cancellation request
- **AND** provides reason (e.g., "Food already cooked")
- **THEN** system receives "kitchen:cancel_rejected" event
- **AND** maintains current order status
- **AND** displays rejection reason to waiter
- **AND** suggests alternatives (e.g., "Proceed with order or speak to manager")

#### Scenario: Cannot cancel completed order
- **WHEN** order status is COMPLETED
- **AND** waiter tries to cancel
- **THEN** system prevents cancellation
- **AND** displays message "Cannot cancel completed order"

### Requirement: Order Notifications
The system SHALL notify waiters of important order events via audio and visual alerts.

#### Scenario: Order ready notification
- **WHEN** kitchen marks order as READY
- **THEN** system displays toast notification "Order #123 ready - Table 5"
- **AND** plays audio alert sound
- **AND** shows persistent badge in orders list
- **AND** highlights order card in green

#### Scenario: Item ready notification
- **WHEN** kitchen marks individual item as ready
- **THEN** system updates item status indicator
- **AND** displays subtle notification "Steak ready on Order #123"

#### Scenario: Cancellation approved notification
- **WHEN** kitchen accepts cancellation
- **THEN** system displays notification "Cancellation approved for Order #123"
- **AND** removes order from active list

#### Scenario: Cancellation rejected notification
- **WHEN** kitchen rejects cancellation
- **THEN** system displays alert notification with reason
- **AND** keeps order in active list
- **AND** prompts waiter to take action

#### Scenario: Mute notifications
- **WHEN** waiter toggles "Mute" in settings
- **THEN** system disables audio alerts
- **AND** continues showing visual notifications
- **AND** saves preference for session

### Requirement: Order Reports
The system SHALL generate reports on order performance, sales, and waiter efficiency.

#### Scenario: View sales by table
- **WHEN** manager views "Sales by Table" report
- **THEN** system displays total sales per table
- **AND** shows number of orders per table
- **AND** calculates average order value per table
- **AND** highlights top-performing tables

#### Scenario: View popular items
- **WHEN** manager views "Popular Items" report
- **THEN** system lists top 10 most ordered items
- **AND** shows quantity sold for each item
- **AND** calculates percentage of total orders
- **AND** identifies items frequently cancelled or modified

#### Scenario: View waiter performance
- **WHEN** manager views "Waiter Performance" report
- **THEN** system lists each waiter's order count
- **AND** shows total sales generated per waiter
- **AND** calculates average order value per waiter
- **AND** shows average time from order creation to kitchen submission

#### Scenario: View customer order history
- **WHEN** waiter enters customer phone number
- **THEN** system displays customer's past orders
- **AND** shows order dates, items ordered, and totals
- **AND** identifies customer preferences (favorite items)
- **AND** enables personalized service

#### Scenario: Export report data
- **WHEN** user clicks "Export" on report
- **THEN** system generates CSV file with report data
- **AND** includes all columns and filters applied
- **AND** downloads file to user's device

### Requirement: Order Validation
The system SHALL validate all order data to ensure data integrity and business rule compliance.

#### Scenario: Validate menu item availability
- **WHEN** waiter adds item to order
- **THEN** system checks if item is currently available
- **AND** prevents adding if item marked unavailable
- **AND** displays message "Item currently unavailable"

#### Scenario: Validate quantity limits
- **WHEN** waiter enters item quantity
- **THEN** system enforces minimum quantity of 1
- **AND** enforces maximum quantity of 50 per item
- **AND** displays error if limits exceeded

#### Scenario: Validate price calculation
- **WHEN** order total is calculated
- **THEN** system verifies sum of item prices matches total
- **AND** applies discount if provided
- **AND** calculates tax at configured rate
- **AND** ensures final amount equals (total - discount + tax)

#### Scenario: Validate status transitions
- **WHEN** order status changes
- **THEN** system validates transition is allowed
- **AND** prevents invalid backward transitions
- **AND** logs validation failures for debugging

### Requirement: Order Permissions
The system SHALL enforce role-based permissions for order operations.

#### Scenario: Waiter creates order
- **WHEN** user with "waiter" role creates order
- **THEN** system assigns order to that waiter
- **AND** allows full control over that order

#### Scenario: Waiter views own orders
- **WHEN** waiter views order list
- **THEN** system displays only orders created by that waiter
- **AND** filters out other waiters' orders (unless admin/manager)

#### Scenario: Manager views all orders
- **WHEN** user with "manager" or "admin" role views orders
- **THEN** system displays all orders regardless of creator
- **AND** shows waiter name on each order

#### Scenario: Manager cancels any order
- **WHEN** manager requests order cancellation
- **THEN** system allows cancellation without kitchen approval
- **AND** logs manager action for audit trail

#### Scenario: Unauthorized order access
- **WHEN** waiter tries to edit another waiter's order
- **AND** user is not admin/manager
- **THEN** system denies request
- **AND** displays error "You can only edit your own orders"

### Requirement: Order Number Generation
The system SHALL generate unique, sequential order numbers for easy identification.

#### Scenario: Generate order number
- **WHEN** new order is created
- **THEN** system generates order number in format "#001"
- **AND** increments from previous order number
- **AND** ensures uniqueness via database constraint

#### Scenario: Daily number reset
- **WHEN** first order created each day
- **THEN** system resets counter to #001
- **AND** includes date prefix if configured (e.g., "2025-11-19-001")

#### Scenario: Handle number collision
- **WHEN** order number already exists
- **THEN** system retries with next number
- **AND** logs collision for monitoring
- **AND** succeeds after max 3 retries

### Requirement: Order Total Calculation
The system SHALL automatically calculate order totals based on items, quantities, discounts, and taxes.

#### Scenario: Calculate subtotal
- **WHEN** items added to order
- **THEN** system multiplies quantity by unit price for each item
- **AND** sums all item totals for subtotal

#### Scenario: Apply discount
- **WHEN** discount amount entered
- **THEN** system subtracts discount from subtotal
- **AND** ensures discount does not exceed subtotal
- **AND** displays discounted amount

#### Scenario: Calculate tax
- **WHEN** order totals calculated
- **THEN** system applies tax rate to (subtotal - discount)
- **AND** rounds tax to 2 decimal places
- **AND** displays tax amount separately

#### Scenario: Calculate final amount
- **WHEN** all calculations complete
- **THEN** system sets final amount = (subtotal - discount + tax)
- **AND** displays final amount prominently
- **AND** updates when items added/removed

#### Scenario: Recalculate on modification
- **WHEN** order items changed after creation
- **THEN** system recalculates all totals automatically
- **AND** updates database with new amounts
- **AND** displays updated total to user
