# Order Module - Frontend Documentation

## Overview

Module Order quản lý đơn hàng trong nhà hàng, hỗ trợ toàn bộ quy trình từ tạo đơn → phục vụ → thanh toán.

## Module Structure

```
orders/
├── components/          # Reusable components
│   ├── OrderStatusBadge.tsx
│   ├── OrderItemCard.tsx
│   └── KitchenOrderCard.tsx
├── constants/           # Constants & configurations
│   ├── order.constants.ts
│   └── index.ts
├── dialogs/             # Dialog components
│   ├── CreateOrderDialog.tsx
│   ├── OrderDetailsDialog.tsx
│   ├── AddItemsDialog.tsx
│   ├── CancelOrderDialog.tsx
│   ├── CancelItemDialog.tsx
│   └── InvoicePreviewDialog.tsx
├── hooks/               # Custom hooks
│   ├── useOrders.ts
│   ├── useOrderSocket.ts
│   └── index.ts
├── services/            # API services
│   ├── order.service.ts
│   ├── order-socket.service.ts
│   └── index.ts
├── types/               # TypeScript types
│   ├── order.types.ts
│   └── index.ts
├── utils/               # Utility functions
│   ├── order.utils.ts
│   └── index.ts
├── views/               # Page views
│   ├── OrderListView.tsx
│   ├── KitchenQueueView.tsx
│   └── index.ts
├── index.ts
└── README.md
```

## Order Workflow

### 1. Order Lifecycle

```
PENDING → CONFIRMED → PREPARING → READY → SERVED → COMPLETED → PAID
   ↓
CANCELLED
```

**Status Descriptions:**

- **PENDING**: Đơn hàng mới tạo, chờ xác nhận
- **CONFIRMED**: Đã được nhân viên xác nhận
- **PREPARING**: Bếp đang chuẩn bị món ăn
- **READY**: Món ăn đã sẵn sàng, chờ phục vụ
- **SERVED**: Đã phục vụ món ăn cho khách
- **COMPLETED**: Khách đã dùng xong, chờ thanh toán
- **PAID**: Đã thanh toán xong
- **CANCELLED**: Đơn hàng đã bị hủy

### 2. Order Item Lifecycle

```
PENDING → PREPARING → READY → SERVED
   ↓
CANCELLED
```

## Constants

### Status Labels

```typescript
import { ORDER_STATUS_LABELS, ORDER_ITEM_STATUS_LABELS } from './constants';

// Order status labels
ORDER_STATUS_LABELS[OrderStatus.PENDING] // "Chờ xác nhận"
ORDER_STATUS_LABELS[OrderStatus.CONFIRMED] // "Đã xác nhận"

// Order item status labels
ORDER_ITEM_STATUS_LABELS[OrderItemStatus.PREPARING] // "Đang chuẩn bị"
```

### Status Colors

```typescript
import { ORDER_STATUS_COLORS } from './constants';

// Get color classes for badges
const color = ORDER_STATUS_COLORS[OrderStatus.PENDING];
// "bg-yellow-100 text-yellow-800 border-yellow-300"
```

### Validation Rules

```typescript
import { ORDER_VALIDATION } from './constants';

ORDER_VALIDATION.MIN_PARTY_SIZE // 1
ORDER_VALIDATION.MAX_PARTY_SIZE // 20
ORDER_VALIDATION.MIN_QUANTITY // 1
ORDER_VALIDATION.MAX_QUANTITY // 99
ORDER_VALIDATION.MAX_SPECIAL_REQUEST_LENGTH // 500
ORDER_VALIDATION.MAX_CANCELLATION_REASON_LENGTH // 500
```

### Messages

```typescript
import { ORDER_MESSAGES } from './constants';

// Success messages
ORDER_MESSAGES.SUCCESS.CREATED // "Tạo đơn hàng thành công"
ORDER_MESSAGES.SUCCESS.ITEM_ADDED // "Thêm món thành công"

// Error messages
ORDER_MESSAGES.ERROR.CREATE_FAILED // "Không thể tạo đơn hàng"
ORDER_MESSAGES.ERROR.EMPTY_ITEMS // "Vui lòng chọn ít nhất một món"

// Confirmation messages
ORDER_MESSAGES.CONFIRMATION.CANCEL_ORDER // "Bạn có chắc chắn muốn hủy đơn hàng này?"
```

## Utility Functions

### Status Helpers

```typescript
import { 
    getOrderStatusLabel,
    getOrderStatusColor,
    isOrderEditable,
    canCancelOrder,
    canCancelItem,
    canMarkItemAsServed,
    isOrderInProgress,
    isOrderFinalized,
} from './utils';

// Get status label
const label = getOrderStatusLabel(OrderStatus.PENDING); // "Chờ xác nhận"

// Get status color classes
const color = getOrderStatusColor(OrderStatus.PENDING);

// Check permissions
const editable = isOrderEditable(order.status); // true for pending/confirmed
const canCancel = canCancelOrder(order.status); // true for pending/confirmed
const canCancelThis = canCancelItem(item.status); // true for pending
const canServe = canMarkItemAsServed(item.status); // true for ready

// Check order state
const inProgress = isOrderInProgress(order.status); // true for pending→served
const finalized = isOrderFinalized(order.status); // true for completed/cancelled/paid
```

### Formatting Helpers

```typescript
import {
    formatCurrency,
    formatDateTime,
    formatDate,
    formatTime,
    formatElapsedTime,
    formatOrderNumber,
} from './utils';

// Format currency
formatCurrency(150000); // "150.000 ₫"

// Format date/time
formatDateTime(new Date()); // "22/11/2025, 10:30"
formatDate(new Date()); // "22/11/2025"
formatTime(new Date()); // "10:30"

// Format elapsed time
formatElapsedTime(45); // "45 phút"
formatElapsedTime(125); // "2 giờ 5 phút"

// Format order number
formatOrderNumber(123); // "#000123"
```

### Calculation Helpers

```typescript
import {
    calculateElapsedTime,
    calculateOrderTotal,
    calculateDiscount,
    calculateFinalAmount,
} from './utils';

// Calculate elapsed time
const minutes = calculateElapsedTime(order.createdAt); // 25

// Calculate order total
const total = calculateOrderTotal(order.items); // 250000

// Calculate discount
const discount = calculateDiscount(250000, 10); // 25000 (10%)
const discountFixed = calculateDiscount(250000, undefined, 30000); // 30000

// Calculate final amount
const final = calculateFinalAmount(250000, 10); // 225000
```

### Validation Helpers

```typescript
import { validateOrderItems } from './utils';

const result = validateOrderItems([
    { itemId: 1, quantity: 2 },
    { itemId: 2, quantity: 0 }, // Invalid
]);

if (!result.valid) {
    console.log(result.errors);
    // ["Món thứ 2: Số lượng không hợp lệ"]
}
```

### Waiting Time Helpers

```typescript
import {
    getWaitingTimeAlertLevel,
    getWaitingTimeColor,
    getWaitingTimeBadgeVariant,
} from './utils';

const minutes = 25;

// Get alert level
const level = getWaitingTimeAlertLevel(minutes); // 'warning'

// Get color class
const color = getWaitingTimeColor(minutes); // 'text-yellow-600'

// Get badge variant
const variant = getWaitingTimeBadgeVariant(minutes); // 'secondary'
```

## API Services

### Order API

```typescript
import { orderApi } from './services';

// Get all orders
const response = await orderApi.getAll({
    page: 1,
    limit: 10,
    status: OrderStatus.PENDING,
    tableId: 5,
});

// Get order by ID
const order = await orderApi.getById(123);

// Create new order
const newOrder = await orderApi.create({
    tableId: 5,
    partySize: 4,
    customerName: 'Nguyễn Văn A',
    items: [
        { itemId: 1, quantity: 2 },
        { itemId: 5, quantity: 1, specialRequest: 'Không hành' },
    ],
});

// Add items to order
const updated = await orderApi.addItems(orderId, {
    items: [
        { itemId: 3, quantity: 1 },
    ],
});

// Cancel item
await orderApi.cancelItem(orderId, itemId, {
    reason: 'Khách đổi ý',
});

// Cancel order
await orderApi.cancel(orderId, {
    reason: 'Khách hủy đơn',
});

// Update status
await orderApi.updateStatus(orderId, {
    status: OrderStatus.CONFIRMED,
});

// Mark item as served
await orderApi.markItemAsServed(orderId, itemId);
```

### Kitchen API

```typescript
import { kitchenApi } from './services';

// Get kitchen queue
const queue = await kitchenApi.getQueue();

// Mark kitchen order as ready
const completed = await kitchenApi.markAsReady(kitchenOrderId);
```

## Custom Hooks

### useOrders

```typescript
import { useOrders } from './hooks';

function OrderList() {
    const {
        orders,
        loading,
        error,
        pagination,
        filters,
        setFilters,
        refetch,
        createOrder,
        updateOrder,
        cancelOrder,
    } = useOrders({
        page: 1,
        limit: 10,
        status: OrderStatus.PENDING,
    });

    const handleCreate = async () => {
        await createOrder({
            tableId: 5,
            partySize: 4,
            items: [{ itemId: 1, quantity: 2 }],
        });
    };

    return (
        <div>
            {orders.map(order => (
                <div key={order.orderId}>{order.orderNumber}</div>
            ))}
        </div>
    );
}
```

### useOrderSocket

```typescript
import { useOrderSocket } from './hooks';

function OrderView() {
    const { connected, error } = useOrderSocket({
        onOrderCreated: (order) => {
            console.log('New order:', order);
        },
        onOrderUpdated: (order) => {
            console.log('Order updated:', order);
        },
        onItemUpdated: (item) => {
            console.log('Item updated:', item);
        },
    });

    return <div>Socket: {connected ? 'Connected' : 'Disconnected'}</div>;
}
```

## Components

### OrderStatusBadge

```typescript
import { OrderStatusBadge } from './components';

<OrderStatusBadge status={OrderStatus.PENDING} />
<OrderStatusBadge status={order.status} className="ml-2" />
```

### OrderItemStatusBadge

```typescript
import { OrderItemStatusBadge } from './components';

<OrderItemStatusBadge status={OrderItemStatus.PREPARING} />
```

### KitchenOrderStatusBadge

```typescript
import { KitchenOrderStatusBadge } from './components';

<KitchenOrderStatusBadge status={KitchenOrderStatus.READY} />
```

## Dialogs

### CreateOrderDialog

```typescript
import { CreateOrderDialog } from './dialogs';

<CreateOrderDialog
    open={open}
    onOpenChange={setOpen}
    tableId={5}
    onSuccess={(order) => {
        console.log('Order created:', order);
    }}
/>
```

### OrderDetailsDialog

```typescript
import { OrderDetailsDialog } from './dialogs';

<OrderDetailsDialog
    open={open}
    onOpenChange={setOpen}
    orderId={123}
    onUpdate={() => refetch()}
/>
```

### CancelOrderDialog

```typescript
import { CancelOrderDialog } from './dialogs';

<CancelOrderDialog
    open={open}
    onOpenChange={setOpen}
    order={selectedOrder}
    onSuccess={() => {
        refetch();
    }}
/>
```

## Views

### OrderListView

```typescript
import { OrderListView } from './views';

<OrderListView
    filters={{ status: OrderStatus.PENDING }}
    onOrderSelect={(order) => console.log(order)}
/>
```

### KitchenQueueView

```typescript
import { KitchenQueueView } from './views';

<KitchenQueueView
    onOrderComplete={() => refetch()}
/>
```

## Best Practices

### 1. Use Constants

```typescript
// ❌ Bad
if (order.status === 'pending') { }
const label = 'Chờ xác nhận';

// ✅ Good
import { OrderStatus, ORDER_STATUS_LABELS } from './types';
if (order.status === OrderStatus.PENDING) { }
const label = ORDER_STATUS_LABELS[OrderStatus.PENDING];
```

### 2. Use Utility Functions

```typescript
// ❌ Bad
const canEdit = order.status === 'pending' || order.status === 'confirmed';

// ✅ Good
import { isOrderEditable } from './utils';
const canEdit = isOrderEditable(order.status);
```

### 3. Use Type Safety

```typescript
// ❌ Bad
const order: any = await orderApi.getById(123);

// ✅ Good
import { Order } from './types';
const order: Order = await orderApi.getById(123);
```

### 4. Handle Errors Properly

```typescript
import { ORDER_MESSAGES } from './constants';

try {
    await orderApi.create(data);
    toast.success(ORDER_MESSAGES.SUCCESS.CREATED);
} catch (error) {
    toast.error(ORDER_MESSAGES.ERROR.CREATE_FAILED);
    console.error(error);
}
```

### 5. Validate Before Submit

```typescript
import { validateOrderItems, ORDER_MESSAGES } from './utils';

const handleSubmit = () => {
    const validation = validateOrderItems(items);
    
    if (!validation.valid) {
        validation.errors.forEach(error => toast.error(error));
        return;
    }
    
    // Proceed with submission
};
```

## WebSocket Integration

### Events

```typescript
import { ORDER_SOCKET_EVENTS } from './constants';

// Listen to events
socket.on(ORDER_SOCKET_EVENTS.ORDER_CREATED, (order) => {
    // Handle new order
});

socket.on(ORDER_SOCKET_EVENTS.ORDER_UPDATED, (order) => {
    // Handle order update
});

socket.on(ORDER_SOCKET_EVENTS.ITEM_UPDATED, (item) => {
    // Handle item update
});

socket.on(ORDER_SOCKET_EVENTS.KITCHEN_UPDATED, (kitchen) => {
    // Handle kitchen update
});
```

## Performance Tips

1. **Memoize expensive calculations:**
```typescript
const total = useMemo(() => calculateOrderTotal(order.items), [order.items]);
```

2. **Debounce search/filter:**
```typescript
const debouncedSearch = useMemo(
    () => debounce((value) => setFilters({ search: value }), 300),
    []
);
```

3. **Use pagination for large lists:**
```typescript
const { orders } = useOrders({
    page: currentPage,
    limit: 20, // Don't load too many at once
});
```

## Testing

### Unit Tests

```typescript
import { 
    isOrderEditable, 
    canCancelOrder,
    formatCurrency 
} from './utils';

describe('Order Utils', () => {
    it('should check if order is editable', () => {
        expect(isOrderEditable(OrderStatus.PENDING)).toBe(true);
        expect(isOrderEditable(OrderStatus.COMPLETED)).toBe(false);
    });
    
    it('should format currency correctly', () => {
        expect(formatCurrency(150000)).toBe('150.000 ₫');
    });
});
```

## Migration Guide

If you're migrating from old code:

1. **Replace hardcoded strings with constants:**
```typescript
// Old
const label = 'Chờ xác nhận';

// New
import { ORDER_STATUS_LABELS } from './constants';
const label = ORDER_STATUS_LABELS[OrderStatus.PENDING];
```

2. **Use utility functions:**
```typescript
// Old
const color = order.status === 'pending' 
    ? 'bg-yellow-100 text-yellow-800' 
    : 'bg-gray-100';

// New
import { getOrderStatusColor } from './utils';
const color = getOrderStatusColor(order.status);
```

3. **Use type-safe enums:**
```typescript
// Old
const status: string = 'pending';

// New
import { OrderStatus } from './types';
const status: OrderStatus = OrderStatus.PENDING;
```

## Troubleshooting

### Common Issues

**Issue**: Status colors not showing
```typescript
// Make sure you import from utils, not defining inline
import { getOrderStatusColor } from './utils';
```

**Issue**: Validation not working
```typescript
// Use ORDER_VALIDATION constants
import { ORDER_VALIDATION } from './constants';
if (quantity > ORDER_VALIDATION.MAX_QUANTITY) { }
```

**Issue**: WebSocket not connecting
```typescript
// Check if socket service is initialized
import { useOrderSocket } from './hooks';
const { connected, error } = useOrderSocket({...});
```

## Related Documentation

- [Backend Order API Documentation](../../../server/src/modules/order/README.md)
- [Order Management Use Cases](../../../docs/use_case/ORDER_MANAGEMENT.md)
- [Order Management Diagrams](../../../docs/diagrams/ORDER_MANAGEMENT_DIAGRAMS.md)
