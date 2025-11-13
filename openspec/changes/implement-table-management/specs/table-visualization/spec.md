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

The system SHALL allow users to switch between Floor Plan view, Visual Floor Plan view, and List view.

#### Scenario: User switches to List view
**Given** the user is viewing the Floor Plan  
**When** the user clicks the "List View" tab/button  
**Then** the system SHALL navigate to the List view  
**And** the URL SHALL update to `/tables?view=list`  
**And** the current filters SHALL be preserved  
**And** the view preference SHALL be saved to user settings/local storage

#### Scenario: User switches to Visual Floor Plan view
**Given** the user is viewing the Floor Plan or List view  
**When** the user clicks the "Visual Floor Plan" tab/button  
**Then** the system SHALL navigate to the Visual Floor Plan view  
**And** the URL SHALL update to `/tables?view=visual`  
**And** the current filters SHALL be preserved  
**And** the system SHALL load the saved floor plan layout (if exists)

#### Scenario: User returns to Floor Plan view
**Given** the user is in List view or Visual Floor Plan view  
**When** the user clicks the "Floor Plan" tab/button  
**Then** the system SHALL return to the Floor Plan view  
**And** the previously selected floor and filters SHALL be restored  

**Acceptance Criteria**:
- ✅ View toggle is prominently placed (tabs or segmented control with 3 options)
- ✅ Active view is clearly indicated
- ✅ View preference persists across sessions
- ✅ All three views share the same data source and filters
- ✅ Switching views is instant (< 100ms)
- ✅ Visual Floor Plan view preserves custom layouts between switches

---

### Requirement: TV-008 - Visual Floor Plan Editor
**Priority**: P1 (High)  
**Category**: User Interface  
**Owner**: Frontend Team

The system SHALL provide an enhanced visual floor plan editor with advanced table positioning, sizing, and customization capabilities.

#### Scenario: User accesses Visual Floor Plan editor
**Given** the user is authenticated as a manager  
**And** the user navigates to `/tables?view=visual`  
**When** the Visual Floor Plan view loads  
**Then** the system SHALL display an interactive canvas with all tables  
**And** each table SHALL be draggable, resizable, and rotatable  
**And** the system SHALL show an editor toolbar with layout tools  
**And** the system SHALL display saved floor plan layouts if available

#### Scenario: User drags and positions table
**Given** the user is in Visual Floor Plan view  
**When** the user clicks and drags a table card  
**Then** the table SHALL move smoothly following the cursor  
**And** the system SHALL show grid snapping indicators  
**And** the system SHALL show alignment guides when table aligns with other tables  
**And** the cursor SHALL change to a "grabbing" icon  
**And** the new position SHALL be temporarily saved (before final save)

#### Scenario: User resizes table
**Given** the user is in Visual Floor Plan view  
**When** the user hovers over a table card edge  
**Then** resize handles SHALL appear on all four corners and edges  
**When** the user drags a resize handle  
**Then** the table SHALL resize proportionally or by edge depending on handle  
**And** the table dimensions SHALL be displayed (e.g., "150x100")  
**And** the system SHALL enforce minimum size limits (50x50 pixels)

#### Scenario: User rotates table
**Given** the user is in Visual Floor Plan view  
**When** the user clicks on a table and drags the rotation handle  
**Then** the table SHALL rotate around its center point  
**And** the rotation angle SHALL be displayed (e.g., "45°")  
**And** the system SHALL snap to 15° increments when Shift key is pressed

**Acceptance Criteria**:
- ✅ Drag-and-drop is smooth (60fps performance)
- ✅ Grid snapping can be toggled on/off
- ✅ Alignment guides appear within 5px threshold
- ✅ Resize maintains aspect ratio when Shift is pressed
- ✅ Rotation range: 0-360 degrees
- ✅ All positioning changes are reversible with Undo (Ctrl+Z)

---

### Requirement: TV-009 - Custom Table Shapes and Styles
**Priority**: P2 (Medium)  
**Category**: User Interface  
**Owner**: Frontend Team

The system SHALL support custom table shapes, styles, and visual properties in the Visual Floor Plan view.

#### Scenario: User changes table shape
**Given** the user is in Visual Floor Plan view  
**And** the user has selected a table  
**When** the user opens the table properties panel  
**And** the user selects a shape from the dropdown (Rectangle, Circle, Square, Oval)  
**Then** the table SHALL update to the selected shape  
**And** the capacity indicator SHALL adjust to fit the new shape  
**And** the shape preference SHALL be saved to the database

#### Scenario: User customizes table appearance
**Given** the user is in Visual Floor Plan view  
**And** the user has selected a table  
**When** the user opens the appearance settings  
**Then** the user SHALL be able to customize:
- Border color and thickness
- Background color (status colors by default)
- Label font size and color
- Icon display (show/hide capacity, status icons)
**And** customizations SHALL be previewed in real-time  
**And** a "Reset to Default" option SHALL be available

**Acceptance Criteria**:
- ✅ 4 basic shapes supported: Rectangle, Circle, Square, Oval
- ✅ Shape changes preserve table dimensions where possible
- ✅ Custom styles persist in database
- ✅ Style changes sync across all connected clients
- ✅ Accessibility: custom colors must meet WCAG AA contrast ratio

---

### Requirement: TV-010 - Floor Plan Background and Layers
**Priority**: P2 (Medium)  
**Category**: User Interface  
**Owner**: Frontend Team

The system SHALL support background images and multiple layers in the Visual Floor Plan view.

#### Scenario: User uploads floor plan background image
**Given** the user is in Visual Floor Plan view  
**And** the user has manager permissions  
**When** the user clicks "Upload Background" button  
**And** the user selects an image file (PNG, JPG, SVG)  
**Then** the system SHALL upload the image to the server  
**And** the image SHALL be displayed as the canvas background  
**And** the image SHALL be resizable and repositionable  
**And** the opacity SHALL be adjustable (0-100%)  
**And** the system SHALL save the background configuration per floor

#### Scenario: User manages canvas layers
**Given** the user is in Visual Floor Plan view  
**When** the user opens the layers panel  
**Then** the system SHALL display all layers:
- Background Image layer (bottom)
- Grid/Guide layer (optional)
- Table layer (top)
- Annotation layer (optional)  
**And** the user SHALL be able to toggle layer visibility  
**And** the user SHALL be able to lock/unlock layers

**Acceptance Criteria**:
- ✅ Supports PNG, JPG, SVG image formats (max 10MB)
- ✅ Background images are stored per floor
- ✅ Image aspect ratio is preserved
- ✅ Opacity range: 0% (invisible) to 100% (opaque)
- ✅ Layer order is fixed but visibility is toggleable

---

### Requirement: TV-011 - Layout Templates and Presets
**Priority**: P2 (Medium)  
**Category**: User Interface  
**Owner**: Frontend Team

The system SHALL provide layout templates and the ability to save/load multiple floor plan configurations.

#### Scenario: User saves current floor plan layout
**Given** the user is in Visual Floor Plan view  
**And** the user has customized table positions and styles  
**When** the user clicks "Save Layout" button  
**And** the user enters a layout name (e.g., "Weekend Setup", "Private Event")  
**Then** the system SHALL save all table positions, sizes, rotations, and styles  
**And** the layout SHALL appear in the "Saved Layouts" dropdown  
**And** a success notification SHALL be shown

#### Scenario: User loads saved layout
**Given** the user is in Visual Floor Plan view  
**And** saved layouts exist for the current floor  
**When** the user selects a layout from the "Saved Layouts" dropdown  
**Then** the system SHALL prompt for confirmation if unsaved changes exist  
**And** the system SHALL apply the saved layout configuration  
**And** all tables SHALL animate to their saved positions  
**And** the animation SHALL take 500ms

#### Scenario: User uses a layout template
**Given** the user is setting up a new floor  
**And** no tables have been positioned yet  
**When** the user clicks "Use Template" button  
**Then** the system SHALL show template options:
- "Fine Dining" (square tables, formal spacing)
- "Casual Dining" (mixed shapes, flexible spacing)
- "Bar/Lounge" (high tables along walls)
- "Banquet Hall" (long rectangular tables)  
**When** the user selects a template  
**Then** the system SHALL auto-generate table positions based on template  
**And** the user SHALL be able to customize after applying

**Acceptance Criteria**:
- ✅ Users can save unlimited layouts per floor
- ✅ Layouts include positions, sizes, rotations, styles, and background
- ✅ Loading layouts shows smooth animation
- ✅ Template system provides 4+ starter templates
- ✅ Layouts can be exported as JSON for backup

---

### Requirement: TV-012 - Visual Floor Plan Grid and Snapping
**Priority**: P1 (High)  
**Category**: User Interface  
**Owner**: Frontend Team

The system SHALL provide a grid system and snapping functionality for precise table alignment.

#### Scenario: User toggles grid visibility
**Given** the user is in Visual Floor Plan view  
**When** the user clicks the "Show Grid" toggle button  
**Then** a grid overlay SHALL appear on the canvas  
**And** grid lines SHALL be evenly spaced (default 20px intervals)  
**And** grid color SHALL be subtle (gray with low opacity)  
**And** grid setting SHALL persist in user preferences

#### Scenario: User enables snap-to-grid
**Given** the user is in Visual Floor Plan view  
**And** the grid is visible  
**When** the user enables "Snap to Grid" option  
**And** the user drags a table  
**Then** the table SHALL snap to the nearest grid intersection  
**And** snapping SHALL provide haptic feedback (visual pulse)  
**And** the snap threshold SHALL be 10 pixels

#### Scenario: User uses alignment guides
**Given** the user is in Visual Floor Plan view  
**And** the user is dragging a table  
**When** the table aligns horizontally or vertically with another table  
**Then** a colored guide line SHALL appear (magenta for horizontal, cyan for vertical)  
**And** the table SHALL snap to the alignment  
**And** the guide SHALL disappear when alignment is broken

**Acceptance Criteria**:
- ✅ Grid intervals are configurable (10px, 20px, 50px)
- ✅ Grid can be hidden/shown with keyboard shortcut (G key)
- ✅ Snap-to-grid can be temporarily disabled with Ctrl key
- ✅ Alignment guides work for center, edges, and corners
- ✅ Performance: grid rendering doesn't impact drag performance

---

### Requirement: TV-013 - Visual Floor Plan Actions and Undo
**Priority**: P1 (High)  
**Category**: User Interface  
**Owner**: Frontend Team

The system SHALL provide action history with undo/redo capabilities and a comprehensive action toolbar.

#### Scenario: User undoes layout change
**Given** the user is in Visual Floor Plan view  
**And** the user has made changes (moved, resized, or styled tables)  
**When** the user presses Ctrl+Z or clicks the "Undo" button  
**Then** the last action SHALL be reversed  
**And** the table SHALL animate back to its previous state  
**And** the undo history count SHALL decrement

#### Scenario: User redoes undone action
**Given** the user is in Visual Floor Plan view  
**And** the user has undone one or more actions  
**When** the user presses Ctrl+Shift+Z or clicks the "Redo" button  
**Then** the last undone action SHALL be reapplied  
**And** the redo history count SHALL decrement

#### Scenario: User saves floor plan layout
**Given** the user is in Visual Floor Plan view  
**And** the user has made unsaved changes  
**When** the user clicks the "Save" button  
**Then** the system SHALL persist all table positions, sizes, rotations, and styles  
**And** the system SHALL clear the undo/redo history  
**And** a success toast SHALL appear ("Layout saved successfully")  
**And** the "Unsaved Changes" indicator SHALL disappear

**Acceptance Criteria**:
- ✅ Undo history supports up to 50 actions
- ✅ Undo/redo works for: move, resize, rotate, style changes
- ✅ Keyboard shortcuts: Ctrl+Z (undo), Ctrl+Shift+Z (redo), Ctrl+S (save)
- ✅ Unsaved changes warning appears on view switch or page exit
- ✅ Action toolbar shows undo/redo availability (disabled when history empty)

---

### Requirement: TV-014 - Visual Floor Plan Toolbar and Controls
**Priority**: P1 (High)  
**Category**: User Interface  
**Owner**: Frontend Team

The system SHALL provide a comprehensive toolbar with essential controls and tools for the Visual Floor Plan editor.

#### Scenario: User accesses editor toolbar
**Given** the user is in Visual Floor Plan view  
**When** the page loads  
**Then** a toolbar SHALL be displayed at the top or side of the canvas  
**And** the toolbar SHALL contain the following tools:
- Selection tool (default)
- Pan tool (hand icon)
- Add table tool (+ icon)
- Delete tool (trash icon)
- Zoom controls (+, -, fit to screen)
- Grid toggle
- Snap to grid toggle
- Undo/redo buttons
- Save layout button
- Load layout dropdown
- Settings button

#### Scenario: User uses selection tool
**Given** the user is in Visual Floor Plan view  
**And** the selection tool is active (default)  
**When** the user clicks on a table  
**Then** the table SHALL be selected (highlighted border)  
**And** the properties panel SHALL show table details  
**And** resize and rotation handles SHALL appear

#### Scenario: User uses pan tool
**Given** the user is in Visual Floor Plan view  
**When** the user activates the pan tool  
**Then** the cursor SHALL change to a hand icon  
**And** clicking and dragging SHALL pan the entire canvas  
**And** tables SHALL not be selectable while pan tool is active  
**And** the user can toggle back to selection tool by pressing Esc or clicking the tool

**Acceptance Criteria**:
- ✅ Toolbar is docked and doesn't overlap canvas
- ✅ Tool icons have tooltips explaining functionality
- ✅ Active tool is visually highlighted
- ✅ Keyboard shortcuts switch tools: V (select), H (pan), T (add table), Delete (delete)
- ✅ Toolbar adapts to mobile (collapsible menu)

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
