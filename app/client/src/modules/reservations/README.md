# Reservation Management Module

## Overview
The Reservation Management module provides a complete booking system for restaurant table reservations with manual table assignment and double-booking prevention.

## Features
- Create reservations with customer information
- Manual table assignment with availability checking
- Reservation confirmation workflow
- Seat customer and mark completed
- Handle no-shows and cancellations
- Filter and search reservations

## Components

### Views
- **ReservationListView**: Main view displaying all reservations with filtering options

### Components
- **ReservationStatusBadge**: Visual status indicator with color coding

### Dialogs
- **CreateReservationDialog**: Form to create new reservations with table selection

## Hooks

### Data Fetching
- `useReservations(filters?)`: Fetch all reservations with optional filters
- `useReservation(id)`: Fetch single reservation by ID
- `useAvailableTables(date, time, partySize)`: Get available tables for booking

### Mutations
- `useCreateReservation()`: Create new reservation
- `useUpdateReservation()`: Update reservation details
- `useConfirmReservation()`: Confirm a pending reservation
- `useSeatCustomer()`: Mark reservation as seated
- `useMarkNoShow()`: Mark customer as no-show
- `useCancelReservation()`: Cancel a reservation

## Types

### Enums
```typescript
enum ReservationStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  SEATED = 'SEATED',
  COMPLETED = 'COMPLETED',
  NO_SHOW = 'NO_SHOW',
  CANCELLED = 'CANCELLED'
}
```

### Interfaces
- `Reservation`: Complete reservation data
- `CreateReservationDto`: Data for creating reservation
- `UpdateReservationDto`: Data for updating reservation
- `ReservationFilters`: Filter criteria
- `AvailableTable`: Table availability info

## Services
All API calls are handled through `reservationApi`:
- `getAll()`, `getById()`, `create()`, `update()`
- `confirm()`, `seat()`, `noShow()`, `complete()`, `cancel()`
- `getAvailableTables()`

## Utilities
- `RESERVATION_STATUS_LABELS`: Human-readable status labels
- `RESERVATION_STATUS_COLORS`: Badge color variants by status
- `formatDate()`, `formatTime()`, `formatDateTime()`: Date/time formatters

## Workflow
1. **Create**: Customer calls → Staff creates reservation → System checks availability
2. **Confirm**: Staff confirms reservation → Assigns table
3. **Seat**: Customer arrives → Staff marks as seated
4. **Complete**: Customer leaves → Reservation marked complete
5. **Exceptions**: No-show or cancellation handling

## Integration Points
- **Customer Module**: Upserts customer on reservation creation
- **Table Module**: Checks availability and assigns tables
- **Backend**: ReservationService with double-booking prevention

## Usage Example
```typescript
import { ReservationListView } from '@/modules/reservations';

export default function ReservationsPage() {
  return <ReservationListView />;
}
```
