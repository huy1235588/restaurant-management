# Order API Documentation

## Overview

API để quản lý đơn hàng trong nhà hàng, từ tạo đơn đến hoàn thành.

**Base URL**: `/api/orders`

**Authentication**: Bearer Token (JWT) required for all endpoints

**Authorization (RBAC)**:
| Endpoint | Roles Allowed |
|----------|---------------|
| GET /orders | All authenticated users |
| GET /orders/count | All authenticated users |
| GET /orders/:id | All authenticated users |
| POST /orders | admin, manager, waiter |
| PATCH /orders/:id/items | admin, manager, waiter |
| DELETE /orders/:id/items/:itemId | admin, manager, waiter |
| DELETE /orders/:id | admin, manager |
| PATCH /orders/:id/status | admin, manager |
| PATCH /orders/:id/items/:itemId/serve | admin, manager, waiter |

**WebSocket**: Real-time updates available at `/orders` namespace

---

## REST API Endpoints

### 1. Get All Orders

Lấy danh sách tất cả orders với phân trang và filters.

**Endpoint**: `GET /orders`

**Query Parameters**:
```typescript
{
  page?: number;           // Default: 1
  limit?: number;          // Default: 20
  status?: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'serving' | 'completed' | 'cancelled';
  tableId?: number;
  staffId?: number;
  reservationId?: number;
  startDate?: string;      // ISO 8601
  endDate?: string;        // ISO 8601
}
```

**Response**: `200 OK`
```typescript
{
  data: Order[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }
}

interface Order {
  orderId: number;
  orderNumber: string;       // e.g., "ORD-00000123"
  tableId: number;
  staffId: number | null;
  reservationId: number | null;
  status: OrderStatus;
  partySize: number;
  customerName: string | null;
  customerPhone: string | null;
  specialRequest: string | null;
  notes: string | null;
  totalAmount: number;       // Decimal
  createdAt: string;         // ISO 8601
  updatedAt: string;         // ISO 8601
  confirmedAt: string | null;
  completedAt: string | null;
  
  // Relations
  table: {
    tableId: number;
    tableNumber: string;
    floor: number;
    capacity: number;
    status: string;
  };
  staff: {
    staffId: number;
    fullName: string;
    role: string;
  } | null;
  orderItems: OrderItem[];
  reservation: Reservation | null;
  kitchenOrders: KitchenOrder[];
  bill: Bill | null;
}

interface OrderItem {
  orderItemId: number;
  orderId: number;
  itemId: number;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  status: 'active' | 'cancelled';
  specialRequest: string | null;
  servedAt: string | null;
  
  menuItem: {
    itemId: number;
    itemName: string;
    category: string;
    price: number;
    imageUrl: string | null;
  };
}
```

**Example**:
```bash
GET /orders?page=1&limit=20&status=confirmed&tableId=5
```

---

### 2. Count Orders

Đếm số lượng orders theo filters.

**Endpoint**: `GET /orders/count`

**Query Parameters**: (same as Get All Orders)

**Response**: `200 OK`
```typescript
{
  count: number;
}
```

**Example**:
```bash
GET /orders/count?status=pending&tableId=5
```

---

### 3. Get Order by ID

Lấy chi tiết một order.

**Endpoint**: `GET /orders/:id`

**Parameters**:
- `id` (number, required): Order ID

**Response**: `200 OK`
```typescript
{
  orderId: number;
  orderNumber: string;
  // ... full order with all relations
}
```

**Errors**:
- `404 Not Found`: Order not found

**Example**:
```bash
GET /orders/123
```

---

### 4. Create Order

Tạo order mới.

**Endpoint**: `POST /orders`

**Request Body**:
```typescript
{
  tableId: number;               // Required
  partySize: number;             // Required, min: 1
  customerName?: string;         // Optional, max 100 chars
  customerPhone?: string;        // Optional, 10-11 digits
  notes?: string;                // Optional, max 1000 chars
  reservationId?: number;        // Optional
  items: OrderItemInput[];       // Required, min 1 item
}

interface OrderItemInput {
  itemId: number;                // Required
  quantity: number;              // Required, min: 1
  specialRequest?: string;       // Optional, max 500 chars
}
```

**Response**: `201 Created`
```typescript
{
  orderId: number;
  orderNumber: string;
  tableId: number;
  partySize: number;
  status: 'pending';
  totalAmount: number;
  orderItems: OrderItem[];
  // ... full order
}
```

**Side Effects**:
- Table status → `occupied`
- Order items created
- Total amount calculated
- WebSocket event: `order:created`

**Errors**:
- `400 Bad Request`:
  - Invalid party size
  - No items provided
  - Invalid item quantity
- `404 Not Found`: 
  - Table not found
  - Menu item not found
- `409 Conflict`: Table already has active order

**Business Rules**:
- Party size must be >= 1
- At least 1 item required
- Each item quantity must be >= 1
- Menu items must be active and available
- Table cannot have another active order

**Example**:
```typescript
POST /orders
{
  "tableId": 5,
  "partySize": 4,
  "customerName": "Nguyễn Văn A",
  "customerPhone": "0987654321",
  "notes": "Birthday celebration",
  "items": [
    {
      "itemId": 1,
      "quantity": 2,
      "specialRequest": "No onions"
    },
    {
      "itemId": 5,
      "quantity": 1
    }
  ]
}

// Response
{
  "orderId": 123,
  "orderNumber": "ORD-00000123",
  "tableId": 5,
  "partySize": 4,
  "status": "pending",
  "totalAmount": 250000,
  "orderItems": [
    {
      "orderItemId": 456,
      "itemId": 1,
      "quantity": 2,
      "unitPrice": 75000,
      "totalPrice": 150000,
      "status": "active",
      "menuItem": {
        "itemName": "Phở Bò"
      }
    }
  ]
}
```

---

### 5. Add Items to Order

Thêm món vào order đã tồn tại.

**Endpoint**: `PATCH /orders/:id/items`

**Parameters**:
- `id` (number, required): Order ID

**Request Body**:
```typescript
{
  items: OrderItemInput[];  // Required, min 1 item
}
```

**Response**: `200 OK`
```typescript
{
  orderId: number;
  orderNumber: string;
  totalAmount: number;      // Recalculated
  orderItems: OrderItem[];  // All items including new ones
  // ... full order
}
```

**Side Effects**:
- New order items created
- Total amount recalculated
- WebSocket event: `order:updated`

**Errors**:
- `400 Bad Request`:
  - Cannot modify completed order
  - Cannot modify cancelled order
  - Bill already created
- `404 Not Found`: Order or menu item not found

**Business Rules**:
- Can only add items to orders with status: pending, confirmed, preparing, ready, serving
- Cannot add items if bill already exists

**Example**:
```typescript
PATCH /orders/123/items
{
  "items": [
    {
      "itemId": 3,
      "quantity": 1,
      "specialRequest": "Extra spicy"
    }
  ]
}
```

---

### 6. Cancel Order Item

Hủy một món trong order.

**Endpoint**: `DELETE /orders/:id/items/:itemId`

**Parameters**:
- `id` (number, required): Order ID
- `itemId` (number, required): Order Item ID

**Request Body**:
```typescript
{
  reason: string;  // Required, max 500 chars
}
```

**Response**: `200 OK`
```typescript
{
  orderId: number;
  orderNumber: string;
  totalAmount: number;      // Recalculated
  orderItems: OrderItem[];  // Item status → 'cancelled'
  // ... full order
}
```

**Side Effects**:
- Order item status → `cancelled`
- Total amount recalculated (excluding cancelled item)
- WebSocket event: `order:updated`

**Errors**:
- `400 Bad Request`:
  - Cannot modify completed order
  - Cannot modify cancelled order
  - Bill already created
  - Item already cancelled
- `404 Not Found`: Order or order item not found

**Example**:
```typescript
DELETE /orders/123/items/456
{
  "reason": "Customer changed mind"
}
```

---

### 7. Cancel Order

Hủy toàn bộ order.

**Endpoint**: `DELETE /orders/:id`

**Parameters**:
- `id` (number, required): Order ID

**Request Body**:
```typescript
{
  reason: string;  // Required, max 500 chars
}
```

**Response**: `200 OK`
```typescript
{
  orderId: number;
  orderNumber: string;
  status: 'cancelled';
  // ... full order
}
```

**Side Effects**:
- Order status → `cancelled`
- All order items status → `cancelled`
- Table status → `available`
- Kitchen orders cancelled (if any)
- WebSocket event: `order:cancelled`

**Errors**:
- `400 Bad Request`:
  - Cannot cancel completed order
  - Order already cancelled
  - Bill already created
- `404 Not Found`: Order not found

**Example**:
```typescript
DELETE /orders/123
{
  "reason": "Customer left"
}
```

---

### 8. Update Order Status

Cập nhật trạng thái order.

**Endpoint**: `PATCH /orders/:id/status`

**Parameters**:
- `id` (number, required): Order ID

**Request Body**:
```typescript
{
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'serving' | 'completed';
}
```

**Response**: `200 OK`
```typescript
{
  orderId: number;
  orderNumber: string;
  status: string;           // Updated status
  confirmedAt: string | null;
  completedAt: string | null;
  // ... full order
}
```

**Side Effects**:
- Order status updated
- Timestamps updated (confirmedAt, completedAt)
- Kitchen order created (if status → confirmed)
- WebSocket event: `order:updated`

**Errors**:
- `400 Bad Request`:
  - Invalid status transition
  - Order already cancelled
- `404 Not Found`: Order not found

**Valid Status Transitions**:
```
pending → confirmed
confirmed → preparing
preparing → ready
ready → serving
serving → completed

Any non-final state → cancelled
```

**Example**:
```typescript
PATCH /orders/123/status
{
  "status": "confirmed"
}
```

---

### 9. Mark Item as Served

Đánh dấu món đã được phục vụ.

**Endpoint**: `PATCH /orders/:id/items/:itemId/serve`

**Parameters**:
- `id` (number, required): Order ID
- `itemId` (number, required): Order Item ID

**Request Body**: None

**Response**: `200 OK`
```typescript
{
  orderItemId: number;
  orderId: number;
  status: 'active';
  servedAt: string;         // Served timestamp
  // ... full order item
}
```

**Side Effects**:
- Order item servedAt timestamp set
- WebSocket event: `order:updated`

**Errors**:
- `400 Bad Request`:
  - Cannot modify completed order
  - Item already cancelled
- `404 Not Found`: Order or order item not found

**Example**:
```typescript
PATCH /orders/123/items/456/serve
```

---

## WebSocket API

### Connection

**Namespace**: `/orders`

**Connection URL**: `ws://localhost:3000/orders`

**Authentication**: JWT token in connection handshake

```typescript
import { io } from 'socket.io-client';

const socket = io('/orders', {
  auth: {
    token: 'YOUR_JWT_TOKEN'
  }
});
```

---

### Events

#### 1. `order:created`

Được emit khi order mới được tạo.

**Event Data**:
```typescript
{
  orderId: number;
  orderNumber: string;
  tableId: number;
  partySize: number;
  status: 'pending';
  totalAmount: number;
  orderItems: OrderItem[];
  table: {
    tableNumber: string;
    floor: number;
  };
  createdAt: string;
}
```

**Client Handling**:
```typescript
socket.on('order:created', (data) => {
  console.log('New order created:', data);
  addOrderToList(data);
  showNotification(`New order from Table ${data.table.tableNumber}`);
});
```

---

#### 2. `order:updated`

Được emit khi order được cập nhật.

**Event Data**:
```typescript
{
  orderId: number;
  orderNumber: string;
  status: string;
  totalAmount: number;
  orderItems: OrderItem[];
  updatedAt: string;
  // ... full order
}
```

**Client Handling**:
```typescript
socket.on('order:updated', (data) => {
  console.log('Order updated:', data);
  updateOrderInList(data.orderId, data);
});
```

---

#### 3. `order:cancelled`

Được emit khi order bị hủy.

**Event Data**:
```typescript
{
  orderId: number;
  orderNumber: string;
  status: 'cancelled';
  table: {
    tableId: number;
    tableNumber: string;
  };
}
```

**Client Handling**:
```typescript
socket.on('order:cancelled', (data) => {
  console.log('Order cancelled:', data);
  removeOrderFromList(data.orderId);
  showNotification(`Order ${data.orderNumber} cancelled`);
});
```

---

## Data Models

### Order Status Flow

```
pending → confirmed → preparing → ready → serving → completed
   ↓         ↓           ↓          ↓        ↓
cancelled cancelled  cancelled cancelled cancelled
```

**Status Descriptions**:
- `pending`: Chờ xác nhận
- `confirmed`: Đã xác nhận, chuyển bếp
- `preparing`: Đang chuẩn bị (bếp)
- `ready`: Sẵn sàng phục vụ
- `serving`: Đang phục vụ
- `completed`: Hoàn thành
- `cancelled`: Đã hủy

### Order Number Format

```
ORD-XXXXXXXX
Example: ORD-00000123
```

### Total Amount Calculation

```typescript
totalAmount = sum(activeOrderItems.totalPrice)

// Each order item
orderItem.totalPrice = quantity × unitPrice
```

---

## Frontend Integration Examples

### React/Next.js Order Management

```typescript
import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';

export function OrderManagement() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [socket, setSocket] = useState<Socket | null>(null);

  // 1. Initialize WebSocket
  useEffect(() => {
    const token = localStorage.getItem('token');
    const newSocket = io('/orders', {
      auth: { token }
    });

    newSocket.on('order:created', (data) => {
      setOrders(prev => [data, ...prev]);
    });

    newSocket.on('order:updated', (data) => {
      setOrders(prev =>
        prev.map(order =>
          order.orderId === data.orderId ? data : order
        )
      );
    });

    newSocket.on('order:cancelled', (data) => {
      setOrders(prev =>
        prev.filter(order => order.orderId !== data.orderId)
      );
    });

    setSocket(newSocket);
    return () => newSocket.close();
  }, []);

  // 2. Fetch orders
  useEffect(() => {
    async function fetchOrders() {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/orders?status=confirmed', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setOrders(data.data);
    }
    fetchOrders();
  }, []);

  // 3. Create order
  async function createOrder(orderData: CreateOrderDto) {
    const token = localStorage.getItem('token');
    const response = await fetch('/api/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(orderData)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message);
    }

    return await response.json();
  }

  // 4. Update order status
  async function updateStatus(orderId: number, status: string) {
    const token = localStorage.getItem('token');
    await fetch(`/api/orders/${orderId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ status })
    });
  }

  // 5. Add items
  async function addItems(orderId: number, items: OrderItemInput[]) {
    const token = localStorage.getItem('token');
    await fetch(`/api/orders/${orderId}/items`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ items })
    });
  }

  return (
    <div>
      {orders.map(order => (
        <OrderCard
          key={order.orderId}
          order={order}
          onUpdateStatus={updateStatus}
          onAddItems={addItems}
        />
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
  "message": "Order not found",
  "error": "Order Not Found",
  "statusCode": 404,
  "orderId": 999
}
```

**400 Bad Request** (Cannot modify):
```json
{
  "message": "Cannot modify completed order",
  "error": "Cannot Modify Completed Order",
  "statusCode": 400,
  "orderId": 123,
  "status": "completed"
}
```

**409 Conflict** (Table occupied):
```json
{
  "message": "Table already has an active order",
  "error": "Table Occupied",
  "statusCode": 409,
  "tableId": 5,
  "existingOrderNumber": "ORD-00000456"
}
```

---

## Best Practices

### 1. Use WebSocket for Real-time Updates

```typescript
// ✅ Good: Real-time via WebSocket
socket.on('order:updated', updateOrder);

// ❌ Bad: Polling
setInterval(() => fetchOrders(), 5000);
```

### 2. Optimistic Updates

```typescript
async function updateOrderStatus(orderId: number, status: string) {
  // Optimistic update
  setOrders(prev =>
    prev.map(order =>
      order.orderId === orderId ? { ...order, status } : order
    )
  );

  try {
    await fetch(`/api/orders/${orderId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    });
  } catch (error) {
    // Revert on error
    fetchOrders();
  }
}
```

### 3. Handle Connection Loss

```typescript
socket.on('disconnect', () => {
  showReconnectingMessage();
});

socket.on('connect', () => {
  fetchFreshData();
});
```

---

## Testing

### Test Create Order

```bash
curl -X POST http://localhost:3000/api/orders \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "tableId": 5,
    "partySize": 4,
    "items": [
      {"itemId": 1, "quantity": 2}
    ]
  }'
```

### Test Update Status

```bash
curl -X PATCH http://localhost:3000/api/orders/123/status \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status": "confirmed"}'
```
