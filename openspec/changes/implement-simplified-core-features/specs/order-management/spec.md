# Order Management Spec

## ADDED Requirements

### Requirement: Create New Order (OM-REQ-001)

The system SHALL allow waiters to create new orders for available tables.

**Priority**: Critical  
**Description**: Waiter can create a new order for a table  
**Acceptance Criteria**:
- Waiter selects an available table
- System creates order with status "pending"
- Order number is auto-generated (UUID)
- Customer name and phone are optional
- Party size defaults to 1 if not specified

#### Scenario: Successful order creation
- - **GIVEN** a waiter is logged in  
- - **AND** table T5 is available  
- - **WHEN** waiter creates order for table T5 with party size 4  
- - **THEN** system creates order with unique order number  
- - **AND** order status is "pending"  
- - **AND** table T5 status changes to "occupied"

#### Scenario: Cannot create order for occupied table
- - **GIVEN** table T3 already has an active order  
- - **WHEN** waiter attempts to create new order for table T3  
- - **THEN** system shows error "Table is already occupied"  
- - **AND** no order is created

---

### Requirement: Add Items to Order (OM-REQ-002)

The system SHALL allow waiters to add menu items to pending orders with quantities and special requests.

**Priority**: Critical  
**Description**: Waiter can add menu items to a pending order  
**Acceptance Criteria**:
- Can add multiple items with quantities
- Can specify special requests per item (max 500 chars)
- Item price locked at time of adding (from MenuItem.price)
- Total price calculated automatically (quantity × unitPrice)
- Can only add items while order status is "pending"

#### Scenario: Add single item to order
- **GIVEN** order #ORD-001 exists with status "pending"  
- **WHEN** waiter adds 2x "Phở Bò" with special request "Không hành"  
- **THEN** OrderItem created with quantity=2, unitPrice from menu  
- **AND** orderItem.totalPrice = 2 × unitPrice  
- **AND** order.totalAmount recalculated

#### Scenario: Add multiple items at once
- **GIVEN** order #ORD-002 exists with status "pending"  
- **WHEN** waiter adds [2x "Phở Bò", 1x "Cà Phê Sữa", 3x "Nước Cam"]  
- **THEN** 3 OrderItems are created  
- **AND** each item has correct quantity and price  
- **AND** order.totalAmount = sum of all item totals

#### Scenario: Cannot add items after order confirmed
- **GIVEN** order #ORD-003 has status "confirmed"  
- **WHEN** waiter attempts to add "Nem Rán"  
- **THEN** system shows error "Cannot modify confirmed order"  
- **AND** no item is added

---

### Requirement: Remove Items from Pending Order (OM-REQ-003)

The system SHALL allow waiters to remove items from pending orders before confirmation.

**Priority**: High  
**Description**: Waiter can remove items from order before confirmation  
**Acceptance Criteria**:
- Can only remove items while order status is "pending"
- Removing item updates order.totalAmount
- Cannot remove if item already being prepared in kitchen

#### Scenario: Remove item from pending order
- **GIVEN** order #ORD-004 has status "pending"  
- **AND** order contains 2x "Phở Bò"  
- **WHEN** waiter removes "Phở Bò" item  
- **THEN** item is deleted from order  
- **AND** order.totalAmount recalculated

#### Scenario: Cannot remove after confirmation
- **GIVEN** order #ORD-005 has status "confirmed"  
- **WHEN** waiter attempts to remove an item  
- **THEN** system shows error "Cannot modify confirmed order"

---

### Requirement: Update Item Quantity (OM-REQ-004)

The system SHALL allow waiters to update item quantities and special requests in pending orders.

**Priority**: High  
**Description**: Waiter can change quantity of items in pending order  
**Acceptance Criteria**:
- Can only update while order status is "pending"
- Quantity must be positive integer
- Total price recalculated automatically
- Special request can be updated

#### Scenario: Increase item quantity
- **GIVEN** order #ORD-006 has 1x "Cà Phê Sữa"  
- **AND** order status is "pending"  
- **WHEN** waiter changes quantity to 3  
- **THEN** orderItem.quantity = 3  
- **AND** orderItem.totalPrice = 3 × unitPrice  
- **AND** order.totalAmount updated

#### Scenario: Update special request
- **GIVEN** order #ORD-007 has 2x "Phở Bò" with no special request  
- **WHEN** waiter updates special request to "Nhiều chanh"  
- **THEN** orderItem.specialRequest = "Nhiều chanh"  
- **AND** prices remain unchanged

---

### Requirement: Confirm Order (OM-REQ-005)

The system SHALL allow waiters to confirm orders, which sends them to the kitchen for preparation.

**Priority**: Critical  
**Description**: Waiter confirms order to send to kitchen  
**Acceptance Criteria**:
- Can only confirm if order has at least 1 item
- Order status changes from "pending" to "confirmed"
- Confirmed timestamp recorded
- Kitchen order automatically created (linked 1-to-1)
- Cannot modify items after confirmation

#### Scenario: Successful order confirmation
- **GIVEN** order #ORD-008 has status "pending"  
- **AND** order contains 3 items  
- **WHEN** waiter confirms order  
- **THEN** order.status = "confirmed"  
- **AND** order.confirmedAt = current timestamp  
- **AND** KitchenOrder created with orderId reference  
- **AND** kitchen display shows new order

#### Scenario: Cannot confirm empty order
- **GIVEN** order #ORD-009 has status "pending"  
- **AND** order has 0 items  
- **WHEN** waiter attempts to confirm  
- **THEN** system shows error "Cannot confirm order without items"  
- **AND** order remains "pending"

---

### Requirement: View Order Details (OM-REQ-006)

The system SHALL display complete order information including items, amounts, and timestamps.

**Priority**: High  
**Description**: Waiter can view complete order information  
**Acceptance Criteria**:
- Display order number, table, customer info, status
- List all order items with quantities and prices
- Show subtotal, tax, total amount
- Display timestamps (created, confirmed, completed)
- Show which staff member created the order

#### Scenario: View active order
- **GIVEN** order #ORD-010 exists  
- **WHEN** waiter views order details  
- **THEN** display shows order number, table number, status  
- **AND** all order items listed with quantities and prices  
- **AND** total amount displayed  
- **AND** creation timestamp shown

---

### Requirement: List Orders with Filters (OM-REQ-007)

The system SHALL provide a filterable list of orders by status, table, and date range.

**Priority**: High  
**Description**: Waiter can view list of orders with filtering  
**Acceptance Criteria**:
- Filter by status (pending, confirmed, completed, cancelled)
- Filter by table
- Filter by date range
- Sort by creation time (newest first)
- Pagination support

#### Scenario: View all pending orders
- **GIVEN** system has 10 orders with various statuses  
- **WHEN** waiter filters by status "pending"  
- **THEN** only pending orders displayed  
- **AND** orders sorted by creation time descending

#### Scenario: View orders for specific table
- **GIVEN** table T7 has 3 historical orders  
- **WHEN** waiter filters by table T7  
- **THEN** all 3 orders for T7 displayed  
- **AND** includes both active and completed orders

---

### Requirement: Cancel Order (OM-REQ-008)

The system SHALL allow waiters to cancel pending or confirmed orders with a required reason.

**Priority**: Medium  
**Description**: Waiter can cancel order before it's completed  
**Acceptance Criteria**:
- Can cancel orders with status "pending" or "confirmed"
- Cannot cancel if kitchen already started preparing
- Cancellation reason is required (min 10 chars)
- Table status returns to "available"
- Cancelled timestamp recorded

#### Scenario: Cancel pending order
- **GIVEN** order #ORD-011 has status "pending"  
- **WHEN** waiter cancels with reason "Customer left"  
- **THEN** order.status = "cancelled"  
- **AND** order.cancelledAt = current timestamp  
- **AND** order.cancellationReason recorded  
- **AND** table status = "available"

#### Scenario: Cannot cancel after kitchen started
- **GIVEN** order #ORD-012 has status "confirmed"  
- **AND** kitchen order status is "preparing"  
- **WHEN** waiter attempts to cancel  
- **THEN** system shows error "Cannot cancel order being prepared"  
- **AND** order remains "confirmed"

---

### Requirement: Mark Order as Completed (OM-REQ-009)

The system SHALL automatically mark orders as completed when payment is received.

**Priority**: High  
**Description**: System marks order completed after payment  
**Acceptance Criteria**:
- Automatically triggered when bill is paid
- Order status changes to "completed"
- Completed timestamp recorded
- Table status changes to "available"
- Cannot modify completed orders

#### Scenario: Order completed after payment
- **GIVEN** order #ORD-013 has bill paid in full  
- **WHEN** payment is confirmed  
- **THEN** order.status = "completed"  
- **AND** order.completedAt = current timestamp  
- **AND** table status = "available"

---

### Requirement: Calculate Order Total (OM-REQ-010)

The system SHALL automatically calculate order amounts including subtotal, tax, and final amount.

**Priority**: Critical  
**Description**: System automatically calculates order amounts  
**Acceptance Criteria**:
- totalAmount = sum of all orderItem.totalPrice
- Recalculated whenever items added/removed/updated
- Includes tax and service charge calculations
- Discount amount can be applied (default 0)
- finalAmount = totalAmount - discountAmount + taxAmount

#### Scenario: Calculate total for new items
- **GIVEN** order #ORD-014 is empty  
- **WHEN** waiter adds [2x "Phở" @ 50k, 1x "Cà Phê" @ 25k]  
- **THEN** order.totalAmount = 125,000 VND  
- **AND** order.taxAmount = 12,500 VND (10% tax)  
- **AND** order.finalAmount = 137,500 VND

#### Scenario: Recalculate after item removal
- **GIVEN** order #ORD-015 has totalAmount = 200,000 VND  
- **WHEN** waiter removes item worth 50,000 VND  
- **THEN** order.totalAmount recalculated to 150,000 VND  
- **AND** tax and final amount updated accordingly

---

### Requirement: Track Order Status Transitions (OM-REQ-011)

The system MUST enforce valid order status transitions and prevent invalid state changes.

**Priority**: Medium  
**Description**: System enforces valid order status transitions  
**Acceptance Criteria**:
- Valid flow: pending → confirmed → completed
- Valid cancellation: pending/confirmed → cancelled
- Cannot skip states
- Cannot revert to previous states
- Status changes logged with timestamps

#### Scenario: Valid status progression
- **GIVEN** order starts with status "pending"  
- **WHEN** waiter confirms order  
- **THEN** status changes to "confirmed"  
- **WHEN** kitchen completes and payment received  
- **THEN** status changes to "completed"

#### Scenario: Invalid status transition
- **GIVEN** order has status "pending"  
- **WHEN** system attempts to set status to "completed" directly  
- **THEN** error thrown "Invalid status transition"  
- **AND** status remains "pending"

---

### Requirement: Associate Order with Table (OM-REQ-012)

The system SHALL link each order to exactly one table and update table status accordingly.

**Priority**: Critical  
**Description**: Each order must be linked to a table  
**Acceptance Criteria**:
- tableId is required when creating order
- Table must exist and be available
- One active order per table maximum
- Table status updated based on order lifecycle

#### Scenario: Create order updates table status
- **GIVEN** table T8 has status "available"  
- **WHEN** waiter creates order for table T8  
- **THEN** table.status = "occupied"  
- **AND** table.currentOrder references new order

#### Scenario: Complete order frees table
- **GIVEN** table T9 is occupied with completed order  
- **WHEN** order status becomes "completed"  
- **THEN** table.status = "available"  
- **AND** table.currentOrder = null

---

### Requirement: Link Order to Reservation (Optional) (OM-REQ-013)

The system SHALL allow optional linking of orders to existing reservations.

**Priority**: Low  
**Description**: Order can optionally link to existing reservation  
**Acceptance Criteria**:
- reservationId is optional field
- If provided, must reference valid reservation
- Reservation status should be "seated"
- Customer info copied from reservation if available

#### Scenario: Create order from reservation
- **GIVEN** reservation #RES-001 exists for table T10  
- **AND** reservation status is "seated"  
- **WHEN** waiter creates order linked to reservation  
- **THEN** order.reservationId = RES-001  
- **AND** order.customerName copied from reservation  
- **AND** order.partySize copied from reservation

---

### Requirement: Record Staff Assignment (OM-REQ-014)

The system SHALL record which staff member created the order and handle order assignment.

**Priority**: Medium  
**Description**: Track which waiter created/manages the order  
**Acceptance Criteria**:
- staffId recorded on order creation (from authenticated user)
- Cannot change staff assignment
- Used for performance tracking and accountability

#### Scenario: Waiter creates order
- **GIVEN** waiter "John" (staffId=5) is logged in  
- **WHEN** John creates new order  
- **THEN** order.staffId = 5  
- **AND** order displays "Created by: John" in UI

---

### Requirement: Order Notes Field (OM-REQ-015)

The system SHALL provide an optional notes field for order-level special instructions.

**Priority**: Low  
**Description**: Waiter can add general notes to order  
**Acceptance Criteria**:
- Notes field optional (max 1000 chars)
- Can be added/edited while order is "pending"
- Visible to kitchen and cashier
- Used for special instructions not item-specific

#### Scenario: Add order-level notes
- **GIVEN** order #ORD-016 has status "pending"  
- **WHEN** waiter adds note "VIP customer, priority service"  
- **THEN** order.notes = "VIP customer, priority service"  
- **AND** note visible in kitchen display

---

## Implementation Notes

### Database Usage
- Use existing `Order` and `OrderItem` models from schema.prisma
- Fields used: orderId, orderNumber, tableId, staffId, reservationId, customerName, customerPhone, partySize, status, notes, totalAmount, discountAmount, taxAmount, finalAmount, orderTime, confirmedAt, completedAt, cancelledAt, cancellationReason
- Fields unused: (none - simplified order uses all relevant fields)

### API Endpoints
```
POST   /api/v1/orders              # Create order
GET    /api/v1/orders              # List orders (with filters)
GET    /api/v1/orders/:id          # Get order details
PATCH  /api/v1/orders/:id          # Update order (pending only)
DELETE /api/v1/orders/:id          # Cancel order
POST   /api/v1/orders/:id/confirm  # Confirm order (send to kitchen)
POST   /api/v1/orders/:id/items    # Add item to order
PATCH  /api/v1/orders/:id/items/:itemId  # Update item
DELETE /api/v1/orders/:id/items/:itemId  # Remove item
```

### Business Rules
- Tax rate: 10% (configurable via environment)
- Service charge: 0% for simplified version (can add later)
- Order number format: UUID v4
- Cannot modify order after status = "confirmed"
- Kitchen order auto-created on confirmation
- Table freed on order completion or cancellation
- Discount requires manager approval (future: for now 0)

### Simplifications Applied
- No order modification after kitchen starts (from LUOC_BO.md)
- No complex item swapping logic
- Single linear workflow: create → add items → confirm → complete
- Manual processes only, no automated suggestions

