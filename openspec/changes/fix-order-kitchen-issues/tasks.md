# Implementation Tasks

## Phase 1: Database & Backend Critical Fixes (Week 1)

### 1. Database Schema Updates
- [x] 1.1 Create migration to update `KitchenOrderStatus` enum (remove `ready`, keep `pending`, `preparing`, `completed`, `cancelled`)
- [x] 1.2 Create migration to update `KitchenPriority` enum (align with API: `low`, `normal`, `high`, `urgent`)
- [x] 1.3 Add unique constraint on `KitchenOrder.orderId`
- [x] 1.4 Add cascade delete on `KitchenOrder.orderId` foreign key
- [x] 1.5 Remove unused fields: `prepTimeEstimate`, `stationId`, `notes` from KitchenOrder model
- [x] 1.6 Run migrations and verify database schema

### 2. Backend Kitchen Service
- [x] 2.1 Update `kitchen.service.ts` - Change `startPreparing()` to set status = `preparing` instead of `ready`
- [x] 2.2 Rename `markReady()` to `completeOrder()` and set status = `completed`
- [x] 2.3 Remove unused `createKitchenOrder()` parameters (stationId, notes, prepTimeEstimate)
- [x] 2.4 Implement optimistic locking in `startPreparing()` to prevent concurrent chef claims
- [x] 2.5 Add pagination to `getAllKitchenOrders()` method
- [x] 2.6 Add include relations in queries to prevent N+1 problem

### 3. Backend Order Service
- [x] 3.1 Remove kitchen order creation from `createOrder()` in `order.service.ts`
- [x] 3.2 Update `updateOrderStatus()` to trigger kitchen order creation when status = `confirmed`
- [x] 3.3 Add status transition validation using `isValidStatusTransition()` helper
- [x] 3.4 Update order validation to check `serving` status when adding/removing items

### 4. Backend Constants & Helpers
- [x] 4.1 Update `KITCHEN_STATUS_FLOW` in constants to reflect new flow: `pending → preparing → completed`
- [x] 4.2 Update `isValidStatusTransition()` in helpers for new simplified flow
- [x] 4.3 Remove unused constants: `SLOW_PREP_TIME_THRESHOLD`, `MAX_CONCURRENT_ORDERS`, `AUTO_CANCEL_TIMEOUT_MINUTES`

### 5. WebSocket Events Standardization
- [x] 5.1 Update Kitchen Gateway to use standard event structure with `event`, `data`, `timestamp`, `source` fields
- [x] 5.2 Rename events: `order:new` → keep, `order:update` → `kitchen:preparing`, `order:completed` → `kitchen:completed`
- [x] 5.3 Add missing event: `kitchen:preparing` when chef starts preparing
- [x] 5.4 Remove event: `kitchen:ready` (merged into `kitchen:completed`)
- [x] 5.5 Implement room-based broadcasting: `kitchen`, `waiter:${staffId}`, `table:${tableId}`

## Phase 2: Frontend Critical Fixes (Week 2)

### 6. Frontend Type Definitions
- [x] 6.1 Update `order.types.ts` - Change financial fields from `number` to `string` (totalAmount, discountAmount, taxAmount, finalAmount)
- [x] 6.2 Add helper function `parseDecimal(value: string): number` in order utils
- [x] 6.3 Update `kitchen.types.ts` - Remove `READY` status from KitchenOrderStatus enum
- [x] 6.4 Update `kitchen.types.ts` - Ensure KitchenPriority matches backend: `"low" | "normal" | "high" | "urgent"`
- [x] 6.5 Update OrderItemStatus enum - Change `ready` to `active` to match backend

### 7. Frontend WebSocket Fixes
- [x] 7.1 Fix `useOrderSocket.ts` - Connect to `/orders` namespace instead of base URL
- [x] 7.2 Update event listeners in `useOrderSocket.ts` to match backend events
- [x] 7.3 Apply singleton pattern to `useKitchenSocket.ts` (like Order module)
- [x] 7.4 Update event names in Kitchen hooks: listen to `kitchen:preparing`, `kitchen:completed`
- [x] 7.5 Remove event listener for `kitchen:ready` (deprecated)

### 8. Frontend Validation Schemas
- [x] 8.1 Add phone validation regex in `order.schemas.ts`: `/^[0-9]{10,11}$/`
- [x] 8.2 Add max constraint to `partySize` (max: 50) in customer schema
- [x] 8.3 Add max length to `specialRequests` (max: 500) in customer schema
- [x] 8.4 Add max constraint to `quantity` (max: 99) in order item schema
- [x] 8.5 Add max length to `specialRequest` (max: 200) in order item schema

### 9. Frontend Error Handling
- [x] 9.1 Add error interceptor in `axios.ts` to show toast on errors
- [x] 9.2 Add `onError` handlers to all mutation hooks in Order module
- [x] 9.3 Add `onError` handlers to all mutation hooks in Kitchen module
- [x] 9.4 Add retry logic (retry: 1) to critical mutations
- [x] 9.5 Create `OrderErrorBoundary` and `KitchenErrorBoundary` components

## Phase 3: Performance & Polish (Week 3)

### 10. Frontend Performance Optimizations
- [x] 10.1 Add `useMemo` for filtered orders in `KitchenDisplayView.tsx`
- [x] 10.2 Add debounced localStorage save in `CreateOrderView.tsx` (1000ms delay)
- [x] 10.3 Add debounced query invalidation in WebSocket handlers (500ms delay)
- [ ] 10.4 Split large components into smaller memoized sub-components

### 11. Backend Performance
- [x] 11.1 Add include relations in `getAllKitchenOrders()` to fetch order, table, items in one query
- [x] 11.2 Implement pagination (default: page=1, limit=20) in kitchen orders endpoint
- [x] 11.3 Add targeted room broadcasting in WebSocket (avoid broadcast to all clients)

### 12. Edge Cases Handling
- [x] 12.1 Add validation to prevent adding items when order status is `serving`
- [ ] 12.2 Handle orphan kitchen orders with cascade delete
- [ ] 12.3 Add unique constraint validation in createKitchenOrder to prevent duplicates
- [ ] 12.4 Test concurrent chef claims with optimistic locking

### 13. Documentation & Testing
- [ ] 13.1 Update ORDER_API.md with new status flow and events
- [ ] 13.2 Update KITCHEN_API.md with simplified operations
- [ ] 13.3 Update ORDER_MANAGEMENT.md use case with new flow
- [ ] 13.4 Create migration guide for existing data
- [ ] 13.5 Manual testing: Create order → Confirm → Kitchen prepare → Complete flow
- [ ] 13.6 Manual testing: WebSocket real-time updates for both modules
- [ ] 13.7 Manual testing: Status transition validation
- [ ] 13.8 Manual testing: Concurrent chef claims scenario

### 14. UI Updates
- [x] 14.1 Update Kitchen status badges to show only 3 states: Pending, Preparing, Completed
- [x] 14.2 Update Kitchen action buttons: "Start Preparing", "Complete Order"
- [x] 14.3 Update Kitchen filters to remove "Ready" option
- [x] 14.4 Update Order detail view to show correct kitchen status
- [x] 14.5 Add loading states and error boundaries to critical views

## Validation Checklist

Before marking complete:
- [x] All database migrations applied successfully
- [x] Backend passes `npm run build` without errors
- [ ] Frontend passes `npm run build` without errors
- [x] No TypeScript errors in either codebase
- [ ] WebSocket connections work for both namespaces
- [ ] Manual testing completed for all critical flows
- [ ] Documentation updated
- [x] No breaking changes for unrelated features
