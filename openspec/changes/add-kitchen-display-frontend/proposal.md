# Proposal: Kitchen Display System Frontend

## Why?

### Problem Statement
The backend Kitchen module is fully implemented with:
- 6 API endpoints (GET list/detail, PATCH start/ready/complete/cancel)
- WebSocket real-time updates (order:new, order:update, order:completed)
- Complete business logic (queue management, prep time tracking, priority system)
- Performance metrics and helper functions

However, **there is no frontend interface for kitchen staff** (chefs) to:
- View incoming orders in real-time
- Claim and start preparing orders
- Mark orders as ready for pickup
- Track preparation times and queue status
- Receive audio/visual notifications for new orders

### Business Impact
Without a Kitchen Display System:
- ❌ Chefs cannot see orders digitally (relying on paper tickets)
- ❌ No real-time communication between waiters and kitchen
- ❌ No visibility into order queue and priorities
- ❌ No tracking of preparation times
- ❌ Manual coordination between kitchen stations
- ❌ Risk of missed or delayed orders

### User Personas
1. **Chef/Cook** (primary user)
   - Needs: Real-time order queue, claim orders, mark ready
   - Pain: Paper tickets, manual timing, no queue visibility

2. **Kitchen Manager**
   - Needs: Monitor queue, track performance metrics, reassign orders
   - Pain: No overview of kitchen efficiency

3. **Waiter** (indirect user)
   - Benefits: Real-time notifications when food is ready
   - Integration: Order Management module receives "order:ready" events

## What?

### High-Level Overview
Build a **Kitchen Display System (KDS)** frontend module that provides:
- Real-time order queue with WebSocket updates
- Card-based order display with color-coded statuses
- One-tap actions (Start, Ready, Complete, Cancel)
- Audio/visual notifications for new orders
- Preparation time tracking with performance indicators
- Responsive design for kitchen tablets/monitors

### Module Structure
```
app/client/src/modules/kitchen/
├── components/
│   ├── KitchenOrderCard.tsx          # Order card with status, items, actions
│   ├── OrderStatusBadge.tsx          # Status indicator (pending/ready/completed)
│   ├── PrepTimeIndicator.tsx         # Timer showing elapsed time
│   ├── OrderItemsList.tsx            # List of menu items to prepare
│   ├── PriorityBadge.tsx             # Priority indicator (urgent/high/normal/low)
│   └── KitchenStats.tsx              # Dashboard stats (queue length, avg time)
├── views/
│   └── KitchenDisplayView.tsx        # Main kitchen dashboard
├── hooks/
│   ├── useKitchenOrders.ts           # React Query for orders list
│   ├── useKitchenOrderById.ts        # React Query for order detail
│   ├── useStartPreparing.ts          # Mutation to start order
│   ├── useMarkReady.ts               # Mutation to mark ready
│   ├── useMarkCompleted.ts           # Mutation to mark completed
│   ├── useCancelKitchenOrder.ts      # Mutation to cancel
│   └── useKitchenSocket.ts           # WebSocket integration
├── services/
│   └── kitchen.service.ts            # API client
├── types/
│   └── kitchen.types.ts              # TypeScript interfaces
├── utils/
│   ├── kitchen-helpers.ts            # Utility functions
│   └── audio-notifications.ts        # Sound effects
├── constants/
│   └── kitchen.constants.ts          # Status colors, timeouts
└── README.md                         # Module documentation
```

### Routes
- `/kitchen` - Main kitchen display (single page, full-screen optimized)

### Core Features

#### 1. Real-time Order Queue
- **Pending Orders**: New orders awaiting chef to start
- **In Progress**: Orders being prepared (shows timer)
- **Ready for Pickup**: Completed orders waiting for waiter
- **Auto-sorting**: Priority (urgent → high → normal → low) + creation time
- **WebSocket sync**: Instant updates when orders change

#### 2. Order Card Display
Each card shows:
- Order number & table info
- Customer name (if provided)
- List of items with quantities and special requests
- Priority badge (color-coded)
- Elapsed time since creation (auto-updating)
- Current status
- Quick action buttons

#### 3. One-Tap Actions
- **Start Preparing** (pending → ready) - Claims order, records start time
- **Mark Ready** (ready → ready) - Signals food is done, notifies waiters
- **Complete** (ready → completed) - Waiter picked up
- **Cancel** - Remove from queue

#### 4. Notifications
- **Audio alert**: New order sound effect
- **Visual flash**: Red border on new order cards
- **Browser notification**: For background awareness
- **Vibration** (on mobile devices)

#### 5. Performance Tracking
- **Prep time timer**: Shows elapsed time for each order
- **Color indicators**:
  - Green: Fast (< 10 min)
  - Yellow: On-time (10-30 min)
  - Red: Slow (> 30 min)
- **Queue stats**: Total pending, in-progress, ready

#### 6. Filtering & Views
- **Status filter**: Show only pending, in-progress, or ready
- **Priority filter**: Focus on urgent/high priority
- **Compact/detailed view**: Toggle between card sizes
- **Full-screen mode**: Hide navigation for dedicated display

### UI/UX Paradigm
- **Single-page dashboard**: No navigation between pages
- **Card-based layout**: Grid of order cards (3-4 columns)
- **Color-coded status**: Green (ready), yellow (preparing), gray (pending)
- **Large touch targets**: Optimized for kitchen tablets
- **Auto-refresh**: WebSocket + periodic polling fallback
- **Minimal input**: One-tap actions, no forms
- **Always visible**: Designed to run 24/7 on kitchen monitor

### Integration Points

#### Backend APIs
```
GET    /kitchen/orders        → List orders with filters
GET    /kitchen/orders/:id    → Order detail
PATCH  /kitchen/orders/:id/start    → Start preparing
PATCH  /kitchen/orders/:id/ready    → Mark ready
PATCH  /kitchen/orders/:id/complete → Mark completed
PATCH  /kitchen/orders/:id/cancel   → Cancel order
```

#### WebSocket Events (Namespace: `/kitchen`)
```
Listen:
- order:new          → New order in queue (play sound)
- order:update       → Order status changed
- order:completed    → Order picked up (remove from display)

Emit: (none - all actions via HTTP)
```

#### Cross-module Integration
- **Order Management**: Receives "kitchen:order-ready" event when chef marks ready
- **Menu Module**: Display menu item names, images, categories
- **Tables Module**: Show table number/name
- **Staff Module**: Track which chef claimed which order

### Technical Stack
- **React Query**: Server state management, auto-refetch
- **Socket.io**: Real-time WebSocket connection
- **React Hook Form + Zod**: (minimal - only for cancel dialog)
- **Radix UI**: Button, Badge, Card components
- **Tailwind CSS**: Responsive layout, color system
- **Howler.js / Web Audio API**: Notification sounds
- **date-fns**: Time formatting and calculations

### Security & Permissions
- **Required permission**: `kitchen.read` (view orders), `kitchen.write` (update status)
- **Role access**: Chef, Kitchen Manager
- **JWT authentication**: All API calls require auth token
- **WebSocket auth**: Connection authenticated with JWT

### Responsive Design
- **Desktop/Monitor** (primary): 3-4 column grid, large cards
- **Tablet**: 2 column grid, medium cards
- **Mobile**: Single column, compact cards (fallback)
- **Full-screen mode**: Hide app navigation, maximize order display

## Impact

### Positive
✅ **Kitchen Efficiency**
- Real-time order visibility eliminates paper tickets
- One-tap actions speed up workflow
- Priority sorting ensures urgent orders handled first
- Prep time tracking identifies bottlenecks

✅ **Better Communication**
- WebSocket sync between kitchen and waiters
- Instant "ready" notifications reduce wait times
- Reduced errors from misread tickets

✅ **Performance Metrics**
- Track average prep times per chef
- Identify slow orders for process improvement
- Monitor queue length to manage capacity

✅ **User Experience**
- Audio/visual alerts prevent missed orders
- Color-coded status for quick scanning
- Large touch targets for ease of use in kitchen environment

✅ **Scalability**
- Supports multiple kitchen stations (future)
- Can handle high order volumes with auto-sorting
- WebSocket ensures real-time sync across devices

### Negative / Tradeoffs
⚠️ **Hardware Dependency**
- Requires tablet/monitor in kitchen (one-time cost)
- Needs reliable WiFi/network in kitchen area

⚠️ **Learning Curve**
- Chefs need training on digital system (vs paper)
- Mitigation: Simple UI with minimal actions

⚠️ **Single Point of Failure**
- If system goes down, kitchen has no orders
- Mitigation: Fallback to paper tickets, system monitoring

⚠️ **Screen Real Estate**
- Limited space for many concurrent orders
- Mitigation: Pagination, auto-hide completed orders

⚠️ **Notification Fatigue**
- Too many alerts can be annoying
- Mitigation: Configurable sound volume, auto-dismiss

### Migration Path
1. **Phase 1**: Build basic kitchen display (view orders, mark ready)
2. **Phase 2**: Add WebSocket real-time updates and notifications
3. **Phase 3**: Add performance metrics and queue management
4. **Phase 4**: Deploy to kitchen on dedicated tablet
5. **Training**: 1-2 hour session for kitchen staff

### Rollback Strategy
- Keep paper ticket system as backup for first 2 weeks
- If critical issues arise, disable WebSocket and use polling
- System monitoring alerts if kitchen display goes offline

## Risks

### Technical Risks
1. **WebSocket Reliability**
   - Risk: Connection drops in kitchen WiFi
   - Mitigation: Auto-reconnect logic, fallback to polling every 10s
   - Impact: Medium

2. **Audio Permissions**
   - Risk: Browser blocks autoplay of notification sounds
   - Mitigation: User interaction to enable sound, visual fallback
   - Impact: Low

3. **Performance (Many Orders)**
   - Risk: 50+ concurrent orders slow down UI
   - Mitigation: Virtualization, pagination, auto-hide old orders
   - Impact: Low (typical restaurant has < 20 concurrent)

4. **Network Latency**
   - Risk: Slow network delays order updates
   - Mitigation: Optimistic updates, loading states
   - Impact: Medium

### Operational Risks
1. **Chef Resistance to Digital**
   - Risk: Kitchen staff prefer paper tickets
   - Mitigation: Training, gradual rollout, keep paper as backup
   - Impact: High (change management)

2. **Device Failure**
   - Risk: Tablet breaks or battery dies
   - Mitigation: Backup tablet, wall-powered setup, paper fallback
   - Impact: High

3. **Screen Visibility**
   - Risk: Kitchen lighting makes screen hard to read
   - Mitigation: High-contrast colors, adjustable brightness
   - Impact: Low

### Business Risks
1. **ROI on Hardware**
   - Risk: Cost of tablets not justified
   - Mitigation: Use existing tablets, measure efficiency gains
   - Impact: Low (tablets are inexpensive)

2. **Workflow Disruption**
   - Risk: Learning curve slows kitchen during training
   - Mitigation: Off-peak training, gradual rollout
   - Impact: Medium

### Mitigation Summary
- **High Risk**: Device failure → Maintain paper backup system for 1 month
- **Medium Risk**: WebSocket drops → Auto-reconnect + polling fallback
- **Medium Risk**: Network latency → Optimistic UI updates
- **Low Risk**: Audio blocked → Visual alerts + vibration

### Unknowns
- 🤔 Exact kitchen WiFi signal strength (needs testing)
- 🤔 Ideal screen size for kitchen environment (test with chefs)
- 🤔 Optimal notification volume (adjust based on kitchen noise)
- 🤔 Whether chefs want item-level tracking vs order-level (start simple)

## Success Metrics
- ✅ 100% of orders visible in kitchen within 1 second of confirmation
- ✅ < 5 second latency for WebSocket updates
- ✅ 95%+ chef satisfaction (survey after 1 month)
- ✅ 20%+ reduction in average order prep time
- ✅ Zero missed orders due to system failure
- ✅ < 2 hours training time for new kitchen staff

## Alternatives Considered
1. **Paper Tickets** (current state)
   - ❌ No real-time updates, manual, error-prone
   
2. **Third-party KDS** (e.g., Elo, Square KDS)
   - ❌ Monthly subscription costs
   - ❌ Limited customization
   - ❌ Does not integrate with our backend

3. **Email/SMS Notifications**
   - ❌ Not real-time enough
   - ❌ Requires chef to check phone

4. **Printer-only System**
   - ❌ No digital queue visibility
   - ❌ No prep time tracking

**Decision**: Build custom KDS for full control, integration, and cost savings.

## Timeline Estimate
- **Module Setup & Routes**: 2 hours
- **API Service Layer**: 3 hours
- **React Query Hooks**: 4 hours
- **Core Components** (OrderCard, StatusBadge, etc.): 8 hours
- **Kitchen Display View**: 6 hours
- **WebSocket Integration**: 4 hours
- **Audio Notifications**: 3 hours
- **Responsive Design**: 4 hours
- **Testing & Bug Fixes**: 6 hours
- **Documentation**: 2 hours
- **Deployment & Training**: 4 hours

**Total**: ~46 hours (~1 week for 1 developer)

## Conclusion
Building a Kitchen Display System frontend is **essential** for modernizing kitchen operations. The backend is ready, and this frontend will unlock real-time order management, reduce errors, and provide valuable performance metrics. The risks are manageable with proper fallback strategies, and the ROI is clear in efficiency gains and customer satisfaction.

**Recommendation**: ✅ Proceed with implementation using the proposed module structure and phased rollout approach.
