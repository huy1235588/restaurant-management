# Reservations Module

Reservation management system for the restaurant, including calendar views, list views, timeline views, and customer management.

## Structure

```
reservations/
├── components/         # Shared components
│   ├── CustomerCard.tsx
│   ├── ReservationCard.tsx
│   ├── SearchPanel.tsx
│   ├── StatusBadge.tsx
│   └── index.ts
├── views/             # Main view components
│   ├── ReservationCalendarView.tsx
│   ├── ReservationListView.tsx
│   ├── ReservationTimelineView.tsx
│   └── index.ts
├── dialogs/           # Dialog components
│   ├── single/
│   │   ├── ReservationFormDialog.tsx
│   │   ├── ReservationDetailsDialog.tsx
│   │   └── index.ts
│   ├── bulk/
│   │   └── index.ts
│   └── index.ts
├── services/          # API services
│   ├── reservation.service.ts
│   └── index.ts
├── hooks/             # Custom hooks (to be added)
│   └── index.ts
├── types/             # TypeScript types (to be added)
│   └── index.ts
├── utils/             # Utility functions (to be added)
│   └── index.ts
└── index.ts           # Module exports
```

## Usage

### Views

```tsx
import { ReservationCalendarView, ReservationListView, ReservationTimelineView } from '@/modules/reservations';

// Calendar view for date-based reservations
<ReservationCalendarView onCreateReservation={handleCreate} />

// List view for table-based display
<ReservationListView />

// Timeline view for scheduling
<ReservationTimelineView />
```

### Dialogs

```tsx
import { ReservationFormDialog, ReservationDetailsDialog } from '@/modules/reservations';

// Create/edit reservation
<ReservationFormDialog
  open={isOpen}
  onClose={handleClose}
  reservation={existingReservation} // Optional for edit
  onSuccess={handleSuccess}
/>

// View reservation details
<ReservationDetailsDialog
  open={isOpen}
  onClose={handleClose}
  reservation={reservation}
/>
```

### Components

```tsx
import { ReservationCard, CustomerCard, StatusBadge, SearchPanel } from '@/modules/reservations';

// Display reservation card
<ReservationCard reservation={reservation} onClick={handleClick} />

// Display customer info
<CustomerCard customer={customer} />

// Show reservation status
<StatusBadge status={reservation.status} />

// Search panel for filtering
<SearchPanel
  onSearch={handleSearch}
  filters={filters}
  onFilterChange={handleFilterChange}
/>
```

### Services

```tsx
import { reservationApi } from '@/modules/reservations';

// Fetch reservations
const reservations = await reservationApi.getReservations();

// Create new reservation
const newReservation = await reservationApi.createReservation({
  customerName: 'John Doe',
  phone: '0123456789',
  date: '2024-01-15',
  time: '19:00',
  guests: 4,
  tableId: 'table-123'
});

// Update reservation
await reservationApi.updateReservation(id, updatedData);

// Delete reservation
await reservationApi.deleteReservation(id);

// Check availability
const isAvailable = await reservationApi.checkAvailability(date, time, tableId);
```

## State Management

Uses Zustand store (`stores/reservationStore.ts`) for:
- Reservation list state
- Selected reservation
- Filter state
- UI state (loading, modals)

## Features

### Calendar View
- Monthly calendar display
- Date selection
- Reservation count per day
- Quick create from date click

### List View
- Tabular display of all reservations
- Sortable columns
- Status filtering
- Search functionality
- Pagination

### Timeline View
- Time-based scheduling
- Table allocation visualization
- Drag-and-drop (future)
- Conflict detection

### Customer Management
- Customer information display
- Reservation history
- Contact details
- Notes and preferences

## API Reference

### reservationApi

#### `getReservations(filters?: ReservationFilters): Promise<Reservation[]>`
Fetch reservations with optional filters.

#### `getReservationById(id: string): Promise<Reservation>`
Get single reservation by ID.

#### `createReservation(data: CreateReservationDto): Promise<Reservation>`
Create new reservation.

#### `updateReservation(id: string, data: UpdateReservationDto): Promise<Reservation>`
Update existing reservation.

#### `deleteReservation(id: string): Promise<void>`
Delete reservation.

#### `checkAvailability(date: string, time: string, tableId?: string): Promise<boolean>`
Check if a time slot is available.

## Dependencies

### Internal
- `@/stores/reservationStore` - State management
- `@/lib/utils/date` - Date formatting utilities
- `@/components/ui/*` - UI components

### External
- `date-fns` - Date manipulation
- `react-hook-form` - Form handling
- `zod` - Schema validation

## Future Enhancements

- [ ] Add custom hooks for reservation logic
- [ ] Extract type definitions to types/
- [ ] Add utility functions for date/time calculations
- [ ] Implement bulk operations dialogs
- [ ] Add drag-and-drop in timeline view
- [ ] Customer search and autocomplete
- [ ] SMS/Email notification integration
- [ ] Waitlist management
