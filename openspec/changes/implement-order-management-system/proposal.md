# Implement Order Management System

## Why
Order Management is the core operational capability of the restaurant management system, connecting customers, waitstaff, kitchen, and payment processing. Currently, the system has database schema and documentation but lacks the actual implementation of order creation, status tracking, kitchen integration, and real-time updates. This feature is critical for restaurant operations and must be implemented to enable end-to-end order workflows from customer order to kitchen preparation and service completion.

## What Changes
- Add complete order creation workflow with table selection, menu item selection, and special requests
- Implement order item management (add, remove, update quantities)
- Add order status lifecycle management (PENDING → CONFIRMED → PREPARING → READY → SERVED → COMPLETED)
- Implement kitchen order system with real-time updates via WebSocket
- Add order cancellation workflow with authorization checks and reason tracking
- Implement order search, filtering, and sorting capabilities
- Add staff-order assignment and tracking
- Implement real-time notifications for kitchen and waitstaff
- Add order statistics and reporting dashboard
- Implement role-based permissions for order operations (waiter, chef, manager, admin)

## Impact
- **Affected specs**: Creates new `order-management` capability
- **Affected code**: 
  - Frontend: `app/client/src/app/(dashboard)/orders/` (new pages and components)
  - Backend: `app/server/src/features/orders/` (new routes, controllers, services)
  - Real-time: WebSocket handlers for order status updates
  - Database: Existing schema in `prisma/schema.prisma` (already defined, no changes needed)
- **Dependencies**: 
  - Requires `menu-management` for menu items
  - Requires `table-management` for table status
  - Requires `staff-management` for user assignments
  - Integrates with `bill-payment-management` for checkout
- **Breaking changes**: None (new feature)
- **Migration**: None required (database schema already exists)
