# Order Management Frontend Module

## Why

Sau khi hoàn thành module Reservation, hệ thống cần module Order Management để xử lý luồng nghiệp vụ chính của nhà hàng: từ khách đặt bàn → gọi món → bếp nấu → phục vụ → thanh toán.

**Hiện trạng:**
- ✅ Backend đã hoàn tất: Order API + Kitchen API với đầy đủ endpoints
- ✅ Kitchen Display frontend đã có cho chef
- ❌ **Thiếu**: Order Management UI cho waiter/manager để:
  - Tạo đơn hàng mới cho bàn
  - Xem danh sách đơn hàng
  - Thêm/sửa/hủy món trong đơn
  - Theo dõi trạng thái real-time
  - Xác nhận món đã phục vụ

Order Management là **module trung tâm** kết nối:
- Reservation → Order (khách đã đặt bàn → gọi món)
- Menu → Order (chọn món từ menu)
- Table → Order (gắn đơn với bàn)
- Order → Kitchen (gửi đơn cho bếp)
- Order → Bill (tạo hóa đơn thanh toán)

## What Changes

Tạo **Order Management Frontend Module** hoàn chỉnh với cấu trúc tương tự các modules hiện tại (menu, reservations, tables):

### 1. Module Structure
```
app/client/src/modules/order/
├── components/          # UI components
│   ├── OrderCard.tsx           # Display order summary
│   ├── OrderItemList.tsx       # List items in order
│   ├── OrderStatusBadge.tsx    # Status indicator
│   ├── MenuItemSelector.tsx    # Menu item selection component
│   ├── TableSelector.tsx       # Table selection component
│   ├── StepIndicator.tsx       # Progress stepper
│   └── index.ts
├── dialogs/            # Modal dialogs (only for confirmations)
│   ├── CancelItemDialog.tsx    # Cancel item with reason
│   ├── CancelOrderDialog.tsx   # Cancel entire order
│   └── index.ts
├── views/              # Page-level views
│   ├── OrderListView.tsx       # List all orders
│   ├── OrderDetailView.tsx     # Order details
│   ├── CreateOrderView.tsx     # Create new order (multi-step)
│   ├── EditOrderView.tsx       # Edit/add items to order
│   └── index.ts
├── hooks/              # Custom React hooks
│   ├── useOrders.ts            # Fetch orders list
│   ├── useOrder.ts             # Fetch single order
│   ├── useCreateOrder.ts       # Create order mutation
│   ├── useAddItems.ts          # Add items mutation
│   ├── useCancelItem.ts        # Cancel item mutation
│   ├── useCancelOrder.ts       # Cancel order mutation
│   ├── useMarkItemServed.ts    # Mark item served
│   ├── useOrderSocket.ts       # WebSocket real-time
│   └── index.ts
├── services/           # API services
│   ├── order.service.ts        # Order API calls
│   └── index.ts
├── types/              # TypeScript types
│   ├── order.types.ts          # Order interfaces/enums
│   └── index.ts
├── utils/              # Utilities
│   ├── order.utils.ts          # Helper functions
│   └── index.ts
├── README.md           # Module documentation
└── index.ts            # Barrel exports
```

### 2. New Frontend Routes
```
/orders                 # Order list (OrderListView)
/orders/new             # Create new order (CreateOrderView)
/orders/[id]            # Order detail (OrderDetailView)
/orders/[id]/edit       # Edit order / Add items (EditOrderView)
```

### 3. Key Features

#### A. Order List View (`/orders`)
- **Danh sách đơn hàng** với filters:
  - Status: pending, confirmed, ready, serving, completed, cancelled
  - Table: filter by table
  - Staff: filter by waiter
  - Date range: today, this week, this month, custom
  - Search: by order number, customer name, phone
- **Sorting**: by time, total amount, status
- **Pagination**: with page/limit controls
- **Actions**:
  - View details (navigate to detail)
  - Add items (navigate to edit page)
  - Cancel order (open dialog)
  - Mark as served
- **Real-time updates** via WebSocket
- **Create Order button** - Navigate to `/orders/new`

#### B. Order Detail View (`/orders/[id]`)
- **Order information**:
  - Order number, table, waiter, party size
  - Customer name, phone (if any)
  - Status with visual badge
  - Timestamps: created, confirmed, completed
- **Order items table**:
  - Item name, quantity, unit price, total
  - Special requests (highlighted)
  - Item status: pending, ready, served, cancelled
  - Actions: cancel item, mark served
- **Totals calculation**:
  - Subtotal
  - Service charge (if applicable)
  - Tax (if applicable)
  - Discount (if applicable)
  - Final total
- **Action buttons**:
  - Add items (navigate to `/orders/[id]/edit`)
  - Cancel order (open dialog)
  - Print order
  - Create bill (redirect to billing)
- **Order history/timeline**:
  - All status changes
  - Items added/cancelled
  - Who did what and when

#### C. Create Order Page (`/orders/new`)
**Multi-step form with progress indicator**

- **Step 1: Select Table**
  - Visual table grid (reuse from tables module)
  - Filter by floor, section, status
  - Show table capacity and current status
  - Validation: table must be available or reserved
  - "Skip" option for takeaway/delivery orders (future)
  
- **Step 2: Customer Info** (optional)
  - Customer name (optional)
  - Phone number (optional, validated format)
  - Party size (required, default: 1)
  - Link to existing reservation (search by phone/name)
  - Auto-fill if reservation selected
  
- **Step 3: Add Menu Items**
  - Category tabs (appetizers, mains, desserts, drinks)
  - Menu items grid with images
  - Add to cart with quantity selector
  - Special requests per item (text input)
  - Shopping cart sidebar showing:
    - Selected items with quantities
    - Individual prices
    - Running subtotal
    - Remove/edit item buttons
  - Search and filter menu items
  
- **Step 4: Review & Confirm**
  - Summary of all information:
    - Table details
    - Customer information
    - Complete item list with special requests
  - Order notes (general, optional)
  - Price breakdown:
    - Subtotal
    - Service charge (if applicable)
    - Tax (if applicable)
    - **Grand Total**
  - Edit buttons for each section (go back to step)
  - "Create Order" button (large, prominent)
  - "Cancel" button (returns to order list)

**Navigation:**
- Progress stepper at top (Step 1 of 4)
- "Next" / "Back" buttons
- "Save as Draft" option (optional, future)
- Breadcrumb: Orders > New Order
- Confirm before leaving page if form has data

#### D. Edit Order Page (`/orders/[id]/edit`)
**For adding items to existing order**

- **Current Order Summary** (read-only header)
  - Order number, table, status
  - Current items list (collapsed/expandable)
  - Current total
  
- **Add New Items Section**
  - Same menu browsing as create order step 3
  - Category tabs and item grid
  - Add to cart with quantities
  - Special requests
  - New items cart (separate from existing)
  
- **Review Changes Section**
  - Current items (grayed out, read-only)
  - New items to add (highlighted)
  - Updated total calculation
  - Show difference: `+X VND`
  
- **Action Buttons**
  - "Add Items to Order" (submit)
  - "Cancel" (back to order detail)
  
**Validation:**
- Cannot edit if order is completed or cancelled
- Cannot edit if bill already created
- Show warning if kitchen is already cooking items

**Navigation:**
- Breadcrumb: Orders > [Order #] > Add Items
- Confirm before leaving if cart has items

#### E. Cancel Item Dialog
- Select item to cancel
- **Reason required**:
  - Customer changed mind
  - Item out of stock
  - Wrong order
  - Customer doesn't want to wait
  - Other (with text)
- Check item status (can't cancel if already served)
- Update total automatically

#### F. Cancel Order Dialog
- Show order summary
- **Reason required**:
  - Customer cancelled
  - Wrong order created
  - Customer left without waiting
  - Restaurant issue
  - Other (with text)
- **Manager approval** if items already cooking
- Calculate cancellation fee (if any)
- Release table automatically

### 4. WebSocket Integration
- Listen to events:
  - `order:created` - New order created
  - `order:status-changed` - Status updated
  - `order:updated` - Order modified
  - `order:items-added` - Items added
  - `order:item-cancelled` - Item cancelled
  - `order:cancelled` - Order cancelled
  - `kitchen:order-ready` - Kitchen finished cooking
- Auto-refresh affected orders
- Show notifications/toasts

### 5. API Integration
Use existing backend endpoints:
- `GET /orders` - List orders
- `GET /orders/:id` - Get order
- `POST /orders` - Create order
- `PATCH /orders/:id/items` - Add items
- `DELETE /orders/:id/items/:itemId` - Cancel item
- `DELETE /orders/:id` - Cancel order
- `PATCH /orders/:id/status` - Update status
- `PATCH /orders/:id/items/:itemId/serve` - Mark served

### 6. State Management
- React Query for server state (caching, auto-refetch)
- WebSocket for real-time updates
- Local state for dialogs/forms

### 7. Permissions
Integrate with existing permission system:
- `orders.read` - View orders
- `orders.create` - Create orders
- `orders.update` - Modify orders (add items, mark served)
- `orders.delete` - Cancel orders/items

## Impact

### Affected Specs
- **NEW**: `order-management` - New frontend capability
- **MODIFIED**: Navigation/routing - Add `/orders` routes
- **INTEGRATION**: Existing modules that interact with orders:
  - `tables` - Create order from table
  - `menu` - Select items for order
  - `kitchen` - Already displays orders (no changes needed)
  - `billing` - Create bill from order (future)

### Affected Code
**New files created:**
- `app/client/src/modules/order/` - Entire new module
- `app/client/src/app/(dashboard)/orders/page.tsx` - Order list page
- `app/client/src/app/(dashboard)/orders/new/page.tsx` - Create order page
- `app/client/src/app/(dashboard)/orders/[id]/page.tsx` - Order detail page
- `app/client/src/app/(dashboard)/orders/[id]/edit/page.tsx` - Edit order page
- `app/client/src/types/order.ts` - Shared order types (if not exists)

**Modified files:**
- `app/client/src/app/(dashboard)/layout.tsx` - Add orders navigation item
- `app/client/src/types/permissions.ts` - May need to verify order permissions
- `app/client/src/proxy.ts` - May need to add role-based routes

### Dependencies
- Existing: React Query, Socket.io-client, React Hook Form, Zod
- UI components: Radix UI (already in use)
- No new dependencies needed

### Breaking Changes
- **NONE** - This is a new feature addition, no existing functionality affected

### Migration Required
- **NONE** - No database or API changes needed (backend already complete)

### Testing Scope
- Manual testing for all CRUD operations
- Test WebSocket real-time updates
- Test permission-based access
- Test integration with tables and menu modules

### Documentation Updates
- Add Order Management section to user guide
- Update architecture docs with new frontend module
- Add screenshots/demo to README

## Risks & Mitigation

### Technical Risks
1. **Real-time sync complexity**
   - Risk: WebSocket events may miss or duplicate
   - Mitigation: Use React Query refetch as fallback, add event deduplication

2. **State management complexity**
   - Risk: Complex state with multiple sources (API, WebSocket, local)
   - Mitigation: Use React Query as single source of truth, WebSocket only triggers refetch

### Business Risks
1. **Incomplete features affecting workflow**
   - Risk: If order module is incomplete, waiters can't work
   - Mitigation: Implement in phases (view → create → modify → cancel)

2. **Permission issues**
   - Risk: Wrong permissions block staff from working
   - Mitigation: Test with all roles (waiter, manager, chef, cashier)

### Timeline Risk
- **Moderate complexity**: ~3-5 days development
- Phased implementation recommended

## Implementation Phases

### Phase 1: Foundation (Day 1)
- [ ] Module structure setup
- [ ] Types and interfaces
- [ ] API service layer
- [ ] Basic hooks (useOrders, useOrder)

### Phase 2: Order List (Day 2)
- [ ] OrderListView with filters
- [ ] OrderCard component
- [ ] OrderStatusBadge
- [ ] Pagination
- [ ] "Create Order" button → Navigate to /orders/new

### Phase 3: Create Order Page (Day 2-3)
- [ ] CreateOrderView (multi-step form)
- [ ] Step 1: TableSelector component
- [ ] Step 2: Customer info form
- [ ] Step 3: MenuItemSelector component with cart
- [ ] Step 4: Review and confirm
- [ ] StepIndicator (progress stepper)
- [ ] Form validation (Zod)
- [ ] Navigation between steps with state preservation
- [ ] Breadcrumb navigation

### Phase 4: Order Details (Day 3)
- [ ] OrderDetailView
- [ ] OrderItemList
- [ ] Action buttons
- [ ] "Add Items" button → Navigate to /orders/[id]/edit
- [ ] Breadcrumb navigation

### Phase 5: Edit Order Page & Dialogs (Day 4)
- [ ] EditOrderView (add items page)
- [ ] Reuse MenuItemSelector component
- [ ] Show current vs new items comparison
- [ ] CancelItemDialog (confirmation only)
- [ ] CancelOrderDialog (confirmation only)
- [ ] Mark item served functionality

### Phase 6: Real-time & Polish (Day 5)
- [ ] WebSocket integration
- [ ] Notifications/toasts
- [ ] Loading states
- [ ] Error handling
- [ ] Testing all scenarios

## Success Criteria

✅ **Must Have:**
- View all orders with filters and pagination
- Create new order with multi-step form (dedicated page)
- Add items to existing order (dedicated page)
- Cancel items with reason (confirmation dialog)
- Cancel entire order with reason (confirmation dialog)
- Mark items as served
- Real-time updates via WebSocket
- Responsive UI (mobile-friendly)
- Permission-based access control
- Step-by-step navigation with progress indicator
- Form state preservation between steps
- Breadcrumb navigation

🎯 **Should Have:**
- Print order functionality
- Order timeline/history
- Search by customer name/phone/order number
- Batch operations (mark multiple items served)
- Sound notification for new orders
- Save draft functionality for incomplete orders
- Auto-save form progress in localStorage
- Shopping cart with visual item counter

💡 **Nice to Have:**
- Order analytics dashboard
- Estimated completion time
- Table-based order view (group by table)
- Staff performance metrics

## Open Questions

1. **Order Number Format**: Use UUID (backend default) or generate custom format (e.g., ORD-20241123-001)?
   - **Recommendation**: Keep UUID for uniqueness, show formatted version in UI

2. **Auto-refresh Interval**: How often should order list refresh?
   - **Recommendation**: 30s polling + WebSocket for instant updates

3. **Cancellation Fee Logic**: Should frontend calculate or just display backend-calculated fee?
   - **Recommendation**: Backend calculates, frontend displays

4. **Print Format**: Thermal printer (80mm) or A4 format?
   - **Recommendation**: Support both, let user choose in settings

5. **Offline Mode**: Should app work offline with queue?
   - **Recommendation**: Not in MVP, consider for v2

## Next Steps After Approval

1. Review and approve this proposal
2. Create detailed technical design (if needed)
3. Set up module structure
4. Implement Phase 1 (Foundation)
5. Iterative implementation following phases
6. Testing and bug fixes
7. Documentation and training materials
8. Deploy and monitor

---

**Status**: ⏳ Awaiting Approval
**Priority**: 🔴 High (Core Feature)
**Effort**: 📊 Medium (3-5 days)
