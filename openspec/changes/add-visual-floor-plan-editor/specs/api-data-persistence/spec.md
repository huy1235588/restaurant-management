# Visual Floor Plan Editor - API and Data Persistence

## ADDED Requirements

### Requirement: Position Management API
The system SHALL provide API endpoints for managing table positions.

#### Scenario: Fetching Floor Positions
**Given** a user loads a floor in the editor  
**When** the client requests positions for floor 2  
**Then** GET /api/floor-plans/positions?floor=2 is called  
**And** returns array of table positions for floor 2  
**And** each position includes tableId, x, y, width, height, rotation  
**And** response time is under 300ms  
**And** response includes table metadata (number, status, capacity)

#### Scenario: Batch Updating Positions
**Given** a user saves multiple table position changes  
**When** the client sends a batch update request  
**Then** PUT /api/floor-plans/positions/batch is called  
**And** request body includes floor number and array of positions  
**And** server validates all positions before updating  
**And** updates are performed in a database transaction  
**And** response confirms successful update with updated data  
**And** operation completes within 1 second for 100 tables

#### Scenario: Single Position Update
**Given** a user moves a single table  
**When** a quick update is needed  
**Then** PUT /api/floor-plans/positions/:tableId can be called  
**And** request body includes floor, x, y, width, height, rotation  
**And** server validates and updates the single position  
**And** response returns the updated position data  
**And** operation completes within 200ms

### Requirement: Layout Management API
The system SHALL provide API endpoints for saving and loading floor plan layouts.

#### Scenario: Listing Saved Layouts
**Given** a user wants to view saved layouts for a floor  
**When** the client requests layouts  
**Then** GET /api/floor-plans/layouts?floor=2 is called  
**And** returns array of layouts for the specified floor  
**And** each layout includes id, name, description, created_at, created_by  
**And** results are sorted by created_at descending  
**And** pagination is supported with limit and offset parameters

#### Scenario: Creating New Layout
**Given** a user saves a layout with name "Evening Setup"  
**When** the client submits the layout  
**Then** POST /api/floor-plans/layouts is called  
**And** request includes layoutName, floor, description, layoutData  
**And** layoutData is JSONB with version, canvasSettings, and tables array  
**And** server validates layout structure and data  
**And** creates record in floor_plan_layouts table  
**And** response returns created layout with generated ID

#### Scenario: Loading Specific Layout
**Given** a user selects a saved layout to load  
**When** the client requests the layout details  
**Then** GET /api/floor-plans/layouts/:layoutId is called  
**And** returns complete layout data including all table positions  
**And** includes canvas settings (zoom, gridSize)  
**And** includes metadata (created_at, updated_at, author)  
**And** response time is under 300ms

#### Scenario: Updating Existing Layout
**Given** a user modifies and re-saves an existing layout  
**When** the client submits the update  
**Then** PUT /api/floor-plans/layouts/:layoutId is called  
**And** request includes updated layoutData and optional new name/description  
**And** server validates the update  
**And** updates updated_at timestamp  
**And** response returns the updated layout

#### Scenario: Deleting Layout
**Given** a user deletes a saved layout  
**When** the client sends delete request  
**Then** DELETE /api/floor-plans/layouts/:layoutId is called  
**And** server verifies user has permission to delete  
**And** removes the layout record from database  
**And** response confirms successful deletion  
**And** operation is irreversible

#### Scenario: Activating Layout
**Given** a user sets a layout as the active default  
**When** the client activates the layout  
**Then** POST /api/floor-plans/layouts/:layoutId/activate is called  
**And** server sets is_active=true for the layout  
**And** sets is_active=false for other layouts on the same floor  
**And** response confirms activation  
**And** active layout becomes the floor's default

### Requirement: Template Management API
The system SHALL provide API endpoints for layout templates.

#### Scenario: Fetching Available Templates
**Given** a user wants to apply a template  
**When** the client requests templates  
**Then** GET /api/floor-plans/templates is called  
**And** returns array of predefined templates  
**And** each template includes id, name, description, tableCount, preview image URL  
**And** templates are categorized (restaurant, cafe, fine-dining, bar, banquet)  
**And** response includes template layout data structure

#### Scenario: Applying Template
**Given** a user selects the "Restaurant Layout" template  
**When** the client applies the template  
**Then** POST /api/floor-plans/templates/:templateId/apply is called  
**And** request includes target floor number  
**And** server generates table positions based on template  
**And** response returns array of positions to render on canvas  
**And** no database changes occur until user saves

### Requirement: Database Schema
The system SHALL use appropriate database tables for data persistence.

#### Scenario: Table Positions Schema
**Given** table positions need to be stored  
**When** the database schema is defined  
**Then** table_positions table exists with columns:  
- id (SERIAL PRIMARY KEY)  
- table_id (INTEGER, FK to restaurant_tables)  
- floor (INTEGER, NOT NULL, DEFAULT 1)  
- x (INTEGER, NOT NULL, DEFAULT 0)  
- y (INTEGER, NOT NULL, DEFAULT 0)  
- width (INTEGER, NOT NULL, DEFAULT 80)  
- height (INTEGER, NOT NULL, DEFAULT 80)  
- rotation (INTEGER, NOT NULL, DEFAULT 0)  
- updated_at (TIMESTAMP, DEFAULT NOW())  
**And** UNIQUE constraint on (table_id, floor)  
**And** CASCADE delete when table is deleted  
**And** index on floor for fast queries

#### Scenario: Floor Plan Layouts Schema
**Given** layout configurations need to be stored  
**When** the database schema is defined  
**Then** floor_plan_layouts table exists with columns:  
- layout_id (SERIAL PRIMARY KEY)  
- layout_name (VARCHAR(100), NOT NULL)  
- floor (INTEGER, NOT NULL)  
- description (TEXT, NULLABLE)  
- layout_data (JSONB, NOT NULL)  
- is_active (BOOLEAN, DEFAULT false)  
- created_at (TIMESTAMP, DEFAULT NOW())  
- updated_at (TIMESTAMP, DEFAULT NOW())  
- created_by (INTEGER, FK to users)  
**And** index on (floor, is_active) for fast queries  
**And** layout_data contains version, canvasSettings, tables array

### Requirement: Data Validation
The system SHALL validate all data before persistence.

#### Scenario: Position Data Validation
**Given** a position update request is received  
**When** the server validates the data  
**Then** floor must be a positive integer (1-99)  
**And** x and y must be non-negative integers  
**And** width and height must be between 40 and 200  
**And** rotation must be between 0 and 360  
**And** table_id must reference existing table  
**And** validation errors return 400 status with details

#### Scenario: Layout Data Validation
**Given** a layout creation/update request is received  
**When** the server validates the layout  
**Then** layout_name must be 1-100 characters  
**And** floor must be valid floor number  
**And** layoutData must be valid JSON  
**And** layoutData must match expected schema (version, canvasSettings, tables)  
**And** all table IDs in layout must exist in database  
**And** validation errors return 400 status with field-specific messages

#### Scenario: Collision Validation
**Given** positions are being saved  
**When** the server validates positions  
**Then** checks for overlapping table positions  
**And** allows save if overlaps are minor (less than 10% overlap)  
**And** warns user about significant overlaps  
**And** does not strictly prevent saves (design decision, user controls layout)

### Requirement: API Error Handling
The system SHALL handle API errors gracefully.

#### Scenario: Network Error
**Given** an API request fails due to network issues  
**When** the client receives the error  
**Then** displays user-friendly error message  
**And** provides retry option  
**And** maintains local state for retry  
**And** logs error details for debugging

#### Scenario: Validation Error
**Given** the server rejects a request due to validation  
**When** the client receives 400 status response  
**Then** displays field-specific error messages  
**And** highlights problematic fields in UI  
**And** allows user to correct and resubmit  
**And** maintains other valid data

#### Scenario: Authorization Error
**Given** a user lacks permission for an operation  
**When** the server returns 403 status  
**Then** displays "Permission denied" message  
**And** explains required permission level  
**And** prevents further attempts at the operation  
**And** user can request elevated access if applicable

#### Scenario: Server Error
**Given** the server encounters an internal error  
**When** the client receives 500 status response  
**Then** displays generic error message  
**And** suggests trying again later  
**And** logs error details for support  
**And** maintains local state for retry  
**And** doesn't expose internal error details to user

### Requirement: API Performance
The system SHALL meet performance benchmarks for API operations.

#### Scenario: Fast Position Fetching
**Given** a floor with up to 100 tables  
**When** positions are requested  
**Then** database query completes within 100ms  
**And** JSON serialization completes within 50ms  
**And** total response time is under 300ms  
**And** query uses index on floor column

#### Scenario: Efficient Batch Updates
**Given** batch update of 100 table positions  
**When** the update is processed  
**Then** database transaction completes within 500ms  
**And** all updates use single transaction  
**And** uses prepared statements for efficiency  
**And** total response time is under 1 second

#### Scenario: Optimized Layout Loading
**Given** a layout with many tables  
**When** the layout is loaded  
**Then** database query uses appropriate indexes  
**And** JSONB data is efficiently retrieved  
**And** response includes only necessary data  
**And** total response time is under 300ms

### Requirement: Real-time Updates
The system SHALL optionally support real-time position updates via WebSocket.

#### Scenario: Broadcasting Position Changes
**Given** a user saves table positions  
**When** the save completes  
**Then** server optionally broadcasts change via WebSocket  
**And** other connected clients receive update event  
**And** clients update their view if on same floor  
**And** change event includes floor, tableId, new position

#### Scenario: Handling Concurrent Edits
**Given** multiple users edit the same floor simultaneously  
**When** both save changes  
**Then** last write wins strategy is applied  
**And** both saves succeed (no locking)  
**And** later saver's data overwrites earlier saver  
**And** system logs concurrent edit occurrences  
**And** future enhancement may add conflict resolution UI
