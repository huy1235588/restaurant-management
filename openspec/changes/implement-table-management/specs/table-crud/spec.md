# Specification Delta: Table CRUD Operations

## ADDED Requirements

### Requirement: TC-001 - Table List View
**Priority**: P0 (Critical)  
**Category**: User Interface  
**Owner**: Frontend Team

The system SHALL provide a data grid view for managing tables with sorting, filtering, and pagination.

#### Scenario: User views table list
**Given** the user is authenticated  
**And** the user navigates to `/tables?view=list`  
**When** the page loads  
**Then** the system SHALL display a data table with columns:
- Table Number (sortable)
- Table Name (sortable)
- Capacity (sortable)
- Floor (sortable, filterable)
- Section (sortable, filterable)
- Status (filterable with badge)
- QR Code (show/download action)
- Actions (dropdown menu)
**And** the table SHALL display 20 rows per page by default  
**And** pagination controls SHALL be displayed at the bottom  
**And** the total count SHALL be shown (e.g., "Showing 1-20 of 45 tables")

**Acceptance Criteria**:
- ✅ All columns display correct data
- ✅ Sorting works ascending/descending
- ✅ Page loads in < 1 second with 100 tables
- ✅ Responsive design works on tablet and desktop
- ✅ Loading skeleton shown during data fetch

---

### Requirement: TC-002 - Create Table
**Priority**: P0 (Critical)  
**Category**: Data Management  
**Owner**: Frontend + Backend Team

The system SHALL allow authorized users to create new tables with validation.

#### Scenario: User creates a new table successfully
**Given** the user has permission `tables.create`  
**And** the user clicks the "Create Table" button  
**When** the create table dialog opens  
**And** the user fills in:
- Table Number: "T-101"
- Table Name: "VIP Corner"
- Capacity: 6
- Min Capacity: 2
- Floor: 2
- Section: "VIP"
**And** the user clicks "Create"  
**Then** the system SHALL validate all fields  
**And** the system SHALL send POST `/tables` request to backend  
**And** the backend SHALL:
  - Validate table number is unique
  - Generate QR code automatically
  - Set default status to "available"
  - Save to database
**And** the system SHALL return the created table with status 201  
**And** the frontend SHALL close the dialog  
**And** the frontend SHALL show success toast "Table T-101 created successfully"  
**And** the frontend SHALL add the new table to the list/floor plan  
**And** the frontend SHALL broadcast `table:created` WebSocket event

#### Scenario: User attempts to create table with duplicate number
**Given** a table with number "T-101" already exists  
**And** the user tries to create a new table with number "T-101"  
**When** the user submits the form  
**Then** the backend SHALL return 400 Bad Request with error "Table number already exists"  
**And** the form SHALL display the error message below the Table Number field  
**And** the dialog SHALL remain open  
**And** the Table Number field SHALL be focused

#### Scenario: User creates table with missing required fields
**Given** the user opens the create table dialog  
**When** the user leaves Table Number empty  
**And** the user clicks "Create"  
**Then** the form SHALL display validation error "Table Number is required"  
**And** the form SHALL NOT submit to the backend  
**And** the field SHALL be highlighted in red

**Acceptance Criteria**:
- ✅ Form validates all required fields before submission
- ✅ Table number uniqueness is enforced
- ✅ Capacity must be between 1 and 20
- ✅ Min Capacity must be ≤ Capacity
- ✅ QR code is auto-generated
- ✅ Success feedback is immediate
- ✅ Form resets after successful creation

---

### Requirement: TC-003 - Edit Table
**Priority**: P0 (Critical)  
**Category**: Data Management  
**Owner**: Frontend + Backend Team

The system SHALL allow authorized users to edit existing table details.

#### Scenario: User edits table details successfully
**Given** the user has permission `tables.update`  
**And** a table with ID 5 exists  
**When** the user clicks "Edit" action on table ID 5  
**Then** the edit dialog SHALL open  
**And** the form SHALL be pre-populated with current values:
- Table Number: "T-05"
- Table Name: "Window Seat"
- Capacity: 4
- Min Capacity: 2
- Floor: 1
- Section: "Indoor"
**When** the user changes:
- Capacity: 6
- Section: "Outdoor"
**And** clicks "Save"  
**Then** the system SHALL validate changes  
**And** send PUT `/tables/5` request with updated fields  
**And** the backend SHALL update the database  
**And** the system SHALL return updated table with status 200  
**And** the frontend SHALL update the table in list/floor plan  
**And** the frontend SHALL broadcast `table:updated` WebSocket event  
**And** show success toast "Table T-05 updated successfully"

#### Scenario: User changes table number to existing number
**Given** the user is editing table ID 5 (number "T-05")  
**And** a table with number "T-10" already exists  
**When** the user changes Table Number to "T-10"  
**And** clicks "Save"  
**Then** the backend SHALL return 400 Bad Request "Table number already exists"  
**And** the form SHALL display the error  
**And** the dialog SHALL remain open

#### Scenario: User cancels edit without saving
**Given** the user has opened the edit dialog for table ID 5  
**And** the user has made changes to Capacity  
**When** the user clicks "Cancel" or presses Escape key  
**Then** the dialog SHALL close without saving  
**And** the changes SHALL be discarded  
**And** the table SHALL retain original values

**Acceptance Criteria**:
- ✅ All editable fields can be updated
- ✅ Table ID and QR Code cannot be edited
- ✅ Validation runs on form submission
- ✅ Optimistic UI updates occur immediately
- ✅ Changes rollback if backend returns error
- ✅ "Unsaved changes" warning if user navigates away

---

### Requirement: TC-004 - Delete Table
**Priority**: P1 (High)  
**Category**: Data Management  
**Owner**: Frontend + Backend Team

The system SHALL allow authorized users to delete tables with safety checks.

#### Scenario: User deletes unused table
**Given** the user has permission `tables.delete`  
**And** table ID 10 exists with status "available"  
**And** table ID 10 has no active orders or reservations  
**When** the user clicks "Delete" action on table ID 10  
**Then** the system SHALL show confirmation dialog:
- Title: "Delete Table T-10?"
- Message: "This action cannot be undone. Are you sure?"
- Buttons: [Cancel] [Delete]
**When** the user clicks "Delete"  
**Then** the system SHALL send DELETE `/tables/10` request  
**And** the backend SHALL:
  - Check table has no active orders/reservations
  - Soft delete or hard delete based on configuration
  - Return 200 OK
**And** the frontend SHALL remove table from list/floor plan  
**And** broadcast `table:deleted` WebSocket event  
**And** show success toast "Table T-10 deleted successfully"

#### Scenario: User attempts to delete occupied table
**Given** table ID 10 has status "occupied"  
**And** table ID 10 has an active order  
**When** the user clicks "Delete" on table ID 10  
**Then** the confirmation dialog SHALL show warning:
- "This table is currently occupied and has an active order."
- "Are you sure you want to delete it?"
**When** the user clicks "Delete"  
**Then** the backend SHALL return 400 Bad Request "Cannot delete table with active order"  
**And** the frontend SHALL show error toast "Cannot delete occupied table"  
**And** the table SHALL remain in the system

#### Scenario: User cancels deletion
**Given** the delete confirmation dialog is open  
**When** the user clicks "Cancel" or presses Escape  
**Then** the dialog SHALL close  
**And** the table SHALL NOT be deleted

**Acceptance Criteria**:
- ✅ Confirmation dialog appears for all deletions
- ✅ Backend prevents deletion of tables with active orders/reservations
- ✅ Soft delete is used (isActive=false) rather than hard delete
- ✅ Deleted tables are removed from all views immediately
- ✅ WebSocket event notifies other users of deletion

---

### Requirement: TC-005 - Bulk Table Operations
**Priority**: P2 (Medium)  
**Category**: Data Management  
**Owner**: Frontend + Backend Team

The system SHALL support bulk operations on multiple selected tables.

#### Scenario: User bulk updates table status
**Given** the user is in List view  
**And** the user selects 5 tables with status "available"  
**When** the user clicks "Bulk Actions" dropdown  
**And** selects "Change Status → Maintenance"  
**Then** the system SHALL show confirmation dialog:
- "Change status of 5 tables to Maintenance?"
**When** the user confirms  
**Then** the system SHALL send PATCH `/tables/bulk` with:
```json
{
  "tableIds": [1, 3, 5, 7, 9],
  "updates": { "status": "maintenance" }
}
```
**And** the backend SHALL update all 5 tables in a transaction  
**And** broadcast WebSocket events for each table  
**And** return summary: { "success": 5, "failed": 0, "errors": [] }  
**And** the frontend SHALL update all tables in list/floor plan  
**And** show success toast "5 tables updated to Maintenance"

#### Scenario: User bulk deletes tables
**Given** the user has selected 3 tables  
**And** 1 of the tables has an active order  
**When** the user selects "Bulk Delete"  
**And** confirms the action  
**Then** the backend SHALL attempt to delete all 3  
**And** successfully delete 2 tables  
**And** fail to delete 1 table (has active order)  
**And** return summary: { "success": 2, "failed": 1, "errors": ["Table T-05: Has active order"] }  
**And** the frontend SHALL show toast: "2 tables deleted, 1 failed"  
**And** display error details in expandable section

**Acceptance Criteria**:
- ✅ Users can select multiple tables (checkboxes)
- ✅ Bulk actions include: Change Status, Delete, Activate/Deactivate
- ✅ Operations are transactional on backend
- ✅ Progress indicator shows for long operations
- ✅ Error summary shows which tables failed and why
- ✅ Successful updates apply immediately

---

### Requirement: TC-006 - Table Search and Filtering
**Priority**: P1 (High)  
**Category**: User Interface  
**Owner**: Frontend Team

The system SHALL provide advanced search and filtering for tables.

#### Scenario: User searches by table number
**Given** the user is in List view  
**And** 45 tables exist in the system  
**When** the user types "T-1" in the search box  
**Then** the system SHALL filter results to show only tables matching "T-1"  
**And** the results SHALL include: "T-1", "T-10", "T-11", "T-12", etc.  
**And** the search SHALL be case-insensitive  
**And** the search SHALL be debounced (300ms delay)  
**And** the URL SHALL update to `/tables?view=list&search=T-1`

#### Scenario: User filters by multiple criteria
**Given** the user is in List view  
**When** the user selects:
- Status: "Available"
- Floor: "2"
- Section: "VIP"
**Then** the system SHALL apply all filters with AND logic  
**And** show only tables that are Available AND on Floor 2 AND in VIP section  
**And** the URL SHALL reflect all filters: `/tables?view=list&status=available&floor=2&section=vip`  
**And** the filter count SHALL display (e.g., "3 filters active")

#### Scenario: User clears filters
**Given** the user has active filters applied  
**And** the filtered results show 5 tables  
**When** the user clicks "Clear All Filters" button  
**Then** all filter values SHALL reset to defaults  
**And** the URL SHALL update to `/tables?view=list`  
**And** the full list of tables SHALL be displayed

**Acceptance Criteria**:
- ✅ Search works for table number and table name
- ✅ Filters can be combined (AND logic)
- ✅ Filter chips show active filters
- ✅ URL parameters sync with filter state
- ✅ Filters persist on page refresh
- ✅ "No results" state shows when filters return empty

---

### Requirement: TC-007 - Table Status Management
**Priority**: P0 (Critical)  
**Category**: Data Management  
**Owner**: Frontend + Backend Team

The system SHALL allow users to change table status with validation.

#### Scenario: User changes table status to Occupied
**Given** the user has permission `tables.changeStatus`  
**And** table ID 5 has status "available"  
**When** the user clicks "Change Status" on table ID 5  
**And** selects "Occupied" from dropdown  
**Then** the system SHALL send PATCH `/tables/5/status` with { "status": "occupied" }  
**And** the backend SHALL validate the status transition  
**And** update the table status  
**And** broadcast `table:status_changed` WebSocket event  
**And** the frontend SHALL update the table status immediately (optimistic update)  
**And** show success toast "Table T-05 status changed to Occupied"

#### Scenario: Invalid status transition
**Given** table ID 5 has status "maintenance"  
**When** the user tries to change status directly to "occupied"  
**Then** the system SHALL show warning dialog:
- "Invalid transition: maintenance → occupied"
- "Valid transitions: maintenance → available only"
- "Change to available first?"
**And** provide option to change to available instead

#### Scenario: Status change with notes
**Given** the user clicks "Change Status" on table ID 5  
**And** selects "Maintenance"  
**When** the status dialog opens  
**Then** an optional "Notes" field SHALL be displayed  
**When** the user enters "Broken chair needs repair"  
**And** confirms the change  
**Then** the notes SHALL be saved with the status change  
**And** displayed in the table history/audit log

**Acceptance Criteria**:
- ✅ Valid status transitions are enforced
- ✅ Optimistic UI updates occur immediately
- ✅ Status changes broadcast to all users in real-time
- ✅ Invalid transitions show helpful error messages
- ✅ Optional notes can be added to status changes
- ✅ Status change history is tracked (who, when, why)

---

### Requirement: TC-008 - Table Validation Rules
**Priority**: P0 (Critical)  
**Category**: Business Logic  
**Owner**: Backend Team

The system SHALL enforce validation rules on table data.

#### Scenario: Validate table number format
**Given** the user is creating or editing a table  
**When** the user enters Table Number "Table 1!" (with special character)  
**Then** the validation SHALL fail with error "Table number can only contain letters, numbers, and hyphens"  
**And** the form SHALL not submit

#### Scenario: Validate capacity range
**Given** the user enters Capacity: 25  
**When** the form is submitted  
**Then** the validation SHALL fail with error "Capacity must be between 1 and 20"

#### Scenario: Validate min capacity vs capacity
**Given** the user enters:
- Capacity: 4
- Min Capacity: 6
**When** the form is submitted  
**Then** the validation SHALL fail with error "Minimum capacity cannot exceed capacity"

**Validation Rules**:
- **Table Number**: Required, 1-20 chars, alphanumeric + hyphens only, unique
- **Table Name**: Optional, max 50 chars
- **Capacity**: Required, integer, 1-20
- **Min Capacity**: Optional, integer, 1-20, ≤ Capacity
- **Floor**: Required, integer, 1-10
- **Section**: Optional, max 50 chars
- **Status**: Required, enum value (available, occupied, reserved, maintenance)
- **QR Code**: Optional, unique if provided

**Acceptance Criteria**:
- ✅ All validation rules enforced on frontend and backend
- ✅ Clear error messages for each validation failure
- ✅ Multiple errors can be shown simultaneously
- ✅ Validation runs on blur and on submit
- ✅ Backend validation prevents bypassing frontend checks

---

## MODIFIED Requirements

None. This is a new capability.

---

## REMOVED Requirements

None. This is a new capability.

---

## Dependencies

- **Backend API**: Existing table endpoints at `/tables`
- **Database**: `restaurant_tables` table in PostgreSQL
- **Spec**: `table-realtime` for WebSocket event integration
- **Component Library**: Radix UI (Dialog, Dropdown, Select)
- **Form Library**: React Hook Form + Zod for validation

---

## API Contract

### GET /tables
**Request**:
```
GET /tables?status=available&floor=2&page=1&limit=20&sortBy=tableNumber&sortOrder=asc
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "items": [...tables],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 45,
      "pages": 3
    }
  }
}
```

### POST /tables
**Request**:
```json
{
  "tableNumber": "T-101",
  "tableName": "VIP Corner",
  "capacity": 6,
  "minCapacity": 2,
  "floor": 2,
  "section": "VIP"
}
```

**Response** (201 Created):
```json
{
  "success": true,
  "data": {
    "tableId": 101,
    "tableNumber": "T-101",
    "tableName": "VIP Corner",
    "capacity": 6,
    "minCapacity": 2,
    "floor": 2,
    "section": "VIP",
    "status": "available",
    "qrCode": "QR_T101_XXXX",
    "isActive": true,
    "createdAt": "2025-11-09T10:00:00Z",
    "updatedAt": "2025-11-09T10:00:00Z"
  }
}
```

### PUT /tables/:id
**Request**:
```json
{
  "capacity": 8,
  "section": "Outdoor"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": { ...updated table }
}
```

### PATCH /tables/:id/status
**Request**:
```json
{
  "status": "occupied",
  "notes": "Party of 4 seated"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": { ...updated table }
}
```

### DELETE /tables/:id
**Response** (200 OK):
```json
{
  "success": true,
  "message": "Table deleted successfully"
}
```

### PATCH /tables/bulk
**Request**:
```json
{
  "tableIds": [1, 2, 3],
  "updates": { "status": "maintenance" }
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "updated": 3,
    "failed": 0,
    "errors": []
  }
}
```

---

## Testing Requirements

### Unit Tests
- [ ] Form validation schema catches all invalid inputs
- [ ] Table list renders correctly with mock data
- [ ] Search debouncing works (300ms delay)
- [ ] Filter logic combines correctly (AND logic)

### Integration Tests
- [ ] Create table flow from button click to success toast
- [ ] Edit table updates database and UI
- [ ] Delete table removes from list/floor plan
- [ ] Bulk operations handle partial failures correctly

### E2E Tests
- [ ] User can create, edit, and delete tables
- [ ] User can search and filter tables
- [ ] User can change table status
- [ ] Multiple users see real-time updates

### Performance Tests
- [ ] List view renders 100 tables in < 1s
- [ ] Search filters 100 tables in < 100ms
- [ ] Bulk update of 50 tables completes in < 3s

---

## Implementation Notes

- Use React Hook Form for all table forms
- Implement optimistic UI updates for better UX
- Add debouncing to search input (300ms)
- Use SWR or React Query for data fetching and caching
- Implement infinite scroll or virtual scrolling for large lists
- Add loading skeletons for better perceived performance
