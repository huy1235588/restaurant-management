# Visual Floor Plan Editor - History and Undo/Redo

## ADDED Requirements

### Requirement: Undo System
The system SHALL support undoing editing actions.

#### Scenario: Undoing Table Move
**Given** a user moves a table from position A to position B  
**When** the user presses Ctrl+Z or clicks Undo  
**Then** the table returns to position A  
**And** the move action is removed from the history stack  
**And** the action is added to the redo stack  
**And** the canvas updates immediately with smooth animation

#### Scenario: Undoing Table Creation
**Given** a user adds a new table to the canvas  
**When** the user presses Ctrl+Z  
**Then** the newly created table is removed from the canvas  
**And** the table deletion animates with fade-out  
**And** the action can be redone to restore the table  
**And** table ID is not reused if action is not redone

#### Scenario: Undoing Table Deletion
**Given** a user deletes a table from the canvas  
**When** the user presses Ctrl+Z  
**Then** the table reappears at its original position  
**And** all table properties are restored (number, capacity, status)  
**And** the table animates in with fade-in effect  
**And** the table becomes selectable immediately

#### Scenario: Undoing Table Resize
**Given** a user resizes a table from 80x80 to 120x120  
**When** the user presses Ctrl+Z  
**Then** the table returns to 80x80 dimensions  
**And** resize handles update to reflect original size  
**And** the resize animates smoothly  
**And** the action is moved to redo stack

#### Scenario: Undoing Property Changes
**Given** a user changes a table's number or capacity  
**When** the user presses Ctrl+Z  
**Then** the table properties revert to previous values  
**And** the properties panel updates to show reverted values  
**And** the change is added to redo stack  
**And** validation is re-applied to reverted state

#### Scenario: Multiple Undo Operations
**Given** a user has performed 5 actions  
**When** the user presses Ctrl+Z five times  
**Then** each action is undone in reverse chronological order  
**And** the canvas state returns to the initial state  
**And** all 5 actions are moved to the redo stack  
**And** undo button becomes disabled when history is empty

#### Scenario: Undo with Keyboard Shortcut
**Given** a user has performed actions  
**When** the user presses Ctrl+Z (Windows) or Cmd+Z (Mac)  
**Then** the last action is undone immediately  
**And** the shortcut prevents browser default behavior  
**And** works consistently across operating systems  
**And** provides visual feedback of the undo operation

### Requirement: Redo System
The system SHALL support redoing undone actions.

#### Scenario: Redoing Undone Action
**Given** a user has undone an action  
**When** the user presses Ctrl+Shift+Z or clicks Redo  
**Then** the undone action is re-applied  
**And** the canvas returns to the post-action state  
**And** the action is moved back to the history stack  
**And** the redo stack is updated

#### Scenario: Multiple Redo Operations
**Given** a user has undone multiple actions  
**When** the user presses Ctrl+Shift+Z multiple times  
**Then** each undone action is reapplied in chronological order  
**And** the canvas state advances forward through history  
**And** redo becomes disabled when redo stack is empty  
**And** all operations animate smoothly

#### Scenario: Redo with Keyboard Shortcut
**Given** a user has undone actions  
**When** the user presses Ctrl+Shift+Z (Windows) or Cmd+Shift+Z (Mac)  
**Then** the next action in redo stack is re-applied  
**And** the shortcut prevents browser default behavior  
**And** works consistently across platforms  
**And** provides visual feedback

#### Scenario: Clearing Redo Stack
**Given** a user has undone actions (redo stack has items)  
**When** the user performs a new action  
**Then** the redo stack is cleared  
**And** the new action is added to history stack  
**And** the redo button becomes disabled  
**And** user cannot redo old actions after branching history

### Requirement: History Stack Management
The system SHALL maintain a history of editing actions.

#### Scenario: Action Recording
**Given** a user performs an editable action  
**When** the action completes  
**Then** the action is recorded in the history stack  
**And** includes action type (move, resize, create, delete, modify)  
**And** stores previous state and new state  
**And** records timestamp of action  
**And** increments the current history index

#### Scenario: Supported Action Types
**Given** various editing actions are available  
**When** actions are performed  
**Then** the following are tracked: table move, table resize, table rotate, table create, table delete, table property changes  
**And** each action type has undo/redo logic  
**And** compound actions are recorded as single history entry  
**And** system actions (auto-save, load) are not in undo history

#### Scenario: History Stack Limit
**Given** a user performs many actions over time  
**When** the history stack exceeds 50 actions  
**Then** the oldest action is removed from the stack  
**And** the stack maintains a maximum of 50 actions  
**And** undo is available for the most recent 50 actions  
**And** memory usage remains bounded

#### Scenario: History State Snapshot
**Given** an action is being recorded  
**When** the history entry is created  
**Then** a snapshot of relevant state is stored  
**And** snapshot includes affected table(s) complete state  
**And** uses shallow copying for efficiency  
**And** stores minimal data needed for undo/redo  
**And** avoids storing entire canvas state

### Requirement: Undo/Redo UI Feedback
The system SHALL provide clear visual feedback for history operations.

#### Scenario: Button State Management
**Given** the editor is in various history states  
**When** the toolbar renders  
**Then** undo button is disabled when history is empty  
**And** redo button is disabled when redo stack is empty  
**And** buttons show enabled state when operations are available  
**And** tooltips indicate keyboard shortcuts  
**And** button icons are clear and intuitive

#### Scenario: History Operation Animation
**Given** a user performs undo or redo  
**When** the operation executes  
**Then** affected tables animate smoothly to new state  
**And** animation duration is 200ms  
**And** uses easing function for natural motion  
**And** multiple table changes animate simultaneously  
**And** user can see what changed

#### Scenario: Undo/Redo Notifications
**Given** a user performs undo or redo  
**When** the operation completes  
**Then** a subtle notification shows what was undone/redone  
**And** notification displays action type and affected table  
**And** notification auto-dismisses after 2 seconds  
**And** notifications don't interrupt workflow

### Requirement: History Persistence
The system SHALL manage history across different contexts.

#### Scenario: History Per Floor
**Given** a user edits multiple floors  
**When** the user switches between floors  
**Then** each floor maintains its own independent history stack  
**And** undo/redo on Floor 1 doesn't affect Floor 2  
**And** switching back to a floor restores its history  
**And** history is maintained during the editing session

#### Scenario: History Cleared on Save
**Given** a user has performed actions and saved  
**When** the save operation completes  
**Then** the history stack is optionally cleared (configurable)  
**And** if not cleared, actions remain undoable after save  
**And** redo stack is always cleared on save  
**And** user preference determines clearing behavior

#### Scenario: History Cleared on Session End
**Given** a user has editing history  
**When** the user exits the editor or closes the browser  
**Then** all history stacks are cleared  
**And** history does not persist between sessions  
**And** opening editor again starts with empty history  
**And** no local storage of history is maintained

### Requirement: Compound Action Support
The system SHALL support undoing compound multi-step actions as single operations.

#### Scenario: Batch Move as Single Undo
**Given** a user moves 5 selected tables together  
**When** the user releases the drag  
**Then** all 5 table moves are recorded as one compound action  
**And** pressing undo reverts all 5 tables to original positions  
**And** redo re-applies all 5 moves together  
**And** user doesn't need to undo 5 times

#### Scenario: Alignment Tool as Single Undo
**Given** a user aligns 10 tables horizontally  
**When** the alignment operation completes  
**Then** all 10 table position changes are one history entry  
**And** undo reverts all tables to pre-alignment positions  
**And** redo re-applies the alignment to all tables  
**And** history stack increments by only 1

### Requirement: History State Integrity
The system SHALL maintain history state consistency.

#### Scenario: Valid History State
**Given** undo/redo operations are performed  
**When** the canvas state is modified through history  
**Then** the state remains valid and consistent  
**And** no orphaned references exist  
**And** table IDs remain correct  
**And** collision detection works on historical states  
**And** no data corruption occurs

#### Scenario: History Error Recovery
**Given** an undo/redo operation fails  
**When** the error is detected  
**Then** the system prevents state corruption  
**And** displays an error message to the user  
**And** reverts to the last known good state  
**And** logs the error for debugging  
**And** history stack integrity is maintained
