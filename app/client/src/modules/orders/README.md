# Orders Module

## Overview
The Orders module manages restaurant order lifecycle from creation to completion, including item management, order confirmation, and kitchen integration.

## Directory Structure

```
orders/
├── components/              # Reusable UI components
│   ├── index.ts
│   ├── OrderCard.tsx                # Card display for order
│   ├── OrderStatusBadge.tsx         # Status badge component
│   ├── OrderItemList.tsx            # List of order items
│   └── OrderSummary.tsx             # Order total summary
│
├── views/                   # Page-level views
│   ├── index.ts
│   ├── OrderListView.tsx            # Main list view
│   └── OrderDetailsView.tsx         # Order details page
│
├── dialogs/                 # Modal dialogs
│   ├── index.ts
│   └── single/
│       ├── index.ts
│       ├── CreateOrderDialog.tsx    # Create new order
│       └── CancelOrderDialog.tsx    # Cancel order with reason
│
├── services/                # API calls
│   ├── index.ts
│   └── order.service.ts             # Order API client
│
├── hooks/                   # Custom React hooks
│   ├── index.ts
│   └── useOrders.ts                 # Order CRUD hooks
│
├── types/                   # TypeScript types
│   └── index.ts
│
├── utils/                   # Helper functions
│   └── index.ts                     # Formatters and validators
│
├── README.md               # This file
└── index.ts                # Module barrel export
```

## Features

### Order Management
- Create orders for available tables
- Add/remove items to pending orders
- Update item quantities and special requests
- Confirm orders (send to kitchen)
- Cancel orders with reason

### Order States
- **Pending**: Order created, items can be modified
- **Confirmed**: Sent to kitchen, no modifications allowed
- **Ready**: Kitchen completed preparation
- **Serving**: Food being served to customers
- **Completed**: Order finished and paid
- **Cancelled**: Order cancelled with reason

### Components

#### OrderCard
Displays order summary in card format.
- Order number and table
- Customer information
- Item count and total amount
- Status badge
- Quick actions (View, Confirm, Cancel)

#### OrderStatusBadge
Color-coded status indicator.

#### OrderItemList
List of items in an order with:
- Item details and pricing
- Special requests
- Quantity controls (for pending orders)
- Remove item button (for pending orders)

#### OrderSummary
Displays order totals:
- Subtotal
- Tax (10%)
- Total amount

### Views

#### OrderListView
Main view for browsing orders.
- Filter by status
- Grid layout with cards
- Create new order
- Quick actions per order

#### OrderDetailsView
Detailed view of single order.
- Order information
- Item list with editing
- Order summary
- Confirm/Cancel actions

### Dialogs

#### CreateOrderDialog
Create new order form:
- Select available table
- Optional customer info
- Party size

#### CancelOrderDialog
Cancel order with:
- Required cancellation reason (minimum 10 characters)

## API Integration

### Hooks

**useOrders(filters)**
- Fetch orders list with filters
- Pagination support
- Auto-refresh

**useOrder(id)**
- Fetch single order details

**useCreateOrder()**
- Create new order

**useConfirmOrder()**
- Confirm order and send to kitchen

**useCancelOrder()**
- Cancel order with reason

**useAddOrderItem(orderId)**
- Add item to order

**useUpdateOrderItem(orderId)**
- Update item quantity/special request

**useRemoveOrderItem(orderId)**
- Remove item from order

## Usage Examples

### List Orders

```typescript
import { OrderListView } from '@/modules/orders';

export default function OrdersPage() {
  return <OrderListView tables={availableTables} />;
}
```

### Order Details

```typescript
import { OrderDetailsView } from '@/modules/orders';

export default function OrderPage({ params }) {
  return <OrderDetailsView orderId={params.id} />;
}
```

### Create Order

```typescript
import { CreateOrderDialog } from '@/modules/orders';

function MyComponent() {
  const [open, setOpen] = useState(false);
  
  return (
    <>
      <Button onClick={() => setOpen(true)}>New Order</Button>
      <CreateOrderDialog
        open={open}
        onOpenChange={setOpen}
        tables={availableTables}
      />
    </>
  );
}
```

## Business Rules

### Order Creation
- Table must be available
- Only one active order per table

### Item Management
- Items can only be modified in pending status
- Quantity must be > 0
- Price locked at time of adding item

### Order Confirmation
- Order must have at least 1 item
- Creates kitchen order automatically
- No modifications after confirmation

### Order Cancellation
- Only pending/confirmed orders can be cancelled
- Requires cancellation reason (min 10 chars)
- Cannot cancel if kitchen started preparing

## Integration Points

- **Table Module**: Table availability and status updates
- **Menu Module**: Menu items and pricing
- **Kitchen Module**: Kitchen order creation on confirmation
- **Billing Module**: Bill creation from completed orders

## Related Modules

- **Kitchen Module**: Receives confirmed orders
- **Billing Module**: Processes payments
- **Table Module**: Table management

---

**Status**: ✅ Implemented
**Last Updated**: November 22, 2025
