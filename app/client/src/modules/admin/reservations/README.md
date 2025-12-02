# Reservation Module - Frontend Documentation

## Overview

Module Reservation quản lý đặt bàn trong nhà hàng, hỗ trợ toàn bộ quy trình: **Đặt bàn → Xác nhận → Khách đến → Gọi món → Hoàn thành**.

## Module Structure

```
reservations/
├── components/          # Reusable components
│   ├── StatusBadge.tsx
│   ├── ReservationCard.tsx
│   ├── ReservationList.tsx
│   ├── ReservationFilters.tsx
│   └── AuditTimeline.tsx
├── constants/           # Constants & configurations ✨ NEW
│   ├── reservation.constants.ts
│   └── index.ts
├── dialogs/             # Dialog components
│   ├── CreateReservationDialog.tsx
│   ├── ConfirmReservationDialog.tsx
│   ├── CheckInDialog.tsx (Seat customer)
│   ├── CompleteReservationDialog.tsx
│   ├── CancelReservationDialog.tsx
│   └── NoShowDialog.tsx
├── hooks/               # Custom hooks
│   ├── useReservations.ts
│   ├── useReservationActions.ts
│   ├── useTableAvailability.ts
│   └── index.ts
├── services/            # API services
│   └── reservation.service.ts
├── types/               # TypeScript types
│   └── index.ts
├── utils/               # Utility functions ✅ Enhanced
│   └── index.ts
├── views/               # Page views
│   ├── ReservationListView.tsx
│   └── ReservationDetailView.tsx
├── index.ts
└── README.md            # ✨ NEW
```

## Reservation Workflow

### Main Flow: Booking → Arrival → Order → Complete

```
PENDING → CONFIRMED → SEATED → COMPLETED
   ↓           ↓
CANCELLED  NO_SHOW
```

**Critical Workflow for Restaurant:**

1. **PENDING** → Customer books table (online/phone)
2. **CONFIRMED** → Staff confirms reservation
3. **SEATED** → Customer arrives, staff checks in ➡️ **Auto-creates Order**
4. Customer orders food (through Order module)
5. **COMPLETED** → Customer finishes dining

**Status Descriptions:**

- **PENDING**: Đặt bàn mới, chờ nhân viên xác nhận
- **CONFIRMED**: Đã được xác nhận, chờ khách đến
- **SEATED**: Khách đã đến và vào bàn, có thể gọi món
- **COMPLETED**: Khách đã dùng xong và hoàn thành
- **CANCELLED**: Đặt bàn đã bị hủy
- **NO_SHOW**: Khách không đến trong thời gian chờ

### Workflow Transitions

```typescript
import { RESERVATION_WORKFLOW } from './constants';

// Available transitions from each status
RESERVATION_WORKFLOW.TRANSITIONS = {
    pending: ['confirmed', 'cancelled'],
    confirmed: ['seated', 'cancelled', 'no_show'],
    seated: ['completed'],
    completed: [],
    cancelled: [],
    no_show: [],
}

// Available actions per status
RESERVATION_WORKFLOW.ACTIONS = {
    pending: ['confirm', 'cancel', 'edit'],
    confirmed: ['seat', 'cancel', 'mark_no_show', 'edit'],
    seated: ['complete', 'create_order'],
    completed: [],
    cancelled: [],
    no_show: [],
}
```

## Constants

### Status Labels

```typescript
import { RESERVATION_STATUS_LABELS } from './constants';

// Vietnamese labels
RESERVATION_STATUS_LABELS.pending // "Chờ xác nhận"
RESERVATION_STATUS_LABELS.confirmed // "Đã xác nhận"
RESERVATION_STATUS_LABELS.seated // "Đã vào bàn"
```

### Status Colors

```typescript
import { RESERVATION_STATUS_COLORS, RESERVATION_STATUS_GRADIENTS } from './constants';

// Simple colors
const color = RESERVATION_STATUS_COLORS.pending;
// "bg-yellow-100 text-yellow-800 border-yellow-200"

// Gradient colors (for enhanced badges)
const gradient = RESERVATION_STATUS_GRADIENTS.confirmed;
// "bg-gradient-to-r from-blue-50 to-indigo-50..."
```

### Workflow Constants

```typescript
import { RESERVATION_WORKFLOW } from './constants';

RESERVATION_WORKFLOW.GRACE_PERIOD_MINUTES // 15
RESERVATION_WORKFLOW.AUTO_NO_SHOW_MINUTES // 30
RESERVATION_WORKFLOW.MIN_ADVANCE_BOOKING_MINUTES // 30
RESERVATION_WORKFLOW.MAX_ADVANCE_BOOKING_DAYS // 90
RESERVATION_WORKFLOW.DEFAULT_DURATION_MINUTES // 120
```

### Validation Rules

```typescript
import { RESERVATION_VALIDATION } from './constants';

RESERVATION_VALIDATION.MIN_PARTY_SIZE // 1
RESERVATION_VALIDATION.MAX_PARTY_SIZE // 20
RESERVATION_VALIDATION.MIN_CUSTOMER_NAME_LENGTH // 2
RESERVATION_VALIDATION.MAX_CUSTOMER_NAME_LENGTH // 100
RESERVATION_VALIDATION.PHONE_NUMBER_LENGTH // 10
RESERVATION_VALIDATION.MAX_SPECIAL_REQUEST_LENGTH // 500
RESERVATION_VALIDATION.MIN_DURATION_MINUTES // 30
RESERVATION_VALIDATION.MAX_DURATION_MINUTES // 480
```

### Messages

```typescript
import { RESERVATION_MESSAGES } from './constants';

// Success messages
RESERVATION_MESSAGES.SUCCESS.CREATED // "Đặt bàn thành công"
RESERVATION_MESSAGES.SUCCESS.SEATED // "Đã vào bàn thành công"
RESERVATION_MESSAGES.SUCCESS.ORDER_CREATED // "Tạo đơn hàng thành công"

// Error messages
RESERVATION_MESSAGES.ERROR.CREATE_FAILED // "Không thể tạo đặt bàn"
RESERVATION_MESSAGES.ERROR.NO_TABLES_AVAILABLE // "Không có bàn trống vào thời gian này"
RESERVATION_MESSAGES.ERROR.NOT_SEATED // "Chưa vào bàn, không thể tạo đơn"

// Confirmation messages
RESERVATION_MESSAGES.CONFIRMATION.SEAT // "Xác nhận khách đã đến và vào bàn?"
RESERVATION_MESSAGES.CONFIRMATION.CANCEL // "Bạn có chắc chắn muốn hủy đặt bàn này?"

// Info messages
RESERVATION_MESSAGES.INFO.GRACE_PERIOD // "Chờ khách 15 phút"
RESERVATION_MESSAGES.INFO.AUTO_NO_SHOW // "Tự động đánh dấu không đến sau 30 phút"
```

## Utility Functions

### Status Helpers

```typescript
import {
    getStatusText,
    getStatusColor,
    getStatusGradient,
    getNextPossibleStatuses,
    getAvailableActions,
    canEditReservation,
    canCancelReservation,
    canSeatReservation,
    canCompleteReservation,
    canCreateOrder,
    canMarkNoShow,
    isReservationActive,
    isReservationFinalized,
} from './utils';

// Get status text/color
const label = getStatusText(reservation.status); // "Chờ xác nhận"
const color = getStatusColor(reservation.status);
const gradient = getStatusGradient(reservation.status);

// Get workflow info
const nextStatuses = getNextPossibleStatuses(reservation.status);
// ['confirmed', 'cancelled']

const actions = getAvailableActions(reservation.status);
// ['confirm', 'cancel', 'edit']

// Check permissions
const canEdit = canEditReservation(reservation.status); // true for pending/confirmed
const canCancel = canCancelReservation(reservation.status);
const canSeat = canSeatReservation(reservation.status); // true for confirmed
const canComplete = canCompleteReservation(reservation.status); // true for seated
const canOrder = canCreateOrder(reservation.status); // true for seated ⭐
const canNoShow = canMarkNoShow(reservation.status); // true for confirmed

// Check state
const isActive = isReservationActive(reservation.status); // pending, confirmed, seated
const isFinalized = isReservationFinalized(reservation.status); // completed, cancelled, no_show
```

### Time & Date Helpers

```typescript
import {
    combineDateTime,
    formatReservationDateTime,
    formatDate,
    formatTime,
    formatDuration,
    isToday,
    isUpcoming,
    isPast,
    getTimeSlotLabel,
    hasReservationTimePassed,
    isWithinGracePeriod,
    shouldAutoNoShow,
    getMinutesUntilReservation,
    getTimeUntilReservation,
    validateReservationDateTime,
} from './utils';

// Combine date & time strings
const dateTime = combineDateTime('2024-12-25', '19:00:00');

// Format display
const formatted = formatReservationDateTime('2024-12-25', '19:00:00');
// "Wed, Dec 25, 2024, 07:00 PM"

const date = formatDate(new Date()); // "Wed, Nov 22, 2025"
const time = formatTime(new Date()); // "10:30 AM"
const duration = formatDuration(120); // "2 hr"

// Check date status
const today = isToday(reservation.reservationDate);
const upcoming = isUpcoming(reservation.reservationDate); // within 24h
const past = isPast(reservation.reservationDate);

// Get time slot
const slot = getTimeSlotLabel(dateTime); // "Tối" (Dinner)

// Workflow checks
const hasPassed = hasReservationTimePassed(
    reservation.reservationDate,
    reservation.reservationTime
);

const inGrace = isWithinGracePeriod(
    reservation.reservationDate,
    reservation.reservationTime
); // Within 15 min after reservation time

const autoNoShow = shouldAutoNoShow(
    reservation.reservationDate,
    reservation.reservationTime
); // > 30 min after reservation time

// Time until
const minutes = getMinutesUntilReservation(
    reservation.reservationDate,
    reservation.reservationTime
);

const timeUntil = getTimeUntilReservation(
    reservation.reservationDate,
    reservation.reservationTime
); // "2 giờ 30 phút nữa"

// Validate
const validation = validateReservationDateTime(
    '2024-12-25',
    '19:00:00'
);
if (!validation.valid) {
    console.log(validation.error);
}
```

### Formatting Helpers

```typescript
import {
    formatReservationCode,
    formatReservationCodeDisplay,
    formatPhoneNumber,
    formatPartySize,
    isValidPhone,
} from './utils';

// Format reservation code
const code = formatReservationCode('abc123'); // "ABC123"
const display = formatReservationCodeDisplay('abc123'); // "#ABC123"

// Format phone
const phone = formatPhoneNumber('0987654321'); // "(098) 765-4321"
const isValid = isValidPhone('0987654321'); // true

// Format party size
const party = formatPartySize(4); // "4 người"
```

### Priority & Sorting

```typescript
import {
    getReservationPriority,
    sortReservationsByPriority,
} from './utils';

// Get priority for sorting
const priority = getReservationPriority(reservation.status);
// seated: 1, confirmed: 2, pending: 3, ...

// Sort reservations
const sorted = sortReservationsByPriority(reservations);
// Sorts by: 1) status priority, 2) reservation time
```

## API Services

### Reservation API

```typescript
import { reservationApi } from './services';

// Get all reservations
const { items, pagination } = await reservationApi.getAll({
    page: 1,
    limit: 10,
    status: 'confirmed',
    date: '2024-12-25',
});

// Get reservation by ID
const reservation = await reservationApi.getById(123);

// Get reservation by code
const reservation = await reservationApi.getByCode('ABC123');

// Get reservations by phone
const reservations = await reservationApi.getByPhone('0987654321');

// Check table availability
const availableTables = await reservationApi.checkAvailability({
    date: '2024-12-25T19:00:00',
    partySize: 4,
    duration: 120,
    floor: 1,
});

// Create new reservation
const newReservation = await reservationApi.create({
    customerName: 'Nguyễn Văn A',
    phoneNumber: '0987654321',
    email: 'nguyenvana@example.com',
    reservationDate: '2024-12-25',
    reservationTime: '19:00',
    partySize: 4,
    duration: 120,
    specialRequest: 'Bàn gần cửa sổ',
    tableId: 5, // Optional - auto-assign if not provided
});

// Update reservation
const updated = await reservationApi.update(123, {
    partySize: 6,
    specialRequest: 'Updated request',
});

// Workflow actions

// 1. Confirm reservation
const confirmed = await reservationApi.confirm(123);

// 2. Seat customer (check-in) - Auto-creates Order! ⭐
const result = await reservationApi.seat(123);
console.log(result.reservation); // Updated reservation (status: seated)
console.log(result.order); // Auto-created order
// {
//   orderId: 456,
//   orderNumber: "ORD-001234",
//   reservationId: 123,
//   tableId: 5,
//   status: "pending",
//   ...
// }

// 3. Complete reservation
const completed = await reservationApi.complete(123);

// 4. Cancel reservation
const cancelled = await reservationApi.cancel(123, {
    reason: 'Khách hủy đơn',
});

// 5. Mark as no-show
const noShow = await reservationApi.markNoShow(123);
```

## Custom Hooks

### useReservations

```typescript
import { useReservations } from './hooks';

function ReservationList() {
    const {
        reservations,
        loading,
        error,
        pagination,
        filters,
        setFilters,
        refetch,
        createReservation,
        updateReservation,
        confirmReservation,
        seatReservation,
        completeReservation,
        cancelReservation,
        markNoShow,
    } = useReservations({
        page: 1,
        limit: 10,
        status: 'confirmed',
        date: '2024-12-25',
    });

    const handleSeat = async (id: number) => {
        const result = await seatReservation(id);
        // result contains both reservation and auto-created order
        console.log('Order created:', result.order.orderNumber);
    };

    return (
        <div>
            {reservations.map(reservation => (
                <div key={reservation.reservationId}>
                    {reservation.reservationCode}
                </div>
            ))}
        </div>
    );
}
```

### useReservationActions

```typescript
import { useReservationActions } from './hooks';

function ReservationCard({ reservation }: Props) {
    const {
        confirming,
        seating,
        completing,
        cancelling,
        handleConfirm,
        handleSeat,
        handleComplete,
        handleCancel,
        handleNoShow,
    } = useReservationActions(reservation.reservationId);

    return (
        <div>
            {canSeatReservation(reservation.status) && (
                <Button
                    onClick={handleSeat}
                    loading={seating}
                >
                    Vào bàn
                </Button>
            )}
        </div>
    );
}
```

### useTableAvailability

```typescript
import { useTableAvailability } from './hooks';

function AvailabilityCheck() {
    const {
        tables,
        loading,
        checkAvailability,
    } = useTableAvailability();

    const handleCheck = async () => {
        await checkAvailability({
            date: '2024-12-25T19:00:00',
            partySize: 4,
            duration: 120,
        });
    };

    return (
        <div>
            {tables.map(table => (
                <div key={table.tableId}>{table.tableNumber}</div>
            ))}
        </div>
    );
}
```

## Components

### StatusBadge

```typescript
import { StatusBadge } from './components';

<StatusBadge status="pending" />
<StatusBadge status="confirmed" showIcon={true} />
<StatusBadge status={reservation.status} className="ml-2" />
```

### ReservationCard

```typescript
import { ReservationCard } from './components';

<ReservationCard
    reservation={reservation}
    onConfirm={() => handleConfirm(reservation.reservationId)}
    onSeat={() => handleSeat(reservation.reservationId)}
    onCancel={() => handleCancel(reservation.reservationId)}
/>
```

## Dialogs

### CreateReservationDialog

```typescript
import { CreateReservationDialog } from './dialogs';

<CreateReservationDialog
    open={open}
    onOpenChange={setOpen}
    onSuccess={(reservation) => {
        console.log('Created:', reservation);
        refetch();
    }}
/>
```

### CheckInDialog (Seat Customer)

```typescript
import { CheckInDialog } from './dialogs';

<CheckInDialog
    open={open}
    onOpenChange={setOpen}
    reservation={selectedReservation}
    onSuccess={(result) => {
        // result contains reservation + auto-created order
        console.log('Seated:', result.reservation);
        console.log('Order created:', result.order);
        refetch();
    }}
/>
```

### CancelReservationDialog

```typescript
import { CancelReservationDialog } from './dialogs';

<CancelReservationDialog
    open={open}
    onOpenChange={setOpen}
    reservation={selectedReservation}
    onSuccess={() => refetch()}
/>
```

## Best Practices

### 1. Use Constants

```typescript
// ❌ Bad
if (reservation.status === 'confirmed') { }
const label = 'Đã xác nhận';

// ✅ Good
import { RESERVATION_STATUS_LABELS } from './constants';
if (canSeatReservation(reservation.status)) { }
const label = RESERVATION_STATUS_LABELS[reservation.status];
```

### 2. Use Workflow Helpers

```typescript
// ❌ Bad
const canSeat = reservation.status === 'confirmed';

// ✅ Good
import { canSeatReservation, canCreateOrder } from './utils';
const canSeat = canSeatReservation(reservation.status);
const canOrder = canCreateOrder(reservation.status);
```

### 3. Validate Before Submit

```typescript
import { validateReservationDateTime, RESERVATION_MESSAGES } from './utils';

const handleSubmit = () => {
    const validation = validateReservationDateTime(date, time);
    
    if (!validation.valid) {
        toast.error(validation.error);
        return;
    }
    
    // Proceed
};
```

### 4. Handle Seat → Order Flow

```typescript
// When seating customer, handle auto-created order
const handleSeat = async (id: number) => {
    try {
        const result = await reservationApi.seat(id);
        
        // Reservation updated to 'seated'
        console.log('Reservation:', result.reservation);
        
        // Order auto-created
        console.log('Order:', result.order.orderNumber);
        
        toast.success(RESERVATION_MESSAGES.SUCCESS.SEATED);
        toast.success(RESERVATION_MESSAGES.SUCCESS.ORDER_CREATED);
        
        // Navigate to order page or show order dialog
        router.push(`/admin/orders/${result.order.orderId}`);
    } catch (error) {
        toast.error(RESERVATION_MESSAGES.ERROR.SEAT_FAILED);
    }
};
```

## Workflow Integration with Order Module

### Complete Flow Example

```typescript
import { reservationApi } from '@/modules/reservations/services';
import { orderApi } from '@/modules/orders/services';

// 1. Customer books table
const reservation = await reservationApi.create({
    customerName: 'Nguyễn Văn A',
    phoneNumber: '0987654321',
    reservationDate: '2024-12-25',
    reservationTime: '19:00',
    partySize: 4,
});
// Status: pending

// 2. Staff confirms
await reservationApi.confirm(reservation.reservationId);
// Status: confirmed

// 3. Customer arrives, staff checks in
const result = await reservationApi.seat(reservation.reservationId);
// Status: seated
// Auto-creates: Order (orderId, orderNumber, ...)

// 4. Customer orders food (use Order module)
await orderApi.addItems(result.order.orderId, {
    items: [
        { itemId: 1, quantity: 2 },
        { itemId: 5, quantity: 1 },
    ],
});

// 5. After dining, complete reservation
await reservationApi.complete(reservation.reservationId);
// Status: completed
```

## Testing

### Unit Tests

```typescript
import {
    canSeatReservation,
    canCreateOrder,
    validateReservationDateTime,
    getTimeUntilReservation,
} from './utils';

describe('Reservation Utils', () => {
    it('should check if can seat', () => {
        expect(canSeatReservation('confirmed')).toBe(true);
        expect(canSeatReservation('pending')).toBe(false);
    });
    
    it('should check if can create order', () => {
        expect(canCreateOrder('seated')).toBe(true);
        expect(canCreateOrder('confirmed')).toBe(false);
    });
    
    it('should validate reservation time', () => {
        const result = validateReservationDateTime(
            '2020-01-01',
            '10:00'
        );
        expect(result.valid).toBe(false);
        expect(result.error).toContain('quá khứ');
    });
});
```

## Migration Guide

If migrating from old code:

1. **Replace hardcoded strings:**
```typescript
// Old
const label = 'Đã xác nhận';

// New
const label = RESERVATION_STATUS_LABELS.confirmed;
```

2. **Use workflow helpers:**
```typescript
// Old
const canEdit = status === 'pending' || status === 'confirmed';

// New
const canEdit = canEditReservation(status);
```

3. **Use time validation:**
```typescript
// Old
if (new Date(date + time) < new Date()) { }

// New
const validation = validateReservationDateTime(date, time);
```

## Troubleshooting

### Issue: Can't create order after seating

```typescript
// Make sure reservation is seated first
if (!canCreateOrder(reservation.status)) {
    toast.error(RESERVATION_MESSAGES.ERROR.NOT_SEATED);
    return;
}
```

### Issue: Validation not working

```typescript
// Use RESERVATION_VALIDATION constants
import { RESERVATION_VALIDATION } from './constants';
if (partySize > RESERVATION_VALIDATION.MAX_PARTY_SIZE) { }
```

## Related Documentation

- [Backend Reservation API](../../../server/src/modules/reservation/README.md)
- [Order Module Integration](../orders/README.md)
- [Reservation Use Cases](../../../docs/use_case/RESERVATION_SYSTEM.md)
