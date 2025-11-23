# Kitchen Module Documentation

## Overview

The Kitchen Module manages kitchen operations for processing restaurant orders. It handles the complete kitchen workflow from order receipt to food preparation and pickup, with real-time WebSocket updates.

## Architecture

### Module Structure

```
kitchen/
├── constants/
│   └── kitchen.constants.ts      # Constants and messages
├── dto/
│   ├── kitchen-order-filters.dto.ts  # Query/filter DTOs
│   └── index.ts                  # DTO exports
├── exceptions/
│   └── kitchen.exceptions.ts     # Custom exceptions
├── helpers/
│   └── kitchen.helper.ts         # Utility functions
├── kitchen.controller.ts         # HTTP endpoints
├── kitchen.service.ts            # Business logic
├── kitchen.repository.ts         # Data access
├── kitchen.gateway.ts            # WebSocket gateway
├── kitchen.module.ts             # Module definition
├── index.ts                      # Central exports
└── README.md                     # Documentation
```

## API Endpoints

### Main Endpoints

- **GET** `/kitchen/orders` - Get all kitchen orders with filters
- **GET** `/kitchen/orders/:id` - Get kitchen order by ID
- **PATCH** `/kitchen/orders/:id/start` - Start preparing order
- **PATCH** `/kitchen/orders/:id/ready` - Mark order as ready
- **PATCH** `/kitchen/orders/:id/complete` - Mark as completed (picked up)
- **PATCH** `/kitchen/orders/:id/cancel` - Cancel kitchen order

## Key Features

### 1. Kitchen Queue Management

- Auto-creation when order is confirmed
- Priority-based queue (urgent → high → normal → low)
- Maximum concurrent orders limit
- Auto-cancellation for abandoned orders

### 2. Order Tracking

- **Creation time**: When order entered kitchen
- **Start time**: When chef starts preparing
- **Completion time**: When food is ready
- **Prep time tracking**: Actual vs estimated
- **Performance metrics**: Fast, on-time, slow

### 3. Real-time Updates (WebSocket)

Events emitted to clients:
- `kitchen:new_order` - New order in kitchen
- `kitchen:order_update` - Order status updated
- `kitchen:order_ready` - Order ready for pickup
- `kitchen:order_completed` - Order picked up

### 4. Priority System

```typescript
Priority Levels:
- urgent: 4 (highest)
- high: 3
- normal: 2 (default)
- low: 1
```

## Kitchen Workflow

### Complete Flow

```
1. Order Confirmed (by waiter)
   ↓
2. Kitchen Order Created (status: pending)
   → WebSocket: kitchen:new_order
   ↓
3. Chef Claims Order (PATCH /start)
   → Status: ready
   → Start time recorded
   → Chef assigned
   → WebSocket: kitchen:order_update
   ↓
4. Chef Marks Ready (PATCH /ready)
   → Status: ready
   → Completion time recorded
   → Prep time calculated
   → Main order: ready
   → WebSocket: kitchen:order_ready
   ↓
5. Waiter Picks Up (PATCH /complete)
   → Status: completed
   → Main order: serving
   → WebSocket: kitchen:order_completed
```

### Alternative Flows

- **Cancel**: From `pending` or `ready` → `cancelled`

## Custom Exceptions

### Kitchen Order Exceptions

- `KitchenOrderNotFoundException` - Kitchen order not found
- `KitchenOrderAlreadyExistsException` - Already exists for order
- `KitchenOrderNotPendingException` - Not in pending state
- `KitchenOrderAlreadyCompletedException` - Already completed
- `KitchenOrderAlreadyCancelledException` - Already cancelled

### Main Order Exceptions

- `MainOrderNotFoundException` - Main order not found
- `OrderNotConfirmedException` - Order not confirmed

### Status Transition Exceptions

- `CannotMarkOrderReadyException` - Cannot mark as ready
- `CanOnlyCompleteReadyOrdersException` - Can only complete ready orders
- `CannotCancelCompletedOrderException` - Cannot cancel completed
- `CannotModifyCompletedOrderException` - Cannot modify completed
- `InvalidKitchenStatusTransitionException` - Invalid transition

### Queue Exceptions

- `KitchenQueueFullException` - Queue at capacity
- `InvalidPriorityException` - Invalid priority level

## Helper Functions

### Time Calculation Helpers

```typescript
KitchenHelper.calculatePrepTime(startedAt, completedAt)
KitchenHelper.getEstimatedCompletionTime(startedAt, estimatedPrepTime)
KitchenHelper.getElapsedTime(createdAt)
KitchenHelper.isWaitingTooLong(createdAt, startedAt)
KitchenHelper.formatPrepTime(minutes)
KitchenHelper.calculateAveragePrepTime(prepTimes[])
```

### Performance Helpers

```typescript
KitchenHelper.isSlowPreparation(prepTimeMinutes)
KitchenHelper.isFastPreparation(prepTimeMinutes)
KitchenHelper.getPrepTimePerformance(actualTime, estimatedTime)
// Returns: 'fast' | 'on-time' | 'slow'
```

### Priority Helpers

```typescript
KitchenHelper.isValidPriority(priority)
KitchenHelper.getPriorityWeight(priority)
KitchenHelper.compareOrderPriority(orderA, orderB)
KitchenHelper.sortOrdersByPriority(orders)
```

### Status Helpers

```typescript
KitchenHelper.isValidStatusTransition(current, new)
KitchenHelper.canModifyOrder(status)
KitchenHelper.canCancelOrder(status)
KitchenHelper.isActiveOrder(status)
KitchenHelper.isFinalState(status)
```

### Queue Management Helpers

```typescript
KitchenHelper.isQueueNearCapacity(currentCount)
KitchenHelper.isQueueFull(currentCount)
KitchenHelper.filterActiveOrders(orders)
KitchenHelper.groupOrdersByStatus(orders)
```

### Display Helpers

```typescript
KitchenHelper.getStatusDisplayName(status)
KitchenHelper.getPriorityDisplayName(priority)
```

## Constants

### Configuration

```typescript
KITCHEN_CONSTANTS = {
    DEFAULT_PREP_TIME: 20,              // 20 minutes
    MIN_PREP_TIME: 5,
    MAX_PREP_TIME: 120,
    PRIORITIES: ['low', 'normal', 'high', 'urgent'],
    DEFAULT_PRIORITY: 'normal',
    AUTO_CANCEL_TIMEOUT_MINUTES: 60,
    MAX_CONCURRENT_ORDERS: 20,
    SLOW_PREP_TIME_THRESHOLD: 30,       // Flag if > 30 min
    FAST_PREP_TIME_THRESHOLD: 10,       // Flag if < 10 min
}
```

### Status Flow

```typescript
KITCHEN_STATUS_FLOW = {
    pending: ['preparing', 'cancelled'],
    preparing: ['ready', 'cancelled'],
    ready: ['completed'],
    completed: [],
    cancelled: [],
}
```

### Messages

```typescript
KITCHEN_MESSAGES.SUCCESS.ORDER_CREATED
KITCHEN_MESSAGES.SUCCESS.ORDER_READY
KITCHEN_MESSAGES.ERROR.ORDER_NOT_FOUND
KITCHEN_MESSAGES.ERROR.CANNOT_COMPLETE
KITCHEN_MESSAGES.WARNING.SLOW_PREPARATION
```

## Usage Examples

### 1. Get Pending Kitchen Orders

```typescript
const filters = {
    status: KitchenOrderStatus.pending,
};

const orders = await kitchenService.getAllKitchenOrders(filters);
```

### 2. Chef Starts Preparing

```typescript
const kitchenOrder = await kitchenService.startPreparing(
    kitchenOrderId,
    staffId, // Chef ID
);

// Result:
// - status: ready
// - startedAt: current time
// - chefId: staffId
```

### 3. Mark Order as Ready

```typescript
const readyOrder = await kitchenService.markReady(kitchenOrderId);

// Result:
// - status: ready
// - completedAt: current time
// - prepTimeActual: calculated in minutes
// - Main order status: ready
```

### 4. Complete Order (Waiter Pickup)

```typescript
const completedOrder = await kitchenService.markCompleted(kitchenOrderId);

// Result:
// - Kitchen order status: completed
// - Main order status: serving
```

### 5. Cancel Kitchen Order

```typescript
const cancelled = await kitchenService.cancelKitchenOrder(kitchenOrderId);
```

## WebSocket Integration

### Server-side (Kitchen Gateway)

```typescript
// Emit to all kitchen clients
kitchenGateway.emitNewOrder(kitchenOrder);
kitchenGateway.emitOrderUpdate(kitchenOrder);
kitchenGateway.emitOrderReady(kitchenOrder);
kitchenGateway.emitOrderCompleted(kitchenOrder);
```

### Client-side (Kitchen Display)

```typescript
// Listen for kitchen events
socket.on('kitchen:new_order', (data) => {
    // Add to queue, play sound
});

socket.on('kitchen:order_update', (data) => {
    // Update order status
});

socket.on('kitchen:order_ready', (data) => {
    // Notify waiters, move to ready area
});

socket.on('kitchen:order_completed', (data) => {
    // Remove from display
});
```

## Status Descriptions

| Status | Description | Next Actions |
|--------|-------------|--------------|
| `pending` | Waiting for chef | Start Preparing or Cancel |
| `ready` | Food is ready | Complete (pickup) |
| `completed` | Picked up by waiter | Final state |
| `cancelled` | Order cancelled | Final state |

## Priority Descriptions

| Priority | Weight | Use Case |
|----------|--------|----------|
| `urgent` | 4 | VIP orders, complaints |
| `high` | 3 | Large parties, time-sensitive |
| `normal` | 2 | Standard orders |
| `low` | 1 | Pre-orders, non-urgent |

## Validation Rules

### Order Creation

- Main order must exist
- Main order must be `confirmed`
- No duplicate kitchen order for same order

### Status Transitions

- `pending` → `preparing` or `cancelled`
- `preparing` → `ready` or `cancelled`
- `ready` → `completed`
- Cannot modify `completed` or `cancelled` orders

### Queue Management

- Max 20 concurrent orders in `preparing` state
- Auto-cancel if `pending` for > 60 minutes

## Error Handling

All errors use custom exceptions:

```typescript
try {
    await kitchenService.startPreparing(id, staffId);
} catch (error) {
    if (error instanceof KitchenOrderNotFoundException) {
        // Handle not found
    } else if (error instanceof KitchenOrderNotPendingException) {
        // Handle invalid state
    } else if (error instanceof KitchenQueueFullException) {
        // Handle queue full
    }
}
```

## Best Practices

1. **Always validate status** before transitions
2. **Use WebSocket events** for real-time updates
3. **Track prep time** for performance analysis
4. **Set appropriate priority** based on order context
5. **Monitor queue capacity** to prevent overload
6. **Log slow preparations** for kitchen optimization
7. **Assign chef** when starting preparation
8. **Calculate metrics** for performance reporting

## Performance Metrics

### Tracking

- **Average prep time**: By dish, chef, time period
- **Fast orders**: < 10 minutes
- **Slow orders**: > 30 minutes
- **Queue length**: Current pending/preparing count
- **Completion rate**: Orders completed vs started
- **Cancellation rate**: Orders cancelled vs total

### Analysis

```typescript
// Get prep times for analysis
const prepTimes = kitchenOrders
    .filter(o => o.prepTimeActual)
    .map(o => o.prepTimeActual);

const avgPrepTime = KitchenHelper.calculateAveragePrepTime(prepTimes);
const slowOrders = prepTimes.filter(t => 
    KitchenHelper.isSlowPreparation(t)
);
```

## Performance Considerations

- Repository uses optimized queries with selective includes
- WebSocket events sent only to kitchen clients
- Pagination supported on list endpoints
- Database indexes: `kitchenOrderId`, `orderId`, `status`, `priority`
- Status transitions use transactions

## Integration Points

### With Order Module

- Creates kitchen order when order is `confirmed`
- Updates order status when kitchen order changes
- Syncs status: `ready` → order.ready, `completed` → order.serving

### With Staff Module

- Assigns chef to kitchen orders
- Tracks chef performance metrics

## Future Enhancements

- [ ] Multi-station kitchen (grill, salad, dessert)
- [ ] Dish-level tracking within orders
- [ ] Kitchen printer integration
- [ ] Voice notifications for waiters
- [ ] Chef performance dashboard
- [ ] Prep time learning/prediction
- [ ] Ingredient availability check
- [ ] Kitchen display system (KDS) integration
- [ ] Order routing by dish category
- [ ] Batch cooking optimization
