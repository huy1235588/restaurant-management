# Visual Floor Plan Editor - Layout Management

## ADDED Requirements

### Requirement: Manual Save System
The system SHALL require explicit user action to save layout changes.

#### Scenario: Unsaved Changes Indicator
**Given** a user makes any change to the floor plan  
**When** the change is made (move, resize, add, delete)  
**Then** an unsaved changes indicator appears (asterisk or "Unsaved" badge)  
**And** the indicator is prominently displayed near the Save button  
**And** the state persists across tool switches and view changes  
**And** remains visible until changes are saved

#### Scenario: Manual Save Action
**Given** a user has unsaved changes  
**When** the user clicks the Save button or presses Ctrl+S  
**Then** the system saves all table positions for the current floor  
**And** sends a batch update request to the API  
**And** displays a saving indicator (spinner or progress)  
**And** shows success notification on completion  
**And** clears the unsaved changes indicator

#### Scenario: Save with Keyboard Shortcut
**Given** a user has unsaved changes  
**When** the user presses Ctrl+S (Windows) or Cmd+S (Mac)  
**Then** the save operation executes immediately  
**And** follows the same save flow as clicking Save button  
**And** provides visual feedback of save status  
**And** prevents browser's default save behavior

#### Scenario: Save Error Handling
**Given** a user attempts to save changes  
**When** the save operation fails (network error, validation error)  
**Then** an error notification appears with details  
**And** the unsaved changes indicator remains active  
**And** the user can retry the save operation  
**And** changes remain in local state for retry

#### Scenario: No Auto-Save
**Given** a user makes changes and waits  
**When** time passes without saving  
**Then** no automatic save occurs  
**And** changes remain unsaved indefinitely  
**And** the unsaved indicator persists  
**And** the user maintains full control over when to commit changes

### Requirement: Save Layout Configuration
The system SHALL allow saving named layout configurations.

#### Scenario: Saving Named Layout
**Given** a user has arranged tables on a floor  
**When** the user clicks "Save Layout As" and enters a name  
**Then** the system saves the current layout as a named configuration  
**And** stores layout data in floor_plan_layouts table  
**And** includes table positions, canvas settings, and metadata  
**And** associates the layout with the current floor and user

#### Scenario: Layout Data Structure
**Given** a layout is being saved  
**When** the system serializes the layout  
**Then** the layout includes version number (1.0)  
**And** stores floor number  
**And** includes array of table positions (id, x, y, width, height, rotation)  
**And** saves canvas settings (zoom, gridSize)  
**And** records creation timestamp and author  
**And** serializes to JSONB format

#### Scenario: Loading Saved Layout
**Given** saved layouts exist for the current floor  
**When** the user opens the "Load Layout" dialog  
**Then** all saved layouts for the floor are listed  
**And** each layout shows name, date created, and author  
**And** the user can preview layout details  
**And** selecting a layout loads it onto the canvas

#### Scenario: Applying Loaded Layout
**Given** a user selects a saved layout to load  
**When** the user confirms loading  
**Then** the system checks for unsaved changes and warns if needed  
**And** clears the current canvas  
**And** positions all tables according to the loaded layout  
**And** applies saved canvas settings (zoom, grid)  
**And** marks layout as active in the database

### Requirement: Layout Templates
The system SHALL provide predefined layout templates.

#### Scenario: Viewing Available Templates
**Given** a user clicks "Apply Template"  
**When** the templates dialog opens  
**Then** predefined templates are displayed with previews  
**And** templates include: Restaurant (8 tables), Cafe (12 tables), Fine Dining (6 tables), Bar (16 tables), Banquet (20 tables)  
**And** each template shows thumbnail preview and description  
**And** user can select a template to apply

#### Scenario: Applying Template
**Given** a user selects the "Restaurant Layout" template  
**When** the user confirms applying the template  
**Then** the system warns about unsaved changes if any exist  
**And** clears the current canvas  
**And** creates tables according to template specification  
**And** positions tables with optimal spacing  
**And** applies template's recommended grid size  
**And** marks layout as having unsaved changes

#### Scenario: Template Customization
**Given** a user has applied a template  
**When** the template is loaded on canvas  
**Then** the user can modify table positions, sizes immediately  
**And** can add or remove tables from the template  
**And** can adjust spacing and alignment  
**And** changes are tracked as unsaved modifications  
**And** can save as custom layout

#### Scenario: Template for Different Floor Sizes
**Given** templates are designed for standard floor sizes  
**When** a template is applied to a floor  
**Then** tables are positioned proportionally to canvas size  
**And** spacing scales appropriately  
**And** margins are maintained relative to floor dimensions  
**And** collision detection ensures no overlaps occur

### Requirement: Layout Operations
The system SHALL support common layout management operations.

#### Scenario: Listing Saved Layouts
**Given** a user requests to view saved layouts  
**When** the layouts list is displayed  
**Then** layouts are filtered by current floor  
**And** sorted by date created (newest first)  
**And** each layout shows name, creation date, author, and table count  
**And** user can search/filter layouts by name  
**And** pagination is provided if many layouts exist

#### Scenario: Deleting Layout
**Given** a user selects a saved layout  
**When** the user clicks "Delete" and confirms  
**Then** the layout is removed from floor_plan_layouts table  
**And** a confirmation dialog prevents accidental deletion  
**And** deletion cannot be undone  
**And** success notification appears after deletion

#### Scenario: Duplicating Layout
**Given** a user selects an existing layout  
**When** the user clicks "Duplicate"  
**Then** a copy of the layout is created  
**And** the duplicate is named "[Original Name] (Copy)"  
**And** user can rename before saving  
**And** duplicate has same table positions as original  
**And** both layouts exist independently

#### Scenario: Activating Layout
**Given** multiple layouts exist for a floor  
**When** a user marks a layout as active  
**Then** the layout's is_active flag is set to true  
**And** other layouts for the floor are marked inactive  
**And** the active layout becomes the default for the floor  
**And** the active layout loads automatically when floor is accessed

### Requirement: Batch Position Updates
The system SHALL efficiently save multiple table positions simultaneously.

#### Scenario: Batch Update Request
**Given** a user has moved multiple tables  
**When** the user saves the layout  
**Then** all position changes are sent in a single API request  
**And** the request includes array of table position objects  
**And** each object has tableId, floor, x, y, width, height, rotation  
**And** server processes updates in a transaction

#### Scenario: Batch Update Success
**Given** a batch update request is sent  
**When** the server processes successfully  
**Then** all table positions are updated in the database  
**And** updated_at timestamp is set to current time  
**And** response includes updated positions for verification  
**And** client state synchronizes with server response  
**And** unsaved changes indicator clears

#### Scenario: Partial Batch Update Failure
**Given** a batch update includes some invalid positions  
**When** the server validates the request  
**Then** the entire batch is rejected (transaction rollback)  
**And** error response lists all validation failures  
**And** no partial updates are saved  
**And** client maintains unsaved state for retry  
**And** user can correct errors and retry save

### Requirement: Layout History and Versioning
The system SHALL track layout changes over time.

#### Scenario: Recording Layout Save
**Given** a user saves a layout  
**When** the save operation completes  
**Then** the updated_at timestamp is recorded  
**And** the system logs the save action  
**And** associates save with the authenticated user  
**And** maintains audit trail of changes

#### Scenario: Layout Metadata Display
**Given** a saved layout exists  
**When** the layout is displayed in the list  
**Then** shows creation date and time  
**And** shows last updated date and time  
**And** displays author username  
**And** shows number of tables in layout  
**And** indicates if layout is currently active
