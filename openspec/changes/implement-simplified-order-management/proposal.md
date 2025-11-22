# Proposal: Simplified Order Management System

## Why

The current order management documentation includes complex features that are unnecessary for a graduation project demo, such as detailed "Preparing" status tracking, multi-tab kitchen interfaces, cancellation fees with approval workflows, thermal printer integration via browser APIs, and granular real-time notifications for every step. These features add significant implementation complexity without proportional value for demonstrating core restaurant management concepts. Simplifying the system to focus on essential order flow (create → queue → complete → serve) and basic reporting will deliver a functional demo faster while maintaining clarity for academic evaluation.

## What Changes

### Removed Features
- **REMOVED**: "Preparing" (Đang nấu) status tracking with detailed cook time and wait time monitoring
- **REMOVED**: Multi-tab kitchen interface (Chờ/Đang nấu/Sẵn sàng) - replaced with single queue view
- **REMOVED**: Explicit "Start Cooking" button - chefs now only click "Done" to mark items complete
- **REMOVED**: Cancellation fee calculation and approval workflow for canceling items
- **REMOVED**: Thermal printer integration via browser driver APIs
- **REMOVED**: Granular real-time notifications for every minor step (e.g., waiter pickup confirmation)
- **REMOVED**: Advanced reporting: staff performance analytics, average wait time analysis, ingredient demand forecasting

### Simplified Features
- **MODIFIED**: Kitchen interface → Single "Queue" (Hàng đợi) view with two states: "Chờ chế biến" (Waiting) and "Đã xong" (Done)
- **MODIFIED**: Order cancellation → Simple deletion without fee calculation or approval; just log "Đã hủy" (Cancelled)
- **MODIFIED**: Printing → "Preview Invoice" button showing PDF/HTML popup instead of actual thermal printer output
- **MODIFIED**: Real-time updates → Consolidated to one stream: staff creates order → kitchen screen auto-updates; other steps use manual refresh or page transition updates
- **MODIFIED**: Reporting → Keep only basic revenue reports (daily/monthly) and best-selling items (món bán chạy)

### Added Features
- Clear separation of concerns: waiter order creation, kitchen queue processing, serving confirmation
- Simplified audit logging for cancellations without complex fee tracking
- Invoice preview functionality with print-friendly HTML/PDF rendering

## Impact

**Affected specs:**
- `order-management` (new capability)

**Affected code:**
- Database schema: `app/server/prisma/schema.prisma` - simplify Order/OrderItem/KitchenOrder statuses
- Backend: `app/server/src/features/orders/` - create streamlined order management endpoints
- Frontend: `app/client/src/modules/orders/` - implement waiter order interface, kitchen queue, serving confirmation
- Real-time: `app/server/src/features/socket/` - simplified WebSocket events for order queue updates
- Reports: `app/server/src/features/reports/` - basic revenue and best-sellers only

**Breaking changes:** N/A (new feature implementation, not modifying existing)

**Migration requirements:** Database migration to create Order, OrderItem, KitchenOrder tables with simplified status enums
