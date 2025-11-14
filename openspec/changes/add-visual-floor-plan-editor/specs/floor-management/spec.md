# Visual Floor Plan Editor - Floor Management

## ADDED Requirements

### Requirement: Floor Selection
The system SHALL support switching between different restaurant floors.

#### Scenario: Displaying Current Floor
**Given** a user is in the visual editor  
**When** the editor loads  
**Then** the floor selector displays the current floor (e.g., "Floor 1")  
**And** shows the number of tables on the current floor  
**And** is positioned in the top-left corner of the toolbar  
**And** is clearly visible and accessible

#### Scenario: Viewing Floor List
**Given** a user clicks on the floor selector dropdown  
**When** the dropdown opens  
**Then** all available floors are listed (Floor 1, Floor 2, Floor 3, etc.)  
**And** each floor shows its table count  
**And** the current floor is marked with a checkmark  
**And** floors are sorted numerically

#### Scenario: Switching Floors
**Given** a user is viewing Floor 1  
**When** the user selects Floor 2 from the dropdown  
**Then** the system checks for unsaved changes  
**And** if changes exist, displays a warning dialog  
**And** after confirmation, clears the current canvas  
**And** loads Floor 2 table positions  
**And** updates the floor selector to show "Floor 2"  
**And** resets zoom and pan to default or last saved view

#### Scenario: Quick Floor Switch with Keyboard
**Given** a user is in the visual editor  
**When** the user presses a number key (1, 2, 3, etc.)  
**Then** the system switches to the corresponding floor  
**And** applies the same unsaved changes check  
**And** provides smooth transition animation  
**And** updates toolbar to reflect new floor

### Requirement: Unsaved Changes Warning
The system SHALL warn users about unsaved changes when switching floors or exiting.

#### Scenario: Warning on Floor Switch
**Given** a user has made unsaved changes to Floor 1  
**When** the user attempts to switch to Floor 2  
**Then** a warning dialog appears  
**And** the dialog shows "You have unsaved changes. Save before switching?"  
**And** offers three options: "Save & Switch", "Discard & Switch", "Cancel"  
**And** "Save & Switch" saves changes and then switches floors  
**And** "Discard & Switch" abandons changes and switches floors  
**And** "Cancel" aborts the floor switch and stays on current floor

#### Scenario: Warning on Editor Exit
**Given** a user has made unsaved changes  
**When** the user clicks "Exit Editor" or navigates away  
**Then** a warning dialog appears  
**And** the dialog shows "You have unsaved changes. Save before exiting?"  
**And** offers "Save & Exit", "Discard & Exit", "Cancel" options  
**And** follows the same logic as floor switch warning

#### Scenario: No Warning Without Changes
**Given** a user has made no changes since last save  
**When** the user switches floors or exits editor  
**Then** no warning dialog appears  
**And** the action completes immediately  
**And** the user experience is smooth without interruption

### Requirement: Floor-Specific Layout Storage
The system SHALL maintain separate layouts for each floor.

#### Scenario: Loading Floor Layout
**Given** a user switches to a specific floor  
**When** the floor data loads  
**Then** the system fetches table positions for that floor only  
**And** retrieves positions from the table_positions table filtered by floor  
**And** loads tables onto the canvas at their saved positions  
**And** applies saved zoom/pan settings if available  
**And** completes loading within 500ms

#### Scenario: Saving Floor Layout
**Given** a user makes changes to Floor 2 and clicks Save  
**When** the save operation executes  
**Then** only Floor 2 table positions are updated in the database  
**And** other floors' data remains unchanged  
**And** the floor column in table_positions is set to 2  
**And** the save completes within 1 second

#### Scenario: Independent Floor Data
**Given** multiple floors exist in the system  
**When** data is stored in the database  
**Then** each table's position record includes a floor column  
**And** the unique constraint ensures one position per table per floor  
**And** a table can have different positions on different floors  
**And** deleting a table removes its positions from all floors

### Requirement: Floor Management UI
The system SHALL provide intuitive floor management controls.

#### Scenario: Floor Selector Display
**Given** the editor is loaded  
**When** the floor selector renders  
**Then** it shows a dropdown button with current floor name  
**And** displays table count badge (e.g., "12 tables")  
**And** shows a building/floor icon  
**And** has a dropdown chevron icon indicating more options  
**And** uses clear, readable typography

#### Scenario: Floor Count Badge
**Given** Floor 2 has 12 tables  
**When** the floor selector displays Floor 2  
**Then** the badge shows "(12 tables)"  
**And** the count updates in real-time when tables are added/removed  
**And** uses subtle styling to not distract from main content  
**And** is positioned next to the floor name

### Requirement: Floor Data Validation
The system SHALL validate floor-related data integrity.

#### Scenario: Valid Floor Range
**Given** a user attempts to create or switch to a floor  
**When** the floor number is provided  
**Then** the system validates the floor is a positive integer  
**And** supports floors 1 through 99  
**And** rejects invalid floor numbers (0, negative, non-integer)  
**And** displays appropriate error messages for invalid input

#### Scenario: Floor Existence Check
**Given** a user attempts to switch to a floor  
**When** the floor number is specified  
**Then** the system checks if the floor exists in the database  
**And** if the floor doesn't exist, creates it with empty layout  
**And** if the floor exists, loads its saved layout  
**And** handles edge cases gracefully (no errors for new floors)

### Requirement: Floor-based Undo/Redo
The system SHALL maintain separate undo/redo history for each floor.

#### Scenario: Floor-Specific History
**Given** a user makes changes on Floor 1  
**When** the user switches to Floor 2  
**Then** Floor 1's undo history is preserved  
**And** Floor 2 has its own independent undo history  
**And** switching back to Floor 1 restores its undo stack  
**And** undo/redo buttons show correct state for current floor

#### Scenario: History Persistence During Session
**Given** a user edits multiple floors in one session  
**When** the user switches between floors  
**Then** each floor's history is maintained in memory  
**And** undo/redo operations only affect the current floor  
**And** history clears when editor session ends  
**And** history persists during unsaved changes warnings

### Requirement: Floor Layout Performance
The system SHALL optimize floor switching performance.

#### Scenario: Fast Floor Switching
**Given** a user switches between floors  
**When** the floor change executes  
**Then** the previous floor's tables are unmounted efficiently  
**And** the new floor's data is fetched from the API  
**And** tables render progressively if many exist  
**And** the total switch time is under 500ms  
**And** loading indicator shows during transition

#### Scenario: Floor Data Caching
**Given** a user has viewed multiple floors in one session  
**When** the user switches back to a previously viewed floor  
**Then** the floor's table data is cached in memory  
**And** no API request is made if data is fresh (within 5 minutes)  
**And** the floor loads instantly from cache  
**And** cache invalidates after save operations
