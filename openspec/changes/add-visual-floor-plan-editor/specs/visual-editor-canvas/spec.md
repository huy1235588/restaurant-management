# Visual Floor Plan Editor - Core Canvas

## ADDED Requirements

### Requirement: Full-Screen Editor Mode
The system SHALL provide a dedicated full-screen editor mode for visual floor plan editing.

#### Scenario: Entering Editor Mode
**Given** a user is viewing the table management list view  
**When** the user clicks the "Visual Editor" button  
**Then** the system switches to full-screen editor mode  
**And** hides the page header, search filters, and stats cards  
**And** displays only the canvas, toolbar, and optional properties panel  
**And** maximizes available workspace for editing

#### Scenario: Exiting Editor Mode
**Given** a user is in the visual editor mode  
**When** the user clicks the "Exit" or "Back to List" button  
**Then** the system returns to the table management list view  
**And** restores the header, filters, and table grid  
**And** if there are unsaved changes, displays a warning dialog before exiting

### Requirement: Canvas Rendering System
The system SHALL render the floor plan using a hybrid Canvas/DOM approach.

#### Scenario: Rendering Static Canvas Elements
**Given** the editor is loaded with a floor plan  
**When** the canvas renders  
**Then** static elements (grid, background) are drawn using HTML5 Canvas  
**And** interactive elements (tables, controls) are rendered as React DOM components  
**And** the canvas maintains 60fps performance with up to 100 tables

#### Scenario: Grid Overlay Display
**Given** a user has grid display enabled  
**When** the canvas renders  
**Then** a grid pattern is drawn on the canvas layer  
**And** the grid uses subtle colors to avoid distraction  
**And** grid lines align to the configured grid size (default 20px)  
**And** grid scales appropriately with zoom level

### Requirement: Zoom Controls
The system SHALL provide zoom controls for the canvas viewport.

#### Scenario: Zooming In
**Given** a user is viewing a floor plan at 100% zoom  
**When** the user clicks the "Zoom In" button or presses Ctrl+Scroll up  
**Then** the canvas zoom increases by one level (25%, 50%, 75%, 100%, 125%, 150%, 200%)  
**And** the zoom animation is smooth (300ms transition)  
**And** the zoom center point is at the current mouse position  
**And** the maximum zoom level is 200%

#### Scenario: Zooming Out
**Given** a user is viewing a floor plan at 100% zoom  
**When** the user clicks the "Zoom Out" button or presses Ctrl+Scroll down  
**Then** the canvas zoom decreases by one level  
**And** the zoom animation is smooth  
**And** the minimum zoom level is 25%

#### Scenario: Resetting Zoom
**Given** a user is viewing a floor plan at any zoom level  
**When** the user presses the "0" key or clicks "Reset Zoom"  
**Then** the canvas zoom returns to 100%  
**And** the transition is smooth  
**And** the canvas centers on the origin point

#### Scenario: Zoom Display
**Given** a user is in the visual editor  
**When** the zoom level changes  
**Then** the current zoom percentage is displayed in the toolbar  
**And** updates in real-time as zoom changes

### Requirement: Pan Controls
The system SHALL provide pan controls for navigating large floor plans.

#### Scenario: Panning with Pan Tool
**Given** a user has selected the Pan tool (H key)  
**When** the user clicks and drags on the canvas  
**Then** the entire canvas viewport moves in the drag direction  
**And** the cursor changes to a grab/grabbing icon  
**And** the pan is smooth and responsive (60fps)

#### Scenario: Pan Boundaries
**Given** a user is panning the canvas  
**When** the user reaches the edge of the pan boundary  
**Then** the system prevents panning beyond the boundary  
**And** the boundary is calculated as the bounding box of all tables plus 500px margin  
**And** a boundary indicator is shown when reaching the edge

#### Scenario: Fit to View
**Given** a user has tables scattered across a large canvas  
**When** the user clicks "Fit to View" button  
**Then** the system calculates the bounding box of all tables  
**And** automatically adjusts zoom and pan to show all tables  
**And** adds padding around the edges (100px)  
**And** animates smoothly to the new view (500ms)

### Requirement: Grid Controls
The system SHALL provide controls for managing the grid overlay.

#### Scenario: Toggling Grid Display
**Given** a user is in the visual editor  
**When** the user presses "G" key or clicks the "Grid" button  
**Then** the grid overlay toggles between visible and hidden  
**And** the grid state persists during the editing session  
**And** the grid button shows active/inactive state

#### Scenario: Configuring Grid Size
**Given** a user has grid display enabled  
**When** the user opens grid settings and selects a grid size (10px, 20px, 50px)  
**Then** the grid is redrawn with the new size  
**And** snap behavior updates to match the new grid size  
**And** the setting persists for the current session

### Requirement: Fullscreen Mode
The system SHALL support fullscreen mode for maximum workspace.

#### Scenario: Entering Fullscreen
**Given** a user is in the visual editor  
**When** the user presses "F" key or clicks the "Fullscreen" button  
**Then** the editor expands to fullscreen mode  
**And** non-essential UI elements are hidden  
**And** the canvas maximizes to full browser window  
**And** fullscreen controls remain accessible

#### Scenario: Exiting Fullscreen
**Given** a user is in fullscreen mode  
**When** the user presses "F" or "Esc" key  
**Then** the editor returns to normal mode  
**And** all UI elements are restored  
**And** the canvas size adjusts to the normal viewport

### Requirement: Performance Optimization
The system SHALL maintain optimal performance with many tables.

#### Scenario: Rendering Many Tables
**Given** a floor plan contains 100 tables  
**When** the canvas renders or updates  
**Then** the frame rate remains at or above 60fps  
**And** interactions (drag, zoom, pan) remain smooth  
**And** initial load time is under 500ms

#### Scenario: Smooth Animations
**Given** a user performs any canvas operation (zoom, pan, drag)  
**When** the animation executes  
**Then** the system uses requestAnimationFrame for smooth rendering  
**And** drag events are debounced to 16ms (60fps)  
**And** no visible lag or stutter occurs during interaction
