# Visual Floor Plan Editor - Drag and Drop System

## ADDED Requirements

### Requirement: Table Dragging
The system SHALL support smooth drag and drop for table repositioning.

#### Scenario: Initiating Table Drag
**Given** a user has the Select tool active  
**When** the user clicks and drags a table  
**Then** the table enters dragging state  
**And** the table gains an elevated shadow effect  
**And** the opacity changes to 0.8 to indicate dragging  
**And** the cursor changes to a grabbing icon

#### Scenario: Real-time Position Updates
**Given** a table is being dragged  
**When** the mouse moves  
**Then** the table position updates in real-time at 60fps  
**And** drag events are debounced to 16ms for smooth performance  
**And** the table follows the mouse pointer precisely  
**And** position coordinates are displayed near the cursor

#### Scenario: Completing Table Drag
**Given** a table is being dragged  
**When** the user releases the mouse button  
**Then** the table is placed at the new position  
**And** grid snapping is applied if enabled  
**And** the table returns to normal styling (no shadow, full opacity)  
**And** the new position is saved to the editor state  
**And** the unsaved changes indicator activates

#### Scenario: Canceling Drag with Escape
**Given** a table is being dragged  
**When** the user presses "Esc" key  
**Then** the drag operation is canceled  
**And** the table returns to its original position with animation  
**And** no changes are saved to state

### Requirement: Collision Detection
The system SHALL detect and prevent table collisions during placement and dragging.

#### Scenario: Real-time Collision Checking
**Given** a table is being dragged  
**When** the table overlaps with another table  
**Then** both tables are highlighted with red outlines  
**And** a collision warning indicator appears  
**And** the position is marked as invalid  
**And** collision state is calculated using AABB algorithm

#### Scenario: Preventing Invalid Placement
**Given** a table drag has a collision detected  
**When** the user releases the mouse button  
**Then** the table is not placed at the collision position  
**And** an error toast notification appears  
**And** the table snaps back to its previous valid position  
**And** no changes are saved to state

#### Scenario: Collision Detection Performance
**Given** a floor plan has 100 tables  
**When** collision detection runs during drag  
**Then** collision checks complete within 16ms (60fps)  
**And** only nearby tables are checked (spatial optimization)  
**And** no frame drops or lag occur during dragging

### Requirement: Grid Snapping
The system SHALL support grid-based alignment for precise table placement.

#### Scenario: Snapping to Grid
**Given** grid snapping is enabled  
**When** a table is dragged and released  
**Then** the table position snaps to the nearest grid intersection  
**And** both X and Y coordinates are rounded to grid size multiples  
**And** the snap threshold is 10px from grid points  
**And** snapping provides subtle haptic feedback (if supported)

#### Scenario: Grid Snapping Algorithm
**Given** a table is released at position (137, 245) with 20px grid  
**When** grid snapping is applied  
**Then** X coordinate snaps to 140 (Math.round(137/20) * 20)  
**And** Y coordinate snaps to 240 (Math.round(245/20) * 20)  
**And** the snap animation is smooth (100ms)

#### Scenario: Disabling Grid Snap Temporarily
**Given** grid snapping is enabled  
**When** the user holds "Shift" key while dragging  
**Then** grid snapping is temporarily disabled  
**And** the table can be placed at any position  
**And** an indicator shows that snap is disabled  
**And** releasing Shift re-enables snapping

#### Scenario: Visual Grid Snap Preview
**Given** grid display and snapping are enabled  
**When** a table is dragged near a grid intersection  
**Then** the nearest snap point is highlighted  
**And** alignment guides show the snap target  
**And** the table preview shows where it will snap  
**And** snap preview updates in real-time during drag

### Requirement: Alignment Guides
The system SHALL display alignment guides when tables align with each other.

#### Scenario: Horizontal Alignment Guide
**Given** a table is being dragged  
**When** the table's Y-coordinate aligns with another table (within 5px)  
**Then** a horizontal alignment line appears across the canvas  
**And** the line connects the aligned tables  
**And** the dragged table snaps to the alignment  
**And** the line disappears when alignment is broken

#### Scenario: Vertical Alignment Guide
**Given** a table is being dragged  
**When** the table's X-coordinate aligns with another table (within 5px)  
**Then** a vertical alignment line appears across the canvas  
**And** the line connects the aligned tables  
**And** the dragged table snaps to the alignment  
**And** the line disappears when alignment is broken

#### Scenario: Center Alignment Guide
**Given** a table is being dragged  
**When** the table's center point aligns with another table's center  
**Then** both horizontal and vertical center guides appear  
**And** the table snaps to center alignment  
**And** alignment snap threshold is 5px  
**And** guides use distinct styling (dashed lines)

#### Scenario: Multiple Alignment Guides
**Given** a table is being dragged  
**When** the table aligns with multiple tables simultaneously  
**Then** all relevant alignment guides are displayed  
**And** the table snaps to the nearest alignment  
**And** guides are color-coded by alignment type  
**And** performance remains smooth with multiple guides

### Requirement: Drag Performance
The system SHALL maintain optimal performance during drag operations.

#### Scenario: Smooth Drag Animation
**Given** a user drags a table across the canvas  
**When** the drag is in progress  
**Then** the frame rate remains at 60fps  
**And** the table follows the cursor without lag  
**And** collision checks don't impact performance  
**And** requestAnimationFrame is used for smooth rendering

#### Scenario: Debounced Drag Events
**Given** drag events fire frequently during mouse movement  
**When** the system processes drag updates  
**Then** events are debounced to 16ms intervals (60fps)  
**And** unnecessary re-renders are prevented  
**And** state updates are batched efficiently  
**And** memory usage remains stable during long drags

### Requirement: Multi-Table Dragging
The system SHALL support dragging multiple selected tables simultaneously.

#### Scenario: Dragging Multiple Tables
**Given** a user has multiple tables selected  
**When** the user drags any selected table  
**Then** all selected tables move together maintaining relative positions  
**And** collision detection applies to all moving tables  
**And** alignment guides consider all selected tables  
**And** grid snapping applies to the dragged table

#### Scenario: Group Collision Detection
**Given** multiple tables are being dragged as a group  
**When** any table in the group collides with another table  
**Then** all tables in the group are highlighted as colliding  
**And** the entire group cannot be placed at the collision position  
**And** the group returns to original positions on invalid placement  
**And** error feedback indicates which table(s) caused collision

### Requirement: Drag Accessibility
The system SHALL provide accessible alternatives to drag and drop.

#### Scenario: Keyboard-based Table Movement
**Given** a user has a table selected  
**When** the user presses arrow keys  
**Then** the table moves in the arrow direction  
**And** movement distance is one grid unit (or 10px without grid)  
**And** collision detection still applies  
**And** holding Shift increases movement speed (5x)

#### Scenario: Position Input Dialog
**Given** a user has a table selected  
**When** the user opens the properties panel and edits X/Y coordinates  
**Then** the table moves to the specified position  
**And** validation ensures position is within canvas bounds  
**And** collision detection prevents invalid positions  
**And** changes are reflected immediately on the canvas
