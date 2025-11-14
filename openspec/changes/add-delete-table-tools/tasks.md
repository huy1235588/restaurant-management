# Implementation Tasks: Add and Delete Table Tools

## Overview

This document outlines the implementation tasks for adding the Add Table tool and Delete tool to the Visual Floor Plan editor.

## Phase 0: Canvas Pan Boundaries (2 days)

### Boundary Calculation (Day 1)

- [ ] **Task 0.1**: Create pan boundary utilities
  - [ ] Create `lib/utils/pan-boundaries.ts`
  - [ ] Implement `calculateCanvasBounds()` function
  - [ ] Implement `constrainPanOffset()` function
  - [ ] Implement `calculateFitToViewOffset()` function
  - **Validation**: Boundaries calculated correctly based on table positions

- [ ] **Task 0.2**: Integrate boundaries with pan handler
  - [ ] Add `canvasBounds` state to VisualFloorPlanCanvas
  - [ ] Recalculate bounds when tables change
  - [ ] Update pan handler to constrain offset within bounds
  - **Validation**: Cannot pan beyond calculated boundaries

### View Control Buttons (Day 2)

- [ ] **Task 0.3**: Add Fit to View button
  - [ ] Add "Fit to View" button to EditorToolbar
  - [ ] Implement `handleFitToView` function
  - [ ] Calculate optimal zoom and offset to show all tables
  - [ ] Add smooth transition animation (300ms)
  - [ ] Add Maximize2 icon from lucide-react
  - **Validation**: Clicking button centers and fits all tables in view

- [ ] **Task 0.4**: Add Reset View button
  - [ ] Add "Reset View" button to EditorToolbar
  - [ ] Implement `handleResetView` function
  - [ ] Reset pan offset to (0, 0) and zoom to 1.0
  - [ ] Add smooth transition animation (300ms)
  - [ ] Add Home icon from lucide-react
  - **Validation**: Clicking button resets view to origin

- [ ] **Task 0.5**: Add boundary indicator (optional)
  - [ ] Create BoundaryIndicator component
  - [ ] Show dashed border around working area
  - [ ] Add "Working Area" label
  - [ ] Toggle visibility with keyboard shortcut (B key)
  - **Validation**: Boundary indicator shows working area clearly

## Phase 1: Add Table Tool (5-6 days)

### Foundation (Day 1)

- [ ] **Task 1.1**: Set up tool state management
  - [ ] Add `ghostTable` state to VisualFloorPlanView
  - [ ] Add `isPlacingTable` state flag
  - [ ] Update `handleToolChange` to handle 'add' tool activation
  - [ ] Add cursor change logic for add tool
  - **Validation**: Clicking Add tool button changes cursor to crosshair

- [ ] **Task 1.2**: Create collision detection utilities
  - [ ] Create `lib/utils/collision-detection.ts`
  - [ ] Implement `rectanglesOverlap()` for AABB collision
  - [ ] Implement `detectCollision()` for table placement
  - [ ] Implement `snapToGrid()` helper
  - **Validation**: Collision detection works correctly

- [ ] **Task 1.3**: Implement table number generation
  - [ ] Create `generateNextTableNumber()` utility
  - [ ] Auto-increment based on existing tables
  - [ ] Handle floor-specific numbering if needed
  - **Validation**: Generated numbers are unique and sequential

### Ghost Preview (Day 2)

- [ ] **Task 2.1**: Create GhostTablePreview component
  - [ ] Create `components/features/tables/visual-floor-plan/GhostTablePreview.tsx`
  - [ ] Implement visual styling (dashed border, semi-transparent)
  - [ ] Add valid/invalid states (blue/red coloring)
  - [ ] Position based on cursor with center offset
  - [ ] Make non-interactive (pointer-events: none)
  - **Validation**: Ghost preview appears and follows cursor

- [ ] **Task 2.2**: Integrate ghost preview with canvas
  - [ ] Add `handleMouseMove` handler in VisualFloorPlanCanvas
  - [ ] Calculate mouse position relative to canvas
  - [ ] Apply zoom and pan transformations
  - [ ] Update ghost position on mouse move
  - [ ] Show/hide ghost based on tool state
  - **Validation**: Ghost preview follows cursor smoothly at all zoom levels

- [ ] **Task 2.3**: Implement collision detection feedback
  - [ ] Check collision on mouse move (debounced)
  - [ ] Update ghost `isValid` prop based on collision
  - [ ] Change ghost color (blue → red) when collision detected
  - [ ] Show "Collision!" message in ghost preview
  - **Validation**: Ghost turns red when hovering over existing tables

### Canvas Click Handler (Day 3)

- [ ] **Task 3.1**: Implement canvas click event
  - [ ] Add `handleCanvasClick` in VisualFloorPlanCanvas
  - [ ] Calculate click position with zoom/pan transform
  - [ ] Apply grid snapping if enabled
  - [ ] Validate placement (no collision, within bounds)
  - [ ] Store clicked position for dialog
  - **Validation**: Click position calculated correctly

- [ ] **Task 3.2**: Handle click validation
  - [ ] Check collision at click position
  - [ ] Check canvas bounds
  - [ ] Show error toast if invalid placement
  - [ ] Open dialog only if valid
  - **Validation**: Cannot place table on existing table, shows error

### Quick Create Dialog (Day 4)

- [ ] **Task 4.1**: Create QuickCreateTableDialog component
  - [ ] Create `components/features/tables/QuickCreateTableDialog.tsx`
  - [ ] Set up React Hook Form with Zod validation
  - [ ] Add fields: tableNumber, capacity, tableName, section
  - [ ] Pre-fill position fields (positionX, positionY)
  - [ ] Add default values (capacity: 4, width: 100, height: 100)
  - **Validation**: Dialog opens with pre-filled values

- [ ] **Task 4.2**: Implement form submission
  - [ ] Call `createTable` action from store
  - [ ] Include position, size, rotation, shape in payload
  - [ ] Handle success: show toast, close dialog, add to undo history
  - [ ] Handle error: show error message, keep dialog open
  - [ ] Reset form after successful creation
  - **Validation**: Table created at correct position with correct data

- [ ] **Task 4.3**: Tool behavior after placement
  - [ ] Option A: Keep tool active for placing more tables
  - [ ] Option B: Switch to select tool after placement
  - [ ] Implement Esc key to cancel and switch to select
  - [ ] Clear ghost preview after placement
  - **Validation**: Tool behavior matches design decision

### Polish & Testing (Day 5)

- [ ] **Task 5.1**: Add visual polish
  - [ ] Smooth transitions for ghost preview
  - [ ] Fade-in animation for newly created table
  - [ ] Improve ghost preview styling
  - [ ] Add tooltip hints
  - **Validation**: Animations smooth, UI polished

- [ ] **Task 5.2**: Implement canvas bounds validation
  - [ ] Prevent placement outside canvas area
  - [ ] Show warning when near edges
  - [ ] Auto-adjust position if close to edge (optional)
  - **Validation**: Cannot place tables outside canvas

- [ ] **Task 5.3**: Add keyboard shortcuts
  - [ ] Ensure `T` key activates add tool
  - [ ] Esc key cancels placement mode
  - [ ] Document shortcuts in help modal
  - **Validation**: Keyboard shortcuts work as expected

## Phase 2: Delete Tool (3-4 days)

### Tool Activation (Day 1)

- [ ] **Task 6.1**: Implement delete tool activation
  - [ ] Update `handleToolChange` for 'delete' tool
  - [ ] Change cursor when delete tool active
  - [ ] Add visual feedback on selected table (red highlight)
  - [ ] Ensure table must be selected first
  - **Validation**: Delete tool activates, cursor changes

- [ ] **Task 6.2**: Add keyboard shortcut for delete
  - [ ] Listen for Delete key press
  - [ ] Check if table is selected
  - [ ] Show toast if no table selected
  - [ ] Trigger delete dialog if valid
  - **Validation**: Delete key opens confirmation dialog

- [ ] **Task 6.3**: Visual feedback in delete mode
  - [ ] Add red overlay to selected table in delete mode
  - [ ] Show trash icon on selected table
  - [ ] Update DraggableTable component styling
  - **Validation**: Selected table shows deletion indicator

### Delete Validation (Day 2)

- [ ] **Task 7.1**: Create validation utilities
  - [ ] Create `validateTableDeletion()` function
  - [ ] Check for active orders (status === 'occupied')
  - [ ] Check for reservations (status === 'reserved')
  - [ ] Return validation result with errors/warnings
  - **Validation**: Validation correctly identifies blocked deletions

- [ ] **Task 7.2**: Implement validation checks
  - [ ] Query related data (orders, reservations) if available
  - [ ] Block deletion if active order exists
  - [ ] Show warning if reservation exists (but allow)
  - [ ] Add option for force delete (with extra confirmation)
  - **Validation**: Cannot delete tables with active orders

### Delete Confirmation Dialog (Day 3)

- [ ] **Task 8.1**: Create DeleteTableConfirmDialog component
  - [ ] Create `components/features/tables/DeleteTableConfirmDialog.tsx`
  - [ ] Use AlertDialog component from UI library
  - [ ] Display table details (number, name, status, capacity)
  - [ ] Show warnings for active orders/reservations
  - [ ] Add destructive action button
  - **Validation**: Dialog displays correct table information

- [ ] **Task 8.2**: Implement confirmation flow
  - [ ] Open dialog when delete tool activated with selection
  - [ ] Disable confirm button if validation fails
  - [ ] Close dialog on cancel
  - [ ] Trigger deletion on confirm
  - [ ] Show loading state during deletion
  - **Validation**: Dialog workflow functions correctly

- [ ] **Task 8.3**: Add visual warnings
  - [ ] Use Alert component for warnings
  - [ ] Different styles for errors vs warnings
  - [ ] Clear messaging about consequences
  - [ ] Emphasize "cannot be undone" message
  - **Validation**: Warnings clearly visible and understandable

### Delete Handler (Day 4)

- [ ] **Task 9.1**: Implement delete handler
  - [ ] Call `deleteTable` action from store
  - [ ] Record action in undo history
  - [ ] Handle success: show toast, close dialog, clear selection
  - [ ] Handle error: show error message, keep dialog open
  - [ ] Switch back to select tool after deletion
  - **Validation**: Table deleted successfully, UI updated

- [ ] **Task 9.2**: Add deletion animation
  - [ ] Fade-out animation for deleted table
  - [ ] Optional: scale-down animation
  - [ ] Remove from DOM after animation completes
  - [ ] Smooth transition (300ms)
  - **Validation**: Deletion visually smooth

- [ ] **Task 9.3**: Update unsaved changes flag
  - [ ] Mark as unsaved change after deletion
  - [ ] Show asterisk on Save button
  - [ ] Prompt before leaving if unsaved
  - **Validation**: Unsaved changes indicator works

## Phase 3: Undo/Redo Integration (1 day)

- [ ] **Task 10.1**: Extend undo/redo for add action
  - [ ] Record 'create' action in history
  - [ ] Implement undo: delete the created table
  - [ ] Implement redo: recreate the table
  - [ ] Preserve all table properties
  - **Validation**: Undo/redo works for table creation

- [ ] **Task 10.2**: Extend undo/redo for delete action
  - [ ] Record 'delete' action with previous state
  - [ ] Implement undo: restore the deleted table
  - [ ] Implement redo: delete again
  - [ ] Restore to exact previous state
  - **Validation**: Undo/redo works for table deletion

## Phase 4: Documentation & Polish (1 day)

- [ ] **Task 11.1**: Update user documentation
  - [ ] Add Add Table tool section to user guide
  - [ ] Document click-to-place workflow
  - [ ] Add Delete tool section
  - [ ] Document keyboard shortcuts
  - [ ] Add screenshots/GIFs if possible
  - **Validation**: Documentation clear and complete

- [ ] **Task 11.2**: Update developer documentation
  - [ ] Document collision detection algorithm
  - [ ] Document tool state management
  - [ ] Add API examples for new components
  - [ ] Document undo/redo integration
  - **Validation**: Developers can extend features

- [ ] **Task 11.3**: Accessibility review
  - [ ] Add ARIA labels to tool buttons
  - [ ] Ensure keyboard navigation works
  - [ ] Add focus indicators
  - **Validation**: Meets accessibility standards

## Validation Checklist

### Functional Requirements
- [ ] Canvas pan is constrained to working area boundaries
- [ ] Boundaries recalculate when tables added/removed/moved
- [ ] Fit to View button centers all tables in viewport
- [ ] Reset View button returns to origin (0,0) at 100% zoom
- [ ] Boundary indicator shows working area (if enabled)
- [ ] Add Table tool activates with button or `T` key
- [ ] Ghost preview follows cursor and snaps to grid
- [ ] Collision detection prevents overlapping tables
- [ ] Quick create dialog opens at click position
- [ ] New tables created with correct position and properties
- [ ] Delete tool activates with button or `Delete` key
- [ ] Selected table shows deletion indicator in delete mode
- [ ] Delete confirmation dialog shows table details and warnings
- [ ] Cannot delete tables with active orders
- [ ] Tables deleted successfully with visual feedback
- [ ] Undo/redo works for add and delete operations

### Non-Functional Requirements
- [ ] Ghost preview updates at 60fps
- [ ] Collision detection completes in < 50ms
- [ ] Dialog opens in < 200ms
- [ ] Table creation completes in < 1 second
- [ ] Deletion animation smooth (< 500ms)
- [ ] No performance degradation with 100+ tables
- [ ] All interactions keyboard accessible

### UX Requirements
- [ ] Tool activation is discoverable
- [ ] Cursor changes clearly indicate active tool
- [ ] Ghost preview color indicates valid/invalid placement
- [ ] Error messages are helpful and specific
- [ ] Confirmation dialogs are clear about consequences
- [ ] Visual feedback for all actions
- [ ] Animations enhance rather than distract

## Dependencies

- Existing Visual Floor Plan infrastructure
- Zustand store with create/delete actions
- React Hook Form + Zod validation
- UI components (Dialog, AlertDialog, Form, Toast)
- Backend API endpoints (already exist)

## Notes

- Implement Add tool before Delete tool (more complex)
- Test thoroughly with existing tables before implementing delete
- Consider adding undo/redo as you implement each tool
- Get UX feedback on ghost preview and cursor styles
- May need to adjust collision buffer distance based on testing

## Phase 5: Duplicate Tool (1-2 days)

### Duplication Utilities (Day 1)

- [ ] **Task 12.1**: Create duplication utilities
  - [ ] Create `lib/utils/table-duplication.ts`
  - [ ] Implement `duplicateTable()` function
  - [ ] Implement `duplicateMultipleTables()` function
  - [ ] Auto-increment table numbers
  - [ ] Add offset calculation (50px right, 50px down)
  - **Validation**: Duplicated tables have correct properties

- [ ] **Task 12.2**: Implement duplicate handler
  - [ ] Add "Duplicate" button to toolbar (when selection exists)
  - [ ] Implement `handleDuplicate` function
  - [ ] Add keyboard shortcut (Ctrl+D)
  - [ ] Handle single and multiple selection
  - [ ] Record action in undo history
  - **Validation**: Ctrl+D duplicates selected table(s)

## Phase 6: Multi-Select & Bulk Operations (3-4 days)

### Selection State Management (Day 1)

- [ ] **Task 13.1**: Create selection state utilities
  - [ ] Create `lib/utils/selection-state.ts`
  - [ ] Implement `toggleSelection()` function
  - [ ] Implement `selectInBox()` function
  - [ ] Add selection mode tracking (single, multi, box)
  - **Validation**: Selection utilities work correctly

- [ ] **Task 13.2**: Implement multi-select interactions
  - [ ] Add Shift+Click to add/remove from selection
  - [ ] Add Ctrl/Cmd+Click to toggle selection
  - [ ] Add Ctrl/Cmd+A to select all on floor
  - [ ] Update DraggableTable to support multi-select
  - [ ] Show selection count badge
  - **Validation**: Multi-select keyboard shortcuts work

### Selection Box (Day 2)

- [ ] **Task 14.1**: Create SelectionBox component
  - [ ] Create `components/features/tables/visual-floor-plan/SelectionBox.tsx`
  - [ ] Render selection rectangle during drag
  - [ ] Apply zoom transformation
  - [ ] Style with border and semi-transparent background
  - **Validation**: Selection box renders correctly

- [ ] **Task 14.2**: Implement box selection interaction
  - [ ] Add mouse down handler (on empty space)
  - [ ] Track drag to draw selection box
  - [ ] Calculate tables within box on mouse up
  - [ ] Update selection state
  - [ ] Clear box on completion
  - **Validation**: Can select multiple tables by dragging box

### Bulk Operations (Day 3)

- [ ] **Task 15.1**: Implement bulk move
  - [ ] Create `handleBulkDrag` function
  - [ ] Drag any selected table moves all
  - [ ] Maintain relative positions
  - [ ] Show ghost for all selected tables
  - [ ] Apply grid snapping to group
  - **Validation**: All selected tables move together

- [ ] **Task 15.2**: Implement bulk delete
  - [ ] Update delete dialog for multiple tables
  - [ ] Show list of tables to be deleted
  - [ ] Aggregate warnings (occupied, reserved)
  - [ ] Delete all or none (atomic operation)
  - **Validation**: Can delete multiple tables at once

- [ ] **Task 15.3**: Visual feedback for selection
  - [ ] Add blue outline to selected tables
  - [ ] Show bounding box around selection group
  - [ ] Add selection count indicator
  - [ ] Highlight on hover (if not selected)
  - **Validation**: Selected tables clearly visible

## Phase 7: Alignment & Distribution Tools (2-3 days)

### Alignment Utilities (Day 1)

- [ ] **Task 17.1**: Create alignment utilities
  - [ ] Create `lib/utils/alignment-tools.ts`
  - [ ] Implement `alignTables()` for 6 alignment types
  - [ ] Implement `distributeTables()` for horizontal/vertical
  - [ ] Implement `matchSize()` utilities
  - **Validation**: Alignment calculations correct

### Alignment Toolbar (Day 2)

- [ ] **Task 18.1**: Create AlignmentToolbar component
  - [ ] Create `components/features/tables/visual-floor-plan/AlignmentToolbar.tsx`
  - [ ] Add buttons for all alignment options
  - [ ] Show only when 2+ tables selected
  - [ ] Position at top center of canvas
  - [ ] Add tooltips for each option
  - **Validation**: Toolbar appears when multiple tables selected

- [ ] **Task 18.2**: Implement alignment handlers
  - [ ] Create `handleAlign` function
  - [ ] Create `handleDistribute` function
  - [ ] Apply alignment to selected tables
  - [ ] Record action in undo history
  - [ ] Show preview before applying (optional)
  - **Validation**: All alignment types work correctly

- [ ] **Task 18.3**: Add visual feedback
  - [ ] Show alignment guides during alignment
  - [ ] Animate tables to new positions (300ms)
  - [ ] Show toast with alignment type
  - [ ] Update unsaved changes flag
  - **Validation**: Alignment is smooth and clear

## Phase 8: Zoom to Selection (1 day)

- [ ] **Task 20.1**: Create zoom utilities
  - [ ] Create `lib/utils/zoom-utilities.ts`
  - [ ] Implement `calculateZoomToFit()` function
  - [ ] Implement `getTablesBounds()` function
  - [ ] Implement `animateViewChange()` function
  - **Validation**: Zoom calculations correct

- [ ] **Task 20.2**: Implement zoom to selection
  - [ ] Create `handleZoomToSelection` function
  - [ ] Calculate optimal zoom and pan
  - [ ] Animate transition (500ms)
  - [ ] Add keyboard shortcut (F key)
  - [ ] Add button to toolbar (optional)
  - **Validation**: F key zooms to selected table(s)

- [ ] **Task 20.3**: Implement double-click zoom
  - [ ] Add double-click handler on table
  - [ ] Zoom and center on clicked table
  - [ ] Use same animation as F key
  - **Validation**: Double-click focuses on table

## Phase 9: Ruler & Measurements (2-3 days)

### Ruler Components (Day 1)

- [ ] **Task 21.1**: Create HorizontalRuler component
  - [ ] Create `components/features/tables/visual-floor-plan/HorizontalRuler.tsx`
  - [ ] Render tick marks every 50px/100px
  - [ ] Show values based on pan offset
  - [ ] Support zoom transformation
  - [ ] Add unit toggle (px/cm/in)
  - **Validation**: Horizontal ruler displays correctly

- [ ] **Task 21.2**: Create VerticalRuler component
  - [ ] Create `components/features/tables/visual-floor-plan/VerticalRuler.tsx`
  - [ ] Similar to HorizontalRuler but vertical
  - [ ] Position on left edge
  - **Validation**: Vertical ruler displays correctly

- [ ] **Task 21.3**: Integrate rulers with canvas
  - [ ] Add rulers to VisualFloorPlanCanvas
  - [ ] Toggle visibility with R key
  - [ ] Update on zoom/pan changes
  - [ ] Add ruler visibility state
  - **Validation**: R key toggles rulers on/off

### Measurement Overlays (Day 2)

- [ ] **Task 22.1**: Create MeasurementOverlay component
  - [ ] Create `components/features/tables/visual-floor-plan/MeasurementOverlay.tsx`
  - [ ] Show coordinates during move
  - [ ] Show dimensions during resize
  - [ ] Show angle during rotate
  - [ ] Position above table being edited
  - **Validation**: Measurements display during operations

- [ ] **Task 22.2**: Implement distance measurement
  - [ ] Show distance between tables (optional)
  - [ ] Render measurement lines
  - [ ] Display numeric value
  - **Validation**: Distance measurements accurate

## Phase 10: Lock/Unlock Tables (1-2 days)

### Lock State Management (Day 1)

- [ ] **Task 24.1**: Create lock utilities
  - [ ] Create `lib/utils/table-locking.ts`
  - [ ] Implement `toggleLock()` function
  - [ ] Implement `isTableLocked()` function
  - [ ] Add lock state to VisualFloorPlanView
  - **Validation**: Lock utilities work correctly

- [ ] **Task 24.2**: Implement lock/unlock handler
  - [ ] Create `handleToggleLock` function
  - [ ] Add keyboard shortcut (Ctrl+L)
  - [ ] Add Lock/Unlock button (when selection exists)
  - [ ] Toggle lock for selected table(s)
  - [ ] Show success toast
  - **Validation**: Ctrl+L locks/unlocks selected tables

### Lock Visual Feedback (Day 2)

- [ ] **Task 25.1**: Update DraggableTable for locks
  - [ ] Show padlock icon on locked tables
  - [ ] Reduce opacity to 85%
  - [ ] Change cursor to not-allowed
  - [ ] Prevent drag if locked
  - [ ] Prevent resize if locked
  - [ ] Prevent rotation if locked
  - **Validation**: Locked tables cannot be modified

- [ ] **Task 25.2**: Update tools for locked tables
  - [ ] Prevent delete of locked tables
  - [ ] Prevent alignment of locked tables
  - [ ] Prevent bulk move of locked tables
  - [ ] Show warning if trying to modify locked
  - **Validation**: All tools respect lock state

## Phase 11: Documentation & Polish (1 day)

- [ ] **Task 26.1**: Update user documentation
  - [ ] Add Duplicate tool section
  - [ ] Add Multi-select section
  - [ ] Add Alignment tools section
  - [ ] Add Zoom to selection section
  - [ ] Add Ruler & measurements section
  - [ ] Add Lock/unlock section
  - [ ] Update keyboard shortcuts reference
  - **Validation**: Documentation comprehensive

- [ ] **Task 26.2**: Update developer documentation
  - [ ] Document selection state management
  - [ ] Document alignment algorithms
  - [ ] Document lock state management
  - [ ] Add code examples
  - **Validation**: Developers can extend features

## Estimated Timeline

- **Phase 0** (Canvas Pan Boundaries): 2 days
- **Phase 1** (Add Table Tool): 5-6 days
- **Phase 2** (Delete Tool): 3-4 days
- **Phase 3** (Undo/Redo): 1 day
- **Phase 4** (Documentation & Polish): 1 day
- **Phase 5** (Duplicate Tool): 1-2 days
- **Phase 6** (Multi-Select): 3 days
- **Phase 7** (Alignment Tools): 2 days
- **Phase 8** (Zoom to Selection): 1 day
- **Phase 9** (Ruler & Measurements): 2 days
- **Phase 10** (Lock/Unlock): 1-2 days
- **Phase 11** (Final Polish): 1 day

**Total**: 20-25 days (4-5 weeks)

## Extended Validation Checklist

### Phase 5: Duplicate Tool
- [ ] Ctrl+D duplicates selected table(s)
- [ ] Duplicate button appears when selection exists
- [ ] Duplicated tables offset correctly (50px right, 50px down)
- [ ] Table numbers auto-increment correctly
- [ ] Collision detection works for duplicates
- [ ] Multi-select duplication works
- [ ] Undo/redo works for duplication

### Phase 6: Multi-Select & Bulk Operations
- [ ] Shift+Click adds/removes from selection
- [ ] Ctrl/Cmd+Click toggles individual selection
- [ ] Ctrl/Cmd+A selects all tables on current floor
- [ ] Selection box draws correctly during drag
- [ ] Tables within box get selected on mouse up
- [ ] Selection count badge displays
- [ ] Blue outline shows on selected tables
- [ ] Bounding box shows around selection group
- [ ] Bulk move maintains relative positions
- [ ] Bulk move applies grid snapping to group
- [ ] Bulk delete dialog shows all tables
- [ ] Bulk delete shows aggregated warnings
- [ ] All multi-select operations work with undo/redo

### Phase 7: Alignment & Distribution
- [ ] Alignment toolbar appears when 2+ tables selected
- [ ] Toolbar positioned at top center of canvas
- [ ] All 6 alignment types work correctly:
  - [ ] Align Left
  - [ ] Align Center Horizontal
  - [ ] Align Right
  - [ ] Align Top
  - [ ] Align Middle Vertical
  - [ ] Align Bottom
- [ ] Horizontal distribution works (equal spacing)
- [ ] Vertical distribution works (equal spacing)
- [ ] Alignment animations smooth (300ms)
- [ ] Alignment guides visible during operation
- [ ] Tooltips show for all alignment options
- [ ] Undo/redo works for alignment operations
- [ ] Locked tables excluded from alignment

### Phase 8: Zoom to Selection
- [ ] F key zooms to selected table(s)
- [ ] Double-click on table zooms and centers
- [ ] Zoom calculation includes all selected tables
- [ ] Adds 20% padding around selection
- [ ] Animation smooth (500ms)
- [ ] Works with single table
- [ ] Works with multiple tables
- [ ] Graceful handling when no selection
- [ ] Respects zoom constraints (min 0.1, max 3.0)

### Phase 9: Ruler & Measurements
- [ ] R key toggles rulers on/off
- [ ] Horizontal ruler displays at top edge
- [ ] Vertical ruler displays at left edge
- [ ] Tick marks at correct intervals (50px minor, 100px major)
- [ ] Ruler values update with pan offset
- [ ] Ruler scales correctly with zoom
- [ ] Measurement overlay shows during drag
- [ ] Measurement shows coordinates (x, y)
- [ ] Measurement shows dimensions during resize
- [ ] Measurement shows angle during rotate
- [ ] Distance measurements accurate (if implemented)
- [ ] Unit conversion works (px/cm/in)
- [ ] Performance good at all zoom levels (60fps)
- [ ] Rulers don't interfere with canvas interactions

### Phase 10: Lock/Unlock Tables
- [ ] Ctrl+L locks/unlocks selected table(s)
- [ ] Lock/Unlock button appears when selection exists
- [ ] Padlock icon shows on locked tables
- [ ] Locked tables opacity reduced to 85%
- [ ] Locked tables cannot be dragged
- [ ] Locked tables cannot be resized
- [ ] Locked tables cannot be rotated
- [ ] Locked tables cannot be deleted
- [ ] Locked tables excluded from bulk operations
- [ ] Locked tables excluded from alignment
- [ ] Locked tables excluded from duplicate
- [ ] Warning toast appears when trying to modify locked table
- [ ] Cursor shows not-allowed on hover over locked table
- [ ] Lock state persists across sessions (if implemented)
- [ ] Multi-select lock/unlock works correctly

### Integration & Compatibility
- [ ] All features work together without conflicts
- [ ] All operations work with undo/redo system
- [ ] All operations broadcast via Socket.io when needed
- [ ] All toast notifications appear correctly
- [ ] No console errors or warnings
- [ ] Performance acceptable with 100+ tables
- [ ] All keyboard shortcuts documented and non-conflicting
- [ ] Mobile touch interactions work (if applicable)
- [ ] Accessibility requirements met:
  - [ ] ARIA labels for all tools
  - [ ] Keyboard navigation for all features
  - [ ] Focus indicators visible
  - [ ] Screen reader announcements
- [ ] Works across browsers (Chrome, Firefox, Safari, Edge)
- [ ] Responsive layout adapts to different screen sizes

### Documentation
- [ ] User guide updated with all new features
- [ ] Developer guide updated with technical details
- [ ] Keyboard shortcuts reference complete
- [ ] Code examples provided for extensibility
- [ ] Migration notes documented (if needed)

---

**Version**: 1.0.0
**Last Updated**: November 2025
