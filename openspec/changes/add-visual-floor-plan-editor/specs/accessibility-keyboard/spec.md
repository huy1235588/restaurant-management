# Visual Floor Plan Editor - Accessibility and Keyboard Navigation

## ADDED Requirements

### Requirement: Keyboard Navigation
The system SHALL support full keyboard navigation for all editor features.

#### Scenario: Tab Navigation
**Given** a user navigates the editor using keyboard  
**When** the user presses Tab key  
**Then** focus moves to the next interactive element in logical order  
**And** focus order follows: toolbar buttons → floor selector → canvas tables → properties panel  
**And** focused elements show clear visual focus indicator  
**And** Shift+Tab moves focus backward

#### Scenario: Canvas Table Navigation
**Given** focus is on the canvas  
**When** the user presses Tab or arrow keys  
**Then** focus moves between tables in spatial order  
**And** focused table shows distinct focus outline  
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

### Requirement: Screen Reader Support
The system SHALL provide screen reader accessibility.

#### Scenario: Canvas Landmark
**Given** a screen reader user navigates the editor  
**When** the canvas region is encountered  
**Then** it is announced as "Floor plan editor canvas" landmark  
**And** role="region" with aria-label is applied  
**And** screen reader describes current floor and table count  
**And** navigation instructions are provided in aria-describedby

#### Scenario: Table Announcement
**Given** a screen reader user focuses on a table  
**When** focus lands on the table element  
**Then** screen reader announces: "Table [number], [status], capacity [capacity], position [x], [y]"  
**And** role="button" indicates it's interactive  
**And** aria-pressed indicates selection state  
**And** aria-label provides complete context

#### Scenario: Tool Button Announcement
**Given** a screen reader user navigates toolbar  
**When** focus lands on a tool button  
**Then** screen reader announces: "[Tool name], [keyboard shortcut], button"  
**And** aria-label includes both name and shortcut  
**And** aria-pressed indicates active state for toggle buttons  
**And** disabled state is announced for unavailable tools

#### Scenario: Live Region Updates
**Given** the editor state changes  
**When** important changes occur (save, error, undo)  
**Then** changes are announced via aria-live regions  
**And** aria-live="polite" for non-urgent updates  
**And** aria-live="assertive" for errors  
**And** announcements are concise and informative

### Requirement: Visual Focus Indicators
The system SHALL provide clear visual focus indicators.

#### Scenario: Focus Outline Visibility
**Given** an element receives keyboard focus  
**When** the element renders  
**Then** a visible focus outline appears  
**And** outline is at least 2px thick  
**And** outline uses high contrast color (WCAG AA compliant)  
**And** outline is visible against any background  
**And** outline does not obscure element content

#### Scenario: Focus Indicator Styles
**Given** different element types receive focus  
**When** focus indicators are displayed  
**Then** buttons show blue outline with 3px offset  
**And** tables show thick blue border with subtle shadow  
**And** input fields show outline and subtle background change  
**And** all focus styles are consistent across the editor

### Requirement: Color Contrast
The system SHALL meet WCAG AA color contrast requirements.

#### Scenario: Text Contrast
**Given** text elements are displayed  
**When** measured against backgrounds  
**Then** normal text has minimum 4.5:1 contrast ratio  
**And** large text (18pt+) has minimum 3:1 contrast ratio  
**And** buttons and interactive elements meet 3:1 ratio  
**And** status colors (available, occupied) have sufficient contrast

#### Scenario: Visual Indicators
**Given** non-text visual elements convey information  
**When** colors are used for status or state  
**Then** colors alone are not the only indicator  
**And** icons or patterns supplement color coding  
**And** colorblind-friendly palette is used  
**And** all status indicators meet 3:1 contrast ratio

### Requirement: Accessible Forms and Dialogs
The system SHALL ensure forms and dialogs are accessible.

#### Scenario: Dialog Accessibility
**Given** a dialog opens (Quick Create, Confirm Delete)  
**When** the dialog is displayed  
**Then** focus moves to the first interactive element  
**And** dialog has role="dialog" and aria-labelledby  
**And** Esc key closes the dialog  
**And** focus returns to trigger element on close  
**And** background content is inert (aria-hidden)

#### Scenario: Form Field Labels
**Given** a form contains input fields  
**When** the form renders  
**Then** every input has an associated label element  
**And** labels use for attribute linking to input id  
**And** required fields are marked with aria-required  
**And** error messages are associated with aria-describedby  
**And** placeholders supplement but don't replace labels

#### Scenario: Error Message Accessibility
**Given** form validation fails  
**When** errors are displayed  
**Then** errors are announced to screen readers  
**And** focus moves to first invalid field  
**And** aria-invalid="true" is set on invalid fields  
**And** error messages are linked with aria-describedby  
**And** errors are visible and have adequate contrast

### Requirement: Semantic HTML
The system SHALL use semantic HTML elements appropriately.

#### Scenario: Proper Element Usage
**Given** UI elements are implemented  
**When** the DOM is inspected  
**Then** buttons use <button> elements  
**And** links use <a> elements with href  
**And** headings use <h1>-<h6> in hierarchical order  
**And** lists use <ul>, <ol>, <li> appropriately  
**And** native elements are preferred over div/span with roles

#### Scenario: Landmark Regions
**Given** the editor layout is structured  
**When** the page renders  
**Then** <header> contains toolbar  
**And** <main> contains canvas region  
**And** <aside> contains properties panel  
**And** navigation uses <nav> element  
**And** landmarks enable quick navigation for screen readers

### Requirement: Keyboard Trap Prevention
The system SHALL prevent keyboard focus traps.

#### Scenario: Dialog Focus Management
**Given** a modal dialog is open  
**When** the user navigates with Tab  
**Then** focus cycles within the dialog  
**And** Tab from last element returns to first  
**And** Shift+Tab from first element goes to last  
**And** Esc key always provides escape route  
**And** focus is not trapped when dialog closes

#### Scenario: Canvas Focus Cycling
**Given** focus is within the canvas area  
**When** the user navigates with Tab  
**Then** after the last table, Tab moves to next UI section  
**And** focus doesn't loop endlessly within canvas  
**And** user can always Tab out to other parts of editor  
**And** no dead-end focus states exist

### Requirement: Accessible Drag and Drop
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

### Requirement: Skip Links
The system SHALL provide skip navigation links.

#### Scenario: Skip to Main Content
**Given** the editor page loads  
**When** the page is accessed via keyboard  
**Then** first tab lands on "Skip to canvas" link  
**And** activating link moves focus to canvas area  
**And** skip link is visually hidden until focused  
**And** becomes visible with keyboard focus

#### Scenario: Multiple Skip Links
**Given** the editor has complex layout  
**When** skip links are provided  
**Then** "Skip to canvas" link is available  
**And** "Skip to toolbar" link is available  
**And** "Skip to properties" link is available  
**And** links are in logical order  
**And** links are visible on focus

### Requirement: Accessible Tooltips
The system SHALL implement accessible tooltips and help text.

#### Scenario: Tooltip Accessibility
**Given** UI elements have tooltips  
**When** an element is focused or hovered  
**Then** tooltip appears after brief delay (300ms)  
**And** tooltip has role="tooltip"  
**And** element has aria-describedby pointing to tooltip  
**And** tooltip is dismissible with Esc key  
**And** tooltip content is accessible to screen readers

#### Scenario: Help Text for Complex Features
**Given** complex features need explanation  
**When** help icons or buttons are provided  
**Then** help is accessible via keyboard (Tab + Enter)  
**And** help text is associated with relevant element  
**And** help content has adequate contrast and readability  
**And** help can be dismissed with Esc or close button
