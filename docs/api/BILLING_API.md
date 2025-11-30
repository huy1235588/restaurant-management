# Billing API Documentation

## Overview

API để quản lý hóa đơn và thanh toán trong hệ thống nhà hàng.

**Base URL**: `/api/bills`

**Authentication**: Bearer Token (JWT) required for all endpoints

**Authorization (RBAC)**:
| Endpoint | Roles Allowed |
|----------|---------------|
| GET /bills | admin, manager, waiter, cashier |
| GET /bills/:id | admin, manager, waiter, cashier |
| POST /bills | admin, manager, waiter, cashier |
| PATCH /bills/:id/discount | admin, manager |
| POST /bills/:id/payment | admin, manager, cashier |
| DELETE /bills/:id | admin |

---

## Endpoints

### 1. Get All Bills

Lấy danh sách tất cả hóa đơn với phân trang và filters.

**Endpoint**: `GET /bills`

**Query Parameters**:
```typescript
{
  page?: number;           // Default: 1
  limit?: number;          // Default: 20, Max: 100
  paymentStatus?: 'pending' | 'paid' | 'refunded' | 'cancelled';
  startDate?: string;      // ISO 8601 format
  endDate?: string;        // ISO 8601 format
  tableId?: number;
  staffId?: number;
}
```

**Response**: `200 OK`
```typescript
{
  data: Bill[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }
}

interface Bill {
  billId: number;
  billNumber: string;        // e.g., "BILL-00000123"
  orderId: number;
  tableId: number;
  staffId: number | null;
  subtotal: number;          // Decimal
  taxAmount: number;         // Decimal
  taxRate: number;           // Decimal (0.1 = 10%)
  serviceCharge: number;     // Decimal
  discountAmount: number;    // Decimal
  totalAmount: number;       // Decimal
  paidAmount: number;        // Decimal
  changeAmount: number;      // Decimal
  paymentStatus: 'pending' | 'paid' | 'refunded' | 'cancelled';
  paymentMethod: 'cash' | 'card' | 'e-wallet' | 'transfer' | null;
  notes: string | null;
  paidAt: string | null;     // ISO 8601
  createdAt: string;         // ISO 8601
  updatedAt: string;         // ISO 8601
  
  // Relations
  order: Order;
  table: RestaurantTable;
  staff: Staff | null;
  billItems: BillItem[];
  payments: Payment[];
}
```

**Example**:
```bash
GET /bills?page=1&limit=20&paymentStatus=pending
```

---

### 2. Get Bill by ID

Lấy chi tiết một hóa đơn theo ID.

**Endpoint**: `GET /bills/:id`

**Parameters**:
- `id` (number, required): Bill ID

**Response**: `200 OK`
```typescript
{
  billId: number;
  billNumber: string;
  // ... (same as above)
  billItems: BillItem[];
  payments: Payment[];
}

interface BillItem {
  billItemId: number;
  billId: number;
  itemId: number;
  itemName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  discount: number;
  total: number;
  menuItem: MenuItem;
}

interface Payment {
  paymentId: number;
  billId: number;
  paymentMethod: 'cash' | 'card' | 'e-wallet' | 'transfer';
  amount: number;
  transactionId: string | null;
  cardNumber: string | null;
  cardHolderName: string | null;
  notes: string | null;
  status: 'pending' | 'paid' | 'refunded' | 'cancelled';
  createdAt: string;
}
```

**Errors**:
- `404 Not Found`: Bill not found

**Example**:
```bash
GET /bills/123
```

---

### 3. Create Bill from Order

Tạo hóa đơn mới từ order.

**Endpoint**: `POST /bills`

**Request Body**:
```typescript
{
  orderId: number;  // Required
}
```

**Response**: `201 Created`
```typescript
{
  billId: number;
  billNumber: string;
  orderId: number;
  tableId: number;
  subtotal: number;
  taxAmount: number;
  taxRate: number;
  serviceCharge: number;
  totalAmount: number;
  paymentStatus: 'pending';
  // ... full bill object
}
```

**Errors**:
- `400 Bad Request`: 
  - Order not ready for billing
  - Bill already exists for order
- `404 Not Found`: Order not found

**Example**:
```typescript
// Request
POST /bills
{
  "orderId": 123
}

// Response
{
  "billId": 456,
  "billNumber": "BILL-00000456",
  "orderId": 123,
  "tableId": 5,
  "subtotal": 200000,
  "taxAmount": 20000,      // 10% tax
  "taxRate": 0.1,
  "serviceCharge": 10000,  // 5% service
  "discountAmount": 0,
  "totalAmount": 230000,
  "paymentStatus": "pending",
  "createdAt": "2024-11-23T10:30:00Z"
}
```

---

### 4. Apply Discount

Áp dụng giảm giá cho hóa đơn.

**Endpoint**: `PATCH /bills/:id/discount`

**Parameters**:
- `id` (number, required): Bill ID

**Request Body** (Option 1 - Amount):
```typescript
{
  amount: number;      // Required if no percentage
  reason: string;      // Required, max 500 chars
}
```

**Request Body** (Option 2 - Percentage):
```typescript
{
  percentage: number;  // Required if no amount (0-100)
  reason: string;      // Required, max 500 chars
}
```

**Response**: `200 OK`
```typescript
{
  billId: number;
  discountAmount: number;     // Calculated discount
  totalAmount: number;        // Recalculated total
  notes: string;              // Updated with discount reason
  // ... full bill object
}
```

**Errors**:
- `400 Bad Request`:
  - Bill not pending
  - Invalid discount amount
  - Discount exceeds subtotal
  - Invalid percentage (not 0-100)
- `403 Forbidden`: Manager approval required (discount > 10%)
- `404 Not Found`: Bill not found

**Business Rules**:
- Can only apply discount to bills with `paymentStatus: 'pending'`
- Discount amount must be between 0 and subtotal
- Discount percentage must be between 0 and 100
- Discount > 10% triggers warning log (may require manager approval in production)

**Example**:
```typescript
// Amount-based discount
PATCH /bills/456/discount
{
  "amount": 50000,
  "reason": "VIP customer discount"
}

// Percentage-based discount
PATCH /bills/456/discount
{
  "percentage": 15,
  "reason": "Promotional discount"
}

// Response
{
  "billId": 456,
  "subtotal": 200000,
  "discountAmount": 30000,    // 15% of 200000
  "totalAmount": 200000,      // 200000 + 20000 + 10000 - 30000
  "notes": "Discount applied: Promotional discount"
}
```

---

### 5. Process Payment

Xử lý thanh toán cho hóa đơn.

**Endpoint**: `POST /bills/:id/payment`

**Parameters**:
- `id` (number, required): Bill ID

**Request Body** (Cash):
```typescript
{
  amount: number;              // Must equal totalAmount
  paymentMethod: 'cash';
  notes?: string;              // Optional
}
```

**Request Body** (Card):
```typescript
{
  amount: number;              // Must equal totalAmount
  paymentMethod: 'card';
  cardNumber?: string;         // Last 4 digits, e.g., "**** 1234"
  cardHolderName?: string;
  transactionId?: string;
  notes?: string;
}
```

**Request Body** (E-wallet / Transfer):
```typescript
{
  amount: number;              // Must equal totalAmount
  paymentMethod: 'e-wallet' | 'transfer';
  transactionId?: string;
  notes?: string;
}
```

**Response**: `200 OK`
```typescript
{
  payment: {
    paymentId: number;
    billId: number;
    paymentMethod: string;
    amount: number;
    transactionId: string | null;
    cardNumber: string | null;
    cardHolderName: string | null;
    status: 'paid';
    createdAt: string;
  },
  bill: {
    billId: number;
    paidAmount: number;
    changeAmount: number;       // For cash payments
    paymentStatus: 'paid';
    paymentMethod: string;
    paidAt: string;
    // ... full bill object with relations
  }
}
```

**Side Effects**:
- Bill status → `paid`
- Order status → `completed`
- Table status → `available`
- Payment record created

**Errors**:
- `400 Bad Request`:
  - Bill not pending
  - Payment amount mismatch
  - Invalid payment method
- `404 Not Found`: Bill not found

**Business Rules**:
- Payment amount MUST equal bill total amount (no partial payments)
- Change is automatically calculated for cash payments
- Bill, order, and table are updated in a transaction

**Example**:
```typescript
// Cash payment
POST /bills/456/payment
{
  "amount": 200000,
  "paymentMethod": "cash"
}

// Response
{
  "payment": {
    "paymentId": 789,
    "billId": 456,
    "paymentMethod": "cash",
    "amount": 200000,
    "status": "paid",
    "createdAt": "2024-11-23T10:45:00Z"
  },
  "bill": {
    "billId": 456,
    "paidAmount": 200000,
    "changeAmount": 0,
    "paymentStatus": "paid",
    "paymentMethod": "cash",
    "paidAt": "2024-11-23T10:45:00Z",
    "order": {
      "orderId": 123,
      "status": "completed",
      "completedAt": "2024-11-23T10:45:00Z"
    },
    "table": {
      "tableId": 5,
      "status": "available"
    }
  }
}
```

---

### 6. Void Bill (Admin Only)

Hủy/xóa hóa đơn (chỉ admin).

**Endpoint**: `DELETE /bills/:id`

**Parameters**:
- `id` (number, required): Bill ID

**Request Body**:
```typescript
{
  reason: string;  // Required
}
```

**Response**: `200 OK`
```typescript
{
  billId: number;
  billNumber: string;
  // ... deleted bill object
}
```

**Side Effects** (if bill was paid):
- Order status → reverted to `ready`
- Table status → reverted to `occupied`
- Payment records deleted
- Bill items deleted
- Bill deleted

**Errors**:
- `403 Forbidden`: Not admin or cannot void paid bill
- `404 Not Found`: Bill not found

**Authorization**: Requires `admin` role

**Example**:
```typescript
DELETE /bills/456
{
  "reason": "Customer complaint - incorrect items"
}
```

---

## Data Models

### Bill Summary Calculation

```typescript
subtotal = sum(orderItems.totalPrice)
taxAmount = subtotal × taxRate (default: 0.1)
serviceCharge = subtotal × serviceRate (default: 0.05)
totalAmount = subtotal + taxAmount + serviceCharge - discountAmount

// For cash payments
changeAmount = paidAmount - totalAmount (if > 0)
```

### Bill Number Format

```
BILL-XXXXXXXX
Example: BILL-00000123
```

### Payment Status Flow

```
pending → paid → (refunded)
   ↓
cancelled
```

---

## Error Responses

### Standard Error Format

```typescript
{
  message: string;           // Error message
  error: string;             // Error type
  statusCode: number;        // HTTP status code
  [key: string]: any;        // Additional context
}
```

### Common Errors

**404 Not Found**:
```typescript
{
  "message": "Bill not found",
  "error": "Bill Not Found",
  "statusCode": 404,
  "billId": 999
}
```

**400 Bad Request** (Bill already exists):
```typescript
{
  "message": "Bill already exists for this order",
  "error": "Bill Already Exists",
  "statusCode": 409,
  "orderId": 123
}
```

**400 Bad Request** (Invalid discount):
```typescript
{
  "message": "Discount amount cannot exceed subtotal",
  "error": "Discount Exceeds Subtotal",
  "statusCode": 400,
  "discountAmount": 250000,
  "subtotal": 200000
}
```

**400 Bad Request** (Payment amount mismatch):
```typescript
{
  "message": "Payment amount must equal total amount",
  "error": "Invalid Payment Amount",
  "statusCode": 400,
  "paymentAmount": 190000,
  "totalAmount": 200000
}
```

---

## Frontend Integration Examples

### React/Next.js Examples

#### 1. Fetch Bills

```typescript
import { useState, useEffect } from 'react';

interface BillsResponse {
  data: Bill[];
  pagination: Pagination;
}

export function useBills(filters?: BillFilters) {
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchBills() {
      const params = new URLSearchParams(filters as any);
      const response = await fetch(`/api/bills?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data: BillsResponse = await response.json();
      setBills(data.data);
      setLoading(false);
    }
    fetchBills();
  }, [filters]);

  return { bills, loading };
}
```

#### 2. Create Bill

```typescript
async function createBill(orderId: number) {
  const response = await fetch('/api/bills', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ orderId }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message);
  }

  return await response.json();
}
```

#### 3. Apply Discount

```typescript
async function applyDiscount(billId: number, discount: {
  amount?: number;
  percentage?: number;
  reason: string;
}) {
  const response = await fetch(`/api/bills/${billId}/discount`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(discount),
  });

  if (!response.ok) {
    const error = await response.json();
    if (error.error === 'Manager Approval Required') {
      // Show manager approval dialog
      return { requiresApproval: true, ...error };
    }
    throw new Error(error.message);
  }

  return await response.json();
}
```

#### 4. Process Payment

```typescript
async function processPayment(billId: number, payment: {
  amount: number;
  paymentMethod: 'cash' | 'card' | 'e-wallet' | 'transfer';
  cardNumber?: string;
  cardHolderName?: string;
  transactionId?: string;
  notes?: string;
}) {
  const response = await fetch(`/api/bills/${billId}/payment`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(payment),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message);
  }

  const result = await response.json();
  
  // Show success message with change amount for cash
  if (payment.paymentMethod === 'cash' && result.bill.changeAmount > 0) {
    console.log(`Change: ${result.bill.changeAmount}`);
  }

  return result;
}
```

#### 5. Complete Bill Flow Component

```typescript
function BillPayment({ orderId }: { orderId: number }) {
  const [bill, setBill] = useState<Bill | null>(null);
  const [loading, setLoading] = useState(false);

  // Step 1: Create bill
  async function handleCreateBill() {
    setLoading(true);
    try {
      const newBill = await createBill(orderId);
      setBill(newBill);
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  }

  // Step 2: Apply discount (optional)
  async function handleApplyDiscount(percentage: number, reason: string) {
    if (!bill) return;
    
    setLoading(true);
    try {
      const updated = await applyDiscount(bill.billId, {
        percentage,
        reason,
      });
      setBill(updated);
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  }

  // Step 3: Process payment
  async function handlePayment(method: PaymentMethod) {
    if (!bill) return;
    
    setLoading(true);
    try {
      const result = await processPayment(bill.billId, {
        amount: bill.totalAmount,
        paymentMethod: method,
      });
      
      // Success - redirect or show receipt
      console.log('Payment successful!', result);
      
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      {!bill ? (
        <button onClick={handleCreateBill} disabled={loading}>
          Create Bill
        </button>
      ) : (
        <div>
          <h3>Bill #{bill.billNumber}</h3>
          <p>Subtotal: {bill.subtotal}</p>
          <p>Tax: {bill.taxAmount}</p>
          <p>Service: {bill.serviceCharge}</p>
          <p>Discount: {bill.discountAmount}</p>
          <p><strong>Total: {bill.totalAmount}</strong></p>
          
          {bill.paymentStatus === 'pending' && (
            <>
              <button onClick={() => handleApplyDiscount(10, 'Customer discount')}>
                Apply 10% Discount
              </button>
              <button onClick={() => handlePayment('cash')}>Pay Cash</button>
              <button onClick={() => handlePayment('card')}>Pay Card</button>
            </>
          )}
          
          {bill.paymentStatus === 'paid' && (
            <p>✅ Paid at {new Date(bill.paidAt!).toLocaleString()}</p>
          )}
        </div>
      )}
    </div>
  );
}
```

---

## Best Practices

### 1. Always Validate Amounts

```typescript
// Check if payment amount matches total
if (paymentAmount !== bill.totalAmount) {
  throw new Error('Payment amount must equal total amount');
}
```

### 2. Handle Change for Cash Payments

```typescript
if (paymentMethod === 'cash') {
  const change = paidAmount - totalAmount;
  if (change > 0) {
    showChangeDialog(change);
  }
}
```

### 3. Manager Approval for Large Discounts

```typescript
if (discountPercentage > 10) {
  // Require manager PIN or approval
  await requestManagerApproval(billId, discountAmount);
}
```

### 4. Transaction Safety

All critical operations (payment processing, bill void) use database transactions to ensure data consistency.

### 5. Error Handling

```typescript
try {
  await processPayment(billId, paymentData);
} catch (error) {
  if (error.statusCode === 400) {
    // Show validation error to user
  } else if (error.statusCode === 403) {
    // Show permission error
  } else {
    // Show generic error
  }
}
```

---

## Rate Limiting

- **Standard**: 100 requests per 15 minutes per user
- **Payment endpoints**: Additional rate limiting may apply

## Testing

### Test Bill Creation

```bash
curl -X POST http://localhost:3000/api/bills \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"orderId": 123}'
```

### Test Discount Application

```bash
curl -X PATCH http://localhost:3000/api/bills/456/discount \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"percentage": 15, "reason": "VIP discount"}'
```

### Test Payment Processing

```bash
curl -X POST http://localhost:3000/api/bills/456/payment \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 200000,
    "paymentMethod": "cash"
  }'
```
