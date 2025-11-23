# Reservation API Documentation

## Overview

API để quản lý đặt bàn trong nhà hàng, từ book → confirm → seat → complete.

**Base URL**: `/api/reservations`

**Authentication**: Bearer Token (JWT) required for all endpoints

**WebSocket**: Real-time updates available at `/reservations` namespace

---

## Workflow

```
Book → Confirm → Seat → Order → Complete
 ↓       ↓        ↓      ↓
Cancel Cancel  Cancel Cancel
```

**Status Flow**:
1. `pending`: Chờ xác nhận
2. `confirmed`: Đã xác nhận
3. `seated`: Đã xếp chỗ
4. `completed`: Hoàn thành
5. `cancelled`: Đã hủy
6. `no-show`: Khách không đến

---

## REST API Endpoints

### 1. Get All Reservations

Lấy danh sách reservations với phân trang và filters.

**Endpoint**: `GET /reservations`

**Query Parameters**:
```typescript
{
  page?: number;           // Default: 1
  limit?: number;          // Default: 20
  status?: 'pending' | 'confirmed' | 'seated' | 'completed' | 'cancelled' | 'no-show';
  customerId?: number;
  tableId?: number;
  startDate?: string;      // ISO 8601
  endDate?: string;        // ISO 8601
  date?: string;           // Specific date (YYYY-MM-DD)
}
```

**Response**: `200 OK`
```typescript
{
  data: Reservation[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }
}

interface Reservation {
  reservationId: number;
  customerId: number | null;
  tableId: number | null;
  partySize: number;
  reservationDate: string;   // ISO 8601
  reservationTime: string;   // ISO 8601
  status: ReservationStatus;
  specialRequest: string | null;
  notes: string | null;
  customerName: string;
  customerPhone: string;
  customerEmail: string | null;
  depositAmount: number | null;
  depositPaid: boolean;
  createdBy: number | null;
  confirmedBy: number | null;
  seatedBy: number | null;
  createdAt: string;         // ISO 8601
  updatedAt: string;         // ISO 8601
  confirmedAt: string | null;
  seatedAt: string | null;
  completedAt: string | null;
  cancelledAt: string | null;
  
  // Relations
  customer: {
    customerId: number;
    fullName: string;
    phone: string;
    email: string | null;
  } | null;
  table: {
    tableId: number;
    tableNumber: string;
    floor: number;
    capacity: number;
    status: string;
  } | null;
  order: {
    orderId: number;
    orderNumber: string;
    status: string;
    totalAmount: number;
  } | null;
  auditLogs: ReservationAuditLog[];
}

interface ReservationAuditLog {
  logId: number;
  reservationId: number;
  action: string;
  performedBy: number | null;
  oldStatus: string | null;
  newStatus: string | null;
  details: any | null;
  timestamp: string;
  
  staff: {
    staffId: number;
    fullName: string;
    role: string;
  } | null;
}
```

**Example**:
```bash
GET /reservations?page=1&limit=20&status=confirmed&date=2024-01-15
```

---

### 2. Count Reservations

Đếm số lượng reservations theo filters.

**Endpoint**: `GET /reservations/count`

**Query Parameters**: (same as Get All Reservations)

**Response**: `200 OK`
```typescript
{
  count: number;
}
```

**Example**:
```bash
GET /reservations/count?status=pending&date=2024-01-15
```

---

### 3. Check Availability

Kiểm tra bàn có sẵn cho thời gian và số người cụ thể.

**Endpoint**: `GET /reservations/availability`

**Query Parameters**:
```typescript
{
  date: string;            // Required, YYYY-MM-DD
  time: string;            // Required, HH:mm
  partySize: number;       // Required
  duration?: number;       // Optional, minutes (default: 120)
}
```

**Response**: `200 OK`
```typescript
{
  available: boolean;
  tables: {
    tableId: number;
    tableNumber: string;
    floor: number;
    capacity: number;
    status: string;
  }[];
  suggestedTimes?: string[];  // If not available, suggest alternatives
}
```

**Example**:
```bash
GET /reservations/availability?date=2024-01-15&time=19:00&partySize=4
```

---

### 4. Get Reservation by ID

Lấy chi tiết một reservation.

**Endpoint**: `GET /reservations/:id`

**Parameters**:
- `id` (number, required): Reservation ID

**Response**: `200 OK`
```typescript
{
  reservationId: number;
  // ... full reservation with all relations and audit logs
}
```

**Errors**:
- `404 Not Found`: Reservation not found

**Example**:
```bash
GET /reservations/123
```

---

### 5. Create Reservation

Tạo reservation mới.

**Endpoint**: `POST /reservations`

**Request Body**:
```typescript
{
  customerId?: number;           // Optional, if customer exists
  customerName: string;          // Required if no customerId, max 100 chars
  customerPhone: string;         // Required, 10-11 digits
  customerEmail?: string;        // Optional, valid email
  partySize: number;             // Required, min: 1
  reservationDate: string;       // Required, YYYY-MM-DD (future date)
  reservationTime: string;       // Required, HH:mm
  duration?: number;             // Optional, minutes (default: 120)
  specialRequest?: string;       // Optional, max 500 chars
  notes?: string;                // Optional, max 1000 chars
  depositAmount?: number;        // Optional, min: 0
  tableId?: number;              // Optional, auto-assigned if not provided
}
```

**Response**: `201 Created`
```typescript
{
  reservationId: number;
  customerId: number | null;
  customerName: string;
  customerPhone: string;
  partySize: number;
  reservationDate: string;
  reservationTime: string;
  status: 'pending';
  tableId: number | null;        // Assigned table (if available)
  table: Table | null;
  createdAt: string;
  // ... full reservation
}
```

**Side Effects**:
- Customer created (if customerId not provided)
- Table auto-assigned based on availability (if tableId not provided)
- Audit log created: `created`
- WebSocket event: `reservation:created`

**Errors**:
- `400 Bad Request`:
  - Invalid phone number
  - Invalid email
  - Invalid party size
  - Invalid date (past date)
  - Invalid time format
- `404 Not Found`: 
  - Customer not found
  - Table not found
- `409 Conflict`: 
  - Table not available at requested time
  - Customer has conflicting reservation

**Business Rules**:
- Reservation must be for future date/time
- Party size must be >= 1
- Customer phone required
- Default duration: 2 hours (120 minutes)
- Table auto-assigned if not specified
- Grace period: 15 minutes after reservation time

**Example**:
```typescript
POST /reservations
{
  "customerName": "Nguyễn Văn A",
  "customerPhone": "0987654321",
  "customerEmail": "nguyenvana@example.com",
  "partySize": 4,
  "reservationDate": "2024-01-15",
  "reservationTime": "19:00",
  "specialRequest": "Window seat preferred",
  "depositAmount": 200000
}

// Response
{
  "reservationId": 123,
  "customerId": 456,
  "customerName": "Nguyễn Văn A",
  "customerPhone": "0987654321",
  "partySize": 4,
  "reservationDate": "2024-01-15T00:00:00.000Z",
  "reservationTime": "2024-01-15T19:00:00.000Z",
  "status": "pending",
  "tableId": 5,
  "table": {
    "tableId": 5,
    "tableNumber": "T05",
    "floor": 1,
    "capacity": 4
  },
  "depositAmount": 200000,
  "depositPaid": false
}
```

---

### 6. Update Reservation

Cập nhật thông tin reservation.

**Endpoint**: `PATCH /reservations/:id`

**Parameters**:
- `id` (number, required): Reservation ID

**Request Body**:
```typescript
{
  partySize?: number;
  reservationDate?: string;      // YYYY-MM-DD
  reservationTime?: string;      // HH:mm
  specialRequest?: string;
  notes?: string;
  tableId?: number;
  depositPaid?: boolean;
}
```

**Response**: `200 OK`
```typescript
{
  reservationId: number;
  // ... updated reservation
}
```

**Side Effects**:
- Reservation updated
- Table re-assigned if date/time/partySize changed
- Audit log created: `updated`
- WebSocket event: `reservation:updated`

**Errors**:
- `400 Bad Request`:
  - Cannot modify completed/cancelled reservation
  - Invalid date (past date)
  - Table not available
- `404 Not Found`: Reservation or table not found

**Example**:
```typescript
PATCH /reservations/123
{
  "partySize": 6,
  "specialRequest": "Birthday cake needed"
}
```

---

### 7. Confirm Reservation

Xác nhận reservation (pending → confirmed).

**Endpoint**: `POST /reservations/:id/confirm`

**Parameters**:
- `id` (number, required): Reservation ID

**Request Body**:
```typescript
{
  confirmedBy?: number;          // Staff ID
  depositPaid?: boolean;         // Default: false
}
```

**Response**: `200 OK`
```typescript
{
  reservationId: number;
  status: 'confirmed';
  confirmedBy: number | null;
  confirmedAt: string;
  depositPaid: boolean;
  // ... full reservation
}
```

**Side Effects**:
- Status → `confirmed`
- confirmedAt timestamp set
- confirmedBy set
- Audit log created: `confirmed`
- WebSocket event: `reservation:confirmed`

**Errors**:
- `400 Bad Request`:
  - Reservation not in pending status
  - Already confirmed
- `404 Not Found`: Reservation not found

**Example**:
```typescript
POST /reservations/123/confirm
{
  "confirmedBy": 789,
  "depositPaid": true
}
```

---

### 8. Seat Reservation

Xếp chỗ cho khách (confirmed → seated).

**Endpoint**: `POST /reservations/:id/seat`

**Parameters**:
- `id` (number, required): Reservation ID

**Request Body**:
```typescript
{
  seatedBy?: number;             // Staff ID
  tableId?: number;              // Override assigned table
}
```

**Response**: `200 OK`
```typescript
{
  reservationId: number;
  status: 'seated';
  seatedBy: number | null;
  seatedAt: string;
  tableId: number;
  table: Table;
  // ... full reservation
}
```

**Side Effects**:
- Status → `seated`
- seatedAt timestamp set
- seatedBy set
- Table status → `occupied`
- Audit log created: `seated`
- WebSocket event: `reservation:seated`

**Errors**:
- `400 Bad Request`:
  - Reservation not in confirmed status
  - Already seated
  - Table not available
- `404 Not Found`: Reservation or table not found

**Example**:
```typescript
POST /reservations/123/seat
{
  "seatedBy": 789,
  "tableId": 5
}
```

---

### 9. Create Order from Reservation

Tạo order cho reservation đã seated.

**Endpoint**: `POST /reservations/:id/order`

**Parameters**:
- `id` (number, required): Reservation ID

**Request Body**:
```typescript
{
  items: OrderItemInput[];       // Required, min 1 item
  notes?: string;
}

interface OrderItemInput {
  itemId: number;
  quantity: number;
  specialRequest?: string;
}
```

**Response**: `201 Created`
```typescript
{
  orderId: number;
  orderNumber: string;
  reservationId: number;
  tableId: number;
  partySize: number;
  status: 'pending';
  totalAmount: number;
  orderItems: OrderItem[];
  // ... full order
}
```

**Side Effects**:
- Order created with reservationId link
- Order items created
- Audit log created: `order_created`
- WebSocket event: `reservation:order_created`

**Errors**:
- `400 Bad Request`:
  - Reservation not seated
  - Order already exists for reservation
  - No items provided
- `404 Not Found`: Reservation or menu items not found

**Example**:
```typescript
POST /reservations/123/order
{
  "items": [
    {"itemId": 1, "quantity": 2},
    {"itemId": 5, "quantity": 1}
  ],
  "notes": "Special occasion"
}
```

---

### 10. Complete Reservation

Hoàn thành reservation (seated → completed).

**Endpoint**: `POST /reservations/:id/complete`

**Parameters**:
- `id` (number, required): Reservation ID

**Request Body**: None

**Response**: `200 OK`
```typescript
{
  reservationId: number;
  status: 'completed';
  completedAt: string;
  table: {
    tableId: number;
    status: 'available';     // Table released
  };
  // ... full reservation
}
```

**Side Effects**:
- Status → `completed`
- completedAt timestamp set
- Table status → `available`
- Audit log created: `completed`
- WebSocket event: `reservation:completed`

**Errors**:
- `400 Bad Request`:
  - Reservation not seated
  - Already completed
  - Order not completed (if order exists)
- `404 Not Found`: Reservation not found

**Example**:
```typescript
POST /reservations/123/complete
```

---

### 11. Cancel Reservation

Hủy reservation.

**Endpoint**: `POST /reservations/:id/cancel`

**Parameters**:
- `id` (number, required): Reservation ID

**Request Body**:
```typescript
{
  reason: string;                // Required, max 500 chars
  cancelledBy?: number;          // Staff ID
}
```

**Response**: `200 OK`
```typescript
{
  reservationId: number;
  status: 'cancelled';
  cancelledAt: string;
  notes: string;                 // Reason appended
  // ... full reservation
}
```

**Side Effects**:
- Status → `cancelled`
- cancelledAt timestamp set
- Table released (if assigned)
- Audit log created: `cancelled` with reason
- WebSocket event: `reservation:cancelled`

**Errors**:
- `400 Bad Request`:
  - Cannot cancel completed reservation
  - Already cancelled
  - Order in progress (cannot cancel)
- `404 Not Found`: Reservation not found

**Example**:
```typescript
POST /reservations/123/cancel
{
  "reason": "Customer called to cancel",
  "cancelledBy": 789
}
```

---

### 12. Mark as No-Show

Đánh dấu khách không đến.

**Endpoint**: `POST /reservations/:id/no-show`

**Parameters**:
- `id` (number, required): Reservation ID

**Request Body**:
```typescript
{
  markedBy?: number;             // Staff ID
}
```

**Response**: `200 OK`
```typescript
{
  reservationId: number;
  status: 'no-show';
  // ... full reservation
}
```

**Side Effects**:
- Status → `no-show`
- Table released (if assigned)
- Audit log created: `no_show`
- WebSocket event: `reservation:no_show`

**Errors**:
- `400 Bad Request`:
  - Reservation not in pending/confirmed status
  - Already seated or completed
- `404 Not Found`: Reservation not found

**Business Rules**:
- Can only mark as no-show if:
  - Status is pending or confirmed
  - Current time is past reservation time + grace period (15 min)

**Example**:
```typescript
POST /reservations/123/no-show
{
  "markedBy": 789
}
```

---

## WebSocket API

### Connection

**Namespace**: `/reservations`

**Connection URL**: `ws://localhost:3000/reservations`

**Authentication**: JWT token in connection handshake

```typescript
import { io } from 'socket.io-client';

const socket = io('/reservations', {
  auth: {
    token: 'YOUR_JWT_TOKEN'
  }
});
```

---

### Events

#### 1. `reservation:created`

Được emit khi reservation mới được tạo.

**Event Data**:
```typescript
{
  reservationId: number;
  customerName: string;
  customerPhone: string;
  partySize: number;
  reservationDate: string;
  reservationTime: string;
  status: 'pending';
  tableId: number | null;
  table: Table | null;
  createdAt: string;
}
```

**Client Handling**:
```typescript
socket.on('reservation:created', (data) => {
  console.log('New reservation:', data);
  addReservationToList(data);
  showNotification(
    `New reservation for ${data.partySize} people at ${data.reservationTime}`
  );
});
```

---

#### 2. `reservation:updated`

Được emit khi reservation được cập nhật.

**Event Data**:
```typescript
{
  reservationId: number;
  partySize: number;
  reservationDate: string;
  reservationTime: string;
  status: string;
  tableId: number | null;
  updatedAt: string;
}
```

**Client Handling**:
```typescript
socket.on('reservation:updated', (data) => {
  console.log('Reservation updated:', data);
  updateReservationInList(data.reservationId, data);
});
```

---

#### 3. `reservation:confirmed`

Được emit khi reservation được xác nhận.

**Event Data**:
```typescript
{
  reservationId: number;
  customerName: string;
  status: 'confirmed';
  confirmedAt: string;
  confirmedBy: number | null;
  depositPaid: boolean;
}
```

**Client Handling**:
```typescript
socket.on('reservation:confirmed', (data) => {
  console.log('Reservation confirmed:', data);
  updateReservationStatus(data.reservationId, 'confirmed');
  showNotification(`Reservation for ${data.customerName} confirmed`);
});
```

---

#### 4. `reservation:seated`

Được emit khi khách được xếp chỗ.

**Event Data**:
```typescript
{
  reservationId: number;
  customerName: string;
  status: 'seated';
  seatedAt: string;
  tableId: number;
  table: {
    tableNumber: string;
    floor: number;
  };
}
```

**Client Handling**:
```typescript
socket.on('reservation:seated', (data) => {
  console.log('Customer seated:', data);
  updateReservationStatus(data.reservationId, 'seated');
  updateTableStatus(data.tableId, 'occupied');
  showNotification(
    `${data.customerName} seated at Table ${data.table.tableNumber}`
  );
});
```

---

#### 5. `reservation:completed`

Được emit khi reservation hoàn thành.

**Event Data**:
```typescript
{
  reservationId: number;
  customerName: string;
  status: 'completed';
  completedAt: string;
  tableId: number;
}
```

**Client Handling**:
```typescript
socket.on('reservation:completed', (data) => {
  console.log('Reservation completed:', data);
  moveToCompletedList(data.reservationId);
  updateTableStatus(data.tableId, 'available');
});
```

---

#### 6. `reservation:cancelled`

Được emit khi reservation bị hủy.

**Event Data**:
```typescript
{
  reservationId: number;
  customerName: string;
  status: 'cancelled';
  cancelledAt: string;
  reason: string;
}
```

**Client Handling**:
```typescript
socket.on('reservation:cancelled', (data) => {
  console.log('Reservation cancelled:', data);
  removeReservationFromList(data.reservationId);
  showNotification(
    `Reservation for ${data.customerName} cancelled: ${data.reason}`
  );
});
```

---

## Data Models

### Reservation Status Flow

```
pending → confirmed → seated → completed
   ↓         ↓          ↓
cancelled cancelled cancelled

pending/confirmed → no-show (after grace period)
```

### Grace Period

**Default**: 15 minutes after reservation time

After grace period expires:
- Pending/confirmed reservations can be marked as no-show
- Table is released for walk-ins

### Audit Log Actions

- `created`: Reservation created
- `updated`: Information changed
- `confirmed`: Confirmed by staff
- `seated`: Customer seated
- `order_created`: Order created from reservation
- `completed`: Reservation finished
- `cancelled`: Reservation cancelled (includes reason)
- `no_show`: Customer didn't arrive

---

## Frontend Integration Examples

### React/Next.js Reservation Calendar

```typescript
import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';

export function ReservationCalendar() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [socket, setSocket] = useState<Socket | null>(null);

  // 1. Initialize WebSocket
  useEffect(() => {
    const token = localStorage.getItem('token');
    const newSocket = io('/reservations', {
      auth: { token }
    });

    // Listen to all events
    newSocket.on('reservation:created', (data) => {
      setReservations(prev => [...prev, data]);
    });

    newSocket.on('reservation:updated', (data) => {
      setReservations(prev =>
        prev.map(res =>
          res.reservationId === data.reservationId ? data : res
        )
      );
    });

    newSocket.on('reservation:confirmed', (data) => {
      updateReservationStatus(data.reservationId, 'confirmed');
    });

    newSocket.on('reservation:seated', (data) => {
      updateReservationStatus(data.reservationId, 'seated');
    });

    newSocket.on('reservation:cancelled', (data) => {
      setReservations(prev =>
        prev.filter(res => res.reservationId !== data.reservationId)
      );
    });

    setSocket(newSocket);
    return () => newSocket.close();
  }, []);

  // 2. Fetch reservations for selected date
  useEffect(() => {
    async function fetchReservations() {
      const token = localStorage.getItem('token');
      const dateStr = selectedDate.toISOString().split('T')[0];
      
      const response = await fetch(
        `/api/reservations?date=${dateStr}&status=pending&status=confirmed`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      
      const data = await response.json();
      setReservations(data.data);
    }
    fetchReservations();
  }, [selectedDate]);

  // 3. Check availability
  async function checkAvailability(
    date: string,
    time: string,
    partySize: number
  ) {
    const token = localStorage.getItem('token');
    const response = await fetch(
      `/api/reservations/availability?date=${date}&time=${time}&partySize=${partySize}`,
      { headers: { 'Authorization': `Bearer ${token}` } }
    );
    return await response.json();
  }

  // 4. Create reservation
  async function createReservation(data: CreateReservationDto) {
    const token = localStorage.getItem('token');
    
    const response = await fetch('/api/reservations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message);
    }

    return await response.json();
  }

  // 5. Confirm reservation
  async function confirmReservation(reservationId: number) {
    const token = localStorage.getItem('token');
    await fetch(`/api/reservations/${reservationId}/confirm`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ depositPaid: true })
    });
  }

  // 6. Seat customer
  async function seatCustomer(reservationId: number, tableId: number) {
    const token = localStorage.getItem('token');
    await fetch(`/api/reservations/${reservationId}/seat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ tableId })
    });
  }

  return (
    <div>
      <DatePicker
        selected={selectedDate}
        onChange={setSelectedDate}
      />
      
      <div className="timeline">
        {reservations.map(reservation => (
          <ReservationCard
            key={reservation.reservationId}
            reservation={reservation}
            onConfirm={confirmReservation}
            onSeat={seatCustomer}
          />
        ))}
      </div>
    </div>
  );
}
```

### Availability Checker Component

```typescript
export function AvailabilityChecker() {
  const [availability, setAvailability] = useState<any>(null);

  async function checkAvailability() {
    const token = localStorage.getItem('token');
    const response = await fetch(
      `/api/reservations/availability?` +
      `date=2024-01-15&time=19:00&partySize=4`,
      { headers: { 'Authorization': `Bearer ${token}` } }
    );
    
    const data = await response.json();
    setAvailability(data);
  }

  return (
    <div>
      {availability?.available ? (
        <div>
          <p>Available tables:</p>
          {availability.tables.map(table => (
            <div key={table.tableId}>
              Table {table.tableNumber} (Floor {table.floor})
            </div>
          ))}
        </div>
      ) : (
        <div>
          <p>Not available. Suggested times:</p>
          {availability?.suggestedTimes?.map(time => (
            <button key={time}>{time}</button>
          ))}
        </div>
      )}
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
  "message": "Reservation not found",
  "error": "Reservation Not Found",
  "statusCode": 404,
  "reservationId": 999
}
```

**400 Bad Request** (Invalid status transition):
```json
{
  "message": "Cannot seat reservation that is not confirmed",
  "error": "Invalid Status Transition",
  "statusCode": 400,
  "reservationId": 123,
  "currentStatus": "pending",
  "attemptedAction": "seat"
}
```

**409 Conflict** (Table not available):
```json
{
  "message": "Table not available at requested time",
  "error": "Table Not Available",
  "statusCode": 409,
  "tableId": 5,
  "requestedTime": "2024-01-15T19:00:00.000Z",
  "suggestedTimes": ["18:00", "20:30"]
}
```

---

## Best Practices

### 1. Always Check Availability First

```typescript
// ✅ Good: Check before creating
const availability = await checkAvailability(date, time, partySize);
if (availability.available) {
  await createReservation({ ...data, tableId: availability.tables[0].tableId });
} else {
  showSuggestedTimes(availability.suggestedTimes);
}

// ❌ Bad: Create without checking
await createReservation(data);  // May fail with 409 Conflict
```

### 2. Handle Grace Period

```typescript
function isWithinGracePeriod(reservation: Reservation): boolean {
  const reservationTime = new Date(reservation.reservationTime);
  const gracePeriodEnd = new Date(reservationTime.getTime() + 15 * 60000);
  return new Date() <= gracePeriodEnd;
}

// Show no-show button only after grace period
{!isWithinGracePeriod(reservation) && (
  <button onClick={() => markNoShow(reservation.reservationId)}>
    Mark as No-Show
  </button>
)}
```

### 3. Use WebSocket for Real-time Updates

```typescript
// ✅ Good: Real-time calendar
socket.on('reservation:created', addToCalendar);

// ❌ Bad: Polling
setInterval(() => fetchReservations(), 30000);
```

### 4. Link Reservation to Order

```typescript
// When seating customer, prepare to create order
async function seatAndPrepareOrder(reservationId: number) {
  await seatCustomer(reservationId);
  
  // Show menu and allow adding items
  navigateToMenu({ reservationId });
}

// When ready, create order from reservation
async function createOrderFromReservation(
  reservationId: number,
  items: OrderItemInput[]
) {
  const order = await fetch(`/api/reservations/${reservationId}/order`, {
    method: 'POST',
    body: JSON.stringify({ items })
  });
  
  return order;
}
```

---

## Testing

### Test Create Reservation

```bash
curl -X POST http://localhost:3000/api/reservations \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "customerName": "Nguyễn Văn A",
    "customerPhone": "0987654321",
    "partySize": 4,
    "reservationDate": "2024-01-15",
    "reservationTime": "19:00",
    "depositAmount": 200000
  }'
```

### Test Check Availability

```bash
curl -X GET "http://localhost:3000/api/reservations/availability?date=2024-01-15&time=19:00&partySize=4" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Test Confirm Reservation

```bash
curl -X POST http://localhost:3000/api/reservations/123/confirm \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"depositPaid": true}'
```
