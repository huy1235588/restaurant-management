# Kitchen Display System - Technical Design

## Context
The Kitchen Display System (KDS) is a specialized interface for kitchen operations, extending the basic kitchen order management from the order-management capability. The KDS must operate in challenging kitchen environments with heat, noise, grease, and time pressure. The system requires large displays (32"+), touchscreen support, hands-free keyboard operation, instant real-time updates, and must handle high-concurrency scenarios during rush hours when 20+ orders may be active simultaneously. The design must prioritize visibility, speed, and fault tolerance over visual polish.

## Goals / Non-Goals

**Goals:**
- Provide full-screen dedicated KDS interface optimized for kitchen environment (large fonts, high contrast)
- Support multiple priority levels with automatic escalation for long-waiting orders
- Enable efficient workload distribution across multiple chefs and workstations
- Provide item-level preparation tracking with individual timers
- Implement intuitive drag-and-drop and keyboard-driven workflows
- Support batch cooking to improve kitchen efficiency
- Deliver real-time synchronization across multiple KDS displays
- Provide comprehensive kitchen performance analytics for management

**Non-Goals:**
- General-purpose order management (covered in order-management capability)
- Customer-facing displays (separate feature)
- Recipe management and instruction systems (separate feature, may link via QR codes)
- Inventory depletion tracking (separate inventory-management capability)
- Voice command support (future enhancement, out of scope for initial implementation)

## Decisions

### Decision 1: Three-Column Kanban Layout with Drag-and-Drop
**What:** Use kanban board with three fixed columns (Pending, In Progress, Ready) allowing drag-and-drop between columns.

**Why:**
- Visual representation of workflow stages intuitive for kitchen staff
- Drag-and-drop provides tactile feedback suitable for touchscreens
- Fixed columns prevent confusion vs customizable boards
- Industry-standard pattern (used by most commercial KDS systems)
- Easy to see bottlenecks at a glance (too many in Pending = capacity issue)

**Alternatives Considered:**
- **List View:** Less visual, harder to see stage distribution
- **Timeline View:** Too complex for fast-paced kitchen environment
- **Grid View:** Doesn't convey workflow progression clearly

**Implementation:**
- Use dnd-kit library for drag-and-drop (better touch support than react-beautiful-dnd)
- Validate status transitions server-side to prevent invalid drags
- Provide keyboard shortcuts as alternative to drag for hygiene (greasy hands)
- Auto-scroll to newly added orders in Pending column

### Decision 2: Auto-Escalation Based on Wait Time
**What:** Automatically escalate orders to Express priority when wait time exceeds 20 minutes.

**Why:**
- Prevents orders from being forgotten during rush hours
- Reduces customer complaints about long waits
- No manual intervention required from managers
- Clear threshold easy to understand and tune
- Industry standard (most restaurants target 15-20 min for main courses)

**Thresholds:**
```
0-15 min: Normal (green timer)
15-20 min: Warning (yellow timer)
20-25 min: Auto-escalate to Express (red badge, alert sound)
25+ min: Critical (pulsing red, continuous alert)
```

**Implementation:**
- Background cron job runs every 5 minutes to check wait times
- Update priority in database and broadcast via WebSocket
- Play alert sound on all connected KDS displays
- Log escalation events for analytics

**Trade-off:** May create false urgency if kitchen is genuinely at capacity, but better than missing orders.

### Decision 3: Chef Assignment with Workload Balancing
**What:** Allow manual chef assignment with workload indicators to suggest balanced distribution.

**Why:**
- Some dishes require specific chef expertise (grill master, pastry chef)
- Automatic assignment may not account for chef skills or current station availability
- Workload visibility helps managers balance load manually
- Suggested assignment speeds up decision without forcing it

**Workload Calculation:**
```
workload_score = (active_orders * 2) + (total_items) + (complex_items * 1.5)
```

**Display:**
```
Chef Assignment:
[●] Chef Hai - Workload: 15 (3 orders, 8 items) ← Suggested
[ ] Chef Linh - Workload: 22 (4 orders, 14 items)
[ ] Chef Tâm - Workload: 8 (2 orders, 4 items)
```

**Implementation:**
- Calculate workload on-demand when showing assignment dialog
- Highlight chef with lowest workload
- Allow manager override for skill-based assignment
- Broadcast workload changes via WebSocket

**Trade-off:** Adds complexity vs full automation, but preserves chef autonomy and skill matching.

### Decision 4: Item-Level Status Tracking
**What:** Track status for each item independently within an order (Preparing, Almost Ready, Ready).

**Why:**
- Orders often have items prepared at different rates (appetizer before main)
- Chef can mark items ready as completed without waiting for entire order
- Provides better progress visibility for partial completion
- Enables staged plating (ready items kept warm while others finish)

**Status Flow Per Item:**
```
PENDING → PREPARING → ALMOST_READY → READY
```

**Order Completion Rule:**
- Order stays in "In Progress" until ALL items marked READY
- Then automatically moves to "Ready" column
- Sends waiter notification when order moves to Ready

**Implementation:**
- Each OrderItem has independent status field in database
- Display checkboxes for each item on KDS card
- Show progress bar: "3/5 items ready (60%)"
- Update via WebSocket for real-time sync

### Decision 5: Multi-Device WebSocket Synchronization
**What:** Use Socket.io rooms to broadcast updates to all connected KDS displays instantly.

**Why:**
- Kitchen may have multiple displays (main board, station-specific screens)
- All displays must show consistent state
- Prevents duplicate work if two chefs see different states
- Enables manager monitoring from office display

**Room Strategy:**
```
Rooms:
- kitchen-all: All KDS displays
- kitchen-station-grill: Grill station only
- kitchen-station-fryer: Fryer station only
- kitchen-chef-{id}: Specific chef's personal view
```

**Conflict Resolution:**
- Last-write-wins for status updates
- Optimistic locking using updatedAt timestamp
- Display toast notification if conflict detected
- Log conflicts for debugging

**Implementation:**
- Join appropriate rooms on KDS connection
- Broadcast events to relevant rooms only (avoid spam)
- Handle reconnection with state resync from server
- Display offline indicator when disconnected

### Decision 6: Batch Cooking Detection and Suggestion
**What:** Automatically detect when multiple pending orders contain same item and suggest batch cooking.

**Detection Logic:**
```
IF (pending orders contain item X ≥ 3 times) THEN
  suggest_batch(item_name, order_ids, total_quantity)
```

**Why:**
- Batch cooking saves time and energy (cook 5 steaks at once vs individually)
- Reduces variability in item quality (all cooked together)
- Improves kitchen throughput during rush hours
- Industry best practice for high-volume items

**Display:**
```
Batch Opportunity:
🔥 Beef Steak x5 across orders #001, #003, #005, #007, #009
[Start Batch] [Dismiss]
```

**Implementation:**
- Scan pending orders every 60 seconds for batch opportunities
- Threshold configurable (default ≥3 of same item)
- Batch tracking links items across orders with shared timer
- Mark all linked items ready when batch completes
- Analytics show time saved vs individual cooking

**Trade-off:** Adds complexity and may delay first order waiting for others, but net efficiency gain outweighs cost.

### Decision 7: Configurable Audio Notification System
**What:** Multi-channel notification system with configurable sounds, volumes, and types.

**Notification Channels:**
1. **Sound Alerts:** Bell chime for new orders, urgent beep for overdue
2. **Visual Flash:** Screen border flash + "NEW ORDER" banner
3. **Browser Push:** Background notifications when app not focused

**Configuration:**
```javascript
NotificationSettings {
  soundEnabled: boolean
  soundVolume: number (0-10)
  soundType: 'bell' | 'chime' | 'beep'
  visualEnabled: boolean
  pushEnabled: boolean
  muteUntil: timestamp | null
}
```

**Why:**
- Kitchens are noisy; sound alone may be missed
- Multiple channels increase notification reliability
- Personal preferences vary (some chefs prefer visual-only)
- Mute function prevents alert fatigue during known delays

**Implementation:**
- Use Web Audio API for precise volume control
- Store preferences in localStorage per device
- Provide mute button with duration selector (5/10/15/30 min)
- Test sound button in settings for calibration

**Trade-off:** More configuration options add complexity, but necessary for diverse kitchen environments.

### Decision 8: Keyboard Shortcuts for Hands-Free Operation
**What:** Comprehensive keyboard shortcuts to enable full KDS operation without touch/mouse.

**Primary Shortcuts:**
```
Navigation:
↑ ↓       - Select previous/next order
Enter     - View details
Escape    - Close modal

Actions:
S         - Start preparing
R         - Mark ready
C         - Cancel
H         - Help overlay

Filters:
1         - VIP only
2         - Express only
3         - Normal only
0         - Show all
M         - Mute alerts
F5/Ctrl+R - Refresh
```

**Why:**
- Kitchen environment often has wet, greasy, or gloved hands
- Keyboard faster than touchscreen for experienced users
- Reduces touchscreen wear in harsh environment
- Accessibility for staff with mobility limitations

**Implementation:**
- Global keyboard event listener with preventDefault
- Visual focus indicator for selected order
- Help overlay shows all shortcuts (press H)
- Context-aware shortcuts (different in modal vs main view)

**Trade-off:** Learning curve for new staff, but training pays off quickly.

### Decision 9: Priority Sorting Algorithm
**What:** Multi-factor sorting algorithm prioritizing by flag, wait time, and VIP status.

**Sorting Formula:**
```javascript
sort_key = (priority_weight * 10000) + (wait_minutes * 10) + vip_bonus

where:
  priority_weight = VIP: 3, Express: 2, Normal: 1
  vip_bonus = is_vip ? 1000 : 0
  wait_minutes = minutes since order creation
```

**Example Sort Order:**
```
1. VIP Express (old) - score: 31,250
2. VIP Normal (old) - score: 30,200
3. Express Normal - score: 20,150
4. Normal (old) - score: 10,120
5. Normal (new) - score: 10,005
```

**Why:**
- Clear, predictable sorting behavior
- VIP always at top regardless of age
- Within same priority, older orders first (FIFO)
- Express escalation for delays ensures no orders forgotten

**Implementation:**
- Calculate sort key on backend when querying orders
- Sort in SQL query for performance (vs client-side)
- Recalculate on every order state change or new arrival
- Allow manager manual override to move specific order to top

### Decision 10: Prep Time Learning Algorithm
**What:** Track actual prep times and use weighted moving average to improve future estimates.

**Learning Formula:**
```javascript
new_estimate = (current_estimate * 0.7) + (actual_time * 0.3)
```

**Why:**
- Menu-configured prep times are estimates, may not match reality
- Different chefs have different speeds
- Complexity factors (special requests) affect time
- More accurate estimates improve customer expectations

**Data Collected:**
- Item name
- Estimated prep time (from menu)
- Actual prep time (from start to ready)
- Special requests presence (yes/no)
- Chef ID
- Time of day (rush hour vs slow)

**Implementation:**
- Record prep times on kitchen order completion
- Run daily batch job to recalculate estimates
- Store learned estimates in separate table to preserve originals
- Display accuracy metrics in analytics dashboard

**Trade-off:** Requires training period (2-4 weeks) before estimates stabilize.

## Risks / Trade-offs

### Risk 1: WebSocket Reliability in Kitchen Environment
**Risk:** Kitchen may have poor WiFi coverage, metal surfaces interfere, or router overwhelmed during peak.

**Mitigation:**
- Implement exponential backoff reconnection (1s, 2s, 4s, 8s, max 30s)
- Queue local changes during disconnection and sync on reconnect
- Display prominent offline indicator (red banner)
- Fallback to thermal printer if WebSocket down > 5 minutes
- Consider wired Ethernet for critical KDS displays

**Trade-off:** Additional complexity for offline handling vs assuming perfect connectivity.

### Risk 2: Performance with 50+ Active Orders
**Risk:** During peak hours (dinner rush), KDS may slow down with many orders rendering and updating.

**Mitigation:**
- Implement virtual scrolling (only render visible orders)
- Limit WebSocket update frequency (max 1 update per 500ms per order)
- Use React.memo and useMemo aggressively
- Consider pagination (show only active orders, archive completed)
- Load test with 100 concurrent orders

**Trade-off:** Optimization effort vs accepting slower UI during peaks.

### Risk 3: Touchscreen Durability in Kitchen
**Risk:** Grease, heat, water splashes damage touchscreens or reduce responsiveness.

**Mitigation:**
- Use industrial-grade touchscreens rated for food service (IP65 waterproof)
- Provide protective screen covers (replaceable)
- Support keyboard operation as primary input method
- Train staff to use knuckles/stylus instead of fingers
- Provide screen cleaning supplies and schedule

**Trade-off:** Higher hardware cost vs regular replacements.

### Risk 4: Alert Fatigue from Overdue Notifications
**Risk:** Continuous alerts for overdue orders cause staff to ignore all notifications.

**Mitigation:**
- Escalate alert frequency gradually (first alert at 20 min, continuous only at 25+ min)
- Provide Mute button with duration for known delays
- Manager can acknowledge delays to silence alerts (equipment failure, special order)
- Analytics track alert silence frequency to identify staffing issues

**Trade-off:** Risk of missed orders vs alert fatigue if too aggressive.

### Risk 5: Drag-and-Drop Accidental Moves
**Risk:** Chef accidentally drags order to wrong column causing incorrect status.

**Mitigation:**
- Require deliberate drag motion (not triggered by tap)
- Show confirmation dialog for invalid transitions (Ready → Pending)
- Undo button visible for 10 seconds after move
- Log all status changes with timestamp and user for audit
- Keyboard shortcuts as safer alternative

**Trade-off:** Confirmation dialogs slow down workflow vs preventing errors.

## Migration Plan

**Phase 1: Basic KDS Layout (Week 1-2)**
1. Implement three-column kanban layout
2. Create order card component with all fields
3. Add real-time WebSocket sync
4. Implement basic drag-and-drop
5. Test on large display hardware

**Phase 2: Priority and Chef Management (Week 3)**
1. Implement priority badging and sorting
2. Add auto-escalation background job
3. Build chef assignment dialog
4. Implement workload distribution display
5. Test priority sorting logic

**Phase 3: Advanced Features (Week 4-5)**
1. Add item-level status tracking
2. Implement real-time timers
3. Build batch cooking detection
4. Add audio notification system
5. Implement keyboard shortcuts

**Phase 4: Analytics and Configuration (Week 6)**
1. Build kitchen analytics dashboard
2. Add performance metrics calculation
3. Implement settings and configuration UI
4. Add workstation management
5. Test all features integrated

**Phase 5: Testing and Deployment (Week 7)**
1. Usability testing with real chefs
2. Load testing with 100 concurrent orders
3. Fix critical bugs and UX issues
4. Train kitchen staff on KDS usage
5. Deploy to production
6. Monitor for 72 hours
7. Collect feedback and iterate

**Rollback Plan:**
- Feature flag to disable KDS and use basic kitchen order view
- No database schema changes (uses existing kitchen_orders table)
- WebSocket disconnection automatically falls back to polling
- Thermal printer backup for critical order tickets

## Open Questions

1. **Q:** Should KDS support split-screen mode (two orders side-by-side) on ultra-wide displays?
   **A:** Yes, implement optional layout toggle for 40"+ displays. Default to single column for ≤32".

2. **Q:** How to handle station-specific displays when order has items from multiple stations?
   **A:** Show order on ALL relevant station displays, but highlight only items for that station.

3. **Q:** Should batch cooking be mandatory or optional suggestion?
   **A:** Optional suggestion only. Allow chef to dismiss or start batch. Don't force batching.

4. **Q:** What happens if auto-escalation triggers during known outage (equipment failure)?
   **A:** Provide "Pause Escalation" button for managers to temporarily disable during incidents.

5. **Q:** Should KDS support multiple languages simultaneously (bilingual display)?
   **A:** No. Display in one language at a time based on logged-in chef preference. Too cluttered otherwise.

6. **Q:** How to handle prep time estimation when chef switches in middle of cooking?
   **A:** Credit original chef for start, new chef for completion. Analytics show both contributions.

7. **Q:** Should completed orders stay on KDS for a duration before disappearing?
   **A:** Yes, keep in "Ready" column for 2 minutes to confirm pickup. Then archive. Configurable duration.

8. **Q:** What printer format for kitchen tickets (80mm thermal)?
   **A:** Standard 80mm thermal with large font (14pt+), clear item list, bold special requests.
