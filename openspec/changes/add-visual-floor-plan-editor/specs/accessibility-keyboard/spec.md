# Visual Floor Plan Editor - Keyboard Navigation

## ADDED Requirements

### Requirement: Keyboard Navigation
The system SHALL support full keyboard navigation for all editor features.

#### Scenario: Tab Navigation
**Given** a user navigates the editor using keyboard  
**When** the user presses Tab key  
**Then** focus moves to the next interactive element in logical order  
**And** focus order follows: toolbar buttons → floor selector → canvas tables → properties panel  
**And** Shift+Tab moves focus backward

#### Scenario: Canvas Table Navigation
**Given** focus is on the canvas  
**When** the user presses Tab or arrow keys  
**Then** focus moves between tables in spatial order  
**And** Enter key selects the focused table  
**And** properties panel updates to show focused table details

#### Scenario: Arrow Key Table Movement
**Given** a user has a table selected  
**When** the user presses arrow keys  
**Then** the selected table moves in the arrow direction  
**And** Up arrow moves table up by 10px (or 1 grid unit)  
**And** Down arrow moves table down by 10px  
**And** Left/Right arrows move table left/right by 10px  
**And** Shift+Arrow increases movement to 50px (5 grid units)

#### Scenario: Keyboard Tool Selection
**Given** a user is in the editor  
**When** the user presses tool shortcut keys (V, H, T)  
**Then** the corresponding tool activates  
**And** focus remains on canvas for immediate use  
**And** visual indicator shows active tool  
**And** tool can be used immediately with keyboard

#### Scenario: Keyboard Actions
**Given** various keyboard shortcuts are available  
**When** the user presses action keys  
**Then** the following shortcuts work:  
- Ctrl+S: Save layout  
- Ctrl+Z: Undo  
- Ctrl+Shift+Z: Redo  
- G: Toggle grid  
- F: Toggle fullscreen  
- Esc: Cancel/deselect  
- Delete: Delete selected table  
- 1-9: Switch to floor N

### Requirement: Dialog Focus Management
The system SHALL manage focus properly in dialogs.

#### Scenario: Dialog Opening
**Given** a modal dialog opens (Quick Create, Confirm Delete)  
**When** the dialog is displayed  
**Then** focus moves to the first interactive element  
**And** Esc key closes the dialog  
**And** focus returns to trigger element on close

#### Scenario: Dialog Tab Navigation
**Given** a modal dialog is open  
**When** the user navigates with Tab  
**Then** focus cycles within the dialog  
**And** Tab from last element returns to first  
**And** Shift+Tab from first element goes to last  
**And** user cannot Tab outside the dialog while it's open

### Requirement: Keyboard Alternatives to Drag and Drop
The system SHALL provide keyboard alternatives to drag and drop.

#### Scenario: Keyboard-based Table Movement
**Given** a user selects a table via keyboard  
**When** the user uses arrow keys  
**Then** the table moves incrementally  
**And** movement respects grid snapping if enabled  
**And** collision detection still applies  
**And** provides equivalent functionality to mouse drag

#### Scenario: Position Input Alternative
**Given** a user wants to precisely position a table  
**When** the user opens properties panel  
**Then** X and Y coordinate input fields are available  
**And** user can type exact coordinates  
**And** Enter key applies the new position  
**And** validation and collision check apply  
**And** provides alternative to drag and drop

### Requirement: Form Field Labels
The system SHALL ensure all form inputs have proper labels.

#### Scenario: Input Label Association
**Given** a form contains input fields  
**When** the form renders  
**Then** every input has an associated label element  
**And** labels use for attribute linking to input id  
**And** placeholders supplement but don't replace labels

### Requirement: Keyboard Shortcuts Reference
The system SHALL provide a keyboard shortcuts reference dialog.

#### Scenario: Accessing Shortcuts Help
**Given** a user wants to see available keyboard shortcuts  
**When** the user presses "?" or clicks help button  
**Then** a keyboard shortcuts reference dialog opens  
**And** all shortcuts are listed with descriptions  
**And** shortcuts are grouped by category (Tools, Actions, Navigation)  
**And** dialog can be closed with Esc key or close button
