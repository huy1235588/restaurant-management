# Order Management - Spec Deltas

## ADDED Requirements

### Requirement: Order Creation
The system SHALL support creating orders both manually (walk-in customers) and automatically (from reservations).

#### Scenario: Create order manually for walk-in customer
- **GIVEN** a customer walks in without prior reservation
- **WHEN** staff creates an order
- **THEN** the system SHALL:
  - Generate unique `orderNumber` (UUID format)
  - Set `reservationId` to NULL
  - Require `tableId`, `customerName`, `partySize`
  - Set initial status to `pending`
  - Allow optional `customerPhone`, `notes`
  - Return created order object

#### Scenario: Create order automatically from reservation
- **GIVEN** a reservation being checked-in (seated)
- **WHEN** the reservation service triggers order creation
- **THEN** the system SHALL:
  - Generate unique `orderNumber`
  - Set `reservationId` to the reservation ID
  - Auto-populate `tableId`, `customerName`, `customerPhone`, `partySize` from reservation
  - Set `staffId` to the user performing check-in
  - Set status to `pending`
  - Return created order object

#### Scenario: Prevent duplicate order for same reservation
- **GIVEN** a reservation that already has an associated order
- **WHEN** attempting to create another order with same `reservationId`
- **THEN** the system SHALL:
  - Detect unique constraint violation on `orders(reservationId)`
  - Return error: "Order already exists for this reservation"
  - Suggest fetching existing order instead

## ADDED Requirements

### Requirement: Order Lifecycle
The system SHALL manage order status transitions from creation to completion.

#### Scenario: Transition order from pending to confirmed
- **GIVEN** an order with status `pending`
- **WHEN** staff confirms the order (optional step, can skip)
- **THEN** the system SHALL:
  - Update status to `confirmed`
  - Set `confirmedAt` timestamp
  - Keep order editable (can add/remove items)

#### Scenario: Complete order
- **GIVEN** an order with items and all items served
- **WHEN** staff marks order as completed
- **THEN** the system SHALL:
  - Update status to `completed`
  - Set `completedAt` timestamp
  - Calculate `totalAmount`, `taxAmount`, `finalAmount`
  - Prevent further edits to order items
  - If order has `reservationId`, suggest completing reservation

#### Scenario: Cancel order
- **GIVEN** an order with status `pending` or `confirmed`
- **WHEN** staff cancels the order
- **THEN** the system SHALL:
  - Update status to `cancelled`
  - Set `cancelledAt` timestamp
  - Record `cancellationReason`
  - Update table status to `available` (if no other active orders)

## ADDED Requirements

### Requirement: Order Items Management
The system SHALL allow adding, updating, and removing items from an order.

#### Scenario: Add items to order
- **GIVEN** an order with status `pending` or `confirmed`
- **WHEN** staff adds menu items to the order
- **THEN** the system SHALL:
  - Create `OrderItem` records with quantity, unit price, total price
  - Support optional `specialRequest` field per item
  - Set initial item status to `pending`
  - Update order `totalAmount` automatically

#### Scenario: Remove items from order
- **GIVEN** an order with items not yet prepared
- **WHEN** staff removes an item
- **THEN** the system SHALL:
  - Delete the `OrderItem` record
  - Recalculate order `totalAmount`
  - Update order `updatedAt` timestamp

#### Scenario: Update item quantity
- **GIVEN** an order item with status `pending`
- **WHEN** staff changes quantity
- **THEN** the system SHALL:
  - Update `OrderItem.quantity` and `totalPrice`
  - Recalculate order `totalAmount`

## ADDED Requirements

### Requirement: Order-Reservation Association
The system SHALL maintain the relationship between orders and reservations when applicable.

#### Scenario: Query order with reservation details
- **GIVEN** an order created from reservation check-in
- **WHEN** fetching order details
- **THEN** the response SHALL include:
  - All order fields
  - Nested `reservation` object with code, date, time, special requests
  - Label order as "From Reservation"

#### Scenario: List orders filtered by source
- **GIVEN** mixed orders (reservation-based and walk-in)
- **WHEN** filtering orders with `source=reservation`
- **THEN** return only orders where `reservationId IS NOT NULL`
- **WHEN** filtering orders with `source=walk-in`
- **THEN** return only orders where `reservationId IS NULL`

## ADDED Requirements

### Requirement: Order Validation
The system SHALL validate order data to ensure consistency and prevent errors.

#### Scenario: Validate table availability
- **GIVEN** creating a new order for a table
- **WHEN** the table is already occupied by another active order
- **THEN** the system SHALL:
  - Check if table has active orders (status not `completed` or `cancelled`)
  - For walk-in: return error "Table already occupied"
  - For reservation-based: allow (table assigned during reservation)

#### Scenario: Validate order uniqueness per reservation
- **GIVEN** a reservation ID
- **WHEN** creating order with `reservationId`
- **THEN** the system SHALL:
  - Check unique constraint on `orders(reservationId)`
  - If order exists: return existing order
  - If order cancelled: allow new order creation

#### Scenario: Validate order edits
- **GIVEN** an order with status `completed`
- **WHEN** attempting to add/remove items
- **THEN** the system SHALL:
  - Return error: "Cannot edit completed order"
  - Prevent any modifications

## ADDED Requirements

### Requirement: Order Number Generation
The system SHALL generate unique, human-readable order numbers.

#### Scenario: Generate order number on creation
- **GIVEN** a new order being created
- **WHEN** the order is saved to database
- **THEN** the system SHALL:
  - Generate format: `ORD-YYYYMMDD-XXXX` (e.g., `ORD-20250122-0001`)
  - Ensure uniqueness via UUID fallback if collision
  - Store in `orderNumber` field

## ADDED Requirements

### Requirement: Order Financial Calculations
The system SHALL calculate order totals, taxes, and discounts.

#### Scenario: Calculate order total
- **GIVEN** an order with multiple items
- **WHEN** calculating totals
- **THEN** the system SHALL:
  - Sum all `OrderItem.totalPrice` → `totalAmount`
  - Apply tax rate (if configured) → `taxAmount`
  - Apply discounts (if any) → `discountAmount`
  - Calculate final: `finalAmount = totalAmount + taxAmount - discountAmount`

#### Scenario: Recalculate on item changes
- **GIVEN** an order with calculated totals
- **WHEN** items are added, removed, or updated
- **THEN** the system SHALL:
  - Automatically recalculate `totalAmount`, `taxAmount`, `finalAmount`
  - Update `updatedAt` timestamp

## ADDED Requirements

### Requirement: Order Querying and Filtering
The system SHALL support comprehensive querying of orders.

#### Scenario: Filter orders by status
- **GIVEN** orders in various statuses
- **WHEN** querying with `status=pending`
- **THEN** return only orders with `status='pending'`

#### Scenario: Filter orders by table
- **GIVEN** multiple orders across tables
- **WHEN** querying with `tableId=5`
- **THEN** return all orders (active or historical) for table 5

#### Scenario: Filter orders by date range
- **GIVEN** historical orders
- **WHEN** querying with `startDate` and `endDate`
- **THEN** return orders where `orderTime` is within the range

#### Scenario: Search orders by customer
- **GIVEN** orders with customer information
- **WHEN** searching by `customerPhone` or `customerName`
- **THEN** return matching orders

## ADDED Requirements

### Requirement: Order Audit Trail
The system SHALL log all significant order operations for accountability.

#### Scenario: Log order creation
- **GIVEN** a new order created
- **WHEN** order is saved
- **THEN** create audit log with:
  - Action: `create`
  - User: staff ID who created
  - Changes: initial order data
  - Source: `manual` or `reservation`

#### Scenario: Log order status changes
- **GIVEN** order status transitioning
- **WHEN** status changes (e.g., `pending` → `completed`)
- **THEN** create audit log with:
  - Action: `status_change`
  - User: staff ID performing action
  - Changes: `{ oldStatus, newStatus }`

#### Scenario: Log order cancellation
- **GIVEN** order being cancelled
- **WHEN** cancellation is saved
- **THEN** create audit log with:
  - Action: `cancel`
  - User: staff ID
  - Changes: `{ reason: cancellationReason }`
