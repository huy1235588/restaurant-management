# Socket Services

Modular WebSocket services for real-time communication.

## Structure

```
socket/
├── base.ts                 # Base socket service with core functionality
├── order.socket.ts         # Order-specific socket events
├── kitchen.socket.ts       # Kitchen-specific socket events
├── table.socket.ts         # Table-specific socket events
└── index.ts               # Central export
```

## Usage

### Basic Connection

```typescript
import { baseSocketService } from '@/lib/socket';

// Connect with authentication token
baseSocketService.connect(accessToken);

// Check connection status
const isConnected = baseSocketService.isConnected();

// Disconnect
baseSocketService.disconnect();

// Join/leave rooms
baseSocketService.joinRoom('waiters');
baseSocketService.leaveRoom('waiters');
```

### Order Socket Events

```typescript
import { orderSocketService } from '@/lib/socket';

// Connect first
orderSocketService.connect(accessToken);

// Listen to events
orderSocketService.onOrderCreated((order) => {
    console.log('New order:', order);
});

orderSocketService.onOrderStatusChanged((data) => {
    console.log('Order status changed:', data);
});

orderSocketService.onOrderConfirmed((data) => {
    console.log('Order sent to kitchen:', data);
});

// Remove listeners
const handleOrderCreated = (order) => console.log(order);
orderSocketService.onOrderCreated(handleOrderCreated);
orderSocketService.offOrderCreated(handleOrderCreated);
```

### Kitchen Socket Events

```typescript
import { kitchenSocketService } from '@/lib/socket';

// Connect first
kitchenSocketService.connect(accessToken);

// Listen to events
kitchenSocketService.onKitchenOrderReceived((order) => {
    console.log('New kitchen order:', order);
    // Play audio alert
});

kitchenSocketService.onKitchenOrderReady((data) => {
    console.log('Order ready:', data);
});

kitchenSocketService.onKitchenStatusChanged((data) => {
    console.log('Kitchen status changed:', data);
});

kitchenSocketService.onKitchenChefAssigned((data) => {
    console.log('Chef assigned:', data);
});
```

### Table Socket Events

```typescript
import { tableSocketService } from '@/lib/socket';

// Connect first
tableSocketService.connect(accessToken);

// Listen to events
tableSocketService.onTableStatusChanged((table) => {
    console.log('Table status changed:', table);
});

tableSocketService.onTableOccupied((table) => {
    console.log('Table occupied:', table);
});

tableSocketService.onTableFreed((table) => {
    console.log('Table freed:', table);
});
```

### Using with React Context

```typescript
import { useSocket } from '@/contexts/SocketContext';

function MyComponent() {
    const { orderSocket, kitchenSocket, tableSocket, isConnected } = useSocket();
    
    useEffect(() => {
        if (!isConnected) return;
        
        const handleOrderCreated = (order) => {
            console.log('New order:', order);
        };
        
        orderSocket.onOrderCreated(handleOrderCreated);
        
        return () => {
            orderSocket.offOrderCreated(handleOrderCreated);
        };
    }, [isConnected, orderSocket]);
    
    return <div>Connected: {isConnected ? '✅' : '❌'}</div>;
}
```

### Using with Hooks

```typescript
import { useOrderSocket } from '@/features/orders/hooks';
import { useKitchenSocket } from '@/features/kitchen/hooks';

function WaiterApp() {
    // Automatically listens to all order and kitchen events
    // Integrates with React Query for cache updates
    useOrderSocket(true);
    
    return <OrderList />;
}

function KitchenApp() {
    // Automatically listens to all kitchen and order events
    // Plays audio alerts, shows notifications
    useKitchenSocket(true);
    
    return <KitchenDisplay />;
}
```

## Available Events

### Order Events
- `order:created` - New order created
- `order:updated` - Order updated
- `order:status-changed` - Order status changed
- `order:confirmed` - Order confirmed and sent to kitchen
- `order:item_added` - Items added to order
- `order:item_status_changed` - Order item status changed
- `order:cancel_request` - Cancel request from waiter

### Kitchen Events
- `kitchen:order-received` - New order received in kitchen
- `kitchen:order-updated` - Kitchen order updated
- `kitchen:order_ready` - Order ready for pickup
- `kitchen:item_ready` - Single item ready
- `kitchen:cancel_accepted` - Cancellation accepted
- `kitchen:cancel_rejected` - Cancellation rejected
- `kitchen:status_changed` - Kitchen order status changed
- `kitchen:chef_assigned` - Chef assigned to order
- `kitchen:station_assigned` - Station assigned to order
- `kitchen:priority_changed` - Order priority changed

### Table Events
- `table:status-changed` - Table status changed
- `table:occupied` - Table occupied
- `table:freed` - Table freed

## Architecture

### Base Socket Service
- Manages Socket.io connection
- Handles authentication
- Provides core methods: connect, disconnect, emit, addEventListener, removeEventListener
- Manages reconnection logic

### Specialized Services
Each service extends `BaseSocketService` and provides:
- Typed event listeners (e.g., `onOrderCreated`, `onKitchenOrderReady`)
- Typed event removers (e.g., `offOrderCreated`, `offKitchenOrderReady`)
- Domain-specific functionality

### Singleton Pattern
All services are exported as singleton instances to ensure:
- Single WebSocket connection
- Consistent state across application
- Memory efficiency

## Migration from Old Socket

Old code:
```typescript
import { socketService } from '@/lib/socket';

socketService.onOrderCreated(callback);
socketService.onKitchenOrderReceived(callback);
socketService.onTableStatusChanged(callback);
```

New code:
```typescript
import { orderSocketService, kitchenSocketService, tableSocketService } from '@/lib/socket';

orderSocketService.onOrderCreated(callback);
kitchenSocketService.onKitchenOrderReceived(callback);
tableSocketService.onTableStatusChanged(callback);
```

Or use context:
```typescript
const { orderSocket, kitchenSocket, tableSocket } = useSocket();

orderSocket.onOrderCreated(callback);
kitchenSocket.onKitchenOrderReceived(callback);
tableSocket.onTableStatusChanged(callback);
```

## Best Practices

1. **Always connect before listening**: Ensure socket is connected before adding event listeners
2. **Clean up listeners**: Always remove event listeners in cleanup functions (useEffect return)
3. **Use typed methods**: Use specific methods like `onOrderCreated` instead of generic `addEventListener`
4. **Handle reconnection**: Services automatically reconnect, but ensure your UI handles connection state
5. **Join appropriate rooms**: Join 'waiters', 'kitchen', or specific order rooms for targeted updates
6. **Use hooks when possible**: Use `useOrderSocket` and `useKitchenSocket` for automatic integration with React Query

## Environment Variables

```env
NEXT_PUBLIC_SOCKET_URL=http://localhost:3001
```

If not set, defaults to `http://localhost:3001`.
