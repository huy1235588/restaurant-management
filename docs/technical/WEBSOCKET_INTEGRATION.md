# WebSocket Integration - Order & Kitchen Management

## Overview

Real-time bidirectional communication between clients (Waiters, Kitchen Staff, Customer Displays) and server for instant updates on order status, kitchen operations, and notifications.

## Architecture

```
┌─────────────┐         ┌─────────────┐         ┌─────────────┐
│   Waiter    │◄───────►│   Server    │◄───────►│   Kitchen   │
│     App     │  Socket │  Socket.IO  │  Socket │  Display    │
└─────────────┘         └─────────────┘         └─────────────┘
       │                       │                       │
       └───────────────────────┴───────────────────────┘
                    Real-time Events
```

## Rooms Structure

### 1. Kitchen Room (`kitchen`)
- **Members**: All kitchen staff, chefs, KDS displays
- **Purpose**: Receive new orders, cancellation requests, priority updates
- **Events**: `order:new`, `order:confirmed`, `order:cancel_request`, etc.

### 2. Waiters Room (`waiters`)
- **Members**: All waiters, servers, order management apps
- **Purpose**: Receive order updates, kitchen status changes, ready notifications
- **Events**: `kitchen:order_ready`, `kitchen:cancel_accepted`, `order:created`, etc.

### 3. Table Room (`table:{tableId}`)
- **Members**: Table displays, customer apps for specific table
- **Purpose**: Show order status to customers at their table
- **Events**: `order:created`, `order:status`, `kitchen:preparing`, `kitchen:ready`

### 4. Order Room (`order:{orderId}`)
- **Members**: Order detail views, tracking screens
- **Purpose**: Real-time updates for specific order
- **Events**: `order:status_changed`, `order:items_added`, `kitchen:acknowledged`

## Event Flow

### Order Creation Flow
```
Waiter creates order
    │
    ├─► Server processes
    │       │
    │       ├─► Emit to Kitchen: order:new
    │       ├─► Emit to Table: order:created
    │       └─► Emit to Waiters: order:created
    │
    └─► Kitchen receives notification
```

### Order Status Update Flow
```
Kitchen updates status (e.g., "preparing" → "ready")
    │
    ├─► Server processes
    │       │
    │       ├─► Emit to Kitchen: kitchen:order_ready
    │       ├─► Emit to Table: kitchen:ready
    │       ├─► Emit to Waiters: kitchen:order_ready
    │       └─► Emit to Order room: kitchen:ready
    │
    └─► Waiter receives notification to serve
```

### Cancellation Flow
```
Waiter requests cancellation
    │
    ├─► Emit to Kitchen: order:cancel_request
    │
Kitchen decides (accept/reject)
    │
    ├─► If ACCEPT:
    │       ├─► Emit to Waiters: kitchen:cancel_accepted
    │       └─► Emit to Order room: kitchen:cancel_accepted
    │
    └─► If REJECT:
            ├─► Emit to Waiters: kitchen:cancel_rejected
            └─► Emit to Order room: kitchen:cancel_rejected (with reason)
```

## Implementation

### Server-Side (Express + Socket.IO)

```typescript
// In order.service.ts
import socketService from '@/shared/utils/socket';

async createOrder(data: CreateOrderDTO, staffId?: number) {
    const order = await orderRepository.create(orderData, orderItems);
    
    // Emit WebSocket event
    socketService.emitNewOrder(order.orderId, order.tableId, {
        orderNumber: order.orderNumber,
        status: order.status,
        items: order.orderItems,
    });
    
    return order;
}
```

### Client-Side (React/Next.js)

```typescript
import OrderSocketClient from '@/lib/socket-client';

// Initialize in component
const socketClient = new OrderSocketClient();

useEffect(() => {
    socketClient.connect('http://localhost:8000', authToken);
    socketClient.joinWaitersRoom();
    
    // Listen for ready orders
    socketClient.onKitchenOrderReady((data) => {
        showNotification(`Order #${data.orderId} is ready!`);
        playSound('order-ready.mp3');
        updateOrdersList(data);
    });
    
    return () => {
        socketClient.disconnect();
    };
}, []);
```

## Order Management Events

### `order:created`
**Trigger**: New order created by waiter  
**Sent to**: Kitchen, Waiters, Table  
**Payload**:
```typescript
{
    orderId: number;
    tableId: number;
    orderNumber: string;
    status: string;
    totalAmount: number;
    finalAmount: number;
    items: OrderItem[];
}
```

### `order:confirmed`
**Trigger**: Order status → 'confirmed'  
**Sent to**: Kitchen, Waiters, Table  
**Payload**:
```typescript
{
    orderId: number;
    tableId: number;
    orderNumber: string;
    confirmedAt: Date;
}
```

### `order:status_changed`
**Trigger**: Order status updated  
**Sent to**: Kitchen, Waiters, Table, Order room  
**Payload**:
```typescript
{
    orderId: number;
    tableId?: number;
    status: string;
}
```

### `order:items_added`
**Trigger**: New items added to existing order  
**Sent to**: Kitchen, Table, Order room  
**Payload**:
```typescript
{
    orderId: number;
    tableId: number;
    items: OrderItem[];
    newTotalAmount: number;
    newFinalAmount: number;
}
```

### `order:item_status_changed`
**Trigger**: Individual item status changes  
**Sent to**: Table, Waiters, Order room  
**Payload**:
```typescript
{
    orderId: number;
    itemId: number;
    status: 'pending' | 'preparing' | 'ready' | 'served' | 'cancelled';
}
```

### `order:cancel_request`
**Trigger**: Waiter requests cancellation  
**Sent to**: Kitchen, Order room  
**Payload**:
```typescript
{
    orderId: number;
    tableId: number;
    reason: string;
    staffId?: number;
}
```

### `order:cancelled`
**Trigger**: Order cancelled (accepted by kitchen)  
**Sent to**: Kitchen, Table, Waiters, Order room  
**Payload**:
```typescript
{
    orderId: number;
    tableId: number;
    reason: string;
}
```

## Kitchen Management Events

### `kitchen:order_acknowledged`
**Trigger**: Chef acknowledges order  
**Sent to**: Kitchen, Waiters, Order room  
**Payload**:
```typescript
{
    kitchenOrderId: number;
    orderId: number;
    chefId: number;
    chefName: string;
}
```

### `kitchen:order_preparing`
**Trigger**: Chef starts preparing  
**Sent to**: Kitchen, Table, Waiters  
**Payload**:
```typescript
{
    kitchenOrderId: number;
    orderId: number;
    tableId: number;
}
```

### `kitchen:order_ready`
**Trigger**: Order ready for serving  
**Sent to**: Kitchen, Table, Waiters, Order room  
**Payload**:
```typescript
{
    kitchenOrderId: number;
    orderId: number;
    tableId: number;
}
```
**UI Action**: Show notification, play sound, highlight order in waiter app

### `kitchen:order_completed`
**Trigger**: Order fully completed  
**Sent to**: Kitchen, Table, Waiters  
**Payload**:
```typescript
{
    kitchenOrderId: number;
    orderId: number;
    tableId: number;
    prepTime: number; // in minutes
}
```

### `kitchen:cancel_accepted`
**Trigger**: Kitchen accepts cancellation  
**Sent to**: Kitchen, Waiters, Order room  
**Payload**:
```typescript
{
    kitchenOrderId: number;
    orderId: number;
    tableId: number;
}
```

### `kitchen:cancel_rejected`
**Trigger**: Kitchen rejects cancellation  
**Sent to**: Kitchen, Waiters, Order room  
**Payload**:
```typescript
{
    kitchenOrderId: number;
    orderId: number;
    tableId: number;
    reason: string;
}
```

### `kitchen:priority_changed`
**Trigger**: Order priority updated  
**Sent to**: Kitchen  
**Payload**:
```typescript
{
    kitchenOrderId: number;
    orderId: number;
    priority: 'normal' | 'express' | 'vip';
}
```

### `kitchen:station_assigned`
**Trigger**: Order assigned to station  
**Sent to**: Kitchen  
**Payload**:
```typescript
{
    kitchenOrderId: number;
    orderId: number;
    stationId: number;
    stationName: string;
}
```

### `kitchen:stats_update`
**Trigger**: Kitchen statistics change  
**Sent to**: Kitchen  
**Payload**:
```typescript
{
    pending: number;
    preparing: number;
    ready: number;
    total: number;
}
```

## Best Practices

### 1. Error Handling
```typescript
socketClient.getSocket()?.on('error', (error) => {
    console.error('Socket error:', error);
    showErrorNotification('Connection lost. Reconnecting...');
});
```

### 2. Reconnection Logic
```typescript
socketClient.getSocket()?.on('reconnect', (attemptNumber) => {
    console.log('Reconnected after', attemptNumber, 'attempts');
    // Re-join rooms
    socketClient.joinWaitersRoom();
    // Refresh data
    fetchLatestOrders();
});
```

### 3. Memory Management
```typescript
useEffect(() => {
    // Setup listeners
    socketClient.onKitchenOrderReady(handleOrderReady);
    
    return () => {
        // Cleanup
        socketClient.offKitchenOrderReady();
        socketClient.leaveWaitersRoom();
    };
}, []);
```

### 4. Authentication
```typescript
// Send token during connection
const socket = io('http://localhost:8000', {
    auth: { token: localStorage.getItem('authToken') }
});

// Server validates token
io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (isValidToken(token)) {
        next();
    } else {
        next(new Error('Authentication error'));
    }
});
```

## Testing

### Manual Testing with Socket.IO Client
```bash
npm install -g socket.io-client-tool

# Connect to server
socli connect http://localhost:8000

# Join kitchen room
socli emit join:kitchen

# Listen for events
socli on order:new
```

### Automated Testing
```typescript
describe('WebSocket Events', () => {
    it('should emit order:created event', (done) => {
        const clientSocket = io('http://localhost:8000');
        
        clientSocket.on('order:created', (data) => {
            expect(data.orderId).toBeDefined();
            done();
        });
        
        // Trigger order creation
        createOrder(orderData);
    });
});
```

## Performance Considerations

1. **Room Management**: Only join rooms needed for current view
2. **Event Throttling**: Debounce high-frequency events (stats updates)
3. **Payload Size**: Send minimal data, fetch details via REST if needed
4. **Connection Pooling**: Reuse socket connection across components
5. **Graceful Degradation**: Fall back to polling if WebSocket fails

## Security

1. **Authentication**: Validate JWT token on connection
2. **Authorization**: Check room access permissions
3. **Rate Limiting**: Prevent event spam
4. **Data Validation**: Sanitize all event payloads
5. **CORS**: Configure allowed origins properly

## Monitoring

Track these metrics:
- Active connections count
- Events emitted per second
- Average latency
- Reconnection rate
- Error rate

```typescript
// Server monitoring
socketService.getIO().engine.clientsCount // Active connections
```

## Documentation Links

- [Socket.IO Server API](https://socket.io/docs/v4/server-api/)
- [Socket.IO Client API](https://socket.io/docs/v4/client-api/)
- [Rooms Documentation](https://socket.io/docs/v4/rooms/)
- [Event Types](./socket-events.types.ts)
- [Client Helper](../utils/socket-client.helper.ts)
