# Implement Order and Kitchen Management System

## Why

The restaurant management system currently lacks a complete order workflow from front-of-house (waiters) to back-of-house (kitchen). This creates operational inefficiencies:
- No digital order taking for waiters
- No real-time kitchen display system for chefs
- Manual communication between front and back of house
- No tracking of order status and preparation time
- Difficult to prioritize urgent orders (VIP, Express)

This change implements a comprehensive order and kitchen management system with two-way real-time communication, enabling efficient restaurant operations from order creation to food preparation.

## What Changes

### Order Management (Front-of-House)
- **Order CRUD**: Waiters can create, read, update orders with table assignment
- **Reservation Linking**: Link orders to reservations when customer had pre-booking
- **Menu Integration**: Browse menu, add items with quantities and special requests
- **Status Tracking**: Track order lifecycle (PENDING → CONFIRMED → PREPARING → READY → SERVING → COMPLETED)
- **Real-time Updates**: Receive notifications when kitchen marks food ready
- **Search & Filter**: Find orders by number, table, waiter, status, date range
- **Reports**: Sales by table, popular items, waiter performance, customer history

### Kitchen Management (Back-of-House)
- **Kitchen Display System (KDS)**: Large screen interface showing all active orders
- **Order Reception**: Auto-receive orders when waiters send to kitchen via WebSocket
- **Priority Management**: Handle VIP, Express, and Normal priority orders
- **Production Tracking**: Update cooking status per item and order
- **Chef Assignment**: Assign orders to specific chefs or workstations (Grill, Fry, Steam)
- **Timer & Alerts**: Track prep time, alert on overdue orders (>20 min)
- **Performance Reports**: Chef efficiency, prep time accuracy, order completion rates

### Integration & Communication
- **WebSocket Real-time**: Bidirectional updates between Order and Kitchen systems
- **Shared Order Status**: Synchronized status across both interfaces
- **Cancel Workflow**: Waiters request cancellation, kitchen confirms/rejects
- **Notification System**: Audio + visual alerts for new orders, ready items, urgent requests

### Database Schema
- `orders` table: Order details, table, reservation (optional), waiter, customer info, status, timestamps
- `order_items` table: Items in order, quantity, price, special requests, item status
- `kitchen_orders` table: Kitchen-specific tracking (chef, station, prep times)

## Impact

### Affected Capabilities
- **NEW**: `order-management` - Complete order lifecycle for waiters
- **NEW**: `kitchen-management` - Kitchen display and production tracking
- **EXTENDS**: `menu-management` (existing) - Menu items used in orders
- **EXTENDS**: `table-management` (planned) - Tables linked to orders
- **EXTENDS**: `staff-management` (existing) - Waiters and chefs assigned to orders
- **EXTENDS**: `bill-payment` (planned) - Orders generate bills

### Affected Code
- **Backend**:
  - `app/server/src/features/orders/` - NEW: Order APIs and business logic
  - `app/server/src/features/kitchen/` - NEW: Kitchen APIs and WebSocket handlers
  - `app/server/prisma/schema.prisma` - ADD: Order, OrderItem, KitchenOrder models
  - `app/server/src/routes/` - ADD: Order and Kitchen routes
  - `app/server/src/shared/websocket/` - EXTEND: Kitchen and Order events

- **Frontend**:
  - `app/client/src/app/(dashboard)/orders/` - NEW: Order management pages
  - `app/client/src/app/(dashboard)/kitchen/` - NEW: Kitchen display pages
  - `app/client/src/components/orders/` - NEW: Order components (form, list, detail)
  - `app/client/src/components/kitchen/` - NEW: Kitchen components (KDS, cards, timer)
  - `app/client/src/hooks/` - NEW: useOrders, useKitchen, useWebSocket hooks
  - `app/client/src/contexts/SocketContext.tsx` - EXTEND: Kitchen and Order events

### Dependencies
- Requires `menu-management` to be functional (menu items for ordering)
- Requires `staff-management` for waiter/chef user accounts
- Will be consumed by `bill-payment` (order → bill conversion)
- Optional: `table-management` for table selection (can use manual input as fallback)
- Optional: `reservation-management` for linking orders to reservations (can create orders without reservations)

### Breaking Changes
None - This is a new feature addition.

### Migration Notes
- Initial deployment requires database migration to add order tables
- Seed data can be added for testing (sample orders)
- WebSocket server must be running for real-time features
- Kitchen display requires separate screen/device (tablet or monitor)

## Implementation Approach

### Phase 1: Backend Foundation
1. Database schema and migrations
2. Order API endpoints (CRUD)
3. Kitchen API endpoints (status updates)
4. WebSocket event infrastructure

### Phase 2: Frontend - Order Management
1. Order list and search interface
2. Order creation form with menu selection
3. Order detail view and editing
4. Real-time status updates via WebSocket

### Phase 3: Frontend - Kitchen Management
1. Kitchen Display System (KDS) layout
2. Order card components with timers
3. Status update controls
4. Chef assignment and priority management

### Phase 4: Integration & Polish
1. Two-way WebSocket communication
2. Notification system (audio + visual)
3. Reports and analytics
4. Error handling and edge cases

## Success Criteria
- Waiters can create orders in <30 seconds
- Kitchen receives orders instantly (<1 second latency)
- Order status updates reflect in both systems real-time
- KDS displays orders sorted by wait time and priority
- Chef can mark items ready and notify waiters
- Reports show accurate timing and performance metrics
- System handles 50+ concurrent orders without lag
