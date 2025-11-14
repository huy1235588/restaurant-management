# Visual Floor Plan Tools Specification

## ADDED Requirements

### Requirement: Add Table Tool Activation and Placement

The system SHALL provide an Add Table tool that allows users to place new tables on the canvas by clicking with visual ghost preview and collision detection.

#### Scenario: Activate Add Table tool
**Given** the Visual Floor Plan editor is open
**When** the user clicks the "Add Table" button or presses the `T` key
**Then** the cursor changes to a crosshair
**And** a ghost table preview appears following the cursor

#### Scenario: Place table on canvas
**Given** the Add Table tool is active
**When** the user clicks on an empty area of the canvas
**Then** a quick creation dialog appears at the click position
**And** the dialog pre-fills the position coordinates
**And** the user can enter table number and capacity
**And** clicking "Create" adds the table to the canvas

#### Scenario: Grid snapping during placement
**Given** the Add Table tool is active
**And** grid snapping is enabled
**When** the user moves the cursor over the canvas
**Then** the ghost preview position snaps to the nearest grid intersection

#### Scenario: Collision detection prevents overlap
**Given** the Add Table tool is active
**And** the user moves the cursor over an existing table
**When** the ghost preview overlaps with an existing table
**Then** the ghost preview color changes to red
**And** clicking does not open the creation dialog
**And** an error message displays "Cannot place table here - collision detected"

#### Scenario: Cancel placement mode
**Given** the Add Table tool is active
**When** the user presses the `Esc` key
**Then** the tool switches back to Select mode
**And** the ghost preview disappears

### Requirement: Delete Table Tool with Validation

The system SHALL provide a Delete Table tool that allows users to remove tables from the canvas with confirmation dialogs and validation checks for active orders and reservations.

#### Scenario: Activate Delete tool with keyboard
**Given** a table is selected in the Visual Floor Plan editor
**When** the user presses the `Delete` key
**Then** a confirmation dialog appears showing table details
**And** the dialog shows table number, capacity, and current status

#### Scenario: Delete table with confirmation
**Given** the delete confirmation dialog is open
**And** the table has no active orders
**When** the user clicks "Delete Table"
**Then** the table is removed from the canvas with a fade-out animation
**And** the table is removed from the database
**And** a success toast displays "Table [number] deleted"
**And** the tool switches back to Select mode

#### Scenario: Prevent deletion of occupied table
**Given** the delete confirmation dialog is open
**And** the table has an active order (status = 'occupied')
**When** the dialog is displayed
**Then** the "Delete Table" button is disabled
**And** an error alert displays "This table has an active order"
**And** the user cannot proceed with deletion

#### Scenario: Warning for reserved table
**Given** the delete confirmation dialog is open
**And** the table is reserved (status = 'reserved')
**When** the dialog is displayed
**And** a warning alert displays "This table has a reservation"
**And** the "Delete Table" button remains enabled
**And** the user can choose to proceed or cancel

### Requirement: Canvas Pan Boundaries and View Controls

The system SHALL constrain canvas panning to a defined working area based on table positions with automatic boundary calculation and view control buttons for fit-to-view and reset operations.

#### Scenario: Calculate canvas boundaries
**Given** tables exist on the canvas
**When** the system calculates pan boundaries
**Then** the boundaries are set to include all tables plus 500px margin on each side
**And** the minimum canvas size is 2000x2000px

#### Scenario: Prevent panning beyond boundaries
**Given** canvas boundaries are calculated
**When** the user attempts to pan beyond the boundary
**Then** the pan operation stops at the boundary
**And** the user cannot pan further in that direction

#### Scenario: Update boundaries when tables change
**Given** canvas boundaries are set
**When** a table is added, removed, or moved
**Then** the boundaries are recalculated
**And** the new boundaries reflect the updated table positions

#### Scenario: Fit all tables in view
**Given** multiple tables exist on the canvas
**When** the user clicks the "Fit to View" button
**Then** the zoom and pan adjust to show all tables
**And** the adjustment animates smoothly over 300ms
**And** all tables are visible with comfortable margins

#### Scenario: Reset view to origin
**Given** the canvas is panned and/or zoomed
**When** the user clicks the "Reset View" button
**Then** the pan offset resets to (0, 0)
**And** the zoom resets to 1.0 (100%)
**And** the adjustment animates smoothly over 300ms

### Requirement: Duplicate Table Tool with Auto-Increment

The system SHALL provide a Duplicate tool that creates copies of selected tables with all properties copied and table numbers auto-incremented, positioned with a 50px offset.

#### Scenario: Duplicate single table
**Given** a table is selected
**When** the user presses `Ctrl+D` or clicks the "Duplicate" button
**Then** a new table is created with all properties copied
**And** the new table number is auto-incremented
**And** the new table is positioned 50px right and 50px down from the original
**And** the new table status is set to "available"

#### Scenario: Duplicate multiple tables
**Given** multiple tables are selected
**When** the user presses `Ctrl+D`
**Then** duplicates are created for all selected tables
**And** each duplicate maintains its relative position to others
**And** all table numbers are auto-incremented
**And** a success toast displays "Duplicated [count] table(s)"

### Requirement: Multi-Select with Box Selection and Bulk Operations

The system SHALL support selecting multiple tables using Shift+Click, Ctrl+Click, Ctrl+A, and box selection with support for bulk move and bulk delete operations.

#### Scenario: Add to selection with Shift+Click
**Given** one table is selected
**When** the user holds Shift and clicks another table
**Then** both tables are selected
**And** a blue outline appears on both tables
**And** a selection count badge displays "2 selected"

#### Scenario: Toggle selection with Ctrl+Click
**Given** one table is selected
**When** the user holds Ctrl/Cmd and clicks the table again
**Then** the table is deselected
**And** the selection count badge disappears

#### Scenario: Select all tables
**Given** multiple tables exist on the current floor
**When** the user presses `Ctrl/Cmd+A`
**Then** all tables on the current floor are selected
**And** the selection count badge displays the total count

#### Scenario: Box selection
**Given** the Select tool is active
**When** the user clicks and drags on an empty canvas area
**Then** a blue selection box appears following the drag
**And** when the user releases the mouse
**Then** all tables within the box are selected

#### Scenario: Bulk move selected tables
**Given** multiple tables are selected
**When** the user drags any selected table
**Then** all selected tables move together
**And** relative positions between tables are maintained
**And** if grid snapping is enabled, the group snaps to grid

#### Scenario: Bulk delete selected tables
**Given** multiple tables are selected
**When** the user presses `Delete` key
**Then** a confirmation dialog shows a list of all tables to be deleted
**And** the dialog aggregates warnings (occupied/reserved counts)
**And** clicking "Delete All" removes all tables atomically

### Requirement: Alignment and Distribution Tools for Precise Positioning

The system SHALL provide alignment and distribution tools with 6 alignment types (left, center horizontal, right, top, middle vertical, bottom) and 2 distribution types (horizontal, vertical) with animated transitions.

#### Scenario: Align tables left
**Given** 2 or more tables are selected
**When** the user clicks "Align Left" in the alignment toolbar
**Then** all selected tables align to the leftmost table's left edge
**And** the alignment animates smoothly over 300ms
**And** the action is added to undo history

#### Scenario: Align tables to center horizontal
**Given** 2 or more tables are selected
**When** the user clicks "Align Center Horizontal"
**Then** all selected tables align to the average horizontal center
**And** the alignment animates smoothly over 300ms

#### Scenario: Distribute tables horizontally
**Given** 3 or more tables are selected
**When** the user clicks "Distribute Horizontally"
**Then** tables are spaced evenly from leftmost to rightmost
**And** the distribution animates smoothly over 300ms
**And** locked tables are excluded from the operation

#### Scenario: Show alignment toolbar
**Given** 2 or more tables are selected
**When** the selection is active
**Then** an alignment toolbar appears at the top center of the canvas
**And** the toolbar shows 6 alignment buttons
**And** the toolbar shows 2 distribution buttons
**And** each button has a tooltip

### Requirement: Zoom to Selection for Quick Navigation

The system SHALL provide a zoom-to-selection feature that calculates optimal zoom and pan to show selected tables with 20% padding, activated by F key or double-click with smooth 500ms animation.

#### Scenario: Zoom to selected table with F key
**Given** one or more tables are selected
**When** the user presses the `F` key
**Then** the viewport zooms and pans to show the selected tables
**And** the zoom level is calculated to fit all selected tables with 20% padding
**And** the animation completes smoothly over 500ms

#### Scenario: Zoom to table on double-click
**Given** a table is visible on the canvas
**When** the user double-clicks the table
**Then** the viewport zooms and centers on that table
**And** the zoom level is optimized for that table's size
**And** the animation completes smoothly over 500ms

#### Scenario: Zoom respects constraints
**Given** the user triggers zoom to selection
**When** the optimal zoom would exceed constraints
**Then** the zoom is clamped to minimum 0.1 (10%)
**And** the zoom is clamped to maximum 3.0 (300%)
**And** the padding is adjusted to keep tables in view

### Requirement: Ruler and Measurement Tools for Precise Positioning

The system SHALL provide horizontal and vertical rulers with tick marks at 50px and 100px intervals, togglable with R key, and measurement overlays showing coordinates during drag, dimensions during resize, and angle during rotation.

#### Scenario: Toggle rulers with R key
**Given** the Visual Floor Plan editor is open
**When** the user presses the `R` key
**Then** horizontal and vertical rulers appear
**And** rulers show tick marks every 50px (minor) and 100px (major)
**And** pressing `R` again hides the rulers

#### Scenario: Show measurements during drag
**Given** a table is being dragged
**When** the table is in motion
**Then** a measurement overlay appears above the table
**And** the overlay shows current X and Y coordinates
**And** the overlay follows the table during drag

#### Scenario: Show dimensions during resize
**Given** a table is being resized
**When** a resize handle is being dragged
**Then** a measurement overlay shows current width × height
**And** the overlay updates in real-time during resize

#### Scenario: Show angle during rotation
**Given** a table is being rotated
**When** the rotation handle is being dragged
**Then** a measurement overlay shows the current rotation angle in degrees
**And** the overlay updates in real-time during rotation

#### Scenario: Rulers scale with zoom
**Given** rulers are visible
**When** the user zooms in or out
**Then** ruler tick marks adjust spacing based on zoom level
**And** ruler values update to reflect the zoom
**And** performance remains at 60fps at all zoom levels

### Requirement: Lock and Unlock Tables to Prevent Accidental Modifications

The system SHALL provide table locking functionality that prevents drag, resize, rotation, and deletion operations on locked tables with visual indicators (padlock icon, 85% opacity, not-allowed cursor) and exclusion from bulk operations.

#### Scenario: Lock selected table
**Given** a table is selected
**When** the user presses `Ctrl+L` or clicks the "Lock" button
**Then** the table is locked
**And** a padlock icon appears on the table
**And** the table opacity reduces to 85%
**And** a success toast displays "Locked 1 table"

#### Scenario: Prevent drag on locked table
**Given** a table is locked
**When** the user attempts to drag the table
**Then** the drag is prevented
**And** the cursor shows "not-allowed"
**And** a warning toast displays "Table is locked. Unlock to edit."

#### Scenario: Prevent resize on locked table
**Given** a table is locked
**When** the user attempts to resize the table
**Then** resize handles are not visible
**And** resize operations are blocked

#### Scenario: Prevent rotation on locked table
**Given** a table is locked
**When** the user attempts to rotate the table
**Then** the rotation handle is not visible
**And** rotation operations are blocked

#### Scenario: Prevent deletion of locked table
**Given** a table is locked and selected
**When** the user presses `Delete` key
**Then** the delete confirmation dialog shows
**But** includes a warning "This table is locked"
**And** the user must unlock before deleting

#### Scenario: Exclude locked tables from alignment
**Given** multiple tables are selected including locked tables
**When** the user applies an alignment operation
**Then** only unlocked tables move
**And** locked tables remain in their positions
**And** a toast displays "Aligned [count] tables (excluded [locked count] locked)"

#### Scenario: Bulk lock multiple tables
**Given** multiple tables are selected
**When** the user presses `Ctrl+L`
**Then** all selected tables are locked
**And** each shows a padlock icon
**And** a success toast displays "Locked [count] tables"

#### Scenario: Unlock locked table
**Given** a locked table is selected
**When** the user presses `Ctrl+L` again
**Then** the table is unlocked
**And** the padlock icon disappears
**And** the table opacity returns to 100%
**And** all edit operations are re-enabled

## MODIFIED Requirements

### Requirement: Tool State Management for Single Active Tool

The system SHALL manage tool states to ensure only one tool is active at a time with proper visual indicators (highlighted button, cursor changes) and automatic state cleanup when switching tools.

#### Scenario: Switch between tools
**Given** the Add Table tool is active
**When** the user clicks the Select tool button
**Then** the Add Table tool deactivates
**And** the ghost preview disappears
**And** the Select tool activates
**And** the cursor returns to default

#### Scenario: Visual indication of active tool
**Given** any tool is selected
**When** the tool becomes active
**Then** the tool button shows active styling (highlighted background)
**And** the cursor changes to match the tool
**And** other tool buttons show inactive styling

### Requirement: Undo/Redo System Integration for All Tool Operations

The existing undo/redo system SHALL support all new tool operations (create, delete, duplicate, alignment) with full state restoration including table properties and positions.

#### Scenario: Undo table creation
**Given** a table was just created using the Add Table tool
**When** the user presses `Ctrl+Z` or clicks Undo
**Then** the created table is removed from the canvas
**And** the table is removed from the database
**And** the canvas state returns to before creation

#### Scenario: Redo table creation
**Given** a table creation was just undone
**When** the user presses `Ctrl+Y` or clicks Redo
**Then** the table is recreated at the original position
**And** the table is added back to the database
**And** all original properties are restored

#### Scenario: Undo table deletion
**Given** a table was just deleted
**When** the user presses `Ctrl+Z`
**Then** the deleted table is restored to the canvas
**And** the table is restored in the database
**And** all properties match the original state

#### Scenario: Undo alignment operation
**Given** multiple tables were just aligned
**When** the user presses `Ctrl+Z`
**Then** all tables return to their previous positions
**And** the movement animates smoothly

