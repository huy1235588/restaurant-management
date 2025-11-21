# Reservation Management Specification

## ADDED Requirements

### Requirement: Create Reservation
The system SHALL allow users to create new reservations with customer information, table selection, date/time, and party size.

#### Scenario: Create reservation with all required fields
- **WHEN** a user submits a reservation with customerName, phoneNumber, reservationDate, reservationTime, headCount, and tableId
- **THEN** the system creates a new reservation with status "pending" and generates a unique reservationCode
- **AND** the system validates that the selected table is available for the requested time slot
- **AND** the system automatically creates or links to an existing Customer record based on phoneNumber
- **AND** the system returns the complete reservation object with generated ID and code

#### Scenario: Create reservation with auto-assigned table
- **WHEN** a user submits a reservation without specifying tableId but provides headCount
- **THEN** the system automatically finds and assigns a suitable table based on capacity and availability
- **AND** the system prioritizes tables with capacity closest to headCount to optimize usage
- **AND** if no suitable table is found, the system returns an error listing available time slots

#### Scenario: Prevent double-booking
- **WHEN** a user attempts to create a reservation for a table that is already reserved in the requested time slot
- **THEN** the system rejects the reservation with error "Table not available for selected time"
- **AND** the system suggests alternative tables or time slots

#### Scenario: Validate reservation time constraints
- **WHEN** a user submits a reservation with reservationDate in the past
- **THEN** the system rejects the request with error "Reservation date must be in the future"
- **AND** when reservationTime is not in HH:mm format, the system rejects with error "Invalid time format"
- **AND** when headCount is less than 1 or greater than 50, the system rejects with error "Invalid party size"

#### Scenario: Create reservation with optional fields
- **WHEN** a user submits a reservation with optional fields like email, specialRequest, notes, tags
- **THEN** the system stores all provided fields and returns them in the response
- **AND** the system accepts NULL values for optional fields without errors

---

### Requirement: View Reservations List
The system SHALL provide paginated list view of all reservations with filtering, searching, and sorting capabilities.

#### Scenario: View reservations with pagination
- **WHEN** a user requests reservations list with page=2 and limit=10
- **THEN** the system returns 10 reservations starting from item 11
- **AND** the response includes pagination metadata (page, limit, total, totalPages)
- **AND** each reservation includes related table and customer information

#### Scenario: Filter reservations by status
- **WHEN** a user requests reservations with status="confirmed"
- **THEN** the system returns only reservations with status "confirmed"
- **AND** the system supports filtering by multiple statuses: pending, confirmed, seated, completed, cancelled, no_show

#### Scenario: Filter reservations by date range
- **WHEN** a user requests reservations with startDate="2024-01-01" and endDate="2024-01-31"
- **THEN** the system returns all reservations with reservationDate within that range
- **AND** the system includes reservations on the boundary dates
- **AND** when only "date" parameter is provided, the system returns reservations for that specific date

#### Scenario: Search reservations
- **WHEN** a user searches with query matching customerName, phoneNumber, or reservationCode
- **THEN** the system returns all matching reservations using case-insensitive partial match
- **AND** the search works across multiple fields simultaneously

#### Scenario: Sort reservations
- **WHEN** a user requests reservations sorted by reservationDate in descending order
- **THEN** the system returns reservations with newest dates first
- **AND** the system supports sorting by: reservationDate, reservationTime, createdAt, status
- **AND** the system supports both "asc" and "desc" sort orders

---

### Requirement: View Reservation Details
The system SHALL display complete details of a single reservation including audit trail and related records.

#### Scenario: Get reservation by ID
- **WHEN** a user requests a reservation by reservationId
- **THEN** the system returns the complete reservation object with all fields
- **AND** the response includes related table details (tableNumber, capacity, floor)
- **AND** the response includes customer details if customerId exists
- **AND** the response includes audit trail of all changes with user and timestamp

#### Scenario: Get reservation by code
- **WHEN** a user requests a reservation using reservationCode
- **THEN** the system returns the reservation matching that unique code
- **AND** the response format is identical to get by ID

#### Scenario: Reservation not found
- **WHEN** a user requests a reservation with non-existent ID or code
- **THEN** the system returns 404 error with message "Reservation not found"

---

### Requirement: Update Reservation
The system SHALL allow modification of existing reservations before they are completed or cancelled.

#### Scenario: Update reservation basic fields
- **WHEN** a user updates customerName, phoneNumber, email, or notes of a pending/confirmed reservation
- **THEN** the system saves the changes and returns the updated reservation
- **AND** the system creates an audit log entry recording the changes and the user who made them

#### Scenario: Update reservation date/time
- **WHEN** a user changes reservationDate or reservationTime of a reservation
- **THEN** the system validates the new time slot is available for the assigned table
- **AND** if available, the system updates the reservation
- **AND** if not available, the system returns error and suggests alternative slots

#### Scenario: Change assigned table
- **WHEN** a user changes tableId of a reservation
- **THEN** the system validates the new table is available for the reservation time
- **AND** the system checks the new table capacity accommodates headCount
- **AND** if valid, the system updates the reservation and logs the change

#### Scenario: Prevent update of completed reservations
- **WHEN** a user attempts to update a reservation with status "completed" or "cancelled"
- **THEN** the system rejects the request with error "Cannot update completed or cancelled reservation"

---

### Requirement: Confirm Reservation
The system SHALL allow staff to confirm pending reservations.

#### Scenario: Confirm pending reservation
- **WHEN** staff confirms a reservation with status "pending"
- **THEN** the system changes status to "confirmed"
- **AND** the system sets confirmedAt to current timestamp
- **AND** the system creates an audit log entry
- **AND** the system returns the updated reservation

#### Scenario: Cannot confirm non-pending reservation
- **WHEN** staff attempts to confirm a reservation that is not "pending"
- **THEN** the system rejects with error "Only pending reservations can be confirmed"

---

### Requirement: Check-in Customer
The system SHALL allow staff to mark customers as seated when they arrive.

#### Scenario: Check-in confirmed reservation
- **WHEN** staff checks in a customer with reservation status "confirmed"
- **THEN** the system changes status to "seated"
- **AND** the system sets seatedAt to current timestamp
- **AND** the system updates the assigned table status to "occupied"
- **AND** the system creates an audit log entry

#### Scenario: Early arrival check-in
- **WHEN** a customer arrives before reservationTime and the table is available
- **THEN** the system allows check-in and marks as "seated"
- **AND** the system records the actual arrival time in seatedAt

#### Scenario: Late arrival check-in
- **WHEN** a customer arrives after reservationTime but within grace period (e.g., 30 minutes)
- **THEN** the system allows check-in and marks as "seated"
- **AND** the system records the late arrival time

#### Scenario: Cannot check-in cancelled reservation
- **WHEN** staff attempts to check in a reservation with status "cancelled" or "no_show"
- **THEN** the system rejects with error "Cannot check in cancelled or no-show reservation"

---

### Requirement: Complete Reservation
The system SHALL mark reservations as completed when customers finish dining and leave.

#### Scenario: Complete seated reservation
- **WHEN** staff marks a seated reservation as completed
- **THEN** the system changes status to "completed"
- **AND** the system sets completedAt to current timestamp
- **AND** the system updates the assigned table status to "available"
- **AND** the system creates an audit log entry

#### Scenario: Cannot complete non-seated reservation
- **WHEN** staff attempts to complete a reservation that is not "seated"
- **THEN** the system rejects with error "Only seated reservations can be completed"

---

### Requirement: Cancel Reservation
The system SHALL allow cancellation of reservations by staff or customers.

#### Scenario: Cancel pending/confirmed reservation
- **WHEN** a user cancels a reservation with status "pending" or "confirmed"
- **THEN** the system changes status to "cancelled"
- **AND** the system sets cancelledAt to current timestamp
- **AND** the system saves cancellationReason if provided
- **AND** the system releases the table (status back to "available")
- **AND** the system creates an audit log entry

#### Scenario: Cancel with reason
- **WHEN** a user provides a cancellationReason when cancelling
- **THEN** the system stores the reason in cancellationReason field
- **AND** the reason is visible in reservation details and audit log

#### Scenario: Cannot cancel completed reservation
- **WHEN** a user attempts to cancel a reservation with status "completed"
- **THEN** the system rejects with error "Cannot cancel completed reservation"

---

### Requirement: Mark No-Show
The system SHALL allow staff to mark reservations as no-show when customers don't arrive.

#### Scenario: Mark no-show after grace period
- **WHEN** staff marks a reservation as no-show after the customer fails to arrive
- **THEN** the system changes status to "no_show"
- **AND** the system sets cancelledAt to current timestamp
- **AND** the system releases the table immediately
- **AND** the system creates an audit log entry
- **AND** the system increments the customer's no-show count if customer record exists

#### Scenario: Track repeat no-show customers
- **WHEN** the system marks a customer as no-show
- **THEN** the system records this in the customer's history
- **AND** the system makes this information available for future reservation decisions

---

### Requirement: Check Table Availability
The system SHALL provide functionality to check which tables are available for a specific date, time, and party size.

#### Scenario: Find available tables for date/time
- **WHEN** a user checks availability for date="2024-12-01", time="19:00", partySize=4, duration=120
- **THEN** the system returns all tables that:
  - Have capacity >= partySize
  - Have minCapacity <= partySize (if defined)
  - Are not reserved in the time window [19:00, 21:00]
  - Have status "available" or "occupied" (if occupied, checking based on estimated release time)
  - Are active (isActive=true)

#### Scenario: Filter available tables by floor
- **WHEN** a user checks availability with floor=2 parameter
- **THEN** the system returns only tables on floor 2 that meet availability criteria
- **AND** the system supports filtering by section (e.g., "VIP", "Garden")

#### Scenario: No tables available
- **WHEN** no tables meet the availability criteria
- **THEN** the system returns empty array with message "No tables available for selected criteria"
- **AND** the system optionally suggests nearby time slots with availability

#### Scenario: Calculate overlap correctly
- **WHEN** checking if a table is available from 19:00-21:00
- **AND** the table has an existing reservation from 18:00-20:00
- **THEN** the system detects overlap and excludes this table
- **AND** when existing reservation is 17:00-18:30, the system includes this table (no overlap)

---

### Requirement: View Reservations by Phone
The system SHALL allow looking up all reservations associated with a phone number.

#### Scenario: Find reservations by phone number
- **WHEN** a user searches for reservations by phoneNumber="0987654321"
- **THEN** the system returns all reservations matching that phone number
- **AND** the results include reservations from all statuses
- **AND** the results are sorted by reservationDate descending (newest first)

#### Scenario: Phone number not found
- **WHEN** a user searches for a phone number with no reservations
- **THEN** the system returns empty array with message "No reservations found"

---

### Requirement: Audit Trail
The system SHALL automatically log all changes to reservations for accountability and history tracking.

#### Scenario: Auto-create audit log on changes
- **WHEN** any field of a reservation is modified
- **THEN** the system creates a ReservationAudit record with:
  - action: "update", "cancel", "confirm", "seat", "complete", "no_show"
  - userId: ID of the staff member performing the action
  - changes: JSON object with before/after values of changed fields
  - createdAt: timestamp of the change

#### Scenario: View audit trail
- **WHEN** viewing reservation details
- **THEN** the system includes all audit records ordered by createdAt descending
- **AND** each audit entry shows who made the change and what changed

---

### Requirement: Customer Auto-Management
The system SHALL automatically create or link customer records based on reservation phone numbers.

#### Scenario: Create new customer on first reservation
- **WHEN** a reservation is created with a phone number that doesn't exist in customers table
- **THEN** the system creates a new Customer record with name and phoneNumber from the reservation
- **AND** the system links the reservation to the new customer via customerId

#### Scenario: Link to existing customer
- **WHEN** a reservation is created with a phone number that already exists
- **THEN** the system finds the existing Customer record by phoneNumber
- **AND** the system links the reservation to that customer
- **AND** the system does not create a duplicate customer

#### Scenario: Update customer name on repeat reservation
- **WHEN** a returning customer creates a reservation with updated name
- **THEN** the system updates the customer's name in the customers table
- **AND** the system maintains the customer's history and preferences

---

### Requirement: Reservation Status Lifecycle
The system SHALL enforce a valid state machine for reservation status transitions.

#### Scenario: Valid status transitions
- **WHEN** a reservation transitions from "pending" to "confirmed"
- **THEN** the system allows the transition
- **AND** when transitioning "confirmed" to "seated", the system allows it
- **AND** when transitioning "seated" to "completed", the system allows it
- **AND** when transitioning "pending" or "confirmed" to "cancelled", the system allows it
- **AND** when transitioning "pending" or "confirmed" to "no_show", the system allows it

#### Scenario: Invalid status transitions
- **WHEN** a user attempts to transition "completed" to any other status
- **THEN** the system rejects with error "Invalid status transition"
- **AND** when attempting "cancelled" to "confirmed", the system rejects
- **AND** when attempting "no_show" to "seated", the system rejects

---

### Requirement: Reservation Validation Rules
The system SHALL validate all reservation data against business rules before creating or updating.

#### Scenario: Validate required fields
- **WHEN** creating a reservation without customerName
- **THEN** the system rejects with error "Customer name is required"
- **AND** when missing phoneNumber, rejects with "Phone number is required"
- **AND** when missing reservationDate, rejects with "Reservation date is required"
- **AND** when missing reservationTime, rejects with "Reservation time is required"
- **AND** when missing headCount, rejects with "Party size is required"

#### Scenario: Validate field formats and ranges
- **WHEN** phoneNumber is not 10-11 digits, the system rejects with "Invalid phone number format"
- **AND** when email is provided but invalid format, rejects with "Invalid email format"
- **AND** when headCount < 1 or > 50, rejects with "Party size must be between 1 and 50"
- **AND** when duration < 30 or > 480, rejects with "Duration must be between 30 and 480 minutes"
- **AND** when customerName length > 100, rejects with "Name too long"

#### Scenario: Validate table capacity
- **WHEN** assigning a table with capacity=4 to a reservation with headCount=6
- **THEN** the system rejects with error "Table capacity insufficient for party size"
- **AND** when table has minCapacity=4 and headCount=2, the system allows but warns about suboptimal usage

---

### Requirement: List/Grid View Display
The system SHALL display reservations in a simple list or grid format without complex visual floor plans.

#### Scenario: Display reservations as list
- **WHEN** viewing reservations list
- **THEN** the system displays each reservation as a card/row showing:
  - reservationCode, customerName, phoneNumber
  - reservationDate, reservationTime, duration
  - tableNumber, headCount, status
  - Action buttons: View, Edit, Cancel, Check-in (based on status)

#### Scenario: Display reservations as grid
- **WHEN** user selects grid view
- **THEN** the system displays reservations as cards in a responsive grid
- **AND** each card shows key information and status badge
- **AND** cards are color-coded by status (pending=yellow, confirmed=blue, seated=green, completed=gray, cancelled/no_show=red)

#### Scenario: Calendar view of reservations
- **WHEN** user selects calendar view
- **THEN** the system displays a monthly calendar with reservation dots on dates
- **AND** clicking a date shows all reservations for that day
- **AND** the system highlights today's date

---

### Requirement: Simple Notifications (UI Only)
The system SHALL display UI notifications for reservation actions without external SMS/Email integration.

#### Scenario: Show confirmation notification
- **WHEN** a reservation is successfully created
- **THEN** the system displays a success toast/notification with reservation code
- **AND** the message includes basic details: "Reservation created for [customerName] on [date] at [time]"

#### Scenario: Show cancellation notification
- **WHEN** a reservation is cancelled
- **THEN** the system displays a notification: "Reservation [code] has been cancelled"
- **AND** if reason provided, includes the reason in the notification

#### Scenario: No external gateway integration
- **WHEN** any reservation action occurs
- **THEN** the system DOES NOT send actual SMS or emails
- **AND** the system only displays in-app UI notifications (toasts, alerts, badges)

---

### Requirement: Basic Reporting
The system SHALL provide simple statistics and reports for reservation analytics.

#### Scenario: Reservation count by status
- **WHEN** viewing dashboard or reports
- **THEN** the system displays count of reservations grouped by status
- **AND** the counts include: total, pending, confirmed, seated, completed, cancelled, no_show

#### Scenario: No-show rate calculation
- **WHEN** viewing reservation statistics for a date range
- **THEN** the system calculates no_show_rate = (no_show_count / total_confirmed_count) * 100
- **AND** the system displays the rate as a percentage

#### Scenario: Reservations by date
- **WHEN** viewing a date range report
- **THEN** the system shows total reservations per day
- **AND** the system groups by status to show trends
- **AND** the system can display as chart (bar/line) or table

#### Scenario: Popular time slots
- **WHEN** viewing time slot analysis
- **THEN** the system shows which reservation times are most popular
- **AND** the system highlights peak hours (e.g., 18:00-20:00)

---

### Requirement: Role-Based Access Control
The system SHALL enforce permissions based on staff roles for reservation operations.

#### Scenario: Admin and Manager full access
- **WHEN** a user with role "admin" or "manager" performs any reservation operation
- **THEN** the system allows the operation (create, read, update, cancel, confirm, seat, complete, no_show)

#### Scenario: Waiter limited access
- **WHEN** a user with role "waiter" attempts reservation operations
- **THEN** the system allows: read, create, confirm, seat, complete
- **AND** the system restricts: cancel (requires manager approval)

#### Scenario: Chef and Cashier read-only
- **WHEN** a user with role "chef" or "cashier" attempts to access reservations
- **THEN** the system allows read-only access (view list and details)
- **AND** the system denies create, update, cancel operations

#### Scenario: Customer online booking (future enhancement)
- **WHEN** an unauthenticated user accesses online booking
- **THEN** the system allows creating reservations without login
- **AND** the system sends a confirmation code to phoneNumber for future lookups
- **AND** customers can view/cancel their reservations using code + phone verification

---

### Requirement: Localization Support
The system SHALL support bilingual interface (English and Vietnamese) for all reservation-related text.

#### Scenario: Display in English
- **WHEN** user's locale is set to "en"
- **THEN** all reservation labels, messages, and status are displayed in English
- **AND** date/time formats follow English conventions

#### Scenario: Display in Vietnamese
- **WHEN** user's locale is set to "vi"
- **THEN** all reservation labels, messages, and status are displayed in Vietnamese
- **AND** date/time formats follow Vietnamese conventions
- **AND** status labels: pending="Chờ xác nhận", confirmed="Đã xác nhận", seated="Đã ngồi", completed="Hoàn thành", cancelled="Đã hủy", no_show="Không đến"

---

### Requirement: Error Handling and User Feedback
The system SHALL provide clear, actionable error messages and user feedback for all reservation operations.

#### Scenario: Validation error messages
- **WHEN** a validation error occurs
- **THEN** the system returns a 400 error with specific field-level errors
- **AND** each error includes the field name and a user-friendly message
- **AND** the frontend displays errors inline next to the relevant fields

#### Scenario: Conflict error with suggestions
- **WHEN** a table conflict occurs during booking
- **THEN** the system returns a 409 error with message "Table not available"
- **AND** the response includes a list of suggested alternative tables or time slots
- **AND** the frontend displays these alternatives for the user to choose

#### Scenario: Success confirmations
- **WHEN** any mutation operation succeeds (create, update, cancel, etc.)
- **THEN** the system returns a 200/201 response with success message
- **AND** the response includes the updated reservation object
- **AND** the frontend displays a success toast notification

#### Scenario: Not found handling
- **WHEN** a reservation is not found
- **THEN** the system returns a 404 error with message "Reservation not found"
- **AND** the frontend displays a user-friendly message and redirects to list view
