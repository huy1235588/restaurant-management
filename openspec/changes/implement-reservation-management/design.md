# Design: Reservation Management System

**Change ID:** `implement-reservation-management`  
**Status:** Draft  
**Last Updated:** 2024-11-16

## Architecture Overview

The reservation management system follows a feature-based architecture pattern with clear separation between backend business logic and frontend presentation layers.

```
┌─────────────────────────────────────────────────────────┐
│                    Client (Next.js)                     │
├─────────────────────────────────────────────────────────┤
│  Pages/Routes          │  Components      │  State      │
│  - /reservations       │  - ReservationCard│  - Zustand │
│  - /reservations/new   │  - CalendarView  │  - Context │
│  - /reservations/:id   │  - TimelineView  │            │
│                        │  - ListView      │            │
└────────────────┬───────────────────────────────────────┘
                 │ HTTP/WebSocket
┌────────────────┴───────────────────────────────────────┐
│                  Server (Express/Node)                 │
├─────────────────────────────────────────────────────────┤
│  API Layer          │  Business Logic  │  Services     │
│  - Routes/endpoints │  - Validation    │  - Email      │
│  - Middleware       │  - Availability  │  - SMS        │
│  - Controllers      │  - Assignment    │  - Websocket  │
└────────────────┬───────────────────────────────────────┘
                 │ Prisma ORM
┌────────────────┴───────────────────────────────────────┐
│              Database (PostgreSQL)                     │
├─────────────────────────────────────────────────────────┤
│  Tables: Reservation, RestaurantTable, Order, Staff    │
└─────────────────────────────────────────────────────────┘
```

## Data Model

### Existing Schema (Prisma)

```prisma
model Reservation {
    reservationId   Int               @id @default(autoincrement())
    reservationCode String            @unique @default(uuid())
    customerName    String
    phoneNumber     String
    email           String?
    tableId         Int
    reservationDate DateTime          @db.Date
    reservationTime DateTime          @db.Time(0)
    duration        Int               @default(120) // minutes
    headCount       Int
    specialRequest  String?
    depositAmount   Decimal?
    status          ReservationStatus @default(pending)
    notes           String?
    createdAt       DateTime          @default(now())
    updatedAt       DateTime          @updatedAt
    
    table  RestaurantTable @relation(fields: [tableId], references: [tableId])
    orders Order[]
}

enum ReservationStatus {
    pending
    confirmed
    seated
    completed
    cancelled
    no_show
}
```

### Proposed Extensions

**Option 1: Extend Reservation Model (Minimal)**
```prisma
model Reservation {
    // ... existing fields ...
    createdBy       Int?              // Staff who created
    confirmedAt     DateTime?
    seatedAt        DateTime?
    completedAt     DateTime?
    cancelledAt     DateTime?
    cancellationReason String?
    tags            String[]          // ["birthday", "vip", "business"]
    isRecurring     Boolean           @default(false)
    recurringGroupId String?
    
    creator         Staff?            @relation(fields: [createdBy], references: [staffId])
}
```

**Option 2: Separate Customer Model (Recommended)**
```prisma
model Customer {
    customerId      Int               @id @default(autoincrement())
    name            String
    phoneNumber     String            @unique
    email           String?           @unique
    birthday        DateTime?
    preferences     Json?             // {"seating": "window", "dietary": ["vegetarian"]}
    notes           String?
    isVip           Boolean           @default(false)
    createdAt       DateTime          @default(now())
    updatedAt       DateTime          @updatedAt
    
    reservations    Reservation[]
}

model Reservation {
    // ... existing fields ...
    customerId      Int?
    customer        Customer?         @relation(fields: [customerId], references: [customerId])
}
```

**Recommendation:** Implement Option 2 (separate Customer model) for better data normalization, customer history tracking, and future extensibility.

### Configuration Storage

**Reservation Settings:**
```typescript
interface ReservationSettings {
    defaultDuration: number;        // minutes, default 120
    bufferTime: number;             // minutes, default 15
    maxAdvanceDays: number;         // default 90
    operatingHours: {
        [day: string]: {            // "monday", "tuesday", etc.
            open: string;           // "10:00"
            close: string;          // "22:00"
            slots: number;          // interval in minutes, default 30
        }
    };
    capacity: {
        allowOverbooking: boolean;
        overbookingPercent: number; // default 10
        enableWaitlist: boolean;
    };
    deposits: {
        requiredForGroupSize: number; // default 8
        amount: number | "percent";
        refundPolicy: {
            hours24Plus: number;    // percent, default 100
            hours12to24: number;    // default 50
            hoursUnder12: number;   // default 0
        }
    };
}
```

**Storage:** JSON configuration file or dedicated `ReservationSettings` table.

## API Design

### REST Endpoints

**Base Path:** `/api/reservations`

```typescript
// List reservations with filters
GET /api/reservations
Query params:
  - date: string (YYYY-MM-DD)
  - startDate: string
  - endDate: string
  - status: ReservationStatus[]
  - tableId: number
  - floor: number
  - search: string (name/phone)
  - page: number
  - limit: number
Response: { data: Reservation[], total: number, page: number }

// Get single reservation
GET /api/reservations/:id
Response: { data: Reservation }

// Create reservation
POST /api/reservations
Body: {
  customerName?: string,
  customerId?: number,
  phoneNumber: string,
  email?: string,
  date: string,
  time: string,
  duration: number,
  partySize: number,
  tableId?: number,  // auto-assign if not provided
  floor?: number,
  specialRequests?: string,
  tags?: string[],
  sendConfirmation?: boolean
}
Response: { data: Reservation, message: string }

// Update reservation
PATCH /api/reservations/:id
Body: Partial<Reservation>
Response: { data: Reservation, message: string }

// Cancel reservation
POST /api/reservations/:id/cancel
Body: { reason?: string }
Response: { data: Reservation, message: string }

// Change status
POST /api/reservations/:id/status
Body: { status: ReservationStatus }
Response: { data: Reservation }

// Check availability
GET /api/reservations/availability
Query params:
  - date: string
  - time: string
  - duration: number
  - partySize: number
  - floor?: number
Response: {
  available: boolean,
  tables: Table[],
  alternatives: { time: string, availableCount: number }[]
}

// Bulk operations
POST /api/reservations/bulk/confirm
Body: { ids: number[] }
Response: { success: number, failed: number, errors: any[] }

POST /api/reservations/bulk/cancel
Body: { ids: number[], reason?: string }
Response: { success: number, failed: number }

// Customer management
GET /api/customers
GET /api/customers/:id
POST /api/customers
PATCH /api/customers/:id
GET /api/customers/:id/history

// Reports
GET /api/reservations/reports/dashboard
GET /api/reservations/reports/occupancy
GET /api/reservations/reports/customers
```

### WebSocket Events

```typescript
// Server → Client events
socket.on('reservation:created', (reservation: Reservation) => {})
socket.on('reservation:updated', (reservation: Reservation) => {})
socket.on('reservation:cancelled', (id: number) => {})
socket.on('reservation:status_changed', (data: { id: number, status: ReservationStatus }) => {})

// Client → Server events
socket.emit('subscribe:reservations', { date: string })
socket.emit('unsubscribe:reservations')
```

## Business Logic

### Availability Calculation

```typescript
async function checkAvailability(params: {
    date: Date,
    time: string,
    duration: number,
    partySize: number,
    floor?: number,
    excludeReservationId?: number
}): Promise<{
    available: boolean,
    tables: Table[],
    conflicts: Reservation[]
}> {
    const startTime = combineDateTime(params.date, params.time);
    const endTime = addMinutes(startTime, params.duration);
    const bufferTime = getSettings().bufferTime;
    
    // Get all tables matching criteria
    const candidateTables = await prisma.restaurantTable.findMany({
        where: {
            capacity: { gte: params.partySize },
            floor: params.floor,
            isActive: true
        }
    });
    
    // Check each table for conflicts
    const availableTables = [];
    for (const table of candidateTables) {
        const conflicts = await prisma.reservation.findMany({
            where: {
                tableId: table.tableId,
                reservationId: { not: params.excludeReservationId },
                status: { in: ['confirmed', 'seated', 'pending'] },
                AND: [
                    {
                        OR: [
                            // Reservation starts during our time
                            {
                                reservationTime: {
                                    gte: subMinutes(startTime, bufferTime),
                                    lt: addMinutes(endTime, bufferTime)
                                }
                            },
                            // Reservation ends during our time
                            {
                                // Calculate end time: reservationTime + duration
                                // Need to use raw query or compute in application
                            }
                        ]
                    }
                ]
            }
        });
        
        // Also check active orders
        const activeOrders = await prisma.order.findMany({
            where: {
                tableId: table.tableId,
                status: { in: ['pending', 'preparing', 'ready', 'served'] }
            }
        });
        
        if (conflicts.length === 0 && activeOrders.length === 0) {
            availableTables.push(table);
        }
    }
    
    return {
        available: availableTables.length > 0,
        tables: availableTables,
        conflicts: [] // Return conflicts if needed for alternative suggestions
    };
}
```

### Auto-Assignment Algorithm

```typescript
function autoAssignTable(
    availableTables: Table[],
    partySize: number,
    preferences?: CustomerPreferences
): Table | null {
    if (availableTables.length === 0) return null;
    
    // Scoring function
    const scoreTable = (table: Table): number => {
        let score = 0;
        
        // Perfect capacity match (+10)
        if (table.capacity === partySize) score += 10;
        // Close capacity match (+5)
        else if (table.capacity === partySize + 1) score += 5;
        // Oversized table (penalty based on waste)
        else score -= (table.capacity - partySize) * 2;
        
        // Preference matches
        if (preferences?.seatingLocation === table.location) score += 5;
        if (preferences?.preferredTableId === table.tableId) score += 15;
        if (preferences?.floor === table.floor) score += 3;
        
        return score;
    };
    
    // Sort by score descending
    const sortedTables = availableTables
        .map(t => ({ table: t, score: scoreTable(t) }))
        .sort((a, b) => b.score - a.score);
    
    return sortedTables[0].table;
}
```

### Validation Rules

```typescript
const validationSchema = z.object({
    customerName: z.string().min(2).max(50),
    phoneNumber: z.string().regex(/^\d{10,15}$/),
    email: z.string().email().optional(),
    date: z.string().refine(val => {
        const date = parseISO(val);
        const today = startOfDay(new Date());
        const maxDate = addDays(today, getSettings().maxAdvanceDays);
        return date >= today && date <= maxDate;
    }, "Date must be within booking window"),
    time: z.string().refine(val => {
        // Check if time is within operating hours
        // Check if time aligns with slot intervals
    }),
    partySize: z.number().min(1).max(20),
    duration: z.number().min(30).max(240),
    specialRequests: z.string().max(500).optional()
});
```

## Frontend Architecture

### Route Structure

```
/reservations
  ├── /reservations (default: calendar view)
  ├── /reservations/timeline
  ├── /reservations/list
  ├── /reservations/new
  ├── /reservations/:id
  └── /reservations/:id/edit
```

### Component Hierarchy

```
ReservationsPage
  ├── ReservationHeader
  │   ├── DateSelector
  │   ├── ViewToggle
  │   ├── FilterPanel
  │   └── CreateButton
  ├── CalendarView (or TimelineView or ListView)
  │   ├── ReservationCard (repeated)
  │   │   ├── StatusBadge
  │   │   ├── CustomerInfo
  │   │   └── QuickActions
  │   └── TimeGrid
  └── ReservationDialog
      ├── CustomerSearch
      ├── DateTimePicker
      ├── TableSelector
      │   └── FloorPlanIntegration
      └── FormActions

ReservationForm (create/edit)
  ├── CustomerSection
  │   ├── CustomerAutocomplete
  │   └── CustomerFields
  ├── ReservationDetails
  │   ├── DatePicker
  │   ├── TimePicker
  │   ├── PartySizeSelector
  │   └── DurationSelector
  ├── TableSelection
  │   ├── AutoAssignOption
  │   ├── ManualTableSelect
  │   └── FloorPlanView
  └── NotificationPreferences
```

### State Management

**Zustand Store:**
```typescript
interface ReservationStore {
    reservations: Reservation[];
    selectedDate: Date;
    viewMode: 'calendar' | 'timeline' | 'list';
    filters: ReservationFilters;
    
    // Actions
    fetchReservations: (params: any) => Promise<void>;
    createReservation: (data: any) => Promise<Reservation>;
    updateReservation: (id: number, data: any) => Promise<Reservation>;
    cancelReservation: (id: number, reason?: string) => Promise<void>;
    changeStatus: (id: number, status: ReservationStatus) => Promise<void>;
    
    setDate: (date: Date) => void;
    setViewMode: (mode: string) => void;
    setFilters: (filters: any) => void;
}
```

### Integration Points

**Floor Plan Integration:**
- Import `FloorPlanCanvas` component
- Add reservation overlay layer showing upcoming reservations
- Color-code tables by reservation status
- Click handler to create reservation for specific table

**Order Integration:**
- Link reservation to order when customer is seated
- Show active order status on reservation card
- Prevent table availability conflicts

**Notification Integration:**
- Email/SMS service wrapper
- Template rendering
- Queue management for bulk sends

## Performance Optimization

### Caching Strategy

```typescript
// Redis cache keys
const CACHE_KEYS = {
    availability: (date: string, time: string) => `avail:${date}:${time}`,
    reservations: (date: string) => `res:${date}`,
    settings: 'res:settings'
};

// Cache TTL
const CACHE_TTL = {
    availability: 300,    // 5 minutes
    reservations: 60,     // 1 minute
    settings: 3600        // 1 hour
};
```

### Query Optimization

- Add database indexes on frequently queried fields
- Use `include` strategically to avoid N+1 queries
- Implement cursor-based pagination for large lists
- Batch availability checks when showing calendar view

### Real-time Updates

- WebSocket connections pooled per date
- Broadcast only to subscribed clients
- Debounce frequent updates
- Graceful fallback to polling if WebSocket fails

## Security Considerations

### Authorization

```typescript
// Middleware for reservation endpoints
const reservationAuth = {
    create: ['manager', 'host', 'receptionist'],
    read: ['manager', 'host', 'receptionist', 'waiter'],
    update: ['manager', 'host', 'receptionist'],
    cancel: ['manager', 'host'],
    viewAnalytics: ['manager']
};
```

### Data Validation

- Server-side validation on all inputs
- Sanitize customer data (XSS prevention)
- Rate limiting on creation endpoints
- CAPTCHA for public booking widget (Phase 2)

### Audit Trail

```typescript
interface ReservationAudit {
    reservationId: number;
    action: 'created' | 'updated' | 'cancelled' | 'status_changed';
    userId: number;
    changes: Json;
    timestamp: DateTime;
}
```

## Testing Strategy

### Unit Tests
- Availability calculation logic
- Auto-assignment algorithm
- Validation rules
- Date/time utilities

### Integration Tests
- API endpoints (CRUD operations)
- WebSocket events
- Database transactions
- External service mocks (email/SMS)

### E2E Tests
- Complete booking workflow
- Calendar navigation and interaction
- Conflict detection and resolution
- Multi-user concurrent scenarios

### Performance Tests
- Load testing for availability checks
- Concurrent reservation creation
- WebSocket connection scaling
- Database query performance

## Deployment Considerations

### Database Migration

```bash
# Generate migration
pnpm prisma migrate dev --name add_reservation_features

# Apply to production
pnpm prisma migrate deploy
```

### Environment Variables

```env
# Notification Services
EMAIL_SERVICE=sendgrid
SENDGRID_API_KEY=...
SMS_SERVICE=twilio
TWILIO_ACCOUNT_SID=...
TWILIO_AUTH_TOKEN=...
TWILIO_PHONE_NUMBER=...

# Reservation Settings
RESERVATION_MAX_ADVANCE_DAYS=90
RESERVATION_DEFAULT_DURATION=120
RESERVATION_BUFFER_TIME=15
```

### Feature Flags

```typescript
const FEATURES = {
    reservations: {
        enabled: true,
        recurringBookings: false,  // Phase 2
        onlineBooking: false,      // Phase 2
        deposits: false,           // Phase 2
        waitlist: true
    }
};
```

## Monitoring & Observability

### Metrics to Track
- Reservation creation rate
- Availability check latency
- Cancellation rate
- No-show rate
- API response times
- WebSocket connection count

### Logging
- All reservation CRUD operations
- Availability check failures
- Notification delivery status
- Validation errors
- Performance bottlenecks

## Future Enhancements

**Phase 2:**
- Payment processing for deposits
- Customer self-service portal
- Mobile app integration
- Advanced analytics and ML predictions

**Phase 3:**
- Multi-location support
- Franchise management
- Social media integration
- Gift card and loyalty program linkage

---

**Document Status:** Draft  
**Last Review:** 2024-11-16  
**Next Review:** After approval
