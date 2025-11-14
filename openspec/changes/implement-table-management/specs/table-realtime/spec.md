# Specification Delta: Table Real-time Updates

## Overview

**IMPORTANT**: WebSocket is used ONLY for real-time synchronization of table status changes across multiple users viewing the same floor plan. It is NOT used for saving floor plan layouts or table positions.

**Scope**:
- ✅ **IN SCOPE**: Real-time status updates (available, occupied, reserved, maintenance) when other users make changes
- ✅ **IN SCOPE**: Broadcasting table creation/deletion/updates to all connected clients
- ❌ **OUT OF SCOPE**: Auto-saving floor plan layouts (layouts are saved via explicit Save button only)
- ❌ **OUT OF SCOPE**: Real-time collaborative editing of floor plans

## ADDED Requirements

### Requirement: TR-001 - WebSocket Connection Management
**Priority**: P0 (Critical)  
**Category**: Real-time Communication  
**Owner**: Frontend + Backend Team

The system SHALL establish and maintain a persistent WebSocket connection for real-time table updates.

#### Scenario: User connects to WebSocket server
**Given** the user is authenticated  
**And** the user navigates to `/tables`  
**When** the page loads  
**Then** the system SHALL establish a WebSocket connection to the server  
**And** send authentication token in connection handshake  
**And** the connection SHALL be established within 2 seconds  
**And** connection status indicator SHALL show "Connected" (green dot)

#### Scenario: WebSocket connection drops
**Given** the user has an active WebSocket connection  
**When** the connection is lost (network issue, server restart)  
**Then** the system SHALL detect disconnection within 5 seconds  
**And** display warning banner "Connection lost. Reconnecting..."  
**And** attempt to reconnect using exponential backoff (1s, 2s, 4s, 8s, max 30s)  
**And** continue retrying until connection is restored  
**And** show success message "Connection restored" when reconnected

#### Scenario: User closes page
**Given** the user has an active WebSocket connection  
**When** the user navigates away from `/tables` or closes the browser tab  
**Then** the system SHALL cleanly disconnect the WebSocket  
**And** send disconnect event to server  
**And** free up connection resources

**Acceptance Criteria**:
- ✅ Connection establishes within 2 seconds
- ✅ Auto-reconnect works with exponential backoff
- ✅ Connection status is visible to user
- ✅ Graceful disconnect on page unload
- ✅ Authentication is enforced on connection
- ✅ Multiple tabs share same connection (optional optimization)

---

### Requirement: TR-002 - Table Status Change Events
**Priority**: P0 (Critical)  
**Category**: Real-time Communication  
**Owner**: Backend + Frontend Team

The system SHALL broadcast real-time events when table status changes.

#### Scenario: User changes table status in UI
**Given** User A is viewing the floor plan  
**And** User B is viewing the same floor plan on a different device  
**And** both users see table T-05 with status "available"  
**When** User A changes table T-05 status to "occupied"  
**Then** the backend SHALL:
  - Update table status in database
  - Broadcast `table:status_changed` event to all connected clients
**And** User B SHALL receive the event within 500ms  
**And** User B's floor plan SHALL update table T-05 to show "occupied" status  
**And** the table card SHALL animate the status change (color transition)

#### Scenario: Backend system changes table status
**Given** multiple users are viewing the floor plan  
**And** an automated system (e.g., reservation timer) changes table T-10 from "reserved" to "available"  
**When** the status update occurs in the database  
**Then** the backend SHALL broadcast `table:status_changed` event  
**And** all connected clients SHALL receive the update within 500ms  
**And** all floor plans SHALL update table T-10 status simultaneously

**Event Schema**:
```typescript
interface TableStatusChangedEvent {
  event: 'table:status_changed';
  data: {
    tableId: number;
    tableNumber: string;
    oldStatus: TableStatus;
    newStatus: TableStatus;
    updatedBy: string;      // username or "system"
    updatedAt: string;      // ISO 8601 timestamp
    notes?: string;         // optional reason for change
  };
}
```

**Acceptance Criteria**:
- ✅ Events deliver within 500ms (p95 latency)
- ✅ All connected clients receive events
- ✅ Events include old and new status for transition validation
- ✅ Events include user/system attribution
- ✅ UI updates are smooth with transition animations

---

### Requirement: TR-003 - Table CRUD Events
**Priority**: P0 (Critical)  
**Category**: Real-time Communication  
**Owner**: Backend + Frontend Team

The system SHALL broadcast real-time events when tables are created, updated, or deleted.

#### Scenario: User creates new table
**Given** User A creates a new table "T-50" on Floor 2  
**And** User B is viewing Floor 2 floor plan  
**When** the table is successfully created  
**Then** the backend SHALL broadcast `table:created` event  
**And** User B SHALL receive the event within 500ms  
**And** User B's floor plan SHALL instantly display the new table T-50  
**And** the new table SHALL animate into view (fade-in or slide-in)

#### Scenario: User edits table details
**Given** User A edits table T-20, changing capacity from 4 to 6  
**And** User B is viewing table T-20 details in a dialog  
**When** User A saves the changes  
**Then** the backend SHALL broadcast `table:updated` event  
**And** User B SHALL receive the event  
**And** User B's dialog SHALL show update notification banner:
  - "Table was updated by [User A]. Refresh to see latest?"
  - [Dismiss] [Refresh]

#### Scenario: User deletes table
**Given** User A deletes table T-15  
**And** User B is viewing the floor plan showing table T-15  
**When** the deletion is confirmed  
**Then** the backend SHALL broadcast `table:deleted` event  
**And** User B SHALL receive the event within 500ms  
**And** table T-15 SHALL animate out of view (fade-out or slide-out)  
**And** the table count SHALL update accordingly

**Event Schemas**:
```typescript
interface TableCreatedEvent {
  event: 'table:created';
  data: Table; // Full table object
}

interface TableUpdatedEvent {
  event: 'table:updated';
  data: {
    tableId: number;
    changes: Partial<Table>; // Only changed fields
    updatedBy: string;
    updatedAt: string;
  };
}

interface TableDeletedEvent {
  event: 'table:deleted';
  data: {
    tableId: number;
    tableNumber: string;
    deletedBy: string;
    deletedAt: string;
  };
}
```

**Acceptance Criteria**:
- ✅ Created tables appear immediately on all clients
- ✅ Updated tables refresh details in real-time
- ✅ Deleted tables remove from all views instantly
- ✅ Animations provide smooth visual feedback
- ✅ Event payloads are minimal (only changed data)

---

### Requirement: TR-005 - Room-based Event Filtering
**Priority**: P1 (High)  
**Category**: Performance Optimization  
**Owner**: Backend Team

The system SHALL use Socket.io rooms to filter events by floor/section.

#### Scenario: User joins floor-specific room
**Given** the user is viewing Floor 2 floor plan  
**When** the floor plan loads  
**Then** the frontend SHALL emit `tables:join` event with { floor: 2 }  
**And** the backend SHALL add the user's socket to room "floor:2"  
**And** the user SHALL only receive events for tables on Floor 2  
**And** events for other floors SHALL NOT be sent to this user

#### Scenario: User switches floors
**Given** the user is currently in room "floor:2"  
**When** the user switches to Floor 3 floor plan  
**Then** the frontend SHALL emit `tables:leave` event with { floor: 2 }  
**And** emit `tables:join` event with { floor: 3 }  
**And** the backend SHALL remove user from "floor:2" room  
**And** add user to "floor:3" room  
**And** the user SHALL now only receive Floor 3 events

#### Scenario: User views all floors (list view)
**Given** the user switches to List view showing all tables  
**When** the view loads  
**Then** the frontend SHALL emit `tables:join` event with { floor: null }  
**And** the backend SHALL add user to "all_tables" room  
**And** the user SHALL receive events for all tables regardless of floor

**Acceptance Criteria**:
- ✅ Users only receive events for tables they're viewing
- ✅ Room switching is instant (< 100ms)
- ✅ Memory usage is optimized (no unnecessary event broadcasts)
- ✅ Edge case: User in multiple tabs joins correct rooms for each view

---

### Requirement: TR-006 - Connection State Management
**Priority**: P1 (High)  
**Category**: User Experience  
**Owner**: Frontend Team

The system SHALL provide clear feedback on connection state and queue updates during disconnection.

#### Scenario: Display connection status indicator
**Given** the user is on the table management page  
**When** the WebSocket connection is established  
**Then** a connection status indicator SHALL show:
  - Green dot + "Live" when connected
  - Yellow dot + "Reconnecting..." when attempting reconnect
  - Red dot + "Disconnected" when all retries exhausted
**And** the indicator SHALL be visible but unobtrusive (e.g., top-right corner)

#### Scenario: Queue updates during disconnection
**Given** the user's WebSocket connection is lost  
**And** User B (still connected) changes table T-05 status  
**When** User A's connection is restored  
**Then** the backend SHALL:
  - Detect that User A missed updates (based on last received event ID)
  - Send queued events or full state snapshot to User A
**And** User A's UI SHALL:
  - Show loading indicator "Syncing updates..."
  - Apply all missed updates (batch update)
  - Show notification "Synced X table updates" (if significant number)

#### Scenario: Degraded mode during prolonged disconnection
**Given** the user has been disconnected for > 30 seconds  
**And** reconnection attempts continue to fail  
**When** the user tries to make changes  
**Then** the system SHALL:
  - Show warning banner "You are working offline. Changes will sync when connection is restored."
  - Allow changes locally (localStorage queue)
  - Disable critical actions (e.g., delete, bulk operations)
  - Auto-sync queued changes when connection restores

**Acceptance Criteria**:
- ✅ Connection status is always visible and accurate
- ✅ Missed updates are synced on reconnection
- ✅ Users can continue viewing (read-only) during disconnection
- ✅ Queued changes sync automatically without data loss
- ✅ Warning banners are clear and actionable

---

### Requirement: TR-007 - Event Rate Limiting
**Priority**: P2 (Medium)  
**Category**: Security & Performance  
**Owner**: Backend Team

The system SHALL rate-limit WebSocket events to prevent abuse and reduce server load.

#### Scenario: Throttle rapid status changes
**Given** a user rapidly changes table status (e.g., clicking 10 times in 1 second)  
**When** the events are sent to the backend  
**Then** the backend SHALL throttle updates to max 5 per second per user  
**And** show warning "Too many requests. Please slow down."  
**And** ignore excessive requests (return 429 Too Many Requests)

#### Scenario: Batch similar events
**Given** 10 users simultaneously change table status on Floor 1  
**When** these events would be broadcast  
**Then** the backend SHALL batch events and send 1 combined update:
```typescript
{
  event: 'tables:batch_update',
  data: [
    { tableId: 1, status: 'occupied', updatedBy: 'user1' },
    { tableId: 2, status: 'available', updatedBy: 'user2' },
    // ... up to 10 tables
  ]
}
```
**And** reduce network traffic by 90%

**Acceptance Criteria**:
- ✅ Rate limiting prevents abuse (max 5 updates/sec per user)
- ✅ Batch updates reduce network traffic for burst changes
- ✅ Critical events (e.g., emergency) bypass rate limiting
- ✅ Users receive feedback when rate-limited

---

## MODIFIED Requirements

None. This is a new capability.

---

## REMOVED Requirements

None. This is a new capability.

---

## Dependencies

- **Socket.io Server**: Version 4.8+ on backend
- **Socket.io Client**: Version 4.8+ on frontend
- **Redis** (optional): For scaling Socket.io across multiple server instances
- **Spec**: `table-crud` for CRUD operations that trigger events
- **Spec**: `table-visualization` for UI components that display updates

---

## WebSocket Event Reference

### Client → Server Events

```typescript
// Join room for specific floor
socket.emit('tables:join', { floor: number | null });

// Leave room
socket.emit('tables:leave', { floor: number });

// Request full state sync (after reconnection)
socket.emit('tables:sync', { lastEventId: string });
```

### Server → Client Events

```typescript
// Table status changed
socket.on('table:status_changed', (data: TableStatusChangedEvent) => {});

// Table created
socket.on('table:created', (data: TableCreatedEvent) => {});

// Table updated
socket.on('table:updated', (data: TableUpdatedEvent) => {});

// Table deleted
socket.on('table:deleted', (data: TableDeletedEvent) => {});

// Batch update (multiple tables)
socket.on('tables:batch_update', (data: TableBatchUpdateEvent) => {});

// Connection acknowledged
socket.on('tables:connected', (data: { socketId: string }) => {});

// Sync response (after reconnection)
socket.on('tables:sync_response', (data: { tables: Table[], events: Event[] }) => {});
```

### System Events

```typescript
// Socket.io connection events
socket.on('connect', () => {});
socket.on('disconnect', (reason: string) => {});
socket.on('reconnect', (attemptNumber: number) => {});
socket.on('reconnect_attempt', (attemptNumber: number) => {});
socket.on('reconnect_error', (error: Error) => {});
socket.on('reconnect_failed', () => {});
```

---

---

## Implementation Notes

### Backend Implementation

```typescript
// socket.io server setup
import { Server } from 'socket.io';

io.on('connection', (socket) => {
  // Authenticate socket
  const user = authenticateSocket(socket);
  
  // Join table rooms
  socket.on('tables:join', ({ floor }) => {
    const room = floor ? `floor:${floor}` : 'all_tables';
    socket.join(room);
  });
  
  // Broadcast status change
  const broadcastStatusChange = (tableId, oldStatus, newStatus) => {
    const table = await getTable(tableId);
    const room = `floor:${table.floor}`;
    
    io.to(room).emit('table:status_changed', {
      tableId,
      tableNumber: table.tableNumber,
      oldStatus,
      newStatus,
      updatedBy: user.username,
      updatedAt: new Date().toISOString(),
    });
  };
});
```

### Frontend Implementation

```typescript
// useTableSocket hook
import { useEffect } from 'react';
import { io } from 'socket.io-client';
import { useTableStore } from '@/stores/tableStore';

export const useTableSocket = (floor: number | null) => {
  useEffect(() => {
    const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL);
    
    socket.on('connect', () => {
      console.log('WebSocket connected');
      socket.emit('tables:join', { floor });
    });
    
    socket.on('table:status_changed', (data) => {
      useTableStore.getState().updateTableStatus(
        data.tableId,
        data.newStatus
      );
    });
    
    socket.on('disconnect', () => {
      console.log('WebSocket disconnected');
      // Show reconnecting banner
    });
    
    return () => {
      socket.disconnect();
    };
  }, [floor]);
};
```

### Optimistic Update Pattern

```typescript
// In tableStore.ts
const updateTableStatus = async (tableId: number, status: TableStatus) => {
  const prevState = get().tables.find(t => t.tableId === tableId);
  
  // Optimistic update
  set(state => ({
    tables: state.tables.map(t =>
      t.tableId === tableId ? { ...t, status, _loading: true } : t
    ),
  }));
  
  try {
    await tableApi.updateStatus(tableId, status);
    
    // Remove loading indicator
    set(state => ({
      tables: state.tables.map(t =>
        t.tableId === tableId ? { ...t, _loading: false } : t
      ),
    }));
  } catch (error) {
    // Rollback
    set(state => ({
      tables: state.tables.map(t =>
        t.tableId === tableId ? { ...prevState, _error: error.message } : t
      ),
    }));
    
    toast.error('Failed to update table status');
  }
};
```

---

## Security Considerations

1. **Authentication**: Require JWT token in WebSocket handshake
2. **Authorization**: Validate user permissions before broadcasting events
3. **Rate Limiting**: Limit events per user to prevent DoS
4. **Input Validation**: Validate all incoming event payloads
5. **Room Security**: Ensure users can only join rooms they have permission to access

---

## Monitoring & Metrics

Track these metrics:
- WebSocket connection count (gauge)
- Event broadcast latency (histogram, p50/p95/p99)
- Reconnection rate (counter)
- Event rate (events/second)
- Failed event deliveries (counter)
- Room membership count (gauge per room)
