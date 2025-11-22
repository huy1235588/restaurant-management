# Order Module Documentation

## Overview

The Order Module is a comprehensive system for managing restaurant orders, from creation to completion. It has been optimized with clean architecture, separation of concerns, and improved error handling.

## Architecture

### Module Structure

```
order/
├── constants/
│   └── order.constants.ts      # Constants and messages
├── dto/
│   ├── base.dto.ts             # Base DTOs for reusability
│   ├── create-order.dto.ts     # Order creation DTOs
│   ├── add-items.dto.ts        # Add items to order
│   ├── cancel-item.dto.ts      # Cancel item DTO
│   ├── cancel-order.dto.ts     # Cancel order DTO
│   ├── update-order-status.dto.ts
│   ├── update-order.dto.ts
│   └── query-order.dto.ts      # Query/filter DTOs
├── exceptions/
│   └── order.exceptions.ts     # Custom exceptions
├── helpers/
│   └── order.helper.ts         # Utility functions
├── order.controller.ts         # Main order endpoints
├── kitchen.controller.ts       # Kitchen-specific endpoints
├── order.service.ts            # Order business logic
├── kitchen.service.ts          # Kitchen business logic
├── order.repository.ts         # Order data access
├── kitchen.repository.ts       # Kitchen data access
├── order.gateway.ts            # WebSocket gateway
├── order.module.ts             # Module definition
└── index.ts                    # Exports
```

## Controllers

### OrderController (`/orders`)

Handles main order operations:

- **GET** `/orders/count` - Count orders with filters
- **GET** `/orders` - List all orders (paginated)
- **GET** `/orders/:id` - Get order by ID
- **POST** `/orders` - Create new order
- **PATCH** `/orders/:id/items` - Add items to order
- **DELETE** `/orders/:id/items/:itemId` - Cancel item
- **DELETE** `/orders/:id` - Cancel entire order
- **PATCH** `/orders/:id/status` - Update order status
- **PATCH** `/orders/:id/items/:itemId/serve` - Mark item as served

### KitchenController (`/kitchen`)

Handles kitchen-specific operations:

- **GET** `/kitchen/queue` - Get pending kitchen orders
- **GET** `/kitchen/orders` - Get all kitchen orders
- **GET** `/kitchen/orders/:id` - Get kitchen order by ID
- **PATCH** `/kitchen/orders/:id/ready` - Mark order as ready
- **PATCH** `/kitchen/orders/:id/complete` - Mark order as completed

## Services

### OrderService

Main business logic for orders:

- `getAllOrders()` - Retrieve orders with filters and pagination
- `countOrders()` - Count orders by filters
- `getOrderById()` - Get single order
- `getOrderByNumber()` - Get order by order number
- `getOrderByReservation()` - Get order by reservation
- `createOrder()` - Create new order with validation
- `addItemsToOrder()` - Add items to existing order
- `cancelItem()` - Cancel specific item
- `cancelOrder()` - Cancel entire order
- `updateOrderStatus()` - Update order status
- `markItemAsServed()` - Mark item as served

### KitchenService

Kitchen operations:

- `getKitchenQueue()` - Get pending kitchen orders
- `getAllKitchenOrders()` - Get all kitchen orders
- `getKitchenOrderById()` - Get kitchen order details
- `markOrderAsReady()` - Mark order as ready (food prepared)
- `markOrderAsCompleted()` - Mark order as completed (picked up)

## Custom Exceptions

Better error context and handling:

- `OrderNotFoundException` - Order not found
- `OrderItemNotFoundException` - Order item not found
- `TableNotFoundException` - Table not found
- `TableOccupiedException` - Table already has active order
- `MenuItemNotFoundException` - Menu item not found
- `MenuItemNotAvailableException` - Menu item not available
- `MenuItemNotActiveException` - Menu item not active
- `CannotModifyCompletedOrderException` - Cannot modify completed order
- `CannotModifyCancelledOrderException` - Cannot modify cancelled order
- `OrderAlreadyCancelledException` - Order already cancelled
- `BillAlreadyCreatedException` - Bill already created
- `KitchenOrderNotFoundException` - Kitchen order not found
- `CannotCompleteKitchenOrderException` - Cannot complete kitchen order

## Helper Functions

**OrderHelper** provides utility methods:

- `canModifyOrder()` - Check if order can be modified
- `canCancelOrder()` - Check if order can be cancelled
- `calculateTotalAmount()` - Calculate total from items
- `calculateActiveItemsTotal()` - Calculate total for active items
- `areAllItemsServed()` - Check if all items served
- `isValidStatusTransition()` - Validate status transitions
- `calculateItemTotal()` - Calculate item total price
- `formatOrderNumber()` - Format order number
- `isActiveOrder()` - Check if order is active
- `getStatusPriority()` - Get status priority for sorting

## Constants

### ORDER_CONSTANTS

- Pagination defaults (page, limit, max limit)
- Order number format
- Business rules (max items, length limits)
- Time limits

### ORDER_MESSAGES

Success and error messages organized by category:

```typescript
ORDER_MESSAGES.SUCCESS.ORDER_CREATED
ORDER_MESSAGES.ERROR.ORDER_NOT_FOUND
```

### KITCHEN_MESSAGES

Kitchen-specific messages:

```typescript
KITCHEN_MESSAGES.SUCCESS.ORDER_READY
KITCHEN_MESSAGES.ERROR.ORDER_NOT_FOUND
```

## Order Status Flow

```
pending → confirmed → preparing → ready → serving → completed
    ↓         ↓           ↓
cancelled cancelled  cancelled
```

## Usage Examples

### Creating an Order

```typescript
const createOrderDto = {
    tableId: 1,
    partySize: 4,
    customerName: 'John Doe',
    customerPhone: '0901234567',
    notes: 'Birthday celebration',
    items: [
        {
            itemId: 1,
            quantity: 2,
            specialRequest: 'No onions',
        },
        {
            itemId: 5,
            quantity: 1,
        },
    ],
};

const order = await orderService.createOrder(createOrderDto, staffId);
```

### Adding Items to Order

```typescript
const addItemsDto = {
    items: [
        {
            itemId: 3,
            quantity: 1,
            specialRequest: 'Extra spicy',
        },
    ],
};

const updatedOrder = await orderService.addItemsToOrder(orderId, addItemsDto);
```

### Kitchen Workflow

```typescript
// Get kitchen queue
const queue = await kitchenService.getKitchenQueue();

// Mark order as ready
const readyOrder = await kitchenService.markOrderAsReady(
    kitchenOrderId,
    staffId,
);

// Mark as completed (picked up)
const completedOrder = await kitchenService.markOrderAsCompleted(
    kitchenOrderId,
);
```

## WebSocket Events

The module emits real-time events via WebSocket:

- `order:created` - New order created
- `order:updated` - Order updated
- `order:cancelled` - Order cancelled
- `kitchen:order_done` - Kitchen order ready

## Validation Rules

- **Party size**: Minimum 1
- **Quantity**: Minimum 1 per item
- **Special request**: Max 500 characters
- **Cancellation reason**: Max 500 characters, required
- **Notes**: Max 1000 characters
- **Items**: At least 1 item required for new order

## Error Handling

All errors use custom exceptions with clear, actionable messages:

```typescript
try {
    await orderService.createOrder(data, staffId);
} catch (error) {
    if (error instanceof TableOccupiedException) {
        // Handle table occupied
    } else if (error instanceof MenuItemNotFoundException) {
        // Handle menu item not found
    }
}
```

## Best Practices

1. **Always use constants** for messages and configuration
2. **Use custom exceptions** for better error context
3. **Validate status transitions** before updating
4. **Check business rules** (bill exists, order status) before modifications
5. **Use helper functions** for reusable logic
6. **Emit WebSocket events** for real-time updates
7. **Include proper validation** in DTOs
8. **Log important operations** for debugging

## Performance Considerations

- Repository uses optimized Prisma queries with selective includes
- Pagination supported on all list endpoints
- Database indexes on frequently queried fields (tableId, staffId, status)
- Transactions used for atomic operations

## Future Enhancements

- [ ] Order scheduling/pre-ordering
- [ ] Order splitting (multiple bills)
- [ ] Order merging (combine tables)
- [ ] Kitchen printer integration
- [ ] Order timeline/history tracking
- [ ] Advanced analytics and reporting
