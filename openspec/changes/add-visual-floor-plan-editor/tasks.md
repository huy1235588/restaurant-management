# Implementation Tasks: Visual Floor Plan Editor

## Phase 1: Foundation & Core Canvas (Weeks 1-2)

### Database & Backend Setup
- [x] Create database migration for `table_positions` table with all columns
- [x] Create database migration for `floor_plan_layouts` table with JSONB support
- [x] Add indexes on floor columns for performance
- [x] Create Prisma schema models for new tables
- [x] Generate Prisma client with new models
- [x] Create floor-plans feature module in backend (/src/features/floor-plans)
- [x] Implement position controller with GET, PUT batch operations
- [x] Implement layouts controller with CRUD operations
- [x] Add validation schemas with Zod for position and layout data

### API Endpoints
- [x] Implement GET /api/floor-plans/positions?floor={floor}
- [x] Implement PUT /api/floor-plans/positions/batch
- [x] Implement GET /api/floor-plans/layouts?floor={floor}
- [x] Implement POST /api/floor-plans/layouts
- [x] Implement GET /api/floor-plans/layouts/:layoutId
- [x] Implement PUT /api/floor-plans/layouts/:layoutId
- [x] Implement DELETE /api/floor-plans/layouts/:layoutId
- [x] Implement POST /api/floor-plans/layouts/:layoutId/activate
- [x] Add authorization middleware for floor plan operations
- [x] Add rate limiting for batch operations
- [x] Document endpoints with Swagger/OpenAPI

### Frontend Foundation
- [x] Create visual-editor feature directory (/src/features/visual-editor)
- [x] Create main VisualEditorPage component
- [x] Create EditorCanvas component with Canvas element
- [x] Create EditorToolbar component layout
- [x] Create PropertiesPanel component skeleton
- [x] Set up Zustand stores: EditorStore, LayoutStore, HistoryStore
- [x] Install and configure @dnd-kit/core library
- [x] Create types/interfaces for table positions, layouts, actions
- [x] Create API client functions for floor plan endpoints
- [x] Set up routing to visual editor page

### Canvas Rendering
- [x] Implement Canvas element initialization
- [x] Create grid rendering function using Canvas API
- [x] Implement grid toggle functionality
- [x] Create configurable grid size options (10px, 20px, 50px)
- [x] Implement responsive canvas sizing
- [x] Add canvas viewport state management
- [x] Create table component for DOM layer
- [x] Implement hybrid Canvas/DOM layering
- [x] Add performance monitoring for canvas rendering

### View Controls
- [x] Implement zoom in/out functions
- [x] Create zoom level state management (25%-200%)
- [x] Add zoom controls to toolbar (buttons and display)
- [x] Implement Ctrl+Scroll zoom functionality
- [x] Add zoom center-point calculation
- [ ] Create smooth zoom animations
- [x] Implement "Reset Zoom" (100%) function
- [x] Add "0" key shortcut for zoom reset
- [x] Implement pan boundaries calculation
- [x] Create "Fit to View" function with bounding box calculation

## Phase 2: Editing Tools & Interactions (Weeks 3-4)

### Tool System
- [x] Create Tool base abstraction
- [x] Implement Select Tool with click selection
- [x] Implement Pan Tool with drag functionality
- [x] Implement Add Table Tool with ghost preview
- [x] Implement Delete Tool with confirmation
- [x] Add tool state management in EditorStore
- [x] Create tool toolbar UI with active states
- [x] Implement tool keyboard shortcuts (V, H, T, Delete)
- [x] Add Esc key to cancel active tool
- [x] Create visual cursor changes per tool

### Select Tool Features
- [x] Implement single table selection with click
- [x] Add selection outline rendering
- [x] Create resize handles (8 points: corners + edges)
- [x] Implement resize handle drag detection
- [x] Add resize constraints (min 40x40, max 200x200)
- [x] Implement multi-select with Shift+Click
- [x] Add deselection on empty area click
- [x] Update properties panel on selection change
- [x] Add visual feedback for selected state

### Drag and Drop System
- [x] Integrate @dnd-kit/core with table components
- [x] Implement draggable table wrapper
- [x] Create drag start/end handlers
- [x] Add real-time position updates during drag (60fps)
- [x] Implement drag event debouncing (16ms)
- [x] Create elevated shadow effect during drag
- [x] Add opacity change during drag
- [x] Implement smooth drop animation
- [x] Add Esc key to cancel drag
- [ ] Create drag performance optimization

### Collision Detection
- [x] Implement AABB collision detection algorithm
- [x] Create collision check function for two rectangles
- [x] Add real-time collision detection during drag
- [x] Implement red outline for colliding tables
- [x] Add collision prevention on drop
- [x] Create error toast for invalid placement
- [ ] Optimize collision checks (spatial partitioning)
- [x] Add collision detection to resize operations
- [ ] Test performance with 100+ tables

### Grid Snapping
- [x] Implement grid snap algorithm (Math.round)
- [x] Add snap-to-grid on drag release
- [x] Create Shift+Drag to disable snapping temporarily
- [ ] Implement snap threshold (10px from grid point)
- [ ] Add visual preview of snap target
- [ ] Create smooth snap animation (100ms)
- [ ] Add grid snapping to resize operations
- [x] Implement alignment guides (horizontal/vertical/center)
- [ ] Add snap-to-alignment with 5px threshold

### Add Table Tool
- [x] Create ghost preview component
- [x] Implement ghost preview following cursor
- [ ] Add green/red color based on collision
- [ ] Create Quick Create Dialog component
- [ ] Pre-fill coordinates from click position
- [ ] Add auto-increment table number logic
- [ ] Implement table creation API call
- [ ] Add fade-in animation for new table
- [ ] Handle creation errors gracefully
- [ ] Keep tool active after creation for adding more

## Phase 3: Floor & Layout Management (Week 5)

### Floor Management
- [x] Create FloorSelector dropdown component
- [x] Implement floor list with table counts
- [x] Add floor switching functionality
- [x] Create unsaved changes detection
- [x] Implement unsaved changes warning dialog
- [x] Add "Save & Switch", "Discard & Switch", "Cancel" options
- [x] Create floor data loading function
- [ ] Implement floor data caching (5 min expiry)
- [x] Add number key shortcuts (1-9) for floor switching
- [x] Create floor-specific state isolation

### Layout Saving
- [x] Implement manual save button in toolbar
- [x] Create unsaved changes indicator (asterisk/badge)
- [x] Add Ctrl+S keyboard shortcut for save
- [x] Implement batch position update API call
- [ ] Create save progress indicator
- [x] Add save success notification
- [x] Implement save error handling with retry
- [x] Clear unsaved indicator on successful save
- [ ] Add save confirmation before exit
- [ ] Create exit warning dialog

### Saved Layouts
- [x] Create SaveLayoutDialog component
- [x] Implement layout name and description inputs
- [x] Add layout data serialization (JSONB format)
- [x] Create save layout API call
- [x] Implement LoadLayoutDialog component
- [x] Create layout list with metadata display
- [ ] Add layout preview (future: thumbnail)
- [x] Implement load layout functionality
- [x] Add delete layout with confirmation
- [ ] Create duplicate layout feature
- [ ] Implement activate layout functionality

### Layout Templates
- [ ] Define 5 predefined templates (Restaurant, Cafe, Fine Dining, Bar, Banquet)
- [ ] Create template data structures with positions
- [ ] Implement ApplyTemplateDialog component
- [ ] Add template preview images
- [ ] Create template application logic
- [ ] Implement scaling for different canvas sizes
- [ ] Add template customization after apply
- [ ] Create GET /api/floor-plans/templates endpoint
- [ ] Implement POST /api/floor-plans/templates/:id/apply endpoint

## Phase 4: History & Advanced Features (Week 6)

### Undo/Redo System
- [x] Create Action interface and types
- [x] Implement HistoryStore with stack management
- [x] Add action recording on all edit operations
- [x] Create undo function with state reversal
- [x] Implement redo function
- [x] Add Ctrl+Z keyboard shortcut for undo
- [x] Add Ctrl+Shift+Z keyboard shortcut for redo
- [x] Create undo/redo buttons in toolbar
- [x] Implement button disabled states
- [x] Add action limit (50 actions max)
- [ ] Create floor-specific history isolation
- [ ] Implement compound action support (multi-table moves)
- [ ] Add smooth animations for undo/redo
- [ ] Clear redo stack on new action

### Properties Panel
- [x] Create PropertiesPanel component
- [x] Display selected table information (number, status, capacity)
- [x] Add position display (X, Y coordinates)
- [x] Show table dimensions (Width, Height)
- [ ] Implement editable properties (number, capacity)
- [x] Add position input fields for precise placement
- [x] Create quick actions buttons (Edit, Delete, Duplicate)
- [ ] Implement real-time property updates
- [ ] Add validation for property changes
- [x] Show multi-selection info when multiple tables selected

### Fullscreen Mode
- [ ] Implement fullscreen API integration
- [x] Create fullscreen toggle button
- [x] Add "F" key shortcut for fullscreen
- [ ] Hide non-essential UI in fullscreen
- [ ] Add Esc key to exit fullscreen
- [ ] Maintain editor state during fullscreen toggle
- [ ] Create fullscreen indicator/exit button

### Keyboard Shortcuts
- [x] Create centralized keyboard handler
- [x] Implement all tool shortcuts (V, H, T)
- [x] Add all action shortcuts (Ctrl+S, Ctrl+Z, etc.)
- [x] Implement grid toggle (G key)
- [ ] Add fullscreen toggle (F key)
- [ ] Create arrow key table movement
- [ ] Implement Shift+Arrow for faster movement
- [x] Add Esc key for cancel/deselect
- [x] Create keyboard shortcuts reference dialog
- [x] Test cross-platform shortcuts (Ctrl/Cmd)

## Phase 5: Performance Optimization & Polish (Week 7)

### Performance Optimization
- [x] Implement React.memo for table components
- [ ] Add virtual scrolling for 100+ tables
- [ ] Optimize collision detection with spatial indexing
- [ ] Use requestAnimationFrame for animations
- [ ] Debounce drag events to 16ms
- [ ] Cache canvas rendering where possible
- [ ] Lazy load floor data
- [ ] Implement optimistic UI updates
- [ ] Profile and optimize re-renders
- [ ] Test with 100+ tables, ensure 60fps

---

## Dependencies Between Tasks
- Database setup must complete before API implementation
- API endpoints needed before frontend data loading
- Canvas rendering foundation needed before tools
- Tool system needed before drag and drop
- Drag and drop needed before collision detection
- Floor management needed before layout saving
- History store needed before undo/redo
- Keyboard shortcuts depend on core tool functionality

## Parallel Work Opportunities
- Backend API and frontend components can develop in parallel after schema agreement
- Different tools (Select, Pan, Add) can be implemented in parallel
- Keyboard shortcuts can be implemented alongside feature development
- Performance optimization can happen as features are completed
