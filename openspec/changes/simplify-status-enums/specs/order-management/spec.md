# Order Management Specification Changes

## MODIFIED Requirements

### Requirement: Order Status Management
The system SHALL manage order lifecycle with 4 simplified states: pending, confirmed, completed, and cancelled.

**Status Definitions:**
- `pending`: Order created but not yet sent to kitchen
- `confirmed`: Order sent to kitchen and being processed
- `completed`: Order finished and payment completed
- `cancelled`: Order cancelled by staff or system

**Valid Status Transitions:**
- `pending` → `confirmed`: When order is sent to kitchen
- `pending` → `cancelled`: When order is cancelled before confirmation
- `confirmed` → `completed`: When payment is completed
- `confirmed` → `cancelled`: When order is cancelled after confirmation

**Business Rules:**
- Cannot modify order items when status is `completed` or `cancelled`
- Cannot change status from `completed` or `cancelled` to any other status
- When order is cancelled, related KitchenOrder MUST be deleted (cascade)

#### Scenario: Create new order
- **GIVEN** a valid table and menu items
- **WHEN** staff creates a new order
- **THEN** order status is set to `pending`
- **AND** KitchenOrder is NOT created yet

#### Scenario: Send order to kitchen
- **GIVEN** an order with status `pending`
- **WHEN** staff confirms the order
- **THEN** order status changes to `confirmed`
- **AND** a KitchenOrder is created with status `pending`

#### Scenario: Complete order with payment
- **GIVEN** an order with status `confirmed`
- **WHEN** payment is successfully processed
- **THEN** order status changes to `completed`
- **AND** completedAt timestamp is recorded

#### Scenario: Add items to completed order (reopen)
- **GIVEN** an order with status `completed`
- **AND** no bill has been created yet
- **WHEN** staff adds new items to the order
- **THEN** order status changes back to `confirmed`
- **AND** completedAt timestamp is cleared
- **AND** a new KitchenOrder is created for the new items only
- **AND** old items retain their `ready` status

#### Scenario: Cannot add items if bill exists
- **GIVEN** an order with status `completed`
- **AND** a bill has been created for the order
- **WHEN** staff attempts to add new items
- **THEN** operation is rejected with error "Bill already created"

#### Scenario: Cancel order before kitchen confirmation
- **GIVEN** an order with status `pending`
- **WHEN** staff cancels the order
- **THEN** order status changes to `cancelled`
- **AND** cancelledAt timestamp is recorded
- **AND** cancellationReason is stored

#### Scenario: Cancel order after kitchen confirmation
- **GIVEN** an order with status `confirmed`
- **WHEN** staff cancels the order
- **THEN** order status changes to `cancelled`
- **AND** related KitchenOrder is deleted
- **AND** cancellationReason is stored

### Requirement: Kitchen Order Status Management
The system SHALL manage kitchen order processing with 4 states: pending, preparing, ready, and completed.

**Status Definitions:**
- `pending`: New order waiting for chef to start
- `preparing`: Chef is actively cooking the order
- `ready`: Food is ready and waiting for pickup
- `completed`: Waiter has picked up the order

**Valid Status Transitions:**
- `pending` → `preparing`: When chef starts cooking
- `preparing` → `ready`: When food is ready
- `ready` → `completed`: When waiter picks up food

**Business Rules:**
- KitchenOrder is created only when Order status is `confirmed`
- When Order is cancelled, KitchenOrder MUST be deleted (no cancelled status)
- Cannot move back to previous status (one-way progression)
- startedAt timestamp recorded when status changes to `preparing`
- completedAt timestamp recorded when status changes to `completed`

#### Scenario: Chef starts preparing order
- **GIVEN** a KitchenOrder with status `pending`
- **WHEN** chef clicks "Start Preparing"
- **THEN** status changes to `preparing`
- **AND** startedAt timestamp is recorded

#### Scenario: Chef marks food as ready
- **GIVEN** a KitchenOrder with status `preparing`
- **WHEN** chef clicks "Mark as Ready"
- **THEN** status changes to `ready`
- **AND** notification is sent to waiters

#### Scenario: Waiter picks up ready food
- **GIVEN** a KitchenOrder with status `ready`
- **WHEN** waiter confirms pickup
- **THEN** status changes to `completed`
- **AND** completedAt timestamp is recorded

#### Scenario: Order cancelled during preparation
- **GIVEN** a KitchenOrder with any status
- **AND** the related Order is cancelled
- **WHEN** Order status changes to `cancelled`
- **THEN** KitchenOrder is deleted from database
- **AND** chef receives cancellation notification

### Requirement: Order Item Status Management
The system SHALL track individual order item readiness with 3 states: pending, ready, and cancelled.

**Status Definitions:**
- `pending`: Item not yet ready (default)
- `ready`: Item is ready to be served
- `cancelled`: Item was cancelled

**Status Update Rules:**
- Items start as `pending` when order is created
- Items change to `ready` when KitchenOrder reaches `ready` or `completed` status
- Items change to `cancelled` when order is cancelled or item is individually removed

**Business Rules:**
- OrderItemStatus is derived from KitchenOrderStatus
- All items in an order share the same readiness (no individual item tracking)
- Cancelled items cannot be restored

#### Scenario: Items ready when kitchen finishes
- **GIVEN** an order with multiple items
- **AND** KitchenOrder status is `ready`
- **WHEN** system updates OrderItems
- **THEN** all OrderItem statuses change to `ready`

#### Scenario: Items cancelled with order
- **GIVEN** an order with status `confirmed`
- **WHEN** order is cancelled
- **THEN** all OrderItem statuses change to `cancelled`

#### Scenario: Individual item cancellation
- **GIVEN** an order with status `pending` or `confirmed`
- **WHEN** staff removes a specific item
- **THEN** that OrderItem status changes to `cancelled`
- **AND** order totals are recalculated

### Requirement: Order Reopening After Completion
The system SHALL allow adding items to completed orders by reopening them, unless a bill has been created.

**Reopening Rules:**
- Can only reopen if Order.status = `completed` and no Bill exists
- When items are added, Order.status changes from `completed` → `confirmed`
- completedAt timestamp is cleared
- New KitchenOrder is created for newly added items only
- Old items retain their status (typically `ready`)
- Once Bill is created, order cannot be reopened

**Business Rules:**
- Cannot reopen if bill already exists
- Cannot reopen cancelled orders
- Reopening resets completedAt to null
- Each batch of added items creates a new KitchenOrder

#### Scenario: Reopen completed order by adding items
- **GIVEN** an order with status `completed`
- **AND** no bill exists for the order
- **WHEN** staff adds new menu items via addItemsToOrder
- **THEN** order status changes to `confirmed`
- **AND** completedAt is set to null
- **AND** new items are added to the order
- **AND** a new KitchenOrder is created with status `pending`
- **AND** the new KitchenOrder includes only the newly added items

#### Scenario: Cannot reopen if bill created
- **GIVEN** an order with status `completed`
- **AND** a bill has been created
- **WHEN** staff attempts to add items
- **THEN** operation fails with "Bill already created" error

#### Scenario: Multiple rounds of adding items
- **GIVEN** an order that has been reopened once
- **AND** the second KitchenOrder is now `completed`
- **WHEN** staff adds items again before final payment
- **THEN** order remains `confirmed`
- **AND** a third KitchenOrder is created
- **AND** all previous KitchenOrders remain in `completed` status

## REMOVED Requirements

### Requirement: Order Preparing Status
**Reason**: Redundant with KitchenOrderStatus. Order status should only reflect high-level workflow (pending, confirmed, completed, cancelled), not kitchen details.  
**Migration**: All orders with `preparing` status will be migrated to `confirmed` status.

### Requirement: Order Ready Status
**Reason**: Redundant with KitchenOrderStatus.ready. Order level doesn't need to track food readiness.  
**Migration**: All orders with `ready` status will be migrated to `confirmed` status.

### Requirement: Order Serving Status
**Reason**: Not needed - order is either confirmed (in progress) or completed (paid).  
**Migration**: All orders with `serving` status will be migrated to `confirmed` status.

### Requirement: Kitchen Order Confirmed Status
**Reason**: Redundant with `pending`. Kitchen doesn't need separate confirmation step.  
**Migration**: All KitchenOrders with `confirmed` status will be migrated to `pending` status.

### Requirement: Kitchen Order Almost Ready Status
**Reason**: Too granular. Simple `preparing` → `ready` transition is sufficient.  
**Migration**: All KitchenOrders with `almost_ready` status will be migrated to `preparing` status.

### Requirement: Kitchen Order Cancelled Status
**Reason**: Cancelled orders should delete KitchenOrder entirely for data cleanliness.  
**Migration**: All KitchenOrders with `cancelled` status will be deleted. Audit trail preserved in Order table.

### Requirement: Order Item Preparing Status
**Reason**: Redundant with KitchenOrderStatus. Items don't need individual preparation tracking.  
**Migration**: All OrderItems with `preparing` status will be migrated to `pending` status.

### Requirement: Order Item Served Status
**Reason**: Redundant with `ready`. Serving is implied when items are ready.  
**Migration**: All OrderItems with `served` status will be migrated to `ready` status.
