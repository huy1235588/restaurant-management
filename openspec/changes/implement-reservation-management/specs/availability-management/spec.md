# Spec: Availability Management

**Capability:** `availability-management`  
**Change:** `implement-reservation-management`  
**Type:** New Capability

## ADDED Requirements

### Requirement: Real-time Availability Checking

The system MUST check table availability in real-time considering existing reservations, active orders, buffer times, and table capacity.

#### Scenario: Check availability for date and time

**Given** a user wants to book 4 guests on Dec 25 at 19:00  
**When** they enter the date, time, and party size  
**Then** the system queries all tables with capacity ≥ 4  
**And** checks for conflicting reservations between 18:45-21:15 (with 15min buffer)  
**And** checks for active orders on those tables  
**And** returns list of available tables within 500ms  
**And** displays: "3 tables available: Table 5, Table 8, Table 12"

#### Scenario: No tables available - suggest alternatives

**Given** all tables are fully booked at 19:00  
**When** availability check runs  
**Then** system responds: "No tables available at 19:00"  
**And** suggests alternative times:
  - "18:30 - 3 tables available"
  - "20:00 - 5 tables available"
  - "21:00 - 8 tables available"

---

### Requirement: Visual Availability Timeline

The system MUST display availability as a visual timeline showing capacity utilization across time slots.

#### Scenario: View availability heatmap for a date

**Given** a user selects Dec 25, 2024  
**When** they view the availability timeline  
**Then** the system displays:
```
11:00 AM  ████████░░  80% booked (8/10 tables)
12:00 PM  ██████░░░░  60% booked (6/10 tables)
 1:00 PM  ████░░░░░░  40% booked (4/10 tables)
 6:00 PM  ██████████ 100% booked (10/10 tables)
 7:00 PM  ░░░░░░░░░░   0% available (FULL)
```
**And** clicking a time slot shows specific table availability

---

### Requirement: Buffer Time Configuration

The system MUST respect configurable buffer times between reservations for cleanup and table preparation.

#### Scenario: Apply buffer time between reservations

**Given** buffer time is set to 15 minutes  
**And** Table 5 has a reservation ending at 21:00  
**When** checking availability for Table 5 at 21:00  
**Then** the system marks Table 5 as unavailable until 21:15  
**And** earliest available time is 21:15

#### Scenario: Configure different buffer times by table type

**Given** window tables require 20-minute buffer for extra cleaning  
**And** standard tables require 15-minute buffer  
**When** checking availability  
**Then** system applies appropriate buffer based on table type  
**And** window tables show availability 20 minutes after previous reservation  
**And** standard tables show availability 15 minutes after

---

### Requirement: Table Turnover Prediction

The system MUST estimate when currently occupied tables will become available based on average dining duration.

#### Scenario: Predict table availability from active order

**Given** Table 3 is currently occupied with an order started at 18:30  
**And** average dining duration for 2 guests is 90 minutes  
**When** checking availability at 19:00  
**Then** system predicts Table 3 will be available at 20:00  
**And** shows: "Table 3 - Expected available at 20:00"

#### Scenario: Adjust prediction based on order progress

**Given** Table 5 started dining at 18:00 (expected end 20:00)  
**And** order status shows dessert was just served at 19:30  
**When** checking availability  
**Then** system adjusts prediction: "Table 5 - Expected available at 20:00 (30 min)"  
**And** marks as "Soon Available" in floor plan

---

### Requirement: Capacity Threshold Warnings

The system MUST warn staff when approaching full capacity for a time slot.

#### Scenario: Warning at 90% capacity

**Given** 9 out of 10 tables are booked for 19:00  
**When** a staff member creates a new reservation for 19:00  
**Then** system shows warning: "⚠️ High demand at 19:00 - only 1 table remaining"  
**And** suggests: "Consider suggesting 18:30 or 19:30 to customer"

#### Scenario: Full capacity - enable waitlist

**Given** all tables are booked for 19:00  
**When** a customer requests that time  
**Then** system shows: "⚠️ No tables available at 19:00"  
**And** offers: "Add to waitlist" button  
**And** "Show alternative times" button

---

### Requirement: Multi-Table Allocation for Large Groups

The system MUST identify and allocate multiple adjacent tables for large parties exceeding single table capacity.

#### Scenario: Allocate 2 tables for group of 10

**Given** a customer wants to book 10 guests  
**And** maximum single table capacity is 6  
**When** checking availability  
**Then** system identifies combinations:
  - "Table 8 (6 seats) + Table 9 (4 seats) - Adjacent"
  - "Table 3 (6 seats) + Table 4 (4 seats) - Same floor"
**And** prioritizes adjacent tables  
**And** reserves both tables with linked reservation

#### Scenario: Consider table proximity in allocation

**Given** multiple table combinations can seat 10 guests  
**When** auto-assigning tables  
**Then** system scores combinations by:
  - Adjacent tables (highest priority)
  - Same section tables
  - Same floor tables
  - Different floors (lowest priority)

---

### Requirement: Floor-Based Availability Filtering

Users MUST be able to filter availability checks by specific floors.

#### Scenario: Check availability on specific floor

**Given** a customer requests a table on Floor 2  
**When** staff checks availability for 4 guests at 19:00  
**And** filters by "Floor 2"  
**Then** system shows only tables on Floor 2  
**And** displays: "2 tables available on Floor 2: Table 8, Table 12"  
**And** alternative times also filtered to Floor 2

---

### Requirement: Overbooking Management

The system MUST support controlled overbooking based on historical no-show patterns and configurable limits.

#### Scenario: Allow overbooking within 10% threshold

**Given** restaurant has 10 tables  
**And** overbooking is enabled at 10%  
**And** historical no-show rate is 8%  
**When** all 10 tables are booked for 19:00  
**Then** system allows 1 additional reservation (11 total)  
**And** shows warning: "⚠️ Overbooked by 1 table - monitor for no-shows"

#### Scenario: Prevent overbooking beyond threshold

**Given** overbooking limit is 10% (11 tables max)  
**When** 11 tables are already booked  
**And** staff tries to add 12th reservation  
**Then** system blocks creation: "Cannot exceed overbooking limit"  
**And** prevents the overbooking

---

### Requirement: Operating Hours Enforcement

The system MUST restrict reservations to configured operating hours and time slot intervals.

#### Scenario: Prevent reservation outside operating hours

**Given** restaurant closes at 22:00  
**And** average dining duration is 2 hours  
**When** staff tries to create reservation at 21:00  
**Then** system shows warning: "⚠️ Late booking - dining may extend past closing time"  
**And** suggests: "Latest recommended time: 20:00"  
**But** allows override with manager permission

#### Scenario: Enforce time slot intervals

**Given** reservation slots are 30-minute intervals (10:00, 10:30, 11:00...)  
**When** staff enters time "10:15"  
**Then** system auto-corrects to nearest slot: "10:00 or 10:30"  
**And** shows: "Time adjusted to 10:30 (nearest available slot)"

---

### Requirement: Advance Booking Window

The system MUST enforce a maximum advance booking period (e.g., 90 days).

#### Scenario: Prevent booking beyond advance window

**Given** advance booking window is 90 days  
**And** today is Jan 1, 2025  
**When** staff tries to create reservation for May 1, 2025 (120 days ahead)  
**Then** system shows error: "Cannot book beyond 90 days in advance"  
**And** displays: "Latest available date: April 1, 2025"

#### Scenario: Allow manager override for special events

**Given** advance booking limit is 90 days  
**When** manager with special permissions creates reservation for 120 days ahead  
**And** marks as "Special Event"  
**Then** system allows the booking  
**And** logs override in audit trail

---

### Requirement: Concurrent Availability Checking

The system MUST handle concurrent availability checks without race conditions or double-bookings.

#### Scenario: Two staff check same time simultaneously

**Given** User A and User B both check availability for 19:00 Dec 25  
**And** only 1 table (Table 5) is available  
**When** both receive confirmation "Table 5 available"  
**And** User A creates reservation first (commits to database)  
**And** User B attempts to create reservation 2 seconds later  
**Then** User B's request is rejected: "Table 5 no longer available"  
**And** system suggests: "Check updated availability"  
**And** prevents double-booking through database-level locking

#### Scenario: Real-time availability update during booking process

**Given** User A opens create form showing "3 tables available"  
**And** User B books Table 5 while User A is filling the form  
**When** User A clicks "Create" 2 minutes later  
**Then** system re-validates availability  
**And** if Table 5 was selected: "Table 5 is no longer available"  
**And** offers to select from currently available tables
