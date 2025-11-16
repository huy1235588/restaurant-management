# Spec: Reservation Interface

**Capability:** `reservation-interface`  
**Change:** `implement-reservation-management`  
**Type:** New Capability

## ADDED Requirements

### Requirement: Multi-View Display System

The reservation interface MUST provide three distinct view modes (Calendar, Timeline, List) that users can switch between based on their workflow preferences.

#### Scenario: Staff switches between calendar and timeline views

**Given** a host is viewing the reservation calendar for December 25, 2024  
**When** they click the "Timeline" view toggle button  
**Then** the interface switches to timeline view showing the same date  
**And** the selected date remains preserved  
**And** the view preference is saved for the current user session

#### Scenario: Manager uses list view to search reservations

**Given** a manager needs to find all reservations for customer "John Smith"  
**When** they switch to "List" view  
**And** enter "John Smith" in the search box  
**Then** the list filters to show only reservations matching "John Smith"  
**And** displays customer phone number, date/time, party size, and status for each match

---

### Requirement: Calendar View Navigation

Calendar view MUST allow navigation by day, week, or month with reservations displayed as time-based cards on their respective dates.

#### Scenario: Navigate to specific date in calendar view

**Given** a user is viewing the calendar for the current week  
**When** they click the date picker and select "December 31, 2024"  
**Then** the calendar navigates to the week containing December 31  
**And** displays all reservations for that week  
**And** highlights December 31 as the selected date

#### Scenario: View reservation details from calendar card

**Given** the calendar shows 5 reservations on December 25  
**When** a user clicks on the "7:00 PM - John Smith" reservation card  
**Then** a details dialog opens showing full reservation information  
**And** displays customer name, phone, email, party size, table, special requests, and status

---

### Requirement: Timeline View with Table Grid

Timeline view MUST display tables as columns and time slots as rows, showing reservation blocks for each table across the selected date.

#### Scenario: View table occupancy throughout the day

**Given** a host selects December 25, 2024 in timeline view  
**When** the timeline loads  
**Then** it displays all active tables as column headers  
**And** shows time slots from opening to closing in 30-minute intervals  
**And** displays colored blocks representing reservations on their respective tables and times  
**And** each block shows customer name and party size

#### Scenario: Filter timeline by floor

**Given** the timeline view is showing all tables  
**When** a user selects "Floor 2" from the floor filter dropdown  
**Then** the timeline updates to show only tables on Floor 2  
**And** maintains the current date selection  
**And** updates the available table count in the header

---

### Requirement: List View with Filtering

List view MUST display reservations as a sortable, filterable list with search capabilities and bulk action support.

#### Scenario: Filter reservations by status

**Given** a user is viewing the reservation list for today  
**When** they click the "Status" filter and select "Pending"  
**Then** the list updates to show only reservations with "Pending" status  
**And** displays the count of filtered results  
**And** maintains other active filters

#### Scenario: Sort reservations by time

**Given** the list view shows 24 reservations for December 25  
**When** a user clicks the "Time" column header  
**Then** reservations are sorted chronologically (earliest first)  
**And** clicking again reverses the sort order (latest first)

---

### Requirement: Quick Stats Dashboard

The reservation interface header MUST display quick statistics showing today's reservation count, status breakdown, and special occasions.

#### Scenario: View today's reservation statistics

**Given** there are 24 reservations scheduled for today  
**When** a user opens the reservation page  
**Then** the header displays "24 Total" reservations  
**And** shows "18 Confirmed", "6 Pending" status breakdown  
**And** highlights "2 Special Occasions" (birthdays/anniversaries)  
**And** updates in real-time as reservations are created or modified

---

### Requirement: Status Color Coding

Reservations MUST be visually distinguished by status using consistent color coding across all views.

#### Scenario: Identify reservation status at a glance

**Given** a user is viewing any reservation view (Calendar, Timeline, or List)  
**When** they scan the reservations  
**Then** "Confirmed" reservations display with green indicator  
**And** "Pending" reservations display with yellow indicator  
**And** "Seated" reservations display with blue indicator  
**And** "Completed" reservations display with gray indicator  
**And** "Cancelled" reservations display with red indicator  
**And** "No-show" reservations display with black indicator

---

### Requirement: Priority Indicators

Reservations with special attributes MUST display visual indicators for VIP customers, special occasions, large groups, and repeat customers.

#### Scenario: Identify VIP customer reservation

**Given** a reservation exists for a customer marked as VIP  
**When** the reservation is displayed in any view  
**Then** it shows a star icon (⭐) next to the customer name  
**And** optionally highlights the card with a distinct border or background

#### Scenario: Identify birthday celebration

**Given** a reservation has "Birthday" tag  
**When** displayed in the interface  
**Then** it shows a cake icon (🎂) as a priority indicator  
**And** alerts staff to prepare special arrangements

---

### Requirement: Quick Actions Menu

Each reservation card MUST provide context-sensitive quick actions based on current status and user permissions.

#### Scenario: Quick actions for confirmed reservation

**Given** a reservation with "Confirmed" status  
**When** a user right-clicks or opens the actions menu on the reservation card  
**Then** available actions include: "Edit", "Mark as Seated", "Cancel", "Send Reminder"  
**And** clicking "Mark as Seated" immediately updates status to "Seated"  
**And** triggers real-time update to other connected clients

---

### Requirement: Keyboard Navigation Support

The interface MUST support keyboard shortcuts for common actions to improve staff efficiency.

#### Scenario: Create new reservation with keyboard shortcut

**Given** a user is on the reservation page  
**When** they press `Ctrl+N` (or `Cmd+N` on Mac)  
**Then** the "New Reservation" dialog opens  
**And** focus is automatically placed on the customer name field

#### Scenario: Navigate calendar with arrow keys

**Given** a user is in calendar view with a date selected  
**When** they press the right arrow key  
**Then** the calendar advances by one day  
**And** pressing left arrow goes back one day  
**And** pressing up/down arrow navigates by week

---

### Requirement: Real-time Updates via WebSocket

The reservation interface MUST update in real-time when reservations are created, modified, or cancelled by other users.

#### Scenario: See new reservation created by another user

**Given** User A and User B both have the reservation page open for December 25  
**When** User A creates a new reservation for 7:00 PM  
**Then** User B's interface automatically updates within 2 seconds  
**And** the new reservation appears in User B's current view  
**And** displays a brief notification: "New reservation added"

#### Scenario: Detect conflicting edits

**Given** User A opens edit dialog for reservation #123  
**And** User B also opens edit dialog for the same reservation  
**When** User A saves changes first  
**Then** User B receives a warning: "This reservation was modified by another user"  
**And** User B can choose to "Reload" to see latest version or "Override" with their changes
