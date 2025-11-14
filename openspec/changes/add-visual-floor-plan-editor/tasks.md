# Implementation Tasks: Visual Floor Plan Editor

## Phase 1: Foundation & Core Canvas (Weeks 1-2)

### Database & Backend Setup
- [ ] Create database migration for `table_positions` table with all columns
- [ ] Create database migration for `floor_plan_layouts` table with JSONB support
- [ ] Add indexes on floor columns for performance
- [ ] Create Prisma schema models for new tables
- [ ] Generate Prisma client with new models
- [ ] Create floor-plans feature module in backend (/src/features/floor-plans)
- [ ] Implement position controller with GET, PUT batch operations
- [ ] Implement layouts controller with CRUD operations
- [ ] Add validation schemas with Zod for position and layout data
- [ ] Write unit tests for controllers and validation

### API Endpoints
- [ ] Implement GET /api/floor-plans/positions?floor={floor}
- [ ] Implement PUT /api/floor-plans/positions/batch
- [ ] Implement GET /api/floor-plans/layouts?floor={floor}
- [ ] Implement POST /api/floor-plans/layouts
- [ ] Implement GET /api/floor-plans/layouts/:layoutId
- [ ] Implement PUT /api/floor-plans/layouts/:layoutId
- [ ] Implement DELETE /api/floor-plans/layouts/:layoutId
- [ ] Implement POST /api/floor-plans/layouts/:layoutId/activate
- [ ] Add authorization middleware for floor plan operations
- [ ] Add rate limiting for batch operations
- [ ] Write API integration tests
- [ ] Document endpoints with Swagger/OpenAPI

### Frontend Foundation
- [ ] Create visual-editor feature directory (/src/features/visual-editor)
- [ ] Create main VisualEditorPage component
- [ ] Create EditorCanvas component with Canvas element
- [ ] Create EditorToolbar component layout
- [ ] Create PropertiesPanel component skeleton
- [ ] Set up Zustand stores: EditorStore, LayoutStore, HistoryStore
- [ ] Install and configure @dnd-kit/core library
- [ ] Create types/interfaces for table positions, layouts, actions
- [ ] Create API client functions for floor plan endpoints
- [ ] Set up routing to visual editor page

### Canvas Rendering
- [ ] Implement Canvas element initialization
- [ ] Create grid rendering function using Canvas API
- [ ] Implement grid toggle functionality
- [ ] Create configurable grid size options (10px, 20px, 50px)
- [ ] Implement responsive canvas sizing
- [ ] Add canvas viewport state management
- [ ] Create table component for DOM layer
- [ ] Implement hybrid Canvas/DOM layering
- [ ] Add performance monitoring for canvas rendering

### View Controls
- [ ] Implement zoom in/out functions
- [ ] Create zoom level state management (25%-200%)
- [ ] Add zoom controls to toolbar (buttons and display)
- [ ] Implement Ctrl+Scroll zoom functionality
- [ ] Add zoom center-point calculation
- [ ] Create smooth zoom animations
- [ ] Implement "Reset Zoom" (100%) function
- [ ] Add "0" key shortcut for zoom reset
- [ ] Implement pan boundaries calculation
- [ ] Create "Fit to View" function with bounding box calculation

## Phase 2: Editing Tools & Interactions (Weeks 3-4)

### Tool System
- [ ] Create Tool base abstraction
- [ ] Implement Select Tool with click selection
- [ ] Implement Pan Tool with drag functionality
- [ ] Implement Add Table Tool with ghost preview
- [ ] Implement Delete Tool with confirmation
- [ ] Add tool state management in EditorStore
- [ ] Create tool toolbar UI with active states
- [ ] Implement tool keyboard shortcuts (V, H, T, Delete)
- [ ] Add Esc key to cancel active tool
- [ ] Create visual cursor changes per tool

### Select Tool Features
- [ ] Implement single table selection with click
- [ ] Add selection outline rendering
- [ ] Create resize handles (8 points: corners + edges)
- [ ] Implement resize handle drag detection
- [ ] Add resize constraints (min 40x40, max 200x200)
- [ ] Implement multi-select with Shift+Click
- [ ] Add deselection on empty area click
- [ ] Update properties panel on selection change
- [ ] Add visual feedback for selected state

### Drag and Drop System
- [ ] Integrate @dnd-kit/core with table components
- [ ] Implement draggable table wrapper
- [ ] Create drag start/end handlers
- [ ] Add real-time position updates during drag (60fps)
- [ ] Implement drag event debouncing (16ms)
- [ ] Create elevated shadow effect during drag
- [ ] Add opacity change during drag
- [ ] Implement smooth drop animation
- [ ] Add Esc key to cancel drag
- [ ] Create drag performance optimization

### Collision Detection
- [ ] Implement AABB collision detection algorithm
- [ ] Create collision check function for two rectangles
- [ ] Add real-time collision detection during drag
- [ ] Implement red outline for colliding tables
- [ ] Add collision prevention on drop
- [ ] Create error toast for invalid placement
- [ ] Optimize collision checks (spatial partitioning)
- [ ] Add collision detection to resize operations
- [ ] Test performance with 100+ tables

### Grid Snapping
- [ ] Implement grid snap algorithm (Math.round)
- [ ] Add snap-to-grid on drag release
- [ ] Create Shift+Drag to disable snapping temporarily
- [ ] Implement snap threshold (10px from grid point)
- [ ] Add visual preview of snap target
- [ ] Create smooth snap animation (100ms)
- [ ] Add grid snapping to resize operations
- [ ] Implement alignment guides (horizontal/vertical/center)
- [ ] Add snap-to-alignment with 5px threshold

### Add Table Tool
- [ ] Create ghost preview component
- [ ] Implement ghost preview following cursor
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
- [ ] Create FloorSelector dropdown component
- [ ] Implement floor list with table counts
- [ ] Add floor switching functionality
- [ ] Create unsaved changes detection
- [ ] Implement unsaved changes warning dialog
- [ ] Add "Save & Switch", "Discard & Switch", "Cancel" options
- [ ] Create floor data loading function
- [ ] Implement floor data caching (5 min expiry)
- [ ] Add number key shortcuts (1-9) for floor switching
- [ ] Create floor-specific state isolation

### Layout Saving
- [ ] Implement manual save button in toolbar
- [ ] Create unsaved changes indicator (asterisk/badge)
- [ ] Add Ctrl+S keyboard shortcut for save
- [ ] Implement batch position update API call
- [ ] Create save progress indicator
- [ ] Add save success notification
- [ ] Implement save error handling with retry
- [ ] Clear unsaved indicator on successful save
- [ ] Add save confirmation before exit
- [ ] Create exit warning dialog

### Saved Layouts
- [ ] Create SaveLayoutDialog component
- [ ] Implement layout name and description inputs
- [ ] Add layout data serialization (JSONB format)
- [ ] Create save layout API call
- [ ] Implement LoadLayoutDialog component
- [ ] Create layout list with metadata display
- [ ] Add layout preview (future: thumbnail)
- [ ] Implement load layout functionality
- [ ] Add delete layout with confirmation
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
- [ ] Create Action interface and types
- [ ] Implement HistoryStore with stack management
- [ ] Add action recording on all edit operations
- [ ] Create undo function with state reversal
- [ ] Implement redo function
- [ ] Add Ctrl+Z keyboard shortcut for undo
- [ ] Add Ctrl+Shift+Z keyboard shortcut for redo
- [ ] Create undo/redo buttons in toolbar
- [ ] Implement button disabled states
- [ ] Add action limit (50 actions max)
- [ ] Create floor-specific history isolation
- [ ] Implement compound action support (multi-table moves)
- [ ] Add smooth animations for undo/redo
- [ ] Clear redo stack on new action

### Properties Panel
- [ ] Create PropertiesPanel component
- [ ] Display selected table information (number, status, capacity)
- [ ] Add position display (X, Y coordinates)
- [ ] Show table dimensions (Width, Height)
- [ ] Implement editable properties (number, capacity)
- [ ] Add position input fields for precise placement
- [ ] Create quick actions buttons (Edit, Delete, Duplicate)
- [ ] Implement real-time property updates
- [ ] Add validation for property changes
- [ ] Show multi-selection info when multiple tables selected

### Fullscreen Mode
- [ ] Implement fullscreen API integration
- [ ] Create fullscreen toggle button
- [ ] Add "F" key shortcut for fullscreen
- [ ] Hide non-essential UI in fullscreen
- [ ] Add Esc key to exit fullscreen
- [ ] Maintain editor state during fullscreen toggle
- [ ] Create fullscreen indicator/exit button

### Keyboard Shortcuts
- [ ] Create centralized keyboard handler
- [ ] Implement all tool shortcuts (V, H, T)
- [ ] Add all action shortcuts (Ctrl+S, Ctrl+Z, etc.)
- [ ] Implement grid toggle (G key)
- [ ] Add fullscreen toggle (F key)
- [ ] Create arrow key table movement
- [ ] Implement Shift+Arrow for faster movement
- [ ] Add Esc key for cancel/deselect
- [ ] Create keyboard shortcuts reference dialog
- [ ] Test cross-platform shortcuts (Ctrl/Cmd)

## Phase 5: Accessibility & Polish (Week 7)

### Accessibility
- [ ] Add ARIA labels to all interactive elements
- [ ] Implement role attributes (button, region, dialog)
- [ ] Create focus indicators for all focusable elements
- [ ] Add keyboard navigation (Tab order)
- [ ] Implement aria-live regions for announcements
- [ ] Add aria-describedby for context
- [ ] Create skip navigation links
- [ ] Implement focus trap for dialogs
- [ ] Add aria-pressed for toggle buttons
- [ ] Test with screen reader (NVDA/JAWS)

### Color Contrast & Visuals
- [ ] Audit all colors for WCAG AA compliance
- [ ] Ensure text has 4.5:1 contrast ratio
- [ ] Verify interactive elements have 3:1 ratio
- [ ] Add non-color indicators (icons, patterns) for status
- [ ] Implement colorblind-friendly palette
- [ ] Create high contrast mode support
- [ ] Add focus outline with adequate contrast
- [ ] Test with color blindness simulators

### Form Accessibility
- [ ] Add labels to all form inputs
- [ ] Implement aria-required for required fields
- [ ] Add aria-invalid and error associations
- [ ] Create accessible error messages
- [ ] Test form navigation with keyboard
- [ ] Add input validation with clear feedback
- [ ] Implement accessible dialogs (focus management)

### Performance Optimization
- [ ] Implement React.memo for table components
- [ ] Add virtual scrolling for 100+ tables
- [ ] Optimize collision detection with spatial indexing
- [ ] Use requestAnimationFrame for animations
- [ ] Debounce drag events to 16ms
- [ ] Cache canvas rendering where possible
- [ ] Lazy load floor data
- [ ] Implement optimistic UI updates
- [ ] Profile and optimize re-renders
- [ ] Test with 100+ tables, ensure 60fps

## Phase 6: Testing & Documentation (Week 8)

### Unit Tests
- [ ] Write tests for collision detection algorithm
- [ ] Test grid snapping calculations
- [ ] Test history stack operations (push, undo, redo)
- [ ] Test Zustand store actions
- [ ] Test API client functions
- [ ] Test validation schemas
- [ ] Test utility functions (bounding box, alignment)
- [ ] Achieve 80%+ code coverage for core logic

### Integration Tests
- [ ] Test floor switching with unsaved changes
- [ ] Test save and load layout workflows
- [ ] Test template application
- [ ] Test drag and drop with collision
- [ ] Test undo/redo sequences
- [ ] Test keyboard navigation flows
- [ ] Test multi-select operations
- [ ] Test API endpoint integration

### End-to-End Tests
- [ ] Create E2E test for complete editing workflow
- [ ] Test adding, moving, resizing, deleting tables
- [ ] Test saving and loading layouts
- [ ] Test floor switching
- [ ] Test undo/redo in complex scenarios
- [ ] Test keyboard-only navigation
- [ ] Test error handling and recovery
- [ ] Use Playwright for E2E tests

### Accessibility Testing
- [ ] Run axe-core accessibility audit
- [ ] Test with keyboard only (no mouse)
- [ ] Test with screen reader (NVDA on Windows)
- [ ] Test with screen reader (VoiceOver on Mac)
- [ ] Verify WCAG AA compliance
- [ ] Test focus management in dialogs
- [ ] Test skip navigation links
- [ ] Fix all critical and serious accessibility issues

### Performance Testing
- [ ] Benchmark canvas rendering with 100 tables
- [ ] Measure drag operation performance (fps)
- [ ] Test zoom and pan smoothness
- [ ] Benchmark API response times
- [ ] Test memory usage during long editing sessions
- [ ] Profile for performance bottlenecks
- [ ] Optimize identified slow operations
- [ ] Ensure all operations meet performance targets

### Documentation
- [ ] Write user guide for visual editor
- [ ] Create video tutorial for basic workflow
- [ ] Document keyboard shortcuts reference
- [ ] Write API documentation for floor plan endpoints
- [ ] Create developer documentation for components
- [ ] Document state management architecture
- [ ] Write troubleshooting guide
- [ ] Create inline help text and tooltips

### Final Polish
- [ ] Review and refine all animations
- [ ] Ensure consistent styling across components
- [ ] Add loading states for all async operations
- [ ] Polish error messages for clarity
- [ ] Review and improve tooltips
- [ ] Test on different screen sizes
- [ ] Test on different browsers (Chrome, Firefox, Safari, Edge)
- [ ] Conduct user acceptance testing
- [ ] Fix all high-priority bugs
- [ ] Prepare feature flag for rollout

## Deployment Checklist
- [ ] Create database migration scripts
- [ ] Test migrations on staging environment
- [ ] Deploy backend API changes
- [ ] Deploy frontend changes
- [ ] Enable feature flag for beta users
- [ ] Monitor error rates and performance
- [ ] Gather user feedback
- [ ] Iterate based on feedback
- [ ] Gradual rollout to all users
- [ ] Post-launch monitoring and support

---

## Dependencies Between Tasks
- Database setup must complete before API implementation
- API endpoints needed before frontend data loading
- Canvas rendering foundation needed before tools
- Tool system needed before drag and drop
- Drag and drop needed before collision detection
- Floor management needed before layout saving
- History store needed before undo/redo
- Core features needed before accessibility polish
- All features needed before comprehensive testing

## Parallel Work Opportunities
- Backend API and frontend components can develop in parallel after schema agreement
- Different tools (Select, Pan, Add) can be implemented in parallel
- Accessibility work can happen alongside feature development
- Documentation can be written as features complete
- Unit tests can be written alongside implementation
