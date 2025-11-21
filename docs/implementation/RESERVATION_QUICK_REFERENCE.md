# Reservation System - Quick Reference Guide

## For Backend Developers

### API Endpoints
```typescript
// Base URL: /api/reservations

// List reservations
GET /reservations?page=1&limit=10&status=pending&date=2024-12-25

// Get by ID
GET /reservations/:id

// Get by code
GET /reservations/code/RSV-20241225-0001

// Get by phone
GET /reservations/phone/+1234567890

// Create
POST /reservations
{
  "customerName": "John Doe",
  "customerPhone": "+1234567890",
  "customerEmail": "john@example.com", // optional
  "partySize": 4,
  "reservationDate": "2024-12-25T19:00:00Z",
  "duration": 120,
  "specialRequests": "Window seat please", // optional
  "tableId": 5 // optional - auto-assigned if omitted
}

// Update
PUT /reservations/:id
{
  "partySize": 6,
  "reservationDate": "2024-12-25T20:00:00Z"
}

// Confirm
PATCH /reservations/:id/confirm

// Check in
PATCH /reservations/:id/seated

// Complete
PATCH /reservations/:id/complete

// Cancel
PATCH /reservations/:id/cancel
{
  "cancellationReason": "Customer request" // optional
}

// Mark no-show
PATCH /reservations/:id/no-show

// Check availability
POST /reservations/check-availability
{
  "date": "2024-12-25T19:00:00Z",
  "partySize": 4,
  "duration": 120,
  "floor": 1, // optional
  "section": "Main" // optional
}
```

### Service Methods
```typescript
import { ReservationService } from '@/modules/reservation/reservation.service';

// In your service/controller
constructor(private reservationService: ReservationService) {}

// Create reservation
const reservation = await this.reservationService.create(createDto);

// Get all with filters
const result = await this.reservationService.findAll(query);

// Get by ID
const reservation = await this.reservationService.findById(id);

// Update
const updated = await this.reservationService.update(id, updateDto);

// Status transitions
await this.reservationService.confirm(id);
await this.reservationService.seat(id);
await this.reservationService.complete(id);
await this.reservationService.cancel(id, cancelDto);
await this.reservationService.markNoShow(id);

// Check availability
const tables = await this.reservationService.checkAvailability(checkDto);
```

### Repository Methods
```typescript
import { ReservationRepository } from '@/modules/reservation/reservation.repository';

// In your service
constructor(private repository: ReservationRepository) {}

// Find with filters
const reservations = await this.repository.findAll(filters, pagination, sort);

// Find overlapping reservations
const overlapping = await this.repository.findOverlapping(tableId, start, end, excludeId);

// Create audit log
await this.repository.createAudit({
  reservationId,
  action: 'CONFIRMED',
  performedBy: userId,
  notes: 'Confirmed by staff'
});
```

## For Frontend Developers

### Using Hooks
```typescript
import {
  useReservations,
  useReservation,
  useReservationActions,
  useTableAvailability
} from '@/modules/reservations/hooks';

// List reservations with filters
function ReservationList() {
  const { reservations, pagination, loading, error, refetch } = useReservations({
    page: 1,
    limit: 10,
    status: 'confirmed',
    date: '2024-12-25'
  });

  return (
    <div>
      {loading && <Loader />}
      {reservations.map(r => <ReservationCard key={r.id} reservation={r} />)}
    </div>
  );
}

// Single reservation
function ReservationDetail({ id }: { id: number }) {
  const { reservation, loading, error, refetch } = useReservation(id);
  
  if (loading) return <Loader />;
  if (!reservation) return <NotFound />;
  
  return <div>{reservation.reservationCode}</div>;
}

// Actions
function ReservationActions({ id }: { id: number }) {
  const {
    confirmReservation,
    cancelReservation,
    seatReservation,
    completeReservation,
    loading,
    error
  } = useReservationActions();

  const handleConfirm = async () => {
    await confirmReservation(id);
    // Toast notification shown automatically
  };

  return (
    <Button onClick={handleConfirm} disabled={loading}>
      Confirm
    </Button>
  );
}

// Table availability
function AvailabilityChecker() {
  const { tables, loading } = useTableAvailability({
    date: '2024-12-25T19:00:00Z',
    partySize: 4,
    duration: 120
  });

  return (
    <div>
      {tables.map(table => (
        <TableOption key={table.id} table={table} />
      ))}
    </div>
  );
}
```

### Using Components
```typescript
import {
  StatusBadge,
  ReservationCard,
  ReservationList,
  ReservationFilters,
  AuditTimeline
} from '@/modules/reservations/components';

// Status badge
<StatusBadge status="confirmed" />

// Reservation card
<ReservationCard
  reservation={reservation}
  onClick={() => router.push(`/reservations/${reservation.id}`)}
  showActions
  onConfirm={() => handleConfirm(reservation)}
  onCancel={() => handleCancel(reservation)}
/>

// List with loading and empty states
<ReservationList
  reservations={reservations}
  loading={loading}
  onReservationClick={handleClick}
  showActions
/>

// Filters
<ReservationFilters
  onFilterChange={(filters) => setFilters(filters)}
/>

// Activity timeline
<AuditTimeline audits={reservation.audits} />
```

### Using Dialogs
```typescript
import {
  CreateReservationDialog,
  ConfirmReservationDialog,
  CancelReservationDialog,
  CheckInDialog,
  CompleteReservationDialog,
  NoShowDialog
} from '@/modules/reservations/dialogs';

function MyComponent() {
  const [showDialog, setShowDialog] = useState(false);
  const [selected, setSelected] = useState<Reservation | null>(null);

  return (
    <>
      <Button onClick={() => setShowDialog(true)}>Create</Button>
      
      <CreateReservationDialog
        open={showDialog}
        onClose={() => setShowDialog(false)}
        onSuccess={() => {
          refetch();
          setShowDialog(false);
        }}
      />
      
      {/* Other dialogs follow same pattern */}
      <ConfirmReservationDialog
        open={showConfirmDialog}
        reservation={selected}
        onClose={() => setShowConfirmDialog(false)}
        onSuccess={refetch}
      />
    </>
  );
}
```

### Using Utilities
```typescript
import {
  formatReservationCode,
  getStatusText,
  getStatusColor,
  getAvailableActions,
  formatReservationDateTime,
  formatDuration,
  canEditReservation,
  isUpcoming
} from '@/modules/reservations/utils';

// Format code
formatReservationCode('rsv-20241225-0001') // "RSV-20241225-0001"

// Get status display
getStatusText('confirmed') // "Confirmed"
getStatusColor('confirmed') // "bg-blue-100 text-blue-800 border-blue-200"

// Get available actions
getAvailableActions('confirmed') // ['seat', 'cancel']

// Format date/time
formatReservationDateTime(new Date()) // "Mon, Dec 25, 2024, 7:00 PM"
formatDuration(120) // "2h"

// Validation
canEditReservation('confirmed') // true
canEditReservation('completed') // false

// Date utilities
isUpcoming(reservation.reservationDate) // true if within 24 hours
```

### Using API Service Directly
```typescript
import { reservationApi } from '@/modules/reservations/services/reservation.service';

// Create
const reservation = await reservationApi.create({
  customerName: 'John Doe',
  customerPhone: '+1234567890',
  partySize: 4,
  reservationDate: new Date().toISOString(),
  duration: 120
});

// Get all
const result = await reservationApi.getAll({
  page: 1,
  limit: 10,
  status: 'confirmed'
});

// Actions
await reservationApi.confirm(id);
await reservationApi.cancel(id, { cancellationReason: 'Customer request' });
```

## Common Patterns

### Creating a Reservation
```typescript
// 1. Show create dialog
<Button onClick={() => setShowCreateDialog(true)}>New Reservation</Button>

// 2. Dialog handles form submission
<CreateReservationDialog
  open={showCreateDialog}
  onClose={() => setShowCreateDialog(false)}
  onSuccess={() => {
    refetch(); // Refresh list
    setShowCreateDialog(false);
  }}
/>
```

### Managing Status Transitions
```typescript
const { confirmReservation, seatReservation, completeReservation } = useReservationActions();

// Confirm (pending → confirmed)
await confirmReservation(id);

// Check in (confirmed → seated)
await seatReservation(id);

// Complete (seated → completed)
await completeReservation(id);
```

### Filtering and Search
```typescript
const [filters, setFilters] = useState({
  page: 1,
  limit: 10,
  status: 'confirmed',
  date: '2024-12-25',
  search: 'John'
});

const { reservations, pagination } = useReservations(filters);

// Update filters
setFilters(prev => ({ ...prev, status: 'pending', page: 1 }));
```

### Error Handling
```typescript
const { createReservation, loading, error } = useReservationActions();

try {
  await createReservation(data);
  // Success toast shown automatically
} catch (err) {
  // Error toast shown automatically
  console.error('Failed to create reservation:', err);
}
```

## TypeScript Types

### Core Types
```typescript
type ReservationStatus = 'pending' | 'confirmed' | 'seated' | 'completed' | 'cancelled' | 'no_show';

interface Reservation {
  id: number;
  reservationCode: string;
  customer: Customer;
  customerId: number;
  table?: RestaurantTable;
  tableId?: number;
  partySize: number;
  reservationDate: Date;
  duration: number;
  status: ReservationStatus;
  specialRequests?: string;
  cancellationReason?: string;
  audits?: ReservationAudit[];
  createdAt: Date;
  updatedAt: Date;
}

interface CreateReservationDto {
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  partySize: number;
  reservationDate: string;
  duration: number;
  specialRequests?: string;
  tableId?: number;
}
```

## Internationalization

### Using Translations
```typescript
import { useTranslation } from 'react-i18next';

function MyComponent() {
  const { t } = useTranslation();

  return (
    <div>
      <h1>{t('reservations.title')}</h1>
      <p>{t('reservations.subtitle')}</p>
      <span>{t('reservations.reservationStatus.confirmed')}</span>
    </div>
  );
}
```

### Available Translation Keys
```
reservations.title
reservations.subtitle
reservations.createReservation
reservations.customerName
reservations.customerPhone
reservations.partySize
reservations.reservationDate
reservations.status
reservations.reservationStatus.pending
reservations.reservationStatus.confirmed
reservations.reservationStatus.seated
reservations.reservationStatus.completed
reservations.reservationStatus.cancelled
reservations.reservationStatus.no_show
reservations.messages.createSuccess
reservations.messages.createError
... (60+ keys total)
```

## Common Issues & Solutions

### Issue: Reservation not appearing in list
**Solution**: Check filters - might be filtered by status or date

### Issue: Can't create reservation - table conflict
**Solution**: Use availability checker first to find free tables

### Issue: Can't transition status
**Solution**: Check current status - only certain transitions allowed:
- pending → confirmed, cancelled
- confirmed → seated, cancelled, no_show
- seated → completed

### Issue: Customer not auto-linked
**Solution**: Ensure phone number format is consistent (E.164 recommended)

### Issue: Translations not showing
**Solution**: Check i18n configuration and locale files

## Performance Tips

1. **Use pagination**: Don't fetch all reservations at once
2. **Filter by date**: Limit queries to specific date ranges
3. **Debounce search**: Use 300ms delay for search input
4. **Cache availability**: Store recent availability checks
5. **Optimistic updates**: Show UI changes before API confirms

## Security Notes

1. All endpoints require JWT authentication
2. Role-based access control enforced
3. Customer phone numbers stored securely
4. Audit trail tracks all changes
5. Input validation on both client and server

## Debugging

### Enable debug logging
```typescript
// Backend (NestJS)
import { Logger } from '@nestjs/common';
const logger = new Logger('ReservationService');
logger.debug('Creating reservation', createDto);

// Frontend (React)
console.log('[Reservation]', 'Creating reservation', data);
```

### Check audit trail
```typescript
// View all changes for a reservation
const { reservation } = useReservation(id);
console.log('Audit trail:', reservation.audits);
```

### API debugging
```typescript
// Check network tab in DevTools
// Or use axios interceptor
reservationApi.interceptors.request.use(config => {
  console.log('API Request:', config);
  return config;
});
```

## Resources

- [Full Implementation Documentation](./RESERVATION_SYSTEM_IMPLEMENTATION.md)
- [OpenSpec Proposal](../openspec/changes/implement-reservation-system/proposal.md)
- [API Documentation](http://localhost:8000/api/docs) (Swagger)
- [Component Storybook](http://localhost:6006) (if available)

## Support

For issues or questions:
1. Check this guide first
2. Review implementation documentation
3. Check existing code patterns in menu/table modules
4. Review OpenSpec requirements
