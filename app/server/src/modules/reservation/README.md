# Reservation Module Documentation

## Overview

The Reservation Module manages the complete reservation workflow from booking to order creation. It has been optimized with clean architecture, custom exceptions, and helper functions to support the workflow: **Book → Confirm → Seat → Order → Complete**.

## Reservation Workflow

### Complete Flow

```
1. Customer Books Table (pending)
   ↓
2. Staff Confirms Reservation (confirmed)
   ↓
3. Customer Arrives & Seated (seated)
   ↓
4. Staff Creates Order from Reservation
   ↓
5. Customer Finishes Dining (completed)
```

### Alternative Flows

- **Cancel**: From `pending` or `confirmed` → `cancelled`
- **No-Show**: From `confirmed` → `noshow` (if customer doesn't arrive)

## Architecture

### Module Structure

```
reservation/
├── constants/
│   └── reservation.constants.ts      # Constants and messages
├── dto/
│   ├── base.dto.ts                   # Base DTOs
│   ├── create-reservation.dto.ts     # Create reservation
│   ├── update-reservation.dto.ts     # Update reservation
│   ├── cancel-reservation.dto.ts     # Cancel reservation
│   ├── check-availability.dto.ts     # Check table availability
│   └── query-reservation.dto.ts      # Query/filter DTOs
├── exceptions/
│   └── reservation.exceptions.ts     # Custom exceptions
├── helpers/
│   └── reservation.helper.ts         # Utility functions
├── reservation.controller.ts         # HTTP endpoints
├── reservation.service.ts            # Business logic
├── reservation.repository.ts         # Data access
└── reservation.module.ts             # Module definition
```

## API Endpoints

### Main Endpoints

- **GET** `/reservations` - List all reservations (paginated)
- **GET** `/reservations/check-availability` - Check table availability
- **GET** `/reservations/phone/:phone` - Get by phone number
- **GET** `/reservations/code/:code` - Get by reservation code
- **GET** `/reservations/:id` - Get by ID
- **POST** `/reservations` - Create new reservation
- **PUT** `/reservations/:id` - Update reservation
- **PATCH** `/reservations/:id/confirm` - Confirm reservation
- **PATCH** `/reservations/:id/seat` - Mark customer as seated
- **PATCH** `/reservations/:id/complete` - Complete reservation
- **PATCH** `/reservations/:id/no-show` - Mark as no-show
- **POST** `/reservations/:id/create-order` - Create order from reservation
- **DELETE** `/reservations/:id` - Cancel reservation

## Key Features

### 1. Smart Table Assignment

- Auto-assign based on party size
- Prefer customer's preferred table
- Consider floor/section preferences
- Optimize table capacity utilization

### 2. Availability Checking

- Real-time availability check
- Overlap detection with grace periods
- Multiple table support
- Duration-based booking

### 3. Reservation Validation

- **Time Validation**:
    - Minimum 30 minutes in advance
    - Maximum 90 days in advance
    - Future date/time only
- **Party Size**: 1-20 guests
- **Table Capacity**: Match or exceed party size
- **Duplicate Prevention**: Same customer, same time slot

### 4. Status Transitions

Valid transitions enforced:

```
pending     → confirmed, cancelled
confirmed   → seated, cancelled, noshow
seated      → completed
completed   → (final state)
cancelled   → (final state)
noshow      → (final state)
```

### 5. Integration with Order Module

When customer is seated:

- Create order linked to reservation
- Transfer customer info
- Link to reserved table
- Maintain audit trail

## Custom Exceptions

### Reservation Exceptions

- `ReservationNotFoundException` - Reservation not found
- `ReservationAlreadyConfirmedException` - Already confirmed
- `ReservationAlreadyCancelledException` - Already cancelled
- `ReservationAlreadyCompletedException` - Already completed
- `CannotModifyReservationException` - Cannot modify in current status
- `CannotCancelReservationException` - Cannot cancel
- `InvalidStatusTransitionException` - Invalid status change

### Table & Availability Exceptions

- `TableNotAvailableException` - Specific table unavailable
- `TablesNotAvailableException` - Multiple tables unavailable
- `TableOccupiedException` - Table currently occupied

### Validation Exceptions

- `InvalidReservationDateException` - Invalid date/time
- `ReservationTooEarlyException` - Too soon
- `ReservationTooFarException` - Too far in future
- `InvalidPartySizeException` - Invalid party size

### Workflow Exceptions

- `OrderAlreadyExistsException` - Order already created
- `ReservationNotConfirmedException` - Not confirmed yet
- `ReservationNotSeatedException` - Customer not seated
- `DuplicateReservationException` - Duplicate booking

## Helper Functions

### Date/Time Helpers

```typescript
ReservationHelper.combineDateTime(date, time);
ReservationHelper.isFutureDateTime(date, time);
ReservationHelper.isWithinMinAdvanceTime(date, time);
ReservationHelper.isWithinMaxAdvanceTime(date, time);
ReservationHelper.calculateEndTime(date, time, duration);
ReservationHelper.isExpired(date, time);
ReservationHelper.isWithinGracePeriod(date, time);
ReservationHelper.hasReservationTimePassed(date, time);
```

### Validation Helpers

```typescript
ReservationHelper.isValidPartySize(partySize)
ReservationHelper.canModifyReservation(status)
ReservationHelper.canCancelReservation(status)
ReservationHelper.canConfirmReservation(status)
ReservationHelper.canSeatReservation(status)
ReservationHelper.canCreateOrder(status)
ReservationHelper.canCompleteReservation(status)
ReservationHelper.canMarkNoShow(status)
ReservationHelper.isValidStatusTransition(current, new)
```

### Utility Helpers

```typescript
ReservationHelper.formatReservationCode(code);
ReservationHelper.isActiveReservation(status);
ReservationHelper.getStatusPriority(status);
ReservationHelper.getTimeUntilReservation(date, time);
ReservationHelper.isToday(date);
```

## Constants

### Business Rules

```typescript
RESERVATION_CONSTANTS = {
    MIN_ADVANCE_BOOKING_MINUTES: 30,
    MAX_ADVANCE_BOOKING_DAYS: 90,
    DEFAULT_RESERVATION_DURATION_MINUTES: 120,
    GRACE_PERIOD_MINUTES: 15,
    AUTO_CANCEL_NO_SHOW_MINUTES: 30,
    MIN_PARTY_SIZE: 1,
    MAX_PARTY_SIZE: 20,
    MAX_TABLES_PER_RESERVATION: 3,
};
```

### Messages

```typescript
RESERVATION_MESSAGES.SUCCESS.RESERVATION_CREATED;
RESERVATION_MESSAGES.SUCCESS.RESERVATION_CONFIRMED;
RESERVATION_MESSAGES.SUCCESS.RESERVATION_SEATED;
RESERVATION_MESSAGES.SUCCESS.ORDER_CREATED;
RESERVATION_MESSAGES.ERROR.RESERVATION_NOT_FOUND;
RESERVATION_MESSAGES.ERROR.TABLES_NOT_AVAILABLE;
```

## Usage Examples

### 1. Create Reservation

```typescript
const dto = {
    customerName: 'Nguyễn Văn A',
    phoneNumber: '0987654321',
    email: 'customer@example.com',
    reservationDate: '2024-12-25',
    reservationTime: '19:00',
    partySize: 4,
    duration: 120,
    specialRequest: 'Window seat preferred',
};

const reservation = await reservationService.create(dto, staffId);
```

### 2. Confirm Reservation

```typescript
const confirmed = await reservationService.confirm(reservationId, staffId);
```

### 3. Seat Customer

```typescript
const seated = await reservationService.seat(reservationId, staffId);
```

### 4. Create Order from Reservation

```typescript
const createOrderDto = {
    items: [
        { itemId: 1, quantity: 2 },
        { itemId: 5, quantity: 1 },
    ],
};

const order = await reservationService.createOrderFromReservation(
    reservationId,
    createOrderDto,
    staffId,
);
```

### 5. Complete Reservation

```typescript
const completed = await reservationService.complete(reservationId, staffId);
```

### 6. Check Availability

```typescript
const availableTables = await reservationService.checkAvailability({
    date: '2024-12-25T19:00:00Z',
    partySize: 4,
    duration: 120,
    floor: 1,
});
```

## Validation Rules

### Time Constraints

- **Advance Booking**: 30 minutes to 90 days in advance
- **Grace Period**: 15 minutes after reservation time
- **Auto No-Show**: 30 minutes after grace period

### Customer Information

- **Name**: 1-100 characters
- **Phone**: 10-11 digits (required)
- **Email**: Valid format (optional)

### Reservation Details

- **Party Size**: 1-20 guests
- **Duration**: 30-480 minutes (default 120)
- **Special Requests**: Max 500 characters
- **Notes**: Max 1000 characters

## Error Handling

All errors use custom exceptions with clear context:

```typescript
try {
    await reservationService.create(dto, staffId);
} catch (error) {
    if (error instanceof ReservationTooEarlyException) {
        // Handle advance booking time error
    } else if (error instanceof TablesNotAvailableException) {
        // Handle no available tables
    } else if (error instanceof InvalidPartySizeException) {
        // Handle invalid party size
    }
}
```

## Integration Points

### With Order Module

- Creates order when customer seated
- Links reservation to order
- Transfers customer information
- Maintains relationship for tracking

### With Table Module

- Checks table availability
- Updates table status
- Manages table assignments
- Prevents double-booking

### With Customer Module

- Creates/finds customer records
- Links reservations to customers
- Tracks customer history

## Best Practices

1. **Always validate** status before transitions
2. **Use helpers** for date/time operations
3. **Check availability** before confirming
4. **Verify customer arrival** before seating
5. **Create order** only after seating
6. **Maintain audit trail** for all changes
7. **Handle grace periods** for late arrivals
8. **Auto-cancel no-shows** to free tables

## Status Descriptions

| Status      | Description                 | Next Actions                  |
| ----------- | --------------------------- | ----------------------------- |
| `pending`   | Awaiting confirmation       | Confirm or Cancel             |
| `confirmed` | Confirmed by staff          | Seat, Cancel, or Mark No-Show |
| `seated`    | Customer arrived and seated | Create Order, Complete        |
| `completed` | Service finished            | Final state                   |
| `cancelled` | Cancelled                   | Final state                   |
| `noshow`    | Customer didn't arrive      | Final state                   |

## Performance Considerations

- Efficient overlap detection queries
- Indexed fields: `reservationDate`, `status`, `phoneNumber`
- Pagination on all list endpoints
- Caching for table availability
- Batch operations for multiple reservations

## Future Enhancements

- [ ] Reservation reminders (SMS/Email)
- [ ] Waitlist management
- [ ] VIP customer priority
- [ ] Table pre-setting
- [ ] Multi-table reservations
- [ ] Recurring reservations
- [ ] Reservation analytics
- [ ] Online booking integration
