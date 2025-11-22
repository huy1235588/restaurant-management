# Kitchen Operations Specification

## ADDED Requirements

### Requirement: Unified Kitchen Display

The system SHALL display all kitchen orders on a single screen without station-based routing.

#### Scenario: Display all pending kitchen orders

- **WHEN** kitchen screen loads
- **THEN** system queries KitchenOrders WHERE status IN ('pending', 'preparing')
- **AND** displays all orders in single unified list
- **AND** sorts by createdAt ASC (first-come-first-served)
- **AND** shows for each order: orderNumber, tableNumber, items, quantity, specialRequest, status, createdAt
- **AND** stationId field is null or default, not used for filtering

#### Scenario: All chefs see same order list

- **WHEN** multiple kitchen screens are connected
- **THEN** all displays show identical order list
- **AND** no orders are hidden or filtered by station
- **AND** any chef can claim any order
- **AND** updates are synchronized via WebSocket

### Requirement: Manual Order Assignment (Self-Claim)

The system SHALL allow chefs to self-assign orders by clicking start button.

#### Scenario: Chef claims order

- **WHEN** chef sees pending order on screen
- **AND** clicks "Start Preparing" button
- **THEN** system updates status to 'preparing'
- **AND** sets startedAt timestamp to current time
- **AND** broadcasts update via WebSocket to all kitchen screens
- **AND** order moves from "Pending" section to "Preparing" section

#### Scenario: Multiple chefs claim same order simultaneously

- **WHEN** two chefs click "Start" on same order at same time
- **THEN** system uses database transaction to ensure only one succeeds
- **AND** first request wins, second receives error "Order already claimed"
- **AND** second chef's screen refreshes to show updated status

### Requirement: Order Status Progression

The system SHALL enforce linear status progression from pending to completed.

#### Scenario: Valid status transitions

- **WHEN** kitchen order is created
- **THEN** initial status = 'pending'
- **AND** chef can transition to 'preparing' (Start button)
- **AND** from preparing can transition to 'ready' (Done button)
- **AND** waiter can transition from ready to 'completed' (Picked Up button)
- **AND** at any point before 'completed', can transition to 'cancelled'

#### Scenario: Invalid backward transition blocked

- **WHEN** order status = 'ready'
- **AND** chef attempts to change back to 'preparing'
- **THEN** system returns error "Cannot move order backward in status"
- **AND** status remains 'ready'

### Requirement: Time Tracking (No Estimates)

The system SHALL record actual preparation times without calculating estimates.

#### Scenario: Record preparation start time

- **WHEN** chef clicks "Start Preparing"
- **THEN** system sets startedAt = current timestamp
- **AND** prepTimeEstimated remains null (not used)
- **AND** displays elapsed time from startedAt on UI (real-time counter)

#### Scenario: Record preparation completion time

- **WHEN** chef clicks "Done" (mark as ready)
- **THEN** system sets completedAt = current timestamp
- **AND** calculates prepTimeActual = completedAt - startedAt (in minutes)
- **AND** stores prepTimeActual for future reporting
- **AND** displays "Prep time: X minutes" on screen

#### Scenario: Query average preparation times for reporting

- **WHEN** manager views kitchen performance report
- **THEN** system calculates AVG(prepTimeActual) grouped by menuItem or category
- **AND** no comparison to estimates (since estimates don't exist)

### Requirement: FIFO Order Display (No Priority)

The system SHALL display orders strictly by creation time without priority sorting.

#### Scenario: Orders sorted by time only

- **WHEN** kitchen screen displays order list
- **THEN** orders sorted by createdAt ASC (oldest first)
- **AND** priority field is ignored (always 'normal' or null)
- **AND** VIP/express orders are NOT highlighted or moved up
- **AND** first order created appears at top of pending list

#### Scenario: New order appears at bottom

- **WHEN** new kitchen order arrives via WebSocket
- **AND** existing orders are already displayed
- **THEN** new order is inserted at bottom of pending list
- **AND** does not jump ahead of older orders

### Requirement: Real-Time Kitchen Updates via WebSocket

The system SHALL broadcast all kitchen order status changes to connected clients in real time.

#### Scenario: Status change broadcasts to all screens

- **WHEN** chef updates order status (pending → preparing → ready)
- **THEN** backend emits WebSocket event: 'order:update' with full order data
- **AND** all connected kitchen screens receive event
- **AND** screens update order status in UI without page refresh
- **AND** order moves to correct section (Pending/Preparing/Ready)

#### Scenario: New order notification

- **WHEN** waiter creates new order and sends to kitchen
- **THEN** backend creates KitchenOrder record
- **AND** emits 'order:new' event with order data
- **AND** kitchen screens receive event
- **AND** new order appears in Pending section with visual notification (e.g., brief highlight)

#### Scenario: Order completed notification

- **WHEN** waiter marks order as picked up/completed
- **THEN** backend emits 'order:complete' event
- **AND** kitchen screens receive event
- **AND** order is removed from display
- **AND** audio/visual confirmation plays (optional)

### Requirement: Kitchen Order Lifecycle

The system SHALL manage complete kitchen order workflow from creation to completion.

#### Scenario: Kitchen order created from restaurant order

- **WHEN** waiter confirms order and sends to kitchen
- **THEN** system creates KitchenOrder record with:
  - orderId (FK to Order)
  - status = 'pending'
  - staffId = null (no chef assigned yet)
  - stationId = null or default (not used)
  - priority = 'normal' (not used)
  - createdAt = current timestamp
- **AND** links all order items to this kitchen order

#### Scenario: Chef marks order ready

- **WHEN** chef clicks "Done" button
- **THEN** system updates status to 'ready'
- **AND** sets completedAt timestamp
- **AND** calculates prepTimeActual
- **AND** notifies waiter UI that order is ready for pickup
- **AND** plays notification sound on waiter screen (optional)

#### Scenario: Waiter picks up completed order

- **WHEN** waiter clicks "Picked Up" on order
- **THEN** system updates status to 'completed'
- **AND** removes order from kitchen display
- **AND** updates linked Order status to 'serving' or 'completed'
- **AND** logs completion in database for reporting

### Requirement: View Kitchen Orders by Status

The system SHALL organize kitchen display into sections by order status.

#### Scenario: Display orders in status sections

- **WHEN** kitchen screen loads
- **THEN** displays three sections:
  1. **Pending** - status = 'pending', sorted by createdAt ASC
  2. **Preparing** - status = 'preparing', sorted by startedAt ASC
  3. **Ready** - status = 'ready', sorted by completedAt ASC
- **AND** each section shows order count (e.g., "Pending (5)")

#### Scenario: Order moves between sections on status change

- **WHEN** order status changes from 'pending' to 'preparing'
- **THEN** order is removed from Pending section
- **AND** appears in Preparing section
- **AND** transition is animated smoothly (slide/fade effect)

### Requirement: Display Order Items in Kitchen

The system SHALL show detailed item information for each kitchen order.

#### Scenario: Show items with special requests

- **WHEN** kitchen screen displays order
- **THEN** lists all OrderItems for that order
- **AND** shows: itemName, quantity, specialRequest (if any)
- **AND** highlights specialRequest in bold or colored text
- **AND** groups items by category if helpful (appetizers, mains, desserts)

#### Scenario: Mark individual items as completed

- **WHEN** chef completes one item in multi-item order
- **THEN** chef can check off item as done
- **AND** item is marked visually (strikethrough or checkmark)
- **AND** order remains in Preparing until all items checked
- **AND** then chef can mark entire order as Ready

### Requirement: Handle Order Cancellations

The system SHALL allow cancelling kitchen orders before completion.

#### Scenario: Waiter cancels order from kitchen

- **WHEN** waiter cancels restaurant order
- **AND** order is still in kitchen (status IN ('pending', 'preparing'))
- **THEN** system updates kitchen order status to 'cancelled'
- **AND** broadcasts 'order:cancelled' event via WebSocket
- **AND** kitchen screens remove order from display with visual feedback
- **AND** chef is notified to stop preparation if already started

#### Scenario: Cannot cancel completed order

- **WHEN** order status = 'ready' or 'completed'
- **AND** waiter attempts to cancel
- **THEN** system returns error "Cannot cancel order that is ready or completed"
- **AND** suggests creating refund/void through billing instead

### Requirement: Kitchen Order Search and Filter

The system SHALL allow searching and filtering kitchen orders for specific needs.

#### Scenario: Search by order number or table

- **WHEN** chef or manager enters search term
- **THEN** system searches by orderNumber (exact/partial) OR tableNumber
- **AND** highlights matching orders on screen
- **AND** non-matching orders are dimmed or hidden

#### Scenario: Filter by time range

- **WHEN** manager selects date/time range
- **THEN** system displays kitchen orders created within that range
- **AND** useful for reviewing historical orders or troubleshooting

### Requirement: No Station-Specific Assignment

The system SHALL ignore kitchen station fields and display all orders to all chefs.

#### Scenario: Station field is unused

- **WHEN** kitchen order is created
- **THEN** stationId field is set to null or default value (e.g., 1)
- **AND** backend does not filter orders by station
- **AND** frontend does not display station information
- **AND** field remains in schema for future scalability but is not utilized

#### Scenario: All item types shown together

- **WHEN** order contains grilled items, fried items, and desserts
- **THEN** all items displayed on same screen in same order
- **AND** no automatic routing to grill station, fry station, dessert station
- **AND** chefs coordinate manually who prepares what

### Requirement: Audio/Visual Notifications for New Orders

The system SHALL provide notification alerts when new orders arrive in kitchen.

#### Scenario: Play sound on new order

- **WHEN** new kitchen order arrives via WebSocket
- **THEN** kitchen screen plays notification sound (e.g., bell, chime)
- **AND** new order briefly highlights with visual effect (flash, pulse)
- **AND** sound can be muted via settings toggle

#### Scenario: Badge count for pending orders

- **WHEN** kitchen screen displays
- **THEN** shows badge count on Pending section (e.g., "Pending (5)")
- **AND** updates in real-time as orders are claimed
- **AND** helps chefs prioritize clearing backlog

### Requirement: Kitchen Performance Metrics

The system SHALL calculate basic metrics from time tracking data for reporting.

#### Scenario: Calculate average prep time

- **WHEN** manager views kitchen analytics
- **THEN** system calculates AVG(prepTimeActual) for:
  - All orders
  - Per chef (staffId)
  - Per menu item
  - Per category
  - Per time period (today, this week, this month)

#### Scenario: Identify slow-preparing items

- **WHEN** manager queries prep time report
- **THEN** system lists items sorted by AVG(prepTimeActual) DESC
- **AND** identifies items taking longest to prepare
- **AND** helps optimize kitchen processes or menu design

### Requirement: Ensure Data Consistency Between Order and KitchenOrder

The system SHALL maintain referential integrity between Order and KitchenOrder tables.

#### Scenario: Kitchen order links to valid order

- **WHEN** creating kitchen order
- **THEN** orderId MUST reference existing Order record
- **AND** foreign key constraint enforces this
- **AND** deleting Order cascades to delete KitchenOrder (if configured)

#### Scenario: Kitchen status reflects in order status

- **WHEN** kitchen order status = 'ready'
- **THEN** linked Order status SHOULD update to 'ready' or similar
- **AND** waiter sees order is ready for pickup in order management screen
