# Spec: Reservation CRUD Operations

**Capability:** `reservation-crud`  
**Change:** `implement-reservation-management`  
**Type:** New Capability

## ADDED Requirements

### Requirement: Create Reservation with Auto-Assignment

The system MUST allow staff to create a reservation with minimal required information (customer name, phone, date, time, party size) and automatically assign an optimal table based on availability and preferences.

#### Scenario: Create reservation with auto-assigned table

**Given** a host receives a phone call requesting a reservation  
**When** they enter:
  - Customer name: "John Smith"
  - Phone: "555-123-4567"
  - Date: "2024-12-25"
  - Time: "19:00"
  - Party size: 4
**And** click "Create Reservation" without selecting a specific table  
**Then** the system finds available tables for 4 guests at 7:00 PM  
**And** auto-assigns the best matching table based on capacity and location  
**And** creates the reservation with status "Pending"  
**And** returns the reservation confirmation code  
**And** displays success message: "Reservation created for Table 5"

#### Scenario: Quick create mode for returning customer

**Given** a staff member presses `Ctrl+N` to open quick create dialog  
**When** they start typing "John Sm" in the customer name field  
**Then** the system shows autocomplete suggestions from existing customers  
**And** selecting "John Smith" pre-fills phone and email  
**And** pre-fills preferences (window seat, vegetarian options)  
**When** they select date, time, and party size  
**And** click "Quick Create"  
**Then** reservation is created in under 5 seconds  
**And** preferred table type is prioritized in auto-assignment

---

### Requirement: Manual Table Selection

Users MUST be able to manually select a specific table instead of using auto-assignment.

#### Scenario: Select specific table from available list

**Given** a user is creating a reservation for 4 guests at 7:00 PM on Dec 25  
**When** they click "Choose Table" button  
**Then** the system displays a list of available tables  
**And** shows table number, capacity, location (window/center/corner), and floor  
**And** marks unavailable tables with reason ("Reserved until 8:00 PM")  
**When** user selects "Table 5 (Window)"  
**Then** the reservation is assigned to Table 5

#### Scenario: View floor plan for table selection

**Given** a user is in the manual table selection step  
**When** they click "Show Floor Plan View"  
**Then** an interactive floor plan opens  
**And** available tables are highlighted in green  
**And** unavailable tables are shown in red with reservation time  
**When** user clicks a green table on the floor plan  
**Then** that table is selected for the reservation

---

### Requirement: Reservation Validation

All reservation data MUST be validated against business rules before creation or update.

#### Scenario: Prevent reservation in the past

**Given** a user attempts to create a reservation  
**When** they select a date before today  
**Then** the system shows error: "Cannot create reservation in the past"  
**And** prevents form submission

#### Scenario: Validate party size against table capacity

**Given** a user selects a table with capacity of 4  
**When** they enter party size of 6  
**Then** the system shows warning: "Selected table capacity (4) is less than party size (6)"  
**And** suggests alternative tables: "Table 8 (6 seats), Table 12 (8 seats)"

#### Scenario: Check time slot alignment

**Given** restaurant has 30-minute time slot intervals  
**When** a user enters time "19:15"  
**Then** the system shows error: "Time must align with 30-minute intervals (e.g., 19:00, 19:30)"  
**And** suggests nearest valid times: "19:00 or 19:30"

---

### Requirement: Conflict Detection

The system MUST detect and prevent double-booking of tables.

#### Scenario: Detect overlapping reservation

**Given** Table 5 has a confirmed reservation from 19:00 to 21:00  
**When** a user attempts to create a new reservation for Table 5 from 20:00 to 22:00  
**Then** the system shows error: "⚠️ Conflict: Table 5 is reserved until 21:00"  
**And** suggests alternatives:
  - "Table 8 (available now)"
  - "Table 5 (available after 21:15 with buffer)"
  - "Table 12 (available now)"

#### Scenario: Consider buffer time in conflict detection

**Given** system buffer time is set to 15 minutes  
**And** Table 3 has reservation ending at 21:00  
**When** user tries to book Table 3 starting at 21:00  
**Then** system rejects: "Table needs 15 minutes buffer for cleanup"  
**And** suggests: "Earliest available time: 21:15"

---

### Requirement: Edit Existing Reservation

Users MUST be able to modify reservation details including date, time, party size, table, and special requests.

#### Scenario: Change reservation time

**Given** a confirmed reservation for Dec 25 at 19:00  
**When** staff opens edit dialog and changes time to 20:00  
**And** clicks "Save Changes"  
**Then** the system re-validates availability for the new time  
**And** updates the reservation if no conflicts exist  
**And** records change in audit log: "Time changed from 19:00 to 20:00 by Sarah"  
**And** sends update notification to customer if enabled

#### Scenario: Increase party size requires different table

**Given** a reservation for 2 guests at Table 3 (capacity 2)  
**When** staff changes party size from 2 to 4  
**Then** system shows warning: "Current table (2 seats) is too small for 4 guests"  
**And** automatically suggests alternative tables with capacity ≥ 4  
**And** allows staff to select new table or cancel edit

---

### Requirement: Cancel Reservation

Staff MUST be able to cancel reservations with optional reason tracking.

#### Scenario: Cancel with reason

**Given** a confirmed reservation exists  
**When** staff clicks "Cancel" button  
**Then** a confirmation dialog appears: "Are you sure you want to cancel this reservation?"  
**And** provides optional "Reason" text field  
**When** staff enters "Customer called to cancel - family emergency"  
**And** confirms cancellation  
**Then** reservation status changes to "Cancelled"  
**And** cancellation reason is saved  
**And** cancelled timestamp is recorded  
**And** table becomes available for rebooking

#### Scenario: Prevent cancellation of completed reservation

**Given** a reservation with status "Completed"  
**When** staff attempts to cancel it  
**Then** system shows error: "Cannot cancel completed reservation"  
**And** suggests: "Use 'View Details' to see reservation history"

---

### Requirement: Status Workflow Management

Reservation status MUST follow defined transitions: Pending → Confirmed → Seated → Completed.

#### Scenario: Mark confirmed reservation as seated

**Given** a "Confirmed" reservation for 19:00  
**And** the current time is 19:05  
**When** host clicks "Mark as Seated" button  
**Then** reservation status changes to "Seated"  
**And** "seatedAt" timestamp is recorded  
**And** table status updates to "Occupied" in floor plan  
**And** notification is sent to kitchen if linked order exists

#### Scenario: Mark as no-show after grace period

**Given** a "Confirmed" reservation for 19:00  
**And** current time is 19:25 (25 minutes late)  
**And** customer has not arrived  
**When** staff clicks "Mark as No-show"  
**Then** reservation status changes to "No-show"  
**And** customer record is flagged for no-show history  
**And** table becomes immediately available for walk-ins  
**And** automated follow-up email is queued

---

### Requirement: Special Requests Handling

Reservations MUST support freeform special requests and predefined tags.

#### Scenario: Add special request during creation

**Given** a customer requests a window seat for birthday celebration  
**When** staff creates the reservation  
**And** enters "Birthday celebration, need window seat and cake" in special requests  
**And** adds tags: "Birthday", "Window"  
**Then** the reservation is saved with special requests  
**And** staff can see the icon indicators (🎂) for birthday  
**And** special requests appear in reservation details

#### Scenario: Kitchen preparation note

**Given** a reservation has special dietary requirements  
**When** staff enters "Vegetarian menu, no peanuts (allergy)" in notes  
**Then** this note is flagged for kitchen visibility  
**And** appears in kitchen order view when reservation is seated

---

### Requirement: Bulk Operations

The system MUST support bulk actions on multiple selected reservations.

#### Scenario: Bulk confirm pending reservations

**Given** there are 6 "Pending" reservations for tomorrow  
**When** manager selects all 6 using shift-click  
**And** clicks "Bulk Actions" → "Confirm Selected"  
**Then** all 6 reservations change to "Confirmed" status  
**And** confirmation emails are sent to all customers  
**And** success message displays: "6 reservations confirmed"

#### Scenario: Bulk cancel for special event

**Given** a special event is cancelled affecting 15 reservations  
**When** staff filters by event tag  
**And** selects all 15 reservations  
**And** clicks "Bulk Cancel" with reason "Event cancelled due to weather"  
**Then** all 15 reservations are cancelled with the same reason  
**And** cancellation emails are sent to all customers  
**And** tables are released for rebooking

---

### Requirement: Change History Audit

All modifications to reservations MUST be logged with user, timestamp, and changed fields.

#### Scenario: View change history

**Given** a reservation has been modified 3 times  
**When** staff opens the reservation details  
**And** clicks "Change Log" button  
**Then** the system displays:
  - "Dec 22: Time changed from 18:30 to 19:00 (by Sarah)"
  - "Dec 21: Party size changed from 2 to 4 (by Mike)"
  - "Dec 20: Reservation created (by Sarah)"
**And** changes are listed in reverse chronological order

---

### Requirement: Deposit Tracking

Reservations for large groups MUST support deposit amount tracking.

#### Scenario: Require deposit for group of 8

**Given** system is configured to require deposits for groups ≥ 8  
**When** staff creates a reservation for 8 guests  
**Then** the system shows "Deposit Required: $100"  
**And** provides field to mark deposit as paid  
**And** status shows "Pending (Deposit Required)"  
**When** deposit is marked as paid  
**Then** status can be changed to "Confirmed"

#### Scenario: Track partial deposit payment

**Given** a group reservation with $200 deposit required  
**When** customer pays $100 initially  
**Then** staff records: depositAmount: $200, depositPaid: $100  
**And** reservation shows: "Deposit: $100/$200 paid"  
**And** remains in "Pending" until full deposit is received
