# Kitchen Operations Module

## Overview
The Kitchen Operations module provides a real-time kitchen display system (KDS) with FIFO ordering and live order status updates for kitchen staff.

## Features
- Real-time kitchen order queue (auto-refresh every 5s)
- FIFO (First In, First Out) ordering
- Three-stage workflow: Pending → Cooking → Ready
- Elapsed time tracking
- Priority indicators for urgent orders
- Special request highlighting

## Components

### Views
- **KitchenDashboardView**: Three-column kanban view (Pending, Cooking, Ready)

### Components
- **KitchenOrderCard**: Card displaying order details with action buttons
- **KitchenStatusBadge**: Visual status indicator

## Hooks

### Data Fetching
- `useKitchenOrders(filters?)`: Fetch all kitchen orders (auto-refresh 5s)
- `useKitchenOrder(id)`: Fetch single order by ID

### Mutations
- `useStartOrder()`: Mark order as cooking
- `useMarkReady()`: Mark order as ready
- `useMarkCompleted()`: Complete order (triggers waiter notification)

## Types

### Enums
```typescript
enum KitchenOrderStatus {
  PENDING = 'pending',
  READY = 'ready',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}
```

### Interfaces
- `KitchenOrder`: Kitchen order with nested order details
- `KitchenFilters`: Filter criteria

## Services
All API calls are handled through `kitchenApi`:
- `getAll()`, `getById()`
- `start()`, `markReady()`, `markCompleted()`, `cancel()`

## Utilities
- `KITCHEN_STATUS_LABELS`: Human-readable status labels
- `KITCHEN_STATUS_COLORS`: Badge color variants
- `getElapsedTime()`: Calculate elapsed time from creation
- `getPriorityColor()`: Get color based on elapsed time thresholds

## Workflow
1. **New Order**: Waiter confirms order → Appears in Pending column
2. **Mark Ready**: Chef marks ready → Moves to Ready column → Waiter notified via WebSocket
3. **Completed**: Waiter picks up → Order moves to Recently Completed column
4. **Auto-cleanup**: Completed orders auto-remove after showing last 10

## Integration Points
- **Order Module**: Kitchen orders created from confirmed orders
- **WebSocket**: Real-time updates via Socket.io (order:new, order:update, order:completed events)
- **Backend**: KitchenService with FIFO sorting and WebSocket gateway

## Real-time Updates
The module uses:
- React Query polling (5s interval) for automatic refresh
- WebSocket integration ready for instant updates (via useKitchenSocket hook)

## Usage Example
```typescript
import { KitchenDashboardView } from '@/modules/kitchen';

export default function KitchenPage() {
  return <KitchenDashboardView />;
}
```

## Performance Considerations
- Auto-refresh limited to 5s to balance real-time needs with server load
- FIFO sorting done server-side
- Efficient React Query caching reduces unnecessary re-fetches
