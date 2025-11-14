# Visual Floor Plan Editor - Editing Tools

## ADDED Requirements

### Requirement: Select Tool
The system SHALL provide a select tool for choosing and manipulating tables.

#### Scenario: Selecting a Table
**Given** a user has the Select tool active (V key)  
**When** the user clicks on a table  
**Then** the table is selected  
**And** a blue outline appears around the selected table  
**And** resize handles appear on the table corners and edges  
**And** the properties panel updates with table information

#### Scenario: Deselecting a Table
**Given** a user has a table selected  
**When** the user clicks on an empty area of the canvas  
**Then** the table is deselected  
**And** the selection outline and resize handles disappear  
**And** the properties panel clears or shows default content

#### Scenario: Multi-Select with Shift
**Given** a user has one or more tables selected  
**When** the user holds Shift and clicks another table  
**Then** the clicked table is added to the selection  
**And** all selected tables show selection outlines  
**And** the properties panel shows multi-selection information

#### Scenario: Dragging Selected Table
**Given** a user has a table selected with the Select tool  
**When** the user drags the selected table  
**Then** the table moves to follow the mouse pointer  
**And** real-time collision detection highlights conflicts  
**And** grid snapping applies if grid is enabled  
**And** the new position updates on mouse release

#### Scenario: Resizing Selected Table
**Given** a user has a table selected  
**When** the user drags a resize handle  
**Then** the table resizes in the corresponding direction  
**And** minimum size constraint (40x40px) is enforced  
**And** maximum size constraint (200x200px) is enforced  
**And** visual feedback shows the new dimensions during resize

### Requirement: Pan Tool
The system SHALL provide a pan tool for canvas navigation.

#### Scenario: Activating Pan Tool
**Given** a user is in the visual editor  
**When** the user presses "H" key or clicks the Pan tool button  
**Then** the Pan tool becomes active  
**And** the cursor changes to a hand/grab icon  
**And** the tool button highlights in the toolbar

#### Scenario: Panning the Canvas
**Given** the Pan tool is active  
**When** the user clicks and drags on the canvas  
**Then** the viewport moves in the direction of the drag  
**And** the cursor changes to a grabbing icon during drag  
**And** pan boundaries prevent moving beyond the work area  
**And** panning is smooth at 60fps

### Requirement: Add Table Tool
The system SHALL provide a tool for adding new tables to the floor plan.

#### Scenario: Activating Add Table Tool
**Given** a user is in the visual editor  
**When** the user presses "T" key or clicks the "Add Table" button  
**Then** the Add Table tool becomes active  
**And** a ghost preview of the table follows the mouse cursor  
**And** the tool button highlights in the toolbar

#### Scenario: Ghost Preview During Placement
**Given** the Add Table tool is active  
**When** the user moves the mouse over the canvas  
**Then** a semi-transparent ghost preview table follows the cursor  
**And** the preview shows green color if position is valid  
**And** the preview shows red color if collision is detected  
**And** grid snapping applies to the preview position if grid is enabled

#### Scenario: Placing a New Table
**Given** the Add Table tool is active with a valid position  
**When** the user clicks on the canvas  
**Then** the Quick Create Dialog opens at that position  
**And** the X and Y coordinates are pre-filled with the clicked position  
**And** default values are provided for table number and capacity  
**And** the user can modify values before creating

#### Scenario: Creating Table from Dialog
**Given** the Quick Create Dialog is open  
**When** the user enters table number, capacity, and clicks "Create"  
**Then** a new table is added to the canvas at the specified position  
**And** the table appears with a fade-in animation  
**And** the tool remains active for adding more tables  
**And** the unsaved changes indicator activates

#### Scenario: Collision Prevention
**Given** the Add Table tool is active  
**When** the user moves the ghost preview over an existing table  
**Then** the preview turns red to indicate collision  
**And** the position is marked as invalid  
**And** clicking at that position shows an error message  
**And** the table is not created

#### Scenario: Canceling Add Tool
**Given** the Add Table tool is active  
**When** the user presses "Esc" key or selects another tool  
**Then** the Add Table tool is deactivated  
**And** the ghost preview disappears  
**And** the previous tool becomes active

### Requirement: Delete Tool
The system SHALL provide functionality to delete tables from the floor plan.

#### Scenario: Deleting Selected Table
**Given** a user has a table selected  
**When** the user presses "Delete" key or clicks the Delete button  
**Then** a confirmation dialog appears  
**And** the dialog shows table details (number, status, reservations)  
**And** the table to be deleted is highlighted in red

#### Scenario: Confirming Deletion
**Given** a delete confirmation dialog is open  
**When** the user confirms the deletion  
**Then** the table is removed from the canvas with fade-out animation  
**And** the action is added to the undo history  
**And** the tool automatically switches back to Select mode  
**And** the unsaved changes indicator activates

#### Scenario: Preventing Active Table Deletion
**Given** a user attempts to delete a table  
**When** the table has an active order  
**Then** the system prevents deletion  
**And** shows an error message explaining the table is in use  
**And** the table is not deleted

#### Scenario: Warning for Reserved Table Deletion
**Given** a user attempts to delete a table  
**When** the table has upcoming reservations  
**Then** the confirmation dialog shows a warning  
**And** displays the reservation details  
**And** requires explicit confirmation to proceed with deletion

### Requirement: Tool Keyboard Shortcuts
The system SHALL support keyboard shortcuts for all editing tools.

#### Scenario: Switching Tools with Keyboard
**Given** a user is in the visual editor  
**When** the user presses a tool shortcut key (V, H, T)  
**Then** the corresponding tool activates immediately  
**And** the toolbar UI updates to show the active tool  
**And** the cursor changes to match the tool  
**And** any active tool ghost previews or states are cleared

#### Scenario: Esc Key Cancels Tool
**Given** a user has a tool active (Pan, Add Table)  
**When** the user presses "Esc" key  
**Then** the tool is deactivated  
**And** the system returns to Select tool as default  
**And** any temporary UI elements (ghost preview) are removed

### Requirement: Visual Tool Feedback
The system SHALL provide clear visual feedback for tool states and actions.

#### Scenario: Active Tool Indication
**Given** a tool is selected  
**When** the toolbar renders  
**Then** the active tool button is highlighted with distinct styling  
**And** the cursor changes to match the tool (hand, crosshair, pointer)  
**And** helper text or tooltip shows the active tool name and shortcut

#### Scenario: Tool Action Feedback
**Given** a user performs a tool action  
**When** the action starts (drag, placement)  
**Then** visual feedback is provided (outline, color change, preview)  
**And** the feedback updates in real-time as the action progresses  
**And** success/error states are clearly indicated with color and icons
