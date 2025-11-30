# Kitchen API Documentation

## Overview

API để quản lý hoạt động bếp, xử lý đơn hàng từ khi nhận đến khi hoàn thành.

**Base URL**: `/api/kitchen`

**Authentication**: Bearer Token (JWT) required for all endpoints

**Authorization (RBAC)**:
| Endpoint | Roles Allowed |
|----------|---------------|
| GET /kitchen/orders | admin, manager, chef, waiter |
| GET /kitchen/orders/:id | admin, manager, chef, waiter |
| PATCH /kitchen/orders/:id/start | admin, manager, chef |
| PATCH /kitchen/orders/:id/ready | admin, manager, chef |
| PATCH /kitchen/orders/:id/complete | admin, manager, chef |
| PATCH /kitchen/orders/:id/cancel | admin, manager, chef |

**WebSocket**: Real-time updates available at `/kitchen` namespace

---

## REST API Endpoints

### 1. Get All Kitchen Orders

Lấy danh sách tất cả kitchen orders với filters.

**Endpoint**: `GET /kitchen/orders`

**Query Parameters**:
```typescript
{
  status?: 'pending' | 'ready' | 'completed' | 'cancelled';
  priority?: 'low' | 'normal' | 'high' | 'urgent';
  chefId?: number;
  startDate?: string;     // ISO 8601
  endDate?: string;       // ISO 8601
}
```

**Response**: `200 OK`
```typescript
{
  data: KitchenOrder[];
}

interface KitchenOrder {
  kitchenOrderId: number;
  orderId: number;
  chefId: number | null;
  status: 'pending' | 'ready' | 'completed' | 'cancelled';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  prepTimeEstimate: number | null;    // Minutes
  prepTimeActual: number | null;      // Minutes
  startedAt: string | null;           // ISO 8601
  completedAt: string | null;         // ISO 8601
  createdAt: string;                  // ISO 8601
  updatedAt: string;                  // ISO 8601
  
  // Relations
  order: {
    orderId: number;
    orderNumber: string;
    tableId: number;
    status: string;
    partySize: number;
    specialRequest: string | null;
    orderItems: OrderItem[];
    table: {
      tableId: number;
      tableNumber: string;
      floor: number;
    };
  };
  chef: {
    staffId: number;
    fullName: string;
  } | null;
}

interface OrderItem {
  orderItemId: number;
  itemId: number;
  quantity: number;
  specialRequest: string | null;
  menuItem: {
    itemId: number;
    itemName: string;
    category: string;
    prepTimeEstimate: number;
  };
}
```

**Example**:
```bash
GET /kitchen/orders?status=pending&priority=high
```

---

### 2. Get Kitchen Order by ID

Lấy chi tiết một kitchen order.

**Endpoint**: `GET /kitchen/orders/:id`

**Parameters**:
- `id` (number, required): Kitchen Order ID

**Response**: `200 OK`
```typescript
{
  kitchenOrderId: number;
  orderId: number;
  // ... (same as above with full relations)
}
```

**Errors**:
- `404 Not Found`: Kitchen order not found

**Example**:
```bash
GET /kitchen/orders/123
```

---

### 3. Start Preparing Order

Chef nhận và bắt đầu chuẩn bị order.

**Endpoint**: `PATCH /kitchen/orders/:id/start`

**Parameters**:
- `id` (number, required): Kitchen Order ID

**Request Body**: None (chef ID from JWT token)

**Response**: `200 OK`
```typescript
{
  kitchenOrderId: number;
  orderId: number;
  chefId: number;              // Assigned chef
  status: 'ready';             // Updated status
  startedAt: string;           // Start timestamp
  // ... full kitchen order
}
```

**Side Effects**:
- Kitchen order status → `ready`
- Chef assigned to order
- Start time recorded
- WebSocket event: `kitchen:order_update`

**Errors**:
- `400 Bad Request`: 
  - Order not in pending status
  - Cannot modify completed/cancelled order
- `404 Not Found`: Kitchen order not found

**Business Rules**:
- Can only start orders with `status: 'pending'`
- Chef ID is automatically set from authenticated user

**Example**:
```typescript
PATCH /kitchen/orders/123/start

// Response
{
  "kitchenOrderId": 123,
  "orderId": 456,
  "chefId": 789,
  "status": "ready",
  "priority": "normal",
  "startedAt": "2024-11-23T10:30:00Z",
  "order": {
    "orderNumber": "ORD-00000456",
    "tableId": 5,
    "orderItems": [
      {
        "itemName": "Phở Bò",
        "quantity": 2,
        "specialRequest": "Ít hành"
      }
    ]
  }
}
```

---

### 4. Mark Order as Ready

Đánh dấu order đã chuẩn bị xong, sẵn sàng để phục vụ.

**Endpoint**: `PATCH /kitchen/orders/:id/ready`

**Parameters**:
- `id` (number, required): Kitchen Order ID

**Request Body**: None

**Response**: `200 OK`
```typescript
{
  kitchenOrderId: number;
  orderId: number;
  status: 'ready';
  completedAt: string;         // Completion timestamp
  prepTimeActual: number;      // Calculated prep time in minutes
  // ... full kitchen order
}
```

**Side Effects**:
- Kitchen order status → `ready`
- Main order status → `ready`
- Completion time recorded
- Prep time calculated (completedAt - startedAt)
- WebSocket event: `kitchen:order_ready`

**Errors**:
- `400 Bad Request`:
  - Order already completed
  - Order cancelled
- `404 Not Found`: Kitchen order not found

**Business Rules**:
- Cannot mark cancelled or completed orders as ready
- Prep time is auto-calculated based on startedAt and completedAt

**Example**:
```typescript
PATCH /kitchen/orders/123/ready

// Response
{
  "kitchenOrderId": 123,
  "orderId": 456,
  "status": "ready",
  "startedAt": "2024-11-23T10:30:00Z",
  "completedAt": "2024-11-23T10:50:00Z",
  "prepTimeActual": 20,        // 20 minutes
  "order": {
    "orderNumber": "ORD-00000456",
    "status": "ready"           // Updated to ready
  }
}
```

---

### 5. Mark Order as Completed

Đánh dấu order đã được nhân viên phục vụ lấy đi (picked up).

**Endpoint**: `PATCH /kitchen/orders/:id/complete`

**Parameters**:
- `id` (number, required): Kitchen Order ID

**Request Body**: None

**Response**: `200 OK`
```typescript
{
  kitchenOrderId: number;
  orderId: number;
  status: 'completed';
  // ... full kitchen order
}
```

**Side Effects**:
- Kitchen order status → `completed`
- Main order status → `serving`
- WebSocket event: `kitchen:order_completed`

**Errors**:
- `400 Bad Request`: Can only complete ready orders
- `404 Not Found`: Kitchen order not found

**Business Rules**:
- Can ONLY complete orders with `status: 'ready'`
- This represents waiter picking up the food

**Example**:
```typescript
PATCH /kitchen/orders/123/complete

// Response
{
  "kitchenOrderId": 123,
  "orderId": 456,
  "status": "completed",
  "order": {
    "orderNumber": "ORD-00000456",
    "status": "serving"         // Updated to serving
  }
}
```

---

### 6. Cancel Kitchen Order

Hủy kitchen order.

**Endpoint**: `PATCH /kitchen/orders/:id/cancel`

**Parameters**:
- `id` (number, required): Kitchen Order ID

**Request Body**: None

**Response**: `200 OK`
```typescript
{
  kitchenOrderId: number;
  orderId: number;
  status: 'cancelled';
  // ... full kitchen order
}
```

**Side Effects**:
- Kitchen order status → `cancelled`
- WebSocket event: `kitchen:order_update`

**Errors**:
- `400 Bad Request`:
  - Cannot cancel completed order
  - Order already cancelled
- `404 Not Found`: Kitchen order not found

**Business Rules**:
- Cannot cancel completed orders
- Can cancel pending or ready orders

**Example**:
```typescript
PATCH /kitchen/orders/123/cancel

// Response
{
  "kitchenOrderId": 123,
  "orderId": 456,
  "status": "cancelled"
}
```

---

## WebSocket API

### Connection

**Namespace**: `/kitchen`

**Connection URL**: `ws://localhost:3000/kitchen` (development) or `wss://yourdomain.com/kitchen` (production)

**Authentication**: Send JWT token in connection handshake

```typescript
import { io } from 'socket.io-client';

const socket = io('/kitchen', {
  auth: {
    token: 'YOUR_JWT_TOKEN'
  }
});
```

---

### Events

#### 1. `kitchen:new_order`

Được emit khi có kitchen order mới được tạo.

**Event Data**:
```typescript
{
  kitchenOrderId: number;
  orderId: number;
  status: 'pending';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  createdAt: string;
  order: {
    orderNumber: string;
    tableId: number;
    partySize: number;
    specialRequest: string | null;
    orderItems: OrderItem[];
    table: {
      tableNumber: string;
      floor: number;
    };
  };
}
```

**Client Handling**:
```typescript
socket.on('kitchen:new_order', (data) => {
  console.log('New order received:', data);
  
  // Add to kitchen queue
  addToQueue(data);
  
  // Play notification sound
  playNotificationSound();
  
  // Show toast notification
  showToast(`New order from Table ${data.order.table.tableNumber}`);
});
```

---

#### 2. `kitchen:order_update`

Được emit khi kitchen order được cập nhật (started, cancelled).

**Event Data**:
```typescript
{
  kitchenOrderId: number;
  orderId: number;
  status: 'pending' | 'ready' | 'completed' | 'cancelled';
  chefId: number | null;
  startedAt: string | null;
  updatedAt: string;
  // ... full kitchen order
}
```

**Client Handling**:
```typescript
socket.on('kitchen:order_update', (data) => {
  console.log('Order updated:', data);
  
  // Update order in list
  updateOrderInList(data.kitchenOrderId, data);
  
  // If chef assigned, show notification
  if (data.chefId) {
    showToast(`Order #${data.orderId} claimed by chef`);
  }
});
```

---

#### 3. `kitchen:order_ready`

Được emit khi order đã chuẩn bị xong.

**Event Data**:
```typescript
{
  kitchenOrderId: number;
  orderId: number;
  status: 'ready';
  completedAt: string;
  prepTimeActual: number;      // Minutes
  order: {
    orderNumber: string;
    tableId: number;
    table: {
      tableNumber: string;
    };
  };
}
```

**Client Handling**:
```typescript
socket.on('kitchen:order_ready', (data) => {
  console.log('Order ready for pickup:', data);
  
  // Move to ready area
  moveToReadyArea(data);
  
  // Notify waiters
  notifyWaiters(`Order for Table ${data.order.table.tableNumber} is ready!`);
  
  // Play completion sound
  playCompletionSound();
  
  // Show prep time
  if (data.prepTimeActual > 30) {
    console.warn(`Slow preparation: ${data.prepTimeActual} minutes`);
  }
});
```

---

#### 4. `kitchen:order_completed`

Được emit khi order đã được waiter lấy đi.

**Event Data**:
```typescript
{
  kitchenOrderId: number;
  orderId: number;
  status: 'completed';
  order: {
    orderNumber: string;
    status: 'serving';
  };
}
```

**Client Handling**:
```typescript
socket.on('kitchen:order_completed', (data) => {
  console.log('Order picked up:', data);
  
  // Remove from display
  removeFromDisplay(data.kitchenOrderId);
  
  // Update stats
  updateCompletionStats();
});
```

---

### Connection Events

#### `connect`

```typescript
socket.on('connect', () => {
  console.log('Connected to kitchen');
  setConnectionStatus('connected');
});
```

#### `disconnect`

```typescript
socket.on('disconnect', () => {
  console.log('Disconnected from kitchen');
  setConnectionStatus('disconnected');
  
  // Show reconnection message
  showToast('Kitchen connection lost. Reconnecting...');
});
```

#### `error`

```typescript
socket.on('error', (error) => {
  console.error('Socket error:', error);
  showErrorToast('Kitchen connection error');
});
```

---

## Data Models

### Kitchen Order Status Flow

```
pending → ready → completed
   ↓
cancelled
```

**Status Descriptions**:
- `pending`: Chờ chef nhận
- `ready`: Đã chuẩn bị xong, sẵn sàng lấy
- `completed`: Đã được waiter lấy đi
- `cancelled`: Đã hủy

### Priority Levels

```typescript
type Priority = 'low' | 'normal' | 'high' | 'urgent';

// Priority weights (for sorting)
urgent: 4   // VIP orders, complaints
high: 3     // Large parties, time-sensitive
normal: 2   // Standard orders (default)
low: 1      // Pre-orders, non-urgent
```

### Prep Time Calculation

```typescript
prepTimeActual = completedAt - startedAt (in minutes)

// Performance indicators
fast: < 10 minutes
on-time: 10-30 minutes
slow: > 30 minutes
```

---

## Frontend Integration Examples

### React/Next.js Kitchen Display

```typescript
import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

interface KitchenOrder {
  kitchenOrderId: number;
  orderId: number;
  status: 'pending' | 'ready' | 'completed' | 'cancelled';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  order: {
    orderNumber: string;
    table: { tableNumber: string; };
    orderItems: Array<{ itemName: string; quantity: number; }>;
  };
}

export function KitchenDisplay() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [orders, setOrders] = useState<KitchenOrder[]>([]);
  const [connected, setConnected] = useState(false);

  // 1. Initialize WebSocket connection
  useEffect(() => {
    const token = localStorage.getItem('token');
    
    const newSocket = io('/kitchen', {
      auth: { token }
    });

    newSocket.on('connect', () => {
      console.log('Kitchen connected');
      setConnected(true);
    });

    newSocket.on('disconnect', () => {
      console.log('Kitchen disconnected');
      setConnected(false);
    });

    // Listen for new orders
    newSocket.on('kitchen:new_order', (data: KitchenOrder) => {
      setOrders(prev => [...prev, data]);
      playNotificationSound();
    });

    // Listen for order updates
    newSocket.on('kitchen:order_update', (data: KitchenOrder) => {
      setOrders(prev => 
        prev.map(order => 
          order.kitchenOrderId === data.kitchenOrderId 
            ? data 
            : order
        )
      );
    });

    // Listen for ready orders
    newSocket.on('kitchen:order_ready', (data: KitchenOrder) => {
      setOrders(prev =>
        prev.map(order =>
          order.kitchenOrderId === data.kitchenOrderId
            ? data
            : order
        )
      );
      notifyWaiters(data);
    });

    // Listen for completed orders
    newSocket.on('kitchen:order_completed', (data: KitchenOrder) => {
      setOrders(prev =>
        prev.filter(order => order.kitchenOrderId !== data.kitchenOrderId)
      );
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  // 2. Fetch initial orders
  useEffect(() => {
    async function fetchOrders() {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/kitchen/orders?status=pending', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      setOrders(data.data);
    }
    fetchOrders();
  }, []);

  // 3. Start preparing
  async function handleStart(kitchenOrderId: number) {
    const token = localStorage.getItem('token');
    const response = await fetch(`/api/kitchen/orders/${kitchenOrderId}/start`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (response.ok) {
      const updated = await response.json();
      // Update will come via WebSocket
    }
  }

  // 4. Mark as ready
  async function handleReady(kitchenOrderId: number) {
    const token = localStorage.getItem('token');
    const response = await fetch(`/api/kitchen/orders/${kitchenOrderId}/ready`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (response.ok) {
      // Update will come via WebSocket
    }
  }

  // 5. Mark as completed
  async function handleComplete(kitchenOrderId: number) {
    const token = localStorage.getItem('token');
    await fetch(`/api/kitchen/orders/${kitchenOrderId}/complete`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
  }

  // Render
  return (
    <div className="kitchen-display">
      <div className="status-bar">
        <span className={connected ? 'connected' : 'disconnected'}>
          {connected ? '🟢 Connected' : '🔴 Disconnected'}
        </span>
        <span>Orders: {orders.length}</span>
      </div>

      <div className="orders-grid">
        {orders
          .sort((a, b) => {
            // Sort by priority then creation time
            const priorityWeight = { urgent: 4, high: 3, normal: 2, low: 1 };
            return priorityWeight[b.priority] - priorityWeight[a.priority];
          })
          .map(order => (
            <OrderCard
              key={order.kitchenOrderId}
              order={order}
              onStart={() => handleStart(order.kitchenOrderId)}
              onReady={() => handleReady(order.kitchenOrderId)}
              onComplete={() => handleComplete(order.kitchenOrderId)}
            />
          ))}
      </div>
    </div>
  );
}

function OrderCard({ order, onStart, onReady, onComplete }) {
  return (
    <div className={`order-card priority-${order.priority}`}>
      <div className="order-header">
        <h3>{order.order.orderNumber}</h3>
        <span className="table">Table {order.order.table.tableNumber}</span>
        <span className={`priority ${order.priority}`}>{order.priority}</span>
      </div>

      <div className="order-items">
        {order.order.orderItems.map((item, i) => (
          <div key={i}>
            <span>{item.quantity}x</span> {item.itemName}
          </div>
        ))}
      </div>

      <div className="order-actions">
        {order.status === 'pending' && (
          <button onClick={onStart}>Start Preparing</button>
        )}
        {order.status === 'ready' && (
          <>
            <button onClick={onReady}>Mark Ready</button>
            <button onClick={onComplete}>Complete</button>
          </>
        )}
      </div>
    </div>
  );
}
```

### Waiter Notification Component

```typescript
export function WaiterNotifications() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [readyOrders, setReadyOrders] = useState<KitchenOrder[]>([]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const newSocket = io('/kitchen', {
      auth: { token }
    });

    // Listen for ready orders
    newSocket.on('kitchen:order_ready', (data) => {
      setReadyOrders(prev => [...prev, data]);
      
      // Show notification
      showNotification({
        title: 'Order Ready!',
        message: `Table ${data.order.table.tableNumber} - Order ${data.order.orderNumber}`,
        sound: true
      });
    });

    setSocket(newSocket);
    return () => newSocket.close();
  }, []);

  async function handlePickup(kitchenOrderId: number) {
    const token = localStorage.getItem('token');
    await fetch(`/api/kitchen/orders/${kitchenOrderId}/complete`, {
      method: 'PATCH',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    setReadyOrders(prev => 
      prev.filter(order => order.kitchenOrderId !== kitchenOrderId)
    );
  }

  return (
    <div className="waiter-notifications">
      {readyOrders.map(order => (
        <div key={order.kitchenOrderId} className="notification">
          <span>Table {order.order.table.tableNumber} ready!</span>
          <button onClick={() => handlePickup(order.kitchenOrderId)}>
            Picked Up
          </button>
        </div>
      ))}
    </div>
  );
}
```

---

## Error Responses

### Common Errors

**404 Not Found**:
```json
{
  "message": "Kitchen order not found",
  "error": "Kitchen Order Not Found",
  "statusCode": 404,
  "kitchenOrderId": 999
}
```

**400 Bad Request** (Invalid status):
```json
{
  "message": "Can only start preparing pending orders",
  "error": "Kitchen Order Not Pending",
  "statusCode": 400,
  "kitchenOrderId": 123,
  "currentStatus": "completed"
}
```

**400 Bad Request** (Cannot complete):
```json
{
  "message": "Can only complete ready orders",
  "error": "Can Only Complete Ready Orders",
  "statusCode": 400,
  "kitchenOrderId": 123,
  "currentStatus": "pending"
}
```

---

## Best Practices

### 1. Use WebSocket for Real-time Updates

Always use WebSocket events for real-time updates instead of polling:

```typescript
// ❌ Bad: Polling
setInterval(() => fetchOrders(), 5000);

// ✅ Good: WebSocket
socket.on('kitchen:order_update', updateOrders);
```

### 2. Handle Connection Loss

```typescript
socket.on('disconnect', () => {
  showReconnectingMessage();
  // Optionally fetch fresh data when reconnected
});

socket.on('connect', () => {
  fetchFreshData();
});
```

### 3. Sort Orders by Priority

```typescript
const sortedOrders = orders.sort((a, b) => {
  const weights = { urgent: 4, high: 3, normal: 2, low: 1 };
  const priorityDiff = weights[b.priority] - weights[a.priority];
  
  if (priorityDiff !== 0) return priorityDiff;
  
  // Same priority, sort by creation time (older first)
  return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
});
```

### 4. Visual Indicators for Prep Time

```typescript
function getPrepTimeColor(actualTime: number, estimatedTime: number) {
  const ratio = actualTime / estimatedTime;
  if (ratio < 0.8) return 'green';   // Fast
  if (ratio < 1.2) return 'yellow';  // On time
  return 'red';                       // Slow
}
```

### 5. Sound Notifications

```typescript
function playNotificationSound() {
  const audio = new Audio('/sounds/new-order.mp3');
  audio.play();
}

function playCompletionSound() {
  const audio = new Audio('/sounds/order-ready.mp3');
  audio.play();
}
```

---

## Testing

### Test Get Orders

```bash
curl http://localhost:3000/api/kitchen/orders \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Test Start Preparing

```bash
curl -X PATCH http://localhost:3000/api/kitchen/orders/123/start \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Test Mark Ready

```bash
curl -X PATCH http://localhost:3000/api/kitchen/orders/123/ready \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Test WebSocket Connection

```typescript
// In browser console
const socket = io('/kitchen', {
  auth: { token: 'YOUR_TOKEN' }
});

socket.on('connect', () => console.log('Connected!'));
socket.on('kitchen:new_order', (data) => console.log('New order:', data));
```
