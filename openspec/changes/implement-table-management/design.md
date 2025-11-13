# Design Document: Table Management

## Architecture Overview

The table management feature follows a layered architecture with real-time capabilities:

```
┌─────────────────────────────────────────────────────────────┐
│                     Presentation Layer                       │
│  ┌──────────────────┐  ┌──────────────────┐                 │
│  │  Floor Plan View │  │   List View      │                 │
│  │  (Canvas-based)  │  │  (Data Grid)     │                 │
│  └──────────────────┘  └──────────────────┘                 │
│             │                    │                           │
│  ┌──────────────────────────────────────────┐               │
│  │     Table Forms (Create/Edit/Status)     │               │
│  └──────────────────────────────────────────┘               │
└─────────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────────┐
│                      State Layer (Zustand)                   │
│  ┌────────────────┐  ┌────────────────┐                     │
│  │  Table State   │  │ WebSocket Sync │                     │
│  │  (CRUD actions)│  │  (Real-time)   │                     │
│  └────────────────┘  └────────────────┘                     │
└─────────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────────┐
│                   Communication Layer                        │
│  ┌────────────────┐  ┌────────────────┐                     │
│  │   REST API     │  │   WebSocket    │                     │
│  │  (table.svc)   │  │  (Socket.io)   │                     │
│  └────────────────┘  └────────────────┘                     │
└─────────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────────┐
│                      Backend Layer                           │
│  ┌────────────────┐  ┌────────────────┐                     │
│  │ Table Service  │  │  Socket Events │                     │
│  │  (Business     │  │  (Broadcasting)│                     │
│  │   Logic)       │  │                │                     │
│  └────────────────┘  └────────────────┘                     │
│             │                    │                           │
│  ┌──────────────────────────────────────────┐               │
│  │       Table Repository (Data Access)     │               │
│  └──────────────────────────────────────────┘               │
└─────────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────────┐
│                   Data Layer (PostgreSQL)                    │
│              restaurant_tables table                         │
└─────────────────────────────────────────────────────────────┘
```

## Component Design

### 1. Floor Plan View

**Purpose**: Visual representation of restaurant layout with real-time table status

**Key Components**:
- `FloorPlanCanvas`: Main canvas container with zoom/pan controls
- `TableCard`: Individual table visualization with status indicator
- `FloorSelector`: Dropdown for floor filtering
- `TableStatusLegend`: Color-coded status guide

**Data Flow**:
```typescript
User Action (click table) 
  → Dispatch action to store
  → API call via table.service.ts
  → Backend updates database
  → Broadcast WebSocket event
  → All clients receive update
  → Store updates state
  → Components re-render
```

**State Management**:
```typescript
interface TableState {
  tables: Table[];
  selectedTable: Table | null;
  filters: {
    status?: TableStatus;
    floor?: number;
    section?: string;
  };
  loading: boolean;
  error: string | null;
}
```

### 2. List View

**Purpose**: Tabular data management with advanced filtering and bulk operations

**Key Components**:
- `TableDataGrid`: Main data table with sortable columns
- `TableFilters`: Search, status, floor, section filters
- `TableRowActions`: Dropdown menu for row actions
- `BulkActionsBar`: Actions for selected rows

**Pagination Strategy**:
- Server-side pagination for 50+ tables
- Client-side pagination for < 50 tables
- Default page size: 20 items
- Configurable via user preferences

### 3. Table Forms

**Purpose**: Create and edit table configurations with validation

**Validation Schema** (Zod):
```typescript
const tableSchema = z.object({
  tableNumber: z.string().min(1, "Required").max(20, "Too long"),
  tableName: z.string().max(50).optional(),
  capacity: z.number().min(1, "Must be at least 1").max(20, "Max 20"),
  minCapacity: z.number().min(1).default(1),
  floor: z.number().min(1).default(1),
  section: z.string().max(50).optional(),
  status: z.enum(['available', 'occupied', 'reserved', 'maintenance']),
  isActive: z.boolean().default(true),
});
```

**Form Flow**:
1. Open dialog → Load form with defaults/existing data
2. User fills fields → Real-time validation
3. Submit → Show loading state
4. Success → Close dialog, show toast, update list
5. Error → Show error message, keep dialog open

## Real-time Architecture

### WebSocket Event Schema

**Client → Server**:
```typescript
// Join table room (for filtering updates)
socket.emit('tables:join', { floor?: number });

// Request table update
socket.emit('tables:update', { tableId: number, data: Partial<Table> });
```

**Server → Client**:
```typescript
// Table status changed
socket.on('table:status_changed', (data: {
  tableId: number;
  status: TableStatus;
  updatedBy: string;
  timestamp: string;
}));

// Table created
socket.on('table:created', (data: Table));

// Table updated
socket.on('table:updated', (data: Partial<Table> & { tableId: number }));

// Table deleted
socket.on('table:deleted', (data: { tableId: number }));
```

### Optimistic Updates Strategy

1. **User Action**: User changes table status from "available" to "occupied"
2. **Immediate UI Update**: Store updates local state, UI reflects change instantly
3. **API Call**: Send request to backend
4. **Success Path**: 
   - Backend confirms change
   - WebSocket broadcasts to other clients
   - Local state already correct, no additional update needed
5. **Failure Path**:
   - Backend returns error
   - Rollback local state to previous value
   - Show error toast
   - Optionally show conflict resolution dialog

**Implementation**:
```typescript
// In tableStore.ts
const updateTableStatus = async (tableId: number, status: TableStatus) => {
  const previousState = get().tables.find(t => t.tableId === tableId);
  
  // Optimistic update
  set(state => ({
    tables: state.tables.map(t => 
      t.tableId === tableId ? { ...t, status } : t
    )
  }));
  
  try {
    await tableApi.updateStatus(tableId, status);
    // Success - WebSocket will handle broadcast
  } catch (error) {
    // Rollback
    set(state => ({
      tables: state.tables.map(t =>
        t.tableId === tableId ? previousState : t
      )
    }));
    throw error;
  }
};
```

### Conflict Resolution

**Scenario**: Two users simultaneously change the same table's status

**Solution**:
1. Use optimistic locking with version field
2. Backend detects conflict (version mismatch)
3. Return 409 Conflict status
4. Frontend shows conflict dialog:
   - "Table status was changed by [User] at [Time]"
   - "Your change: [Your Status]"
   - "Current status: [Current Status]"
   - Options: [Force Update] [Cancel] [Refresh]

## Database Considerations

### Current Schema
```prisma
model RestaurantTable {
  tableId     Int         @id @default(autoincrement())
  tableNumber String      @unique @db.VarChar(20)
  tableName   String?     @db.VarChar(50)
  capacity    Int
  minCapacity Int         @default(1)
  floor       Int         @default(1)
  section     String?     @db.VarChar(50)
  status      TableStatus @default(available)
  qrCode      String?     @unique @db.VarChar(255)
  isActive    Boolean     @default(true)
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt
  
  // Relations
  reservations Reservation[]
  orders       Order[]
  bills        Bill[]
}
```

### Proposed Enhancements (Phase 2)
```prisma
model RestaurantTable {
  // ... existing fields ...
  
  // For drag-and-drop positioning
  positionX   Float?      // X coordinate on canvas
  positionY   Float?      // Y coordinate on canvas
  rotation    Int?        @default(0) // Rotation angle (0-360)
  
  // For visual customization
  shape       String?     @default("rectangle") // rectangle, circle, square
  width       Float?      @default(100)
  height      Float?      @default(100)
  
  // For audit trail
  lastStatusChange DateTime?
  lastChangedBy    Int?
  
  // Add index for performance
  @@index([positionX, positionY])
  @@index([lastStatusChange])
}
```

### Query Optimization

**Indexes** (already in schema):
- `@@index([status])` - Fast filtering by status
- `@@index([floor])` - Fast floor filtering
- `@@index([isActive])` - Fast active/inactive filtering

**Compound Indexes** (recommended):
```prisma
@@index([floor, section])     // Filter by floor and section together
@@index([status, floor])      // Common filter combination
@@index([isActive, status])   // Active tables by status
```

## Performance Considerations

### Frontend Optimizations

1. **Virtual Scrolling**: Use `react-window` for lists with 100+ tables
2. **Memoization**: Memoize table cards to prevent unnecessary re-renders
3. **Debouncing**: Debounce search input (300ms)
4. **Code Splitting**: Lazy load floor plan canvas component
5. **Image Optimization**: Use Next.js Image component for QR codes

### Backend Optimizations

1. **Pagination**: Limit query results to 50 items per page
2. **Caching**: Cache table list in Redis for 60 seconds
3. **Connection Pooling**: Optimize database connection pool size
4. **Batch Operations**: Use database transactions for bulk updates
5. **WebSocket Rooms**: Use Socket.io rooms for floor-based filtering

### Network Optimizations

1. **HTTP/2**: Use multiplexed connections
2. **Compression**: Enable gzip/brotli for API responses
3. **WebSocket**: Maintain single persistent connection
4. **Incremental Updates**: Send only changed fields in WebSocket events

## Security Considerations

### Authentication & Authorization

**Role-based Permissions**:
```typescript
enum TablePermissions {
  'tables.read',      // View tables
  'tables.create',    // Create new tables
  'tables.update',    // Edit table details
  'tables.delete',    // Delete tables
  'tables.changeStatus', // Change table status
  'tables.generateQR',   // Generate QR codes
}

// Role mappings
const rolePermissions = {
  admin: ['tables.*'],
  manager: ['tables.*'],
  waiter: ['tables.read', 'tables.changeStatus'],
  cashier: ['tables.read'],
  chef: ['tables.read'],
};
```

**Frontend Guards**:
```typescript
// Disable actions based on permissions
<Button 
  onClick={handleDelete}
  disabled={!hasPermission('tables.delete')}
>
  Delete
</Button>
```

**Backend Guards**:
```typescript
// Middleware for route protection
router.delete('/:id', 
  authenticate,
  authorize(['tables.delete']),
  tableController.delete
);
```

### Input Validation

**Frontend** (Zod schema):
- Prevent XSS in table names
- Limit string lengths
- Validate numeric ranges
- Sanitize user input

**Backend** (Additional validation):
- Check table number uniqueness
- Validate status transitions
- Verify foreign key constraints
- Check business rules (e.g., can't delete occupied table)

### WebSocket Security

1. **Authentication**: Require JWT token for WebSocket connection
2. **Authorization**: Validate user can access requested floor/section
3. **Rate Limiting**: Limit events per user per minute
4. **Validation**: Validate all incoming events
5. **Sanitization**: Sanitize event payloads

## Error Handling

### Error Categories

1. **Validation Errors** (400):
   - Invalid table number format
   - Capacity out of range
   - Missing required fields

2. **Not Found Errors** (404):
   - Table ID does not exist
   - Floor does not exist

3. **Conflict Errors** (409):
   - Table number already exists
   - Concurrent update conflict
   - Invalid status transition

4. **Server Errors** (500):
   - Database connection failed
   - WebSocket broadcast failed
   - QR code generation failed

### Error Display Strategy

**Toast Notifications**:
- Success: Green toast, auto-dismiss in 3s
- Warning: Yellow toast, auto-dismiss in 5s
- Error: Red toast, manual dismiss required

**Inline Errors**:
- Form validation: Show below field
- List operations: Show in row
- Bulk operations: Show error summary dialog

**Fallback UI**:
- Network error: Show retry button
- WebSocket disconnected: Show warning banner
- Page error: Show error boundary with reload option

## Testing Strategy

### Unit Tests
- Component rendering with various props
- Store actions and state updates
- Validation schema edge cases
- Utility functions (QR generation, etc.)

### Integration Tests
- Complete CRUD flow
- WebSocket event handling
- Optimistic updates and rollback
- Filter and search combinations

### End-to-End Tests
- User creates table → appears in list
- User changes status → updates in real-time
- User deletes table → removed from database
- Multiple users → concurrent updates handled

### Performance Tests
- Load 200 tables → measure render time
- 50 concurrent WebSocket connections → measure latency
- Bulk update 100 tables → measure completion time
- Scroll list → measure FPS

## Monitoring & Observability

### Metrics to Track

1. **Performance Metrics**:
   - Page load time (target: < 2s)
   - WebSocket latency (target: < 500ms)
   - API response time (target: < 200ms)

2. **Business Metrics**:
   - Tables created per day
   - Status changes per hour
   - Average table occupancy rate
   - Most used floors/sections

3. **Error Metrics**:
   - WebSocket disconnection rate
   - API error rate
   - Validation error rate

### Logging

**Frontend Logs**:
```typescript
logger.info('Table status updated', { tableId, status, user });
logger.error('WebSocket connection failed', { error, retryCount });
logger.warn('Optimistic update rolled back', { tableId, reason });
```

**Backend Logs**:
```typescript
logger.info('Table created', { tableId, createdBy });
logger.error('Database query failed', { query, error });
logger.warn('Concurrent update detected', { tableId, conflicts });
```

## Deployment Considerations

### Environment Variables

```env
# Frontend (.env.local)
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
NEXT_PUBLIC_QR_CODE_BASE_URL=https://restaurant.com/table

# Backend (.env)
DATABASE_URL=postgresql://user:pass@localhost:5432/restaurant
REDIS_URL=redis://localhost:6379
SOCKET_IO_CORS_ORIGIN=http://localhost:3000
```

### Database Migration

```bash
# Run Prisma migration (if schema changes)
npx prisma migrate dev --name add_table_positions

# Seed sample tables for development
npx prisma db seed
```

### Feature Flags

Use feature flags for gradual rollout:
```typescript
const featureFlags = {
  'table.floorPlan': true,        // Enable floor plan view
  'table.dragDrop': false,        // Enable drag-and-drop (Phase 2)
  'table.bulkOperations': true,   // Enable bulk operations
  'table.qrGeneration': true,     // Enable QR code generation
};
```

## Future Enhancements

### Phase 3+ Ideas

1. **Table Combination**: Combine multiple small tables into large table
2. **Advanced Analytics**: Heatmaps, occupancy trends, revenue per table
3. **3D Visualization**: Three.js-based 3D floor plan
4. **Mobile App**: Native iOS/Android app with tablet support
5. **AR Integration**: View table layout via AR on mobile
6. **AI Recommendations**: Smart table assignment based on party size and preferences
7. **Voice Commands**: "Alexa, show me available tables on floor 2"
8. **Offline Mode**: PWA with offline-first architecture

## References

- [UI Design Documentation](../../../docs/design/TABLE_MANAGEMENT_UI_DESIGN.md)
- [Database Schema](../../../docs/DATABASE.md)
- [Socket.io Documentation](https://socket.io/docs/v4/)
- [Zustand Documentation](https://zustand-demo.pmnd.rs/)
- [React Hook Form](https://react-hook-form.com/)
