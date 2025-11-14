# Proposal: Implement Add Table and Delete Table Tools in Visual Floor Plan

## Overview

Implement the Add Table tool and Delete selected table functionality in the Visual Floor Plan editor. These tools allow users to directly add new tables to the canvas and delete existing tables using the editor toolbar, completing the table management workflow within the visual editor.

## Why

Currently, the Visual Floor Plan editor has toolbar buttons for "Add Table" (T) and "Delete" (Delete key) tools, but their functionality is not fully implemented. Users need these tools to:

- **Add tables directly on the canvas**: Click to place new tables at specific positions without leaving the visual editor
- **Delete tables visually**: Select and delete tables directly from the canvas with visual feedback
- **Complete editing workflow**: Perform all table operations (create, move, resize, rotate, delete) within a single interface

Without these tools, users must:
- Switch to List View to create tables, then return to Visual Floor Plan to position them (inefficient)
- Use the List View or Quick View panel to delete tables instead of direct visual manipulation
- Break their workflow by context-switching between views

This implementation enables a seamless, intuitive editing experience where users can manage their entire floor plan layout without leaving the visual editor.

## Problem Statement

Current state:
- ✅ Add Table tool button exists in toolbar (activates with `T` key)
- ✅ Delete tool button exists in toolbar (activates with `Delete` key)
- ❌ Add Table tool has no click handler - clicking canvas does nothing
- ❌ Delete tool has no implementation - cannot delete selected tables
- ❌ No visual feedback when tools are active
- ❌ No validation for table placement or deletion
- ❌ No integration with table creation form for Add tool
- ❌ No confirmation dialog for Delete tool
- ❌ Pan tool allows infinite panning - can lose view of tables

This creates confusion for users who see the tools but cannot use them effectively. Additionally, users can pan the canvas infinitely, potentially losing the view of all tables and struggling to return to the working area.

## Proposed Solution

Implement both tools with intuitive interactions and proper validation:

### 1. Add Table Tool (`T` key)

**Activation:**
- Click "Add Table" button in toolbar OR press `T` key
- Cursor changes to crosshair (+) to indicate placement mode
- Canvas shows visual hint (e.g., ghost table preview following cursor)

**Placement Workflow:**
1. User activates Add Table tool
2. User clicks on canvas at desired position
3. Quick creation dialog appears with pre-filled position coordinates
4. User enters required fields (table number, capacity)
5. User clicks "Create" to confirm
6. New table appears at clicked position
7. Tool remains active for placing more tables (or auto-switches to Select tool)

**Features:**
- Grid snapping: Snap placement to grid if grid is enabled
- Visual preview: Show ghost/transparent table at cursor position
- Position validation: Prevent placement on existing tables (collision detection)
- Smart defaults: Auto-increment table numbers, default capacity based on size
- Keyboard shortcut: `Esc` to cancel placement, `Enter` to confirm position

### 2. Delete Tool (`Delete` key)

**Activation:**
- Click "Delete" button in toolbar OR press `Delete` key with table selected
- Selected table(s) highlight in red to indicate deletion target
- Cursor changes to deletion icon (🗑️ or ⛔)

**Deletion Workflow:**
1. User selects table(s) in Select mode
2. User activates Delete tool OR presses `Delete` key
3. Confirmation dialog appears with table details
4. User confirms deletion
5. Table is removed from canvas with fade-out animation
6. Store and database are updated
7. Tool auto-switches back to Select mode

**Features:**
- Confirmation dialog: Show table number, status, and warning if occupied/reserved
- Validation: Prevent deletion of tables with active orders
- Bulk delete: Support deleting multiple selected tables (if multi-select implemented)
- Visual feedback: Red overlay on selected table before deletion
- Undo support: Action added to undo history
- Keyboard shortcut: `Delete` key when table selected

### 3. Tool State Management

**Tool Switching:**
- Only one tool active at a time (Select, Pan, Add, Delete)
- Tools persist until user switches to another tool
- Exception: Delete tool auto-switches to Select after deletion
- Visual indicators show which tool is active

**Cursor Changes:**
- Select tool: Default cursor
- Pan tool: Grab/grabbing cursor
- Add tool: Crosshair cursor
- Delete tool: Not-allowed cursor on tables

### 4. Canvas Pan Boundaries

**Pan Limits:**
- Define canvas working area based on table positions
- Add padding/margin around tables (e.g., 500px on each side)
- Prevent panning beyond defined boundaries
- Allow panning to show all tables plus comfortable margin

**Boundary Calculation:**
- Calculate bounding box of all tables
- Add margin buffer (default: 500px)
- Update boundaries when tables added/removed/moved
- Ensure minimum canvas size (e.g., 2000x2000px)

**User Experience:**
- Smooth pan resistance when reaching boundary
- Visual indicator when at edge (optional)
- Double-click or button to reset view to center
- Fit-to-view button to show all tables

## Goals

1. **Complete visual editing workflow**: Enable full CRUD operations within Visual Floor Plan
2. **Intuitive interactions**: Users understand tool behavior immediately
3. **Prevent errors**: Validate placements and confirm deletions
4. **Seamless experience**: Minimize context switching and dialog interruptions
5. **Performance**: Handle tool operations smoothly with 100+ tables
6. **Bounded navigation**: Prevent users from getting lost by limiting pan area to working space
7. **Productivity boost**: Reduce time to setup and modify floor plans by 50%
8. **Precision**: Enable exact positioning and alignment of tables
9. **Flexibility**: Support both quick bulk operations and detailed fine-tuning
10. **Safety**: Protect completed work from accidental changes

## Extended Features

Beyond the core Add and Delete tools, this proposal includes additional productivity enhancements:

### 5. Duplicate Table Tool (`Ctrl+D` or Duplicate button)

**Purpose**: Quickly create copies of existing tables with all properties

**Features:**
- Duplicate selected table with one click
- Auto-increment table number
- Place copy with slight offset (50px right, 50px down)
- Copy all properties: capacity, shape, size, rotation
- Support duplicate multiple selected tables

**Workflow:**
1. Select table(s)
2. Press `Ctrl+D` or click Duplicate button
3. Duplicate appears with incremented number
4. Can immediately move or edit duplicate

### 6. Multi-Select & Bulk Operations

**Selection Methods:**
- `Shift + Click`: Add/remove from selection
- `Ctrl/Cmd + A`: Select all tables on current floor
- Selection box: Drag to draw selection rectangle
- Select by section: Right-click section → Select all

**Bulk Operations:**
- Bulk move: Drag any selected table, all move together
- Bulk resize: Not supported (maintain individual sizes)
- Bulk delete: Delete all selected with confirmation
- Bulk property change: Status, section, floor

**Visual Feedback:**
- Selected tables show blue outline
- Selection count badge
- Bounding box around selection group

### 7. Alignment & Distribution Tools

**Alignment Options:**
- Align Left: Align to leftmost table's left edge
- Align Right: Align to rightmost table's right edge
- Align Top: Align to topmost table's top edge
- Align Bottom: Align to bottommost table's bottom edge
- Align Center (Horizontal): Center horizontally
- Align Center (Vertical): Center vertically

**Distribution Options:**
- Distribute Horizontally: Even spacing left-to-right
- Distribute Vertically: Even spacing top-to-bottom

**Size Matching:**
- Match Width: Set all to same width as reference
- Match Height: Set all to same height as reference
- Match Size: Set all to same width and height

**UI:**
- Alignment toolbar appears when 2+ tables selected
- Visual preview before applying
- Undo/redo support

### 8. Zoom to Selection

**Features:**
- Focus on selected table(s) with optimal zoom
- Double-click table to zoom and center it
- Keyboard shortcut: `F` key (focus)
- Smooth zoom animation (500ms)
- Zoom to section/floor

**Use Cases:**
- Quick navigation in large floor plans
- Focus during editing
- Presentation mode

### 9. Ruler & Measurement Tools

**Features:**
- Horizontal ruler on top edge
- Vertical ruler on left edge
- Toggle with `R` key
- Show in pixels or real-world units (cm, inches)
- Measurement overlay during drag/resize

**Coordinate Display:**
- Show X, Y position while dragging
- Show Width × Height while resizing
- Show rotation angle while rotating
- Distance between tables

**Visual:**
- Subtle ruler design (doesn't distract)
- Clear tick marks every 50px/100px
- Current position highlighted

### 10. Lock/Unlock Tables

**Purpose**: Prevent accidental modification of finalized tables

**Features:**
- Lock selected table(s): Cannot move, resize, rotate, delete
- Locked indicator: Padlock icon overlay
- Unlock with single click
- Bulk lock/unlock
- Keyboard shortcut: `Ctrl+L`

**Visual Feedback:**
- Locked tables have padlock icon
- Locked tables show different cursor (not-allowed)
- Slightly reduced opacity (85%)
- Cannot select for drag operations

**Use Cases:**
- Protect fixed tables (pillars, walls)
- Lock completed sections
- Prevent changes during service

## Non-Goals

- Advanced placement options (angles, templates during placement)
- Drag-to-place interaction (click-to-place only)
- Copy to clipboard / paste from clipboard (separate feature)
- Table grouping / parent-child relationships
- 3D visualization
- Import from external CAD files

## Success Metrics

**Functional:**
- Users can add tables by clicking canvas with < 5 seconds per table
- Users can delete tables with confirmation in < 3 seconds
- Tool switching is instant (< 100ms)
- Collision detection prevents overlapping tables
- All actions properly sync with database
- Pan boundaries prevent users from getting lost
- Duplicate creates accurate copies in < 1 second
- Multi-select supports 50+ tables without lag
- Alignment operations complete in < 500ms
- Zoom to selection animates smoothly (60fps)
- Rulers display at all zoom levels without performance issues
- Lock/unlock operations are instant

**UX:**
- Tool behavior is discoverable (users find features without documentation)
- Cursor changes clearly indicate active tool
- Error messages are helpful and actionable
- Undo/redo works for all tool actions
- Selection feedback is immediate and clear
- Alignment preview shows before applying
- Locked tables clearly communicate their state

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Accidental table placement | Medium | Show preview before commit, easy undo |
| Accidental deletion | High | Always show confirmation dialog |
| Collision with existing tables | Medium | Implement collision detection, show visual warning |
| Performance with many tables | Low | Optimize collision detection with spatial indexing |
| Tool confusion | Medium | Clear cursor indicators, toolbar highlighting |

## Dependencies

- Existing Visual Floor Plan editor infrastructure
- Table creation form component (reuse or adapt)
- Collision detection utilities (new)
- Zustand store actions for create/delete
- Backend API endpoints (already exist)

## Timeline Estimate

**Phase 1: Core Tools** (1.5 weeks)
- Canvas Pan Boundaries: 2 days
- Add Table Tool: 5-6 days
- Delete Tool: 3-4 days

**Phase 2: Productivity Tools** (1.5 weeks)
- Duplicate Tool: 1-2 days
- Multi-Select: 3-4 days
- Alignment Tools: 2-3 days

**Phase 3: Enhancement Tools** (1 week)
- Zoom to Selection: 1 day
- Ruler & Measurements: 2-3 days
- Lock/Unlock: 1-2 days

**Phase 4: Polish & Documentation** (1 day)
- Final testing
- Documentation updates
- Bug fixes

**Total**: 4-4.5 weeks

## Alternatives Considered

1. **Modal-based table creation (no canvas click)**
   - Rejected: Breaks visual editing flow, position not intuitive
   
2. **Drag-to-place for Add tool**
   - Rejected: More complex, click-to-place is faster for most users
   - Consider for future enhancement
   
3. **No confirmation for Delete**
   - Rejected: Too risky, deleting tables with orders could cause issues
   
4. **Delete via context menu instead of tool**
   - Considered: Could coexist, but tool provides better visual workflow

## Open Questions

1. Should Add Table tool auto-switch to Select mode after placement?
   - **Proposed**: Stay in Add mode for multiple placements, `Esc` to exit
   
2. Should we show table preview while hovering before clicking?
   - **Proposed**: Yes, improves placement accuracy
   
3. What should happen if user tries to delete occupied table?
   - **Proposed**: Show warning, allow force delete with additional confirmation
   
4. Should Delete tool work without selecting table first?
   - **Proposed**: No, must select first (safer, more deliberate)
   
5. Default size for newly placed tables?
   - **Proposed**: 100x100px (configurable in properties after placement)

## What Changes

This change adds comprehensive visual editing tools to the Visual Floor Plan editor:

**New Capabilities:**
- Add Table Tool: Click-to-place table creation with ghost preview and collision detection
- Delete Table Tool: Visual table deletion with confirmation and validation
- Canvas Pan Boundaries: Constrained panning to prevent getting lost
- Duplicate Tool: Quick table duplication with auto-increment
- Multi-Select: Box selection and bulk operations
- Alignment Tools: Precise positioning with 6 alignment types and distribution
- Zoom to Selection: Quick navigation with F key and double-click
- Ruler & Measurements: Visual guides with coordinate/dimension overlays
- Lock/Unlock: Protect tables from accidental modifications

**Modified Capabilities:**
- Tool State Management: Enhanced to support 10 tools with proper state transitions
- Undo/Redo System: Extended to support all new tool operations

**Files Changed:**
- `app/client/src/components/features/tables/visual-floor-plan/VisualFloorPlanView.tsx` - Main editor component with tool orchestration
- `app/client/src/components/features/tables/visual-floor-plan/VisualFloorPlanCanvas.tsx` - Canvas with pan boundaries and event handlers
- `app/client/src/components/features/tables/visual-floor-plan/EditorToolbar.tsx` - Toolbar with new tool buttons
- `app/client/src/components/features/tables/visual-floor-plan/DraggableTable.tsx` - Table component with lock support
- `app/client/src/lib/stores/tableStore.ts` - Store with selection and lock state

**New Files:**
- `app/client/src/components/features/tables/visual-floor-plan/GhostTablePreview.tsx` - Ghost preview component
- `app/client/src/components/features/tables/QuickCreateTableDialog.tsx` - Quick creation dialog
- `app/client/src/components/features/tables/DeleteTableConfirmDialog.tsx` - Delete confirmation dialog
- `app/client/src/components/features/tables/visual-floor-plan/SelectionBox.tsx` - Multi-select box component
- `app/client/src/components/features/tables/visual-floor-plan/AlignmentToolbar.tsx` - Alignment controls
- `app/client/src/components/features/tables/visual-floor-plan/HorizontalRuler.tsx` - Horizontal ruler
- `app/client/src/components/features/tables/visual-floor-plan/VerticalRuler.tsx` - Vertical ruler
- `app/client/src/components/features/tables/visual-floor-plan/MeasurementOverlay.tsx` - Measurement display
- `app/client/src/lib/utils/pan-boundaries.ts` - Pan boundary calculations
- `app/client/src/lib/utils/collision-detection.ts` - Collision detection algorithms
- `app/client/src/lib/utils/table-duplication.ts` - Duplication utilities
- `app/client/src/lib/utils/selection-state.ts` - Multi-select state management
- `app/client/src/lib/utils/alignment-tools.ts` - Alignment algorithms
- `app/client/src/lib/utils/zoom-utilities.ts` - Zoom calculations
- `app/client/src/lib/utils/table-locking.ts` - Lock state utilities

## Implementation Details

### Add Table Tool

**State:**
```typescript
interface AddTableState {
  isPlacing: boolean;
  previewPosition: { x: number; y: number } | null;
  ghostTable: Partial<Table> | null;
}
```

**Collision Detection:**
```typescript
function detectCollision(
  position: { x: number; y: number },
  size: { width: number; height: number },
  existingTables: Table[]
): boolean {
  // Check if new table overlaps with any existing table
  // Account for rotation if needed
}
```

### Delete Tool

**Validation:**
```typescript
function canDeleteTable(table: Table): {
  allowed: boolean;
  reason?: string;
  requiresConfirmation: boolean;
} {
  // Check for active orders, reservations
  // Return appropriate flags
}
```

## Approval

- [ ] Product Owner
- [ ] Tech Lead
- [ ] UI/UX Designer

## Related Documents

- [TABLE_MANAGEMENT_USER_GUIDE.md](../../../docs/TABLE_MANAGEMENT_USER_GUIDE.md)
- [TABLE_MANAGEMENT_DEVELOPER_GUIDE.md](../../../docs/TABLE_MANAGEMENT_DEVELOPER_GUIDE.md)
- [implement-table-management/proposal.md](../implement-table-management/proposal.md)
