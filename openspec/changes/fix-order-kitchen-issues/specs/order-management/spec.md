## MODIFIED Requirements

### Requirement: Order Status Transition Validation
The system SHALL validate order status transitions to prevent invalid state changes.

**Valid Transitions**:
- `pending` → `confirmed`, `cancelled`
- `confirmed` → `preparing`, `cancelled`
- `preparing` → `ready`, `cancelled`
- `ready` → `serving`, `cancelled`
- `serving` → `completed`

#### Scenario: Successful valid transition
- **GIVEN** an order with status `pending`
- **WHEN** updating status to `confirmed`
- **THEN** status update succeeds
- **AND** `confirmedAt` timestamp is recorded
- **AND** kitchen order is automatically created

#### Scenario: Invalid transition rejected
- **GIVEN** an order with status `pending`
- **WHEN** attempting to update status to `serving`
- **THEN** request is rejected with validation error
- **AND** error message indicates invalid transition from `pending` to `serving`

#### Scenario: Cannot modify completed order
- **GIVEN** an order with status `completed`
- **WHEN** attempting to add or remove items
- **THEN** request is rejected
- **AND** error indicates order is completed

#### Scenario: Cannot modify serving order
- **GIVEN** an order with status `serving`
- **WHEN** attempting to add new items
- **THEN** request is rejected
- **AND** error indicates order is being served

### Requirement: Kitchen Order Trigger on Confirmation
The system SHALL automatically create kitchen order when order status changes to confirmed.

#### Scenario: Kitchen order created on confirm
- **GIVEN** an order with status `pending`
- **WHEN** staff updates order status to `confirmed`
- **THEN** a kitchen order is automatically created
- **AND** kitchen order has status `pending`
- **AND** kitchen order priority is set based on order type or defaults to `normal`
- **AND** WebSocket event `order:confirmed` is emitted to `/kitchen` namespace

#### Scenario: No kitchen order for pending orders
- **GIVEN** creating a new order
- **WHEN** order remains in `pending` status
- **THEN** no kitchen order is created
- **AND** bếp không nhận được notification

### Requirement: Order WebSocket Events
The system SHALL emit real-time WebSocket events for order lifecycle changes.

**Event Structure**:
```typescript
{
    event: string;        // Event name
    data: OrderEventData; // Order data
    timestamp: string;    // ISO 8601 timestamp
    source: 'order';      // Event source
}
```

**Event Names**:
- `order:created` - New order created
- `order:confirmed` - Order confirmed, sent to kitchen
- `order:updated` - Order details updated
- `order:cancelled` - Order cancelled

#### Scenario: Order created event
- **GIVEN** creating a new order
- **WHEN** order is successfully saved
- **THEN** `order:created` event is emitted to `/orders` namespace
- **AND** event data includes full order details
- **AND** event includes ISO timestamp

#### Scenario: Order confirmed event
- **GIVEN** an order with status `pending`
- **WHEN** status updates to `confirmed`
- **THEN** `order:confirmed` event is emitted to both `/orders` and `/kitchen` namespaces
- **AND** kitchen staff receive notification
- **AND** event triggers kitchen order creation

#### Scenario: Clients in specific rooms receive events
- **GIVEN** waiter connected to room `waiter:${staffId}`
- **AND** order assigned to this waiter
- **WHEN** `order:updated` event is emitted
- **THEN** waiter receives the event
- **AND** other waiters do not receive it

### Requirement: Order Financial Type Safety
The system SHALL use string type for financial fields to match Prisma Decimal serialization.

**Frontend Types**:
```typescript
interface Order {
    totalAmount: string;      // Prisma Decimal → JSON string
    discountAmount: string;
    taxAmount: string;
    finalAmount: string;
}
```

#### Scenario: Financial fields serialized as strings
- **GIVEN** backend Order with Prisma Decimal fields
- **WHEN** serializing to JSON for API response
- **THEN** Decimal values are converted to strings
- **AND** precision is maintained (e.g., "150000.00")

#### Scenario: Frontend calculations use helper
- **GIVEN** order with `totalAmount: "150000.00"`
- **WHEN** frontend needs to calculate with this value
- **THEN** use `parseDecimal(order.totalAmount)` helper
- **AND** helper returns `number` type for calculations
- **AND** calculations are accurate

### Requirement: Order Item Validation
The system SHALL validate order items to ensure data integrity.

#### Scenario: Quantity validation
- **GIVEN** adding item to order
- **WHEN** quantity is less than 1 or greater than 99
- **THEN** validation fails
- **AND** error message indicates valid range (1-99)

#### Scenario: Special request length limit
- **GIVEN** adding item with special request
- **WHEN** special request exceeds 200 characters
- **THEN** validation fails
- **AND** error indicates maximum length

### Requirement: Customer Information Validation
The system SHALL validate customer information with appropriate constraints.

#### Scenario: Phone number format validation
- **GIVEN** entering customer phone number
- **WHEN** phone number does not match pattern `/^[0-9]{10,11}$/`
- **THEN** validation error is shown immediately
- **AND** form submission is prevented
- **AND** error message shows expected format

#### Scenario: Party size validation
- **GIVEN** entering party size
- **WHEN** value is less than 1 or greater than 50
- **THEN** validation fails
- **AND** error indicates valid range (1-50)

#### Scenario: Special requests length limit
- **GIVEN** entering special requests for order
- **WHEN** text exceeds 500 characters
- **THEN** validation fails
- **AND** character counter shows remaining characters

## ADDED Requirements

### Requirement: Order WebSocket Namespace Connection
The system SHALL connect Order module frontend to correct `/orders` WebSocket namespace.

#### Scenario: Frontend connects to orders namespace
- **GIVEN** Order module component mounting
- **WHEN** `useOrderSocket()` hook initializes
- **THEN** Socket.io connects to `${SOCKET_URL}/orders`
- **AND** connection is established with server
- **AND** connection status is `connected`

#### Scenario: Singleton socket instance
- **GIVEN** multiple components using `useOrderSocket()`
- **WHEN** components mount and unmount
- **THEN** only one socket connection is created
- **AND** socket is shared across components
- **AND** socket is cleaned up when last component unmounts

### Requirement: Order Error Handling
The system SHALL provide consistent error handling across order operations.

#### Scenario: API error displayed to user
- **GIVEN** creating an order
- **WHEN** API returns error (e.g., table already occupied)
- **THEN** error interceptor catches the error
- **AND** toast notification shows error message
- **AND** error message is user-friendly

#### Scenario: Mutation retry on network failure
- **GIVEN** submitting order mutation
- **WHEN** network request fails temporarily
- **THEN** mutation retries once automatically
- **AND** user sees loading state during retry
- **AND** success/error shown after retry

#### Scenario: Error boundary catches component errors
- **GIVEN** error occurs in Order view component
- **WHEN** error is thrown during render
- **THEN** ErrorBoundary catches the error
- **AND** fallback UI is displayed
- **AND** error is logged to console

### Requirement: Order Performance Optimization
The system SHALL optimize order list rendering and data fetching.

#### Scenario: Debounced localStorage saves
- **GIVEN** user editing order draft
- **WHEN** order data changes (add item, update quantity)
- **THEN** localStorage save is debounced by 1000ms
- **AND** save only occurs once after user stops editing
- **AND** prevents excessive localStorage writes

#### Scenario: Debounced query invalidation
- **GIVEN** receiving `order:updated` WebSocket event
- **WHEN** multiple events arrive in quick succession
- **THEN** query invalidation is debounced by 500ms
- **AND** API is called only once after events stop
- **AND** prevents excessive refetching
