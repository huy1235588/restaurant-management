# Specification Delta: Table Visualization

## ADDED Requirements

### Requirement: TV-001 - Floor Plan View
**Priority**: P0 (Critical)  
**Category**: User Interface  
**Owner**: Frontend Team

The system SHALL provide a visual floor plan view that displays restaurant tables in a 2D canvas layout with real-time status indicators.

#### Scenario: Restaurant manager views floor plan
**Given** the user is authenticated as a manager  
**And** the user navigates to `/tables`  
**And** the floor plan view is selected (default view)  
**When** the page loads  
**Then** the system SHALL display a canvas showing all tables for the currently selected floor  
**And** each table SHALL be rendered as a card showing:
- Table number (required)
- Table name (if available)
- Capacity indicator (e.g., "👥 4")
- Status color indicator (🟢 available, 🔴 occupied, 🟡 reserved, 🔵 maintenance)
**And** tables SHALL be positioned in a grid layout if no custom positions are stored  
**And** the system SHALL display a legend showing status color meanings  
**And** the system SHALL display a count of tables by status (e.g., "🟢 Trống (8) | 🔴 Đang Dùng (3)")

**Acceptance Criteria**:
- ✅ Canvas renders without errors on Chrome, Firefox, Safari, Edge
- ✅ All active tables for selected floor are visible
- ✅ Status colors match design specifications
- ✅ Page loads in < 2 seconds with 100 tables
- ✅ Responsive layout works on desktop (1024px+) and tablet (768px+)

---

### Requirement: TV-002 - Floor and Section Filtering
**Priority**: P0 (Critical)  
**Category**: User Interface  
**Owner**: Frontend Team

The system SHALL allow users to filter the floor plan view by floor and section.

#### Scenario: User filters tables by floor
**Given** the user is on the floor plan view  
**And** tables exist on multiple floors (e.g., Floor 1, Floor 2, Floor 3)  
**When** the user selects "Floor 2" from the floor dropdown  
**Then** the canvas SHALL display only tables on Floor 2  
**And** the table count SHALL update to reflect filtered results  
**And** the URL SHALL update to `/tables?floor=2` for bookmarkability  

#### Scenario: User filters by section
**Given** the user is on the floor plan view  
**And** the user has selected "Floor 1"  
**And** tables have sections defined (e.g., "VIP", "Garden", "Indoor")  
**When** the user clicks the "Garden" section filter chip  
**Then** the canvas SHALL display only tables in the "Garden" section on Floor 1  
**And** the section chip SHALL appear in an active/selected state  
**And** the user SHALL be able to clear the filter by clicking the chip again  

**Acceptance Criteria**:
- ✅ Floor selector dropdown shows all floors with table counts
- ✅ Section filters appear as toggle chips
- ✅ Filters apply instantly (< 100ms)
- ✅ URL parameters sync with filter state
- ✅ Filters persist on page refresh
- ✅ "Clear All Filters" button resets to default view

---

### Requirement: TV-003 - Table Card Interactions
**Priority**: P0 (Critical)  
**Category**: User Interface  
**Owner**: Frontend Team

The system SHALL provide interactive table cards with hover effects, click actions, and contextual information.

#### Scenario: User hovers over table card
**Given** the user is viewing the floor plan  
**When** the user hovers the mouse over a table card  
**Then** the system SHALL display a tooltip showing:
- Table number and name
- Current status
- Capacity (e.g., "Seats 4-6")
- Current occupancy if occupied (e.g., "3/6 occupied")
- Time since status change (e.g., "Occupied 1h 23m ago")
**And** the card SHALL have a subtle hover effect (border highlight or shadow)

#### Scenario: User clicks on table card
**Given** the user is viewing the floor plan  
**And** the user has permission to view table details  
**When** the user clicks on a table card  
**Then** the system SHALL open a table details panel/drawer  
**And** the panel SHALL display:
- Full table information (number, name, capacity, floor, section, status, QR code)
- Current order information if occupied
- Current reservation information if reserved
- Quick action buttons (Edit, Change Status, View QR)

#### Scenario: User right-clicks on table card
**Given** the user is viewing the floor plan  
**When** the user right-clicks on a table card  
**Then** the system SHALL display a context menu with quick actions:
- Change Status → submenu with available statuses
- Edit Table
- View QR Code
- Assign to Order (if available)
- Delete Table (with confirmation)

**Acceptance Criteria**:
- ✅ Tooltips appear within 200ms of hover
- ✅ Click actions respond within 100ms
- ✅ Context menu aligns properly and doesn't overflow viewport
- ✅ Actions are disabled based on user permissions
- ✅ Keyboard navigation works (Tab to focus, Enter to activate)

---

### Requirement: TV-004 - Canvas Zoom and Pan Controls
**Priority**: P1 (High)  
**Category**: User Interface  
**Owner**: Frontend Team

The system SHALL provide zoom and pan controls for navigating large floor plans.

#### Scenario: User zooms in on floor plan
**Given** the user is viewing the floor plan  
**When** the user clicks the "+" zoom button  
**Then** the canvas SHALL zoom in by 25% centered on the viewport  
**And** the zoom level SHALL be capped at 200%  
**And** the zoom level indicator SHALL update (e.g., "150%")

#### Scenario: User zooms using mouse wheel
**Given** the user is viewing the floor plan  
**When** the user scrolls the mouse wheel up while hovering over the canvas  
**Then** the canvas SHALL zoom in by 10% per wheel notch  
**And** the zoom SHALL be centered on the cursor position

#### Scenario: User pans the canvas
**Given** the user is viewing the floor plan  
**And** the canvas is zoomed in beyond 100%  
**When** the user clicks and drags on the canvas background  
**Then** the canvas SHALL pan following the mouse movement  
**And** the cursor SHALL change to a grab/grabbing icon

#### Scenario: User resets zoom
**Given** the user has zoomed and panned the canvas  
**When** the user clicks the "Reset View" button  
**Then** the canvas SHALL return to 100% zoom  
**And** the canvas SHALL center on the viewport  
**And** the transition SHALL be smooth (300ms animation)

**Acceptance Criteria**:
- ✅ Zoom range: 50% to 200%
- ✅ Smooth zoom animations
- ✅ Pan boundaries prevent scrolling beyond floor plan
- ✅ Touch gestures work on tablets (pinch to zoom, drag to pan)
- ✅ Keyboard shortcuts work: `Ctrl +` (zoom in), `Ctrl -` (zoom out), `Ctrl 0` (reset)

---

### Requirement: TV-005 - Table Status Legend
**Priority**: P2 (Medium)  
**Category**: User Interface  
**Owner**: Frontend Team

The system SHALL display a persistent legend explaining table status colors and states.

#### Scenario: User views status legend
**Given** the user is on the floor plan view  
**When** the page loads  
**Then** the system SHALL display a legend at the bottom of the canvas showing:
- 🟢 Available (Trống) - Green circle
- 🔴 Occupied (Đang Dùng) - Red circle
- 🟡 Reserved (Đã Đặt) - Yellow circle
- 🔵 Maintenance (Bảo Trì) - Blue circle
**And** each status SHALL show a count of tables (e.g., "🟢 Available (12)")  
**And** the legend SHALL update in real-time as statuses change

#### Scenario: User filters by status via legend
**Given** the user is viewing the floor plan  
**When** the user clicks on a status in the legend (e.g., "🟢 Available (12)")  
**Then** the canvas SHALL highlight only tables with that status  
**And** other tables SHALL be dimmed/faded (opacity 0.3)  
**And** clicking the same status again SHALL clear the filter

**Acceptance Criteria**:
- ✅ Legend is always visible (sticky to bottom or sidebar)
- ✅ Status counts update in real-time
- ✅ Legend is accessible (screen reader friendly)
- ✅ Status filter works with other filters (floor, section)

---

### Requirement: TV-006 - Empty State Handling
**Priority**: P2 (Medium)  
**Category**: User Interface  
**Owner**: Frontend Team

The system SHALL display appropriate empty states when no tables match the current filters or no tables exist.

#### Scenario: No tables exist in database
**Given** the user is authenticated  
**And** no tables have been created yet  
**When** the user navigates to `/tables`  
**Then** the system SHALL display an empty state illustration  
**And** the message SHALL say "No tables found. Get started by creating your first table."  
**And** a "Create Table" button SHALL be prominently displayed  

#### Scenario: No tables match current filters
**Given** the user is viewing the floor plan  
**And** the user has applied filters (e.g., Floor 3, Section "VIP")  
**And** no tables match these filters  
**When** the filtered results are empty  
**Then** the system SHALL display a message "No tables found matching your filters"  
**And** a "Clear Filters" button SHALL be displayed  
**And** the current filter values SHALL be shown

**Acceptance Criteria**:
- ✅ Empty states are visually distinct and friendly
- ✅ Clear call-to-action buttons are provided
- ✅ Messages are localized (EN/VI)
- ✅ Empty state doesn't show loading spinners

---

### Requirement: TV-007 - View Mode Toggle
**Priority**: P1 (High)  
**Category**: User Interface  
**Owner**: Frontend Team

The system SHALL allow users to switch between Floor Plan view and List view.

#### Scenario: User switches to List view
**Given** the user is viewing the Floor Plan  
**When** the user clicks the "List View" tab/button  
**Then** the system SHALL navigate to the List view  
**And** the URL SHALL update to `/tables?view=list`  
**And** the current filters SHALL be preserved  
**And** the view preference SHALL be saved to user settings/local storage

#### Scenario: User returns to Floor Plan view
**Given** the user is in List view  
**When** the user clicks the "Floor Plan" tab/button  
**Then** the system SHALL return to the Floor Plan view  
**And** the previously selected floor and filters SHALL be restored  

**Acceptance Criteria**:
- ✅ View toggle is prominently placed (tabs or segmented control)
- ✅ Active view is clearly indicated
- ✅ View preference persists across sessions
- ✅ Both views share the same data source and filters
- ✅ Switching views is instant (< 100ms)

---

## MODIFIED Requirements

None. This is a new capability.

---

## REMOVED Requirements

None. This is a new capability.

---

## Dependencies

- **Spec**: `table-crud` - Requires table data to be available
- **Spec**: `table-realtime` - Status updates should reflect in real-time
- **Component Library**: Radix UI (Dialog, Dropdown, Tooltip)
- **State Management**: Zustand store for table state
- **UI Framework**: Next.js 16 with App Router

---

## Testing Requirements

### Unit Tests
- [ ] TableCard component renders correctly with all status types
- [ ] FloorSelector displays correct floor list
- [ ] Canvas zoom calculations are accurate
- [ ] Legend status counts calculate correctly

### Integration Tests
- [ ] Floor filter updates canvas and URL
- [ ] Status filter via legend dims other tables
- [ ] Zoom and pan controls work together
- [ ] View toggle preserves filters

### E2E Tests
- [ ] User can navigate full floor plan workflow
- [ ] User can switch between floors and see correct tables
- [ ] User can interact with table cards and see details
- [ ] Real-time updates appear on canvas

### Performance Tests
- [ ] Floor plan with 200 tables renders in < 2s
- [ ] Zoom/pan operations run at 60fps
- [ ] Status updates render in < 100ms

### Accessibility Tests
- [ ] Keyboard navigation works for all controls
- [ ] Screen readers announce table statuses correctly
- [ ] Color contrast meets WCAG AA standards
- [ ] Focus indicators are visible

---

## Implementation Notes

### Technical Decisions

1. **Canvas vs. HTML Elements**: Use HTML divs for table cards instead of Canvas API
   - **Reason**: Better accessibility, easier interaction handling, native CSS animations
   - **Trade-off**: Slightly lower performance with 200+ tables, mitigated by virtual scrolling

2. **Grid Layout**: Use CSS Grid for table positioning
   - **Reason**: Simple, responsive, no complex calculations needed initially
   - **Future**: Migrate to absolute positioning when drag-and-drop is implemented

3. **Real-time Updates**: Integrate with WebSocket events defined in `table-realtime` spec
   - **Event**: `table:status_changed` → Update table card color
   - **Event**: `table:created` → Add new table card to canvas
   - **Event**: `table:deleted` → Remove table card from canvas

### Open Questions

1. **Q**: Should the floor plan support custom backgrounds (floor plan images)?
   **A**: Not in Phase 1. Defer to Phase 2 as enhancement.

2. **Q**: Should we support printing the floor plan?
   **A**: Yes, add "Print Floor Plan" button that generates a printer-friendly view.

3. **Q**: Maximum number of tables per floor?
   **A**: No hard limit, but performance testing required for 100+ tables per floor.
