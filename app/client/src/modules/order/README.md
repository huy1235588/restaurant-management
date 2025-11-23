# Order Management Module

## Overview

The Order Management module provides a complete solution for managing restaurant orders from creation to completion. It includes features for creating orders, adding items, tracking status, cancelling items/orders, and real-time updates via WebSocket.

## Features

- ✅ View all orders with pagination and filters
- ✅ Create new orders with multi-step wizard (4 steps)
- ✅ Add items to existing orders
- ✅ Cancel individual items or entire orders
- ✅ Mark items as served
- ✅ Real-time updates via WebSocket
- ✅ Permission-based access control
- ✅ Responsive design (mobile, tablet, desktop)

## Module Structure

```
order/
├── components/          # Reusable UI components
│   ├── OrderCard.tsx
│   ├── OrderItemList.tsx
│   ├── OrderStatusBadge.tsx
│   ├── OrderSummaryCard.tsx
│   ├── OrderTimeline.tsx
│   ├── TableSelector.tsx
│   ├── MenuItemSelector.tsx
│   ├── ShoppingCart.tsx
│   └── StepIndicator.tsx
├── dialogs/            # Modal dialogs
│   ├── CancelItemDialog.tsx
│   └── CancelOrderDialog.tsx
├── views/              # Page-level views
│   ├── OrderListView.tsx
│   ├── CreateOrderView.tsx
│   ├── OrderDetailView.tsx
│   └── EditOrderView.tsx
├── hooks/              # React Query hooks
│   ├── useOrders.ts
│   ├── useOrderById.ts
│   ├── useCreateOrder.ts
│   ├── useAddItems.ts
│   ├── useCancelItem.ts
│   ├── useCancelOrder.ts
│   ├── useMarkItemServed.ts
│   ├── useUpdateOrderStatus.ts
│   └── useOrderSocket.ts
├── services/           # API services
│   └── order.service.ts
├── types/              # TypeScript types
│   └── order.types.ts
└── utils/              # Utilities
    ├── order.utils.ts
    └── order.schemas.ts
```

## Routes

- `/orders` - Order list page
- `/orders/new` - Create new order (multi-step)
- `/orders/[id]` - Order detail page
- `/orders/[id]/edit` - Add items to order

## Usage

### Fetching Orders

```typescript
import { useOrders } from '@/modules/order';

function OrderListPage() {
    const { data, isLoading, error } = useOrders({
        status: 'pending',
        page: 1,
        limit: 20,
    });

    if (isLoading) return <div>Loading...</div>;
    if (error) return <div>Error: {error.message}</div>;

    return (
        <div>
            {data.data.map(order => (
                <OrderCard key={order.orderId} order={order} />
            ))}
        </div>
    );
}
```

### Creating an Order

```typescript
import { useCreateOrder } from '@/modules/order';

function CreateOrderForm() {
    const createOrder = useCreateOrder();

    const handleSubmit = (data) => {
        createOrder.mutate({
            tableId: 1,
            partySize: 4,
            items: [
                { itemId: 1, quantity: 2, specialRequest: 'No onions' },
                { itemId: 2, quantity: 1 },
            ],
        });
    };

    return (
        <form onSubmit={handleSubmit}>
            {/* Form fields */}
        </form>
    );
}
```

### Real-time Updates

```typescript
import { useOrderSocket } from '@/modules/order';

function OrderDetailPage({ orderId }) {
    const { data: order } = useOrderById(orderId);

    // Listen to WebSocket events
    useOrderSocket({
        onOrderUpdated: (event) => {
            if (event.orderId === orderId) {
                console.log('Order updated:', event);
            }
        },
        onKitchenOrderReady: (event) => {
            if (event.orderId === orderId) {
                // Show notification
                toast.success('Order is ready!');
            }
        },
        enableNotifications: true,
        enableSound: true,
    });

    return <div>{/* Order details */}</div>;
}
```

## API Endpoints

All endpoints are defined in `services/order.service.ts`:

- `GET /orders` - Get all orders with filters
- `GET /orders/count` - Get orders count
- `GET /orders/:id` - Get order by ID
- `POST /orders` - Create new order
- `PATCH /orders/:id/items` - Add items to order
- `DELETE /orders/:id/items/:itemId` - Cancel order item
- `DELETE /orders/:id` - Cancel entire order
- `PATCH /orders/:id/status` - Update order status
- `PATCH /orders/:id/items/:itemId/serve` - Mark item as served

## WebSocket Events

- `order:created` - New order created
- `order:updated` - Order modified
- `order:status-changed` - Status updated
- `order:items-added` - Items added to order
- `order:item-cancelled` - Item cancelled
- `order:cancelled` - Order cancelled
- `kitchen:order-ready` - Kitchen finished cooking

## Utilities

### Formatting

```typescript
import {
    formatOrderNumber,
    formatCurrency,
    formatDateTime,
    getRelativeTime,
} from '@/modules/order';

formatOrderNumber('uuid-1234'); // "ORD-UUID-123"
formatCurrency(150000); // "150.000 ₫"
formatDateTime('2024-01-01T10:00:00'); // "01/01/2024 10:00"
getRelativeTime('2024-01-01T10:00:00'); // "5 minutes ago"
```

### Status Colors

```typescript
import { getOrderStatusColor, getOrderStatusLabel } from '@/modules/order';

getOrderStatusColor('confirmed'); // "bg-blue-100 text-blue-800"
getOrderStatusLabel('confirmed'); // "Confirmed"
```

### Validation

```typescript
import {
    canCancelOrder,
    canAddItems,
    canCancelOrderItem,
    canMarkItemServed,
} from '@/modules/order';

canCancelOrder(order); // true/false
canAddItems(order); // true/false
canCancelOrderItem(item); // true/false
canMarkItemServed(item); // true/false
```

## Permissions

- `orders.read` - View orders
- `orders.create` - Create orders
- `orders.update` - Modify orders (add items, mark served)
- `orders.delete` - Cancel orders/items

## Testing

```bash
# Run tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run coverage
npm test -- --coverage
```

## Dependencies

- React Query (@tanstack/react-query) - Server state management
- Socket.io-client - Real-time WebSocket communication
- React Hook Form - Form management
- Zod - Schema validation
- Sonner - Toast notifications
- Radix UI - UI components

## Contributing

1. Follow the existing code structure
2. Add TypeScript types for all new interfaces
3. Write tests for new functionality
4. Update this README when adding new features

## License

Proprietary - Restaurant Management System
