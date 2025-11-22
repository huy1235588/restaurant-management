# Reservation Management Specification

## ADDED Requirements

### Requirement: Create Reservation with Manual Table Selection

The system SHALL allow staff to create reservations by manually selecting tables from a filtered list of available options.

#### Scenario: Staff creates reservation with manual table selection

- **WHEN** staff enters reservation date, time, and party size
- **THEN** system displays list of tables WHERE capacity >= partySize AND status = 'available' at that time slot
- **AND** list shows table number, capacity, floor, section for each option
- **AND** staff clicks on preferred table to assign
- **AND** system creates reservation with selected tableId and status = 'pending'
- **AND** system generates unique reservationCode
- **AND** system sends single confirmation email with reservation details

#### Scenario: No tables available for requested criteria

- **WHEN** staff enters date, time, and party size
- **AND** no tables match criteria (all occupied or capacity too small)
- **THEN** system displays "No tables available" message
- **AND** suggests alternative time slots within ±2 hours if available
- **AND** does not create reservation

#### Scenario: Table becomes unavailable during selection

- **WHEN** staff views available table list
- **AND** another staff member books the same table simultaneously
- **AND** first staff attempts to confirm reservation
- **THEN** system validates table still available
- **AND** returns error "Table no longer available, please select another"
- **AND** refreshes available table list

### Requirement: Basic Deposit Recording

The system SHALL record deposit amounts for reservations without automated refund calculation.

#### Scenario: Staff records deposit amount

- **WHEN** creating reservation
- **AND** customer pays deposit
- **THEN** staff enters depositAmount in VND
- **AND** system stores amount in reservation.depositAmount field
- **AND** displays deposit on confirmation email
- **AND** no automated refund logic is applied

#### Scenario: Reservation cancelled with deposit

- **WHEN** reservation has depositAmount > 0
- **AND** staff or customer requests cancellation
- **THEN** system updates status to 'cancelled'
- **AND** stores cancellationReason
- **AND** admin manually decides refund amount offline
- **AND** no automatic refund calculation occurs

### Requirement: Single Confirmation Email

The system SHALL send exactly one confirmation email when reservation is successfully created.

#### Scenario: Reservation created successfully

- **WHEN** staff confirms reservation creation
- **THEN** system sends email to customer email address (if provided)
- **AND** email includes: reservationCode, date, time, table number, party size, deposit amount, restaurant contact info
- **AND** no follow-up reminder emails are sent
- **AND** no scheduled email jobs are created

#### Scenario: Email address not provided

- **WHEN** creating reservation without email
- **THEN** system creates reservation normally
- **AND** skips email sending
- **AND** shows confirmation details on screen for staff to communicate verbally

### Requirement: Manual No-Show Handling

The system SHALL require staff to explicitly mark reservations as no-show when customers do not arrive.

#### Scenario: Customer arrives on time

- **WHEN** reservation time arrives
- **AND** customer checks in at restaurant
- **THEN** staff clicks "Seat Customer" button
- **AND** system updates status to 'seated'
- **AND** sets seatedAt timestamp
- **AND** updates table.status to 'occupied'

#### Scenario: Customer does not arrive

- **WHEN** reservation time passes
- **AND** customer has not checked in after grace period (e.g., 15 minutes)
- **THEN** staff clicks "Mark No-Show" button
- **AND** system updates status to 'no_show'
- **AND** sets cancelledAt timestamp
- **AND** updates table.status back to 'available'
- **AND** logs action in ReservationAudit table

#### Scenario: No automatic timeout cancellation

- **WHEN** reservation time passes
- **AND** customer has not checked in
- **THEN** system does NOT automatically change status
- **AND** reservation remains in 'confirmed' status
- **AND** table remains 'reserved' until staff takes manual action

### Requirement: Reservation Status Transitions

The system SHALL enforce valid state transitions for reservation lifecycle.

#### Scenario: Valid status progression

- **WHEN** reservation is created
- **THEN** initial status = 'pending'
- **AND** staff can confirm → 'confirmed'
- **AND** from confirmed can → 'seated', 'cancelled', 'no_show'
- **AND** from seated can → 'completed', 'cancelled'
- **AND** cancelled and no_show are terminal states (no further transitions)

#### Scenario: Invalid status transition blocked

- **WHEN** reservation status = 'completed'
- **AND** staff attempts to change to 'pending' or 'confirmed'
- **THEN** system returns error "Invalid status transition"
- **AND** status remains unchanged
- **AND** error is logged

### Requirement: View Reservation List with Filtering

The system SHALL display reservations with filtering by status, date range, and table.

#### Scenario: Filter reservations by status

- **WHEN** staff selects status filter (pending, confirmed, seated, completed, cancelled, no_show)
- **THEN** system displays only reservations matching selected status
- **AND** sorts by reservationDate and reservationTime ascending
- **AND** shows: reservationCode, customerName, phoneNumber, tableNumber, partySize, status

#### Scenario: Filter reservations by date range

- **WHEN** staff selects date range (e.g., today, this week, next week, custom range)
- **THEN** system displays reservations WHERE reservationDate BETWEEN start AND end dates
- **AND** includes all statuses unless status filter also applied

#### Scenario: Search reservation by code or phone

- **WHEN** staff enters search term
- **THEN** system searches by reservationCode (exact match) OR phoneNumber (partial match)
- **AND** displays matching reservations instantly
- **AND** highlights search term in results

### Requirement: Edit Reservation Details

The system SHALL allow staff to modify reservation details before it is completed or cancelled.

#### Scenario: Update date/time/party size

- **WHEN** reservation status IN ('pending', 'confirmed')
- **AND** staff changes date, time, or partySize
- **THEN** system re-validates table assignment
- **AND** if current table no longer suitable, prompts for new table selection
- **AND** updates reservation record
- **AND** logs change in ReservationAudit table

#### Scenario: Cannot edit completed/cancelled reservation

- **WHEN** reservation status IN ('completed', 'cancelled', 'no_show')
- **AND** staff attempts to edit
- **THEN** system shows error "Cannot edit finalized reservation"
- **AND** edit form is disabled or read-only

### Requirement: Cancel Reservation

The system SHALL allow staff to cancel reservations with reason documentation.

#### Scenario: Staff cancels reservation

- **WHEN** staff clicks "Cancel Reservation" button
- **AND** enters cancellationReason (e.g., "Customer requested", "No deposit", "No-show")
- **THEN** system updates status to 'cancelled'
- **AND** sets cancelledAt timestamp
- **AND** stores cancellationReason
- **AND** releases table (status = 'available')
- **AND** logs action in ReservationAudit

#### Scenario: Customer self-cancels reservation

- **WHEN** customer calls to cancel
- **AND** provides reservationCode or phoneNumber
- **THEN** staff finds reservation
- **AND** clicks "Cancel" with reason = "Customer cancelled"
- **AND** same cancellation workflow as staff-initiated

### Requirement: Reservation Audit Trail

The system SHALL log all reservation status changes and modifications for accountability.

#### Scenario: Audit log captures every change

- **WHEN** any reservation field is modified OR status changes
- **THEN** system creates ReservationAudit record
- **AND** captures: reservationId, action (e.g., "created", "confirmed", "cancelled"), userId, changes (JSON diff), timestamp
- **AND** audit records are immutable (no updates/deletes)

#### Scenario: View reservation history

- **WHEN** staff opens reservation details
- **THEN** system displays audit trail in chronological order
- **AND** shows: timestamp, user name, action, changes made
- **AND** helps troubleshoot disputes or questions

### Requirement: Prevent Double-Booking

The system SHALL prevent multiple reservations for the same table at overlapping times.

#### Scenario: Detect overlapping reservation

- **WHEN** creating or editing reservation
- **AND** selected table already has reservation WHERE:
  - reservationDate = new date
  - AND time ranges overlap (new start < existing end AND new end > existing start)
  - AND existing status IN ('pending', 'confirmed', 'seated')
- **THEN** system returns error "Table already reserved for this time"
- **AND** does not create/update reservation

#### Scenario: Past reservations do not block

- **WHEN** table has reservation with status = 'completed' or reservationDate < today
- **AND** new reservation requested for same table at same time tomorrow
- **THEN** system allows creation (no overlap)

### Requirement: Display Available Tables

The system SHALL show real-time table availability based on reservation schedule.

#### Scenario: Show available tables for date/time

- **WHEN** staff selects date, time, duration, partySize
- **THEN** system calculates requested time window (start to start + duration)
- **AND** queries tables WHERE:
  - capacity >= partySize
  - AND isActive = true
  - AND status NOT IN ('maintenance')
  - AND no overlapping reservations in requested window
- **AND** displays matching tables with floor, section, capacity info

#### Scenario: Available table list updates on selection

- **WHEN** staff selects different date or time
- **THEN** available table list refreshes immediately
- **AND** previously selected table is cleared if no longer available
- **AND** new list reflects current availability
