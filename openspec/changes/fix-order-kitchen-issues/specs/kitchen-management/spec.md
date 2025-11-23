## MODIFIED Requirements

### Requirement: Kitchen Order Status Flow
The system SHALL manage kitchen order lifecycle through a simplified 3-state flow suitable for student graduation projects.

**Status Flow**: `pending` → `preparing` → `completed` (with optional `cancelled` at any point)

**Status Definitions**:
- `pending`: Kitchen order created, waiting for chef to start
- `preparing`: Chef has started cooking the order
- `completed`: Order is finished and ready for service
- `cancelled`: Order was cancelled before completion

#### Scenario: Chef starts preparing order
- **GIVEN** a kitchen order with status `pending`
- **WHEN** chef clicks "Start Preparing" button
- **THEN** status changes to `preparing`
- **AND** `startedAt` timestamp is recorded
- **AND** `chefId` is assigned to current staff
- **AND** WebSocket event `kitchen:preparing` is emitted

#### Scenario: Chef completes order
- **GIVEN** a kitchen order with status `preparing`
- **WHEN** chef clicks "Complete Order" button
- **THEN** status changes to `completed`
- **AND** `completedAt` timestamp is recorded
- **AND** `prepTimeActual` is calculated from `startedAt` to `completedAt`
- **AND** WebSocket event `kitchen:completed` is emitted
- **AND** linked Order status updates to `ready`

#### Scenario: Invalid status transition rejected
- **GIVEN** a kitchen order with status `completed`
- **WHEN** attempt to change status to `preparing`
- **THEN** request is rejected with validation error
- **AND** error message indicates invalid transition

#### Scenario: Only one chef can claim order
- **GIVEN** a kitchen order with status `pending` and no assigned chef
- **WHEN** two chefs simultaneously click "Start Preparing"
- **THEN** only the first chef's request succeeds
- **AND** second chef receives error "Order already claimed"
- **AND** order shows assigned to first chef

### Requirement: Kitchen Order Creation Timing
The system SHALL create kitchen orders only when parent order is confirmed, not immediately upon order creation.

#### Scenario: Kitchen order created on confirmation
- **GIVEN** an order with status `pending`
- **WHEN** staff updates order status to `confirmed`
- **THEN** a kitchen order is automatically created
- **AND** kitchen order has status `pending`
- **AND** kitchen order is linked to parent order via `orderId`
- **AND** WebSocket event `order:confirmed` is emitted to kitchen namespace

#### Scenario: No kitchen order for unconfirmed orders
- **GIVEN** a new order is created
- **WHEN** order status is `pending`
- **THEN** no kitchen order exists
- **AND** order does not appear in kitchen display

#### Scenario: Cannot create duplicate kitchen orders
- **GIVEN** an order already has a kitchen order
- **WHEN** attempt to create another kitchen order for same order
- **THEN** request is rejected
- **AND** error message indicates kitchen order already exists

### Requirement: Kitchen Order Priority
The system SHALL support basic priority levels for kitchen orders to enable simple prioritization.

**Priority Levels**: `low`, `normal`, `high`, `urgent`

#### Scenario: Default priority is normal
- **GIVEN** creating a new kitchen order
- **WHEN** no priority is specified
- **THEN** priority is set to `normal`

#### Scenario: Kitchen orders sorted by priority
- **GIVEN** multiple kitchen orders with different priorities
- **WHEN** loading kitchen display
- **THEN** orders are sorted: `urgent` → `high` → `normal` → `low`
- **AND** within same priority, sorted by creation time (oldest first)

### Requirement: Kitchen Order Validation
The system SHALL validate kitchen order operations to prevent invalid state changes.

#### Scenario: Validate status transitions
- **GIVEN** defined valid transitions: pending→preparing, preparing→completed, any→cancelled
- **WHEN** attempting to change status
- **THEN** system checks if transition is valid
- **AND** rejects invalid transitions with error message

#### Scenario: Cannot modify completed order
- **GIVEN** a kitchen order with status `completed`
- **WHEN** attempt to change status or assigned chef
- **THEN** request is rejected
- **AND** error indicates order is already completed

### Requirement: Kitchen Order Pagination
The system SHALL provide paginated access to kitchen orders to improve performance.

#### Scenario: Get paginated kitchen orders
- **GIVEN** 50 total kitchen orders in database
- **WHEN** requesting page 1 with limit 20
- **THEN** response contains first 20 orders
- **AND** response includes total count (50)
- **AND** response includes pagination metadata

#### Scenario: Include related data in queries
- **GIVEN** fetching kitchen orders
- **WHEN** requesting with include relations
- **THEN** response includes linked Order data
- **AND** includes Order's table information
- **AND** includes Order's items with menu item details
- **AND** includes assigned chef information
- **AND** prevents N+1 query problem

## REMOVED Requirements

### Requirement: Kitchen Stations Assignment
**Reason**: Too complex for student graduation project. All orders processed in general kitchen area.
**Migration**: Remove `stationId` field from database. No data migration needed as feature was not implemented.

### Requirement: Prep Time Estimation
**Reason**: Adds unnecessary complexity. Actual prep time (`prepTimeActual`) is sufficient for demo purposes.
**Migration**: Remove `prepTimeEstimate` field from KitchenOrder model.

### Requirement: Auto-Cancel Timeout
**Reason**: Automatic timeout management adds complexity not required for graduation demo. Manual cancellation by staff is sufficient.
**Migration**: Remove timeout constants and scheduled job checking logic.

### Requirement: Max Concurrent Orders Limit
**Reason**: Not needed for demo scale. Kitchen staff manages capacity manually.
**Migration**: Remove `MAX_CONCURRENT_ORDERS` constant and validation logic.

### Requirement: Kitchen Notes Field
**Reason**: Redundant with Order's `specialRequest` field per item. Simplifies data model.
**Migration**: Remove `notes` field from KitchenOrder model. Special instructions remain in OrderItem.specialRequest.

### Requirement: Ready Status
**Reason**: Creates confusion between "ready" (cooked) and "completed" (served). Simplified flow combines these into single `completed` status.
**Migration**: 
- Update `KitchenOrderStatus` enum to remove `ready`
- Migrate existing orders with `ready` status to `completed`
- Update all references in code from `ready` to `completed`

## ADDED Requirements

### Requirement: Optimistic Locking for Chef Claims
The system SHALL prevent race conditions when multiple chefs attempt to claim the same order simultaneously.

#### Scenario: Concurrent claim prevention
- **GIVEN** a kitchen order with status `pending` and no assigned chef
- **WHEN** Chef A and Chef B simultaneously call `startPreparing()`
- **THEN** database update uses conditional check: `WHERE chefId IS NULL AND status = pending`
- **AND** only one update succeeds (returns count = 1)
- **AND** failed request receives error "Order already claimed by another chef"

### Requirement: Cascade Delete for Kitchen Orders
The system SHALL automatically delete kitchen orders when parent order is deleted to prevent orphaned records.

#### Scenario: Parent order deleted
- **GIVEN** an order with linked kitchen order
- **WHEN** order is soft-deleted or hard-deleted
- **THEN** kitchen order is automatically deleted
- **AND** no orphaned kitchen order remains

### Requirement: Unique Kitchen Order per Order
The system SHALL enforce one-to-one relationship between Order and KitchenOrder.

#### Scenario: Database constraint prevents duplicates
- **GIVEN** unique constraint on KitchenOrder.orderId
- **WHEN** attempt to insert second kitchen order for same orderId
- **THEN** database raises unique violation error
- **AND** application returns error "Kitchen order already exists for this order"
