# Implementation Tasks: Table Management

## Phase 1: Core Features (Week 1-2)

### Backend Enhancements
- [x] **Task 1.1**: Add WebSocket events for table status changes
  - [x] Create `table:status_changed` event emitter
  - [x] Create `table:created` event emitter
  - [x] Create `table:updated` event emitter
  - [x] Create `table:deleted` event emitter
  - [x] Add event listeners in socket handler
  - [ ] Test event broadcasting to all connected clients
  - **Validation**: WebSocket events emit within 100ms of database changes

- [x] **Task 1.2**: Enhance table API endpoints
  - [x] Add `GET /tables/stats` endpoint for dashboard statistics
  - [ ] Add validation for table status transitions
  - [ ] Add optimistic locking for concurrent updates
  - [x] Add bulk update endpoint `PATCH /tables/bulk`
  - **Validation**: All endpoints return correct HTTP status codes and error messages

### Frontend Setup
- [x] **Task 2.1**: Create table page structure
  - [x] Create `app/client/src/app/(dashboard)/tables/page.tsx`
  - [ ] Create `app/client/src/app/(dashboard)/tables/layout.tsx`
  - [ ] Add route metadata and SEO tags
  - [x] Implement loading and error states
  - **Validation**: Page renders at `/tables` route without errors

- [x] **Task 2.2**: Set up Zustand store for table state
  - [x] Extend `tableStore.ts` with full CRUD actions
  - [x] Add real-time sync actions (WebSocket integration)
  - [x] Add optimistic UI update logic
  - [x] Add error handling and rollback logic
  - **Validation**: Store updates trigger component re-renders correctly

- [x] **Task 2.3**: Create shared table components
  - [x] Create `TableStatusBadge` component
  - [x] Create `TableCard` component (for floor plan)
  - [x] Create `TableRowActions` component (for list view)
  - [x] Create `FloorSelector` component
  - **Validation**: Components render with correct styling and props

### List View Implementation
- [x] **Task 3.1**: Build table list/grid view
  - [x] Create data table with sortable columns
  - [x] Implement column headers (Number, Name, Capacity, Floor, Section, Status, QR Code, Actions)
  - [ ] Add row selection (single/multi)
  - [x] Add pagination controls
  - [x] Add empty state illustration
  - **Validation**: List displays all tables with correct data

- [x] **Task 3.2**: Implement search and filtering
  - [x] Add search input (by table number/name)
  - [x] Add status filter dropdown (all, available, occupied, reserved, maintenance)
  - [x] Add floor filter
  - [x] Add section filter
  - [ ] Add active/inactive toggle
  - [ ] Implement debounced search (300ms)
  - **Validation**: Filters update results correctly, URL params sync with filters

- [x] **Task 3.3**: Add quick actions menu
  - [x] Add "Edit" action button
  - [x] Add "Change Status" dropdown
  - [x] Add "View QR Code" action
  - [x] Add "Delete" action with confirmation
  - [ ] Add "Assign to Order" action
  - **Validation**: All actions trigger correct API calls and UI updates

### Table Forms
- [x] **Task 4.1**: Create table creation dialog
  - [x] Build modal/dialog component with React Hook Form
  - [x] Add form fields: tableNumber (required), tableName (optional), capacity (required), minCapacity, floor, section
  - [x] Implement Zod validation schema
  - [x] Add client-side validation with error messages
  - [x] Add submit handler with loading state
  - [x] Show success/error toast notifications
  - **Validation**: Form validates all fields, shows errors, submits successfully

- [x] **Task 4.2**: Create table edit dialog
  - [x] Pre-populate form with existing table data
  - [x] Allow editing all fields except tableId
  - [x] Add "Save" and "Cancel" buttons
  - [ ] Implement optimistic UI updates
  - **Validation**: Edits persist correctly, optimistic updates rollback on error

- [x] **Task 4.3**: Implement status change dialog
  - [x] Create status selection dropdown with icons
  - [ ] Add transition validation (e.g., can't go from maintenance to occupied directly)
  - [ ] Add confirmation for destructive changes
  - [ ] Add optional notes field
  - **Validation**: Invalid transitions show warning, valid transitions update immediately

### Real-time Updates
- [x] **Task 5.1**: Set up WebSocket connection for tables
  - [x] Create `useTableSocket` hook
  - [x] Connect to Socket.io server on component mount
  - [x] Subscribe to table events (`table:status_changed`, etc.)
  - [x] Update Zustand store on event receipt
  - [x] Handle connection/disconnection events
  - [ ] Implement auto-reconnect logic (exponential backoff)
  - **Validation**: Status changes from other clients reflect within 500ms

- [ ] **Task 5.2**: Add optimistic UI updates
  - [ ] Update local state immediately on user action
  - [ ] Show loading indicator on affected table
  - [ ] Rollback changes if server returns error
  - [ ] Show conflict resolution dialog if needed
  - **Validation**: UI feels instant, errors handled gracefully

## Phase 2: Floor Plan & Enhanced Features (Week 3)

### Basic Floor Plan View
- [x] **Task 6.1**: Create basic floor plan canvas
  - [x] Build canvas component with responsive sizing
  - [ ] Implement zoom controls (+, -, reset)
  - [ ] Add pan/drag canvas functionality (mouse + touch)
  - [ ] Add grid overlay (optional toggle)
  - [ ] Add minimap for navigation (optional)
  - **Validation**: Canvas scales and pans smoothly on all devices

- [x] **Task 6.2**: Render table cards on canvas
  - [x] Position tables in grid layout (if no coordinates stored)
  - [x] Render TableCard components with status colors
  - [x] Add hover effects and tooltips
  - [x] Show occupancy indicator (e.g., "3/4 seats occupied")
  - [x] Add click handler to open table details
  - **Validation**: All tables visible and interactive

- [x] **Task 6.3**: Implement floor/section filtering
  - [x] Add floor selector dropdown in toolbar
  - [x] Add section filter chips
  - [x] Filter tables displayed on canvas
  - [ ] Update table count indicator
  - **Validation**: Filters update canvas instantly

## Phase 3: Visual Floor Plan (Week 4-5)

### View Mode and Navigation
- [ ] **Task 10.1**: Add Visual Floor Plan tab
  - [ ] Update view toggle to include "Visual Floor Plan" option
  - [ ] Create route `/tables?view=visual`
  - [ ] Implement view switching with state preservation
  - [ ] Add view mode persistence in localStorage
  - **Validation**: Three tabs (Floor Plan, Visual Floor Plan, List) work correctly

### Visual Editor Setup
- [ ] **Task 10.2**: Set up Visual Floor Plan canvas infrastructure
  - [ ] Install `dnd-kit` library for drag-and-drop
  - [ ] Create `VisualFloorPlanCanvas` component
  - [ ] Set up canvas state management (zoom, pan, grid settings)
  - [ ] Implement HTML5 Canvas for background and grid rendering
  - [ ] Create hybrid rendering (Canvas + DOM elements)
  - **Validation**: Canvas renders without errors, supports zoom/pan

- [ ] **Task 10.3**: Create editor toolbar
  - [ ] Build toolbar component with tool palette
  - [ ] Add tools: Select, Pan, Add Table, Delete, Zoom, Grid, Save
  - [ ] Implement tool activation/deactivation logic
  - [ ] Add keyboard shortcuts (V, H, T, Delete, G, Ctrl+S)
  - [ ] Add tooltips for all tools
  - **Validation**: All tools functional with keyboard shortcuts

### Drag, Resize, and Rotate
- [ ] **Task 10.4**: Implement advanced drag-and-drop
  - [ ] Make table cards draggable with `dnd-kit`
  - [ ] Add visual feedback during drag (shadow, cursor)
  - [ ] Implement grid snapping with configurable threshold
  - [ ] Add alignment guides (horizontal, vertical, center)
  - [ ] Support multi-select drag (Shift + click)
  - [ ] Save positions to local state on drag end
  - **Validation**: Drag is smooth (60fps), snapping works, guides appear

- [ ] **Task 10.5**: Implement table resizing
  - [ ] Add resize handles (corners and edges) to selected tables
  - [ ] Implement proportional resize (Shift key)
  - [ ] Show dimensions during resize
  - [ ] Enforce minimum size limits (50x50px)
  - [ ] Update table width/height in state
  - **Validation**: Resize handles work, dimensions update correctly

- [ ] **Task 10.6**: Implement table rotation
  - [ ] Add rotation handle to selected tables
  - [ ] Implement rotation around center point
  - [ ] Show rotation angle during rotation
  - [ ] Add snap-to-angle (15° increments with Shift)
  - [ ] Update rotation value (0-360°) in state
  - **Validation**: Rotation is smooth, angle snapping works

### Grid and Alignment
- [ ] **Task 10.7**: Build grid system
  - [ ] Render grid overlay using Canvas API
  - [ ] Make grid configurable (10px, 20px, 50px intervals)
  - [ ] Add grid toggle button (keyboard: G)
  - [ ] Implement snap-to-grid logic (disable with Ctrl)
  - [ ] Add visual snap feedback (pulse effect)
  - **Validation**: Grid renders correctly, snapping accurate

- [ ] **Task 10.8**: Implement alignment guides
  - [ ] Detect alignment during drag (center, edges, corners)
  - [ ] Render dynamic guide lines (magenta horizontal, cyan vertical)
  - [ ] Snap to alignment within 5px threshold
  - [ ] Remove guides when alignment broken
  - **Validation**: Guides appear/disappear correctly, snap works

### Custom Table Shapes and Styles
- [ ] **Task 10.9**: Create properties panel
  - [ ] Build side panel component
  - [ ] Show selected table properties
  - [ ] Add shape selector (Rectangle, Circle, Square, Oval)
  - [ ] Add style customization (border color, background, font size)
  - [ ] Add dimension inputs (width, height, rotation)
  - [ ] Real-time preview of changes
  - **Validation**: Properties panel updates table appearance

- [ ] **Task 10.10**: Implement shape rendering
  - [ ] Render tables with custom shapes (CSS border-radius)
  - [ ] Adjust capacity indicator position per shape
  - [ ] Ensure hit detection works for all shapes
  - [ ] Save shape preference to database
  - **Validation**: All 4 shapes render and interact correctly

### Background and Layers
- [ ] **Task 10.11**: Implement background image upload
  - [ ] Create background upload dialog
  - [ ] Add file input (PNG, JPG, SVG, max 10MB)
  - [ ] Upload image to server (use existing file storage API)
  - [ ] Render background image on canvas
  - [ ] Add opacity slider (0-100%)
  - [ ] Allow repositioning and scaling background
  - [ ] Save background config per floor
  - **Validation**: Images upload, render, and persist correctly

- [ ] **Task 10.12**: Build layer manager
  - [ ] Create layers panel showing all layers
  - [ ] Add visibility toggles for each layer
  - [ ] Add lock/unlock functionality
  - [ ] Implement layer order (background → grid → tables → annotations)
  - **Validation**: Layer visibility and locking work correctly

### Layout Management
- [ ] **Task 10.13**: Implement save/load layouts
  - [ ] Add "Save Layout" button with name input dialog
  - [ ] Save all table positions, sizes, rotations, styles to database
  - [ ] Create `FloorPlanLayout` table (migration required)
  - [ ] Add "Load Layout" dropdown showing saved layouts
  - [ ] Implement layout loading with animation (500ms transition)
  - [ ] Show confirmation dialog if unsaved changes exist
  - **Validation**: Layouts save and load correctly with animations

- [ ] **Task 10.14**: Create layout templates
  - [ ] Design 4 layout templates (Fine Dining, Casual, Bar/Lounge, Banquet)
  - [ ] Implement template application algorithm
  - [ ] Add "Use Template" button and template selector
  - [ ] Auto-generate table positions based on template
  - [ ] Allow customization after applying template
  - **Validation**: Templates apply correctly and are customizable

### Undo/Redo and Actions
- [ ] **Task 10.15**: Implement action history
  - [ ] Create action history stack (max 50 actions)
  - [ ] Record actions: move, resize, rotate, style change
  - [ ] Implement undo (Ctrl+Z) functionality
  - [ ] Implement redo (Ctrl+Shift+Z) functionality
  - [ ] Add undo/redo buttons to toolbar
  - [ ] Clear history on save
  - **Validation**: Undo/redo works for all action types

- [ ] **Task 10.16**: Implement save functionality
  - [ ] Add "Save" button (keyboard: Ctrl+S)
  - [ ] Persist all changes to database via API
  - [ ] Show success/error notifications
  - [ ] Update "unsaved changes" indicator
  - [ ] Add confirmation dialog on view switch with unsaved changes
  - **Validation**: Save persists all changes correctly

### Database Migrations
- [ ] **Task 10.17**: Create database migrations for Visual Floor Plan
  - [ ] Add columns to `RestaurantTable`: positionX, positionY, rotation, shape, width, height, customStyles
  - [ ] Create `FloorPlanLayout` table
  - [ ] Create `FloorPlanBackground` table
  - [ ] Add indexes for performance
  - [ ] Run migrations in dev and staging
  - **Validation**: Migrations run without errors, schema updated

### API Endpoints
- [ ] **Task 10.18**: Create API endpoints for Visual Floor Plan
  - [ ] Add `PATCH /tables/bulk-positions` for saving positions
  - [ ] Add `POST /floor-plans/layouts` for saving layouts
  - [ ] Add `GET /floor-plans/layouts?floor={floor}` for loading layouts
  - [ ] Add `POST /floor-plans/backgrounds` for uploading backgrounds
  - [ ] Add `GET /floor-plans/backgrounds/{floor}` for loading backgrounds
  - **Validation**: All endpoints work with correct validation

### QR Code Management
- [x] **Task 7.1**: Implement QR code generation
  - [ ] Install `qrcode` library (NOTE: needs to be installed via npm)
  - [x] Create QR code generation utility
  - [x] Generate unique codes for each table (format: `TABLE-{tableNumber}`)
  - [x] Add "Generate QR" button in table form
  - [ ] Auto-generate on table creation (optional)
  - **Validation**: QR codes scan correctly to table URL

- [x] **Task 7.2**: Create QR code display dialog
  - [x] Build modal showing QR code image
  - [x] Add download button (PNG format)
  - [x] Add print button
  - [x] Show table details alongside QR code
  - **Validation**: QR codes download as 300x300px PNG files

- [ ] **Task 7.3**: Bulk QR code generation
  - [ ] Add "Generate All QR Codes" action
  - [ ] Create ZIP download with all QR codes
  - [ ] Add progress indicator for bulk generation
  - **Validation**: ZIP file contains correct QR codes for all active tables

### Bulk Operations
- [ ] **Task 8.1**: Implement bulk selection
  - [ ] Add "Select All" checkbox in table header
  - [ ] Add individual row checkboxes
  - [ ] Show selection count in toolbar
  - [ ] Add "Clear Selection" button
  - **Validation**: Selection state syncs correctly across pages

- [ ] **Task 8.2**: Add bulk actions menu
  - [ ] Add "Bulk Change Status" action
  - [ ] Add "Bulk Delete" action with confirmation
  - [ ] Add "Bulk Export" action (CSV/JSON)
  - [ ] Add "Bulk Activate/Deactivate" action
  - [ ] Show progress indicator for bulk operations
  - **Validation**: Bulk actions complete successfully, show error summary if any fail

### Advanced Features
- [ ] **Task 9.1**: Add table statistics dashboard
  - [ ] Create stats cards (total tables, available, occupied, reserved, maintenance)
  - [ ] Add charts (occupancy rate over time, floor distribution)
  - [ ] Add average table turnover time metric
  - **Validation**: Stats update in real-time

- [ ] **Task 9.2**: Implement table history/audit log
  - [ ] Create history table in database (or use existing audit log)
  - [ ] Show status change history in table details
  - [ ] Show who made changes and when
  - **Validation**: History displays chronologically with user info

- [ ] **Task 9.3**: Add keyboard shortcuts
  - [ ] Implement shortcuts: `Ctrl+N` (new table), `/` (focus search), `Esc` (close dialogs)
  - [ ] Show shortcut hints in tooltips
  - [ ] Add keyboard shortcut help modal (`?` key)
  - **Validation**: All shortcuts work correctly

## Phase 3: Polish & Testing (Week 4-5)

### UI/UX Polish
- [ ] **Task 10.1**: Responsive design implementation
  - [ ] Test on mobile (320px-767px)
  - [ ] Test on tablet (768px-1023px)
  - [ ] Test on desktop (1024px+)
  - [ ] Adjust layouts for each breakpoint
  - [ ] Optimize touch interactions for mobile
  - **Validation**: All features work on all screen sizes

- [ ] **Task 10.2**: Accessibility improvements
  - [ ] Add ARIA labels to all interactive elements
  - [ ] Ensure keyboard navigation works (Tab, Enter, Escape)
  - [ ] Test with screen readers
  - [ ] Add focus indicators
  - [ ] Ensure color contrast meets WCAG AA standards
  - **Validation**: Lighthouse accessibility score > 95

- [ ] **Task 10.3**: Loading states and animations
  - [ ] Add skeleton loaders for initial load
  - [ ] Add smooth transitions for status changes
  - [ ] Add micro-animations for user actions
  - [ ] Optimize animation performance (use CSS transforms)
  - **Validation**: Animations run at 60fps

### Testing
- [ ] **Task 11.1**: Unit tests
  - [ ] Test table components (render, props, events)
  - [ ] Test Zustand store actions and selectors
  - [ ] Test form validation logic
  - [ ] Test utility functions (QR generation, etc.)
  - **Validation**: 80%+ code coverage

- [ ] **Task 11.2**: Integration tests
  - [ ] Test table CRUD flow end-to-end
  - [ ] Test WebSocket event handling
  - [ ] Test status change workflows
  - [ ] Test bulk operations
  - **Validation**: All critical paths covered

- [ ] **Task 11.3**: Performance testing
  - [ ] Load test with 200+ tables
  - [ ] Test WebSocket with 50+ concurrent connections
  - [ ] Measure initial page load time (< 2s)
  - [ ] Optimize bundle size
  - **Validation**: No performance degradation with max expected load

### Documentation
- [ ] **Task 12.1**: Update user documentation
  - [ ] Write table management user guide
  - [ ] Create video tutorial (optional)
  - [ ] Update FAQ section
  - **Validation**: Documentation covers all features

- [ ] **Task 12.2**: Update developer documentation
  - [ ] Document component API and props
  - [ ] Document WebSocket event schema
  - [ ] Update API documentation
  - **Validation**: New developers can understand codebase

## Validation Checklist

### Functional Requirements
- [ ] Users can view all tables in list and floor plan views
- [ ] Users can create new tables with validation
- [ ] Users can edit existing table details
- [ ] Users can delete tables (with confirmation)
- [ ] Users can change table status
- [ ] Status changes reflect in real-time for all users
- [ ] Users can filter tables by status, floor, section
- [ ] Users can search tables by number or name
- [ ] Users can generate QR codes for tables
- [ ] Users can perform bulk operations

### Non-Functional Requirements
- [ ] Page loads in < 2 seconds
- [ ] WebSocket updates arrive in < 500ms
- [ ] UI is responsive on all devices
- [ ] Accessibility score > 95
- [ ] No console errors or warnings
- [ ] Works in Chrome, Firefox, Safari, Edge (latest versions)

### Business Requirements
- [ ] Supports 50-200 tables per restaurant
- [ ] Handles 100+ concurrent users
- [ ] Zero data loss during status transitions
- [ ] 95%+ WebSocket uptime
- [ ] Staff can complete operations in < 30 seconds

## Dependencies Between Tasks

```mermaid
graph TD
    A[1.1 WebSocket Events] --> E[5.1 WebSocket Hook]
    B[2.1 Page Structure] --> C[3.1 List View]
    B --> F[6.1 Floor Plan Canvas]
    D[2.3 Shared Components] --> C
    D --> F
    C --> G[3.2 Search/Filter]
    C --> H[3.3 Quick Actions]
    E[5.1 WebSocket Hook] --> K[5.2 Optimistic Updates]
    F --> L[6.2 Render Tables]
    L --> M[6.3 Floor Filter]
    L --> N[6.4 Drag-Drop]
```

## Notes
- Tasks can be parallelized where no dependencies exist
- Phase 1 tasks are highest priority for MVP
- Phase 2 tasks add significant user value
- Phase 3 ensures production readiness
- Each task should be completed and validated before marking as done
