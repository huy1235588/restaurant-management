# Spec: Floor Plan Integration

**Capability:** `floor-plan-integration`  
**Change:** `implement-reservation-management`  
**Type:** Modified Capability

## MODIFIED Requirements

### Requirement: Visual Table Selection from Floor Plan

The floor plan MUST support selecting tables visually during reservation creation and show reservation status overlays.

#### Scenario: Select table from floor plan during booking

**Given** staff is creating a reservation for 4 guests at 19:00  
**And** they click "Select from Floor Plan" button  
**When** floor plan view opens  
**Then** floor plan displays with color-coded availability:
  - 🟢 Green: Available for selected time
  - 🔴 Red: Reserved/Occupied
  - 🟡 Yellow: Soon available (within 30 min)
**When** staff clicks a green table (Table 5)  
**Then** table is selected for the reservation  
**And** dialog closes, returning to reservation form with Table 5 selected

#### Scenario: Hover to see table availability details

**Given** floor plan is displayed for reservation selection  
**When** staff hovers over a red (unavailable) table  
**Then** tooltip appears showing:
  - "Table 3 - Reserved until 20:30"
  - "Current reservation: John Doe (2 guests)"
  - "Next available: 20:45"

---

### Requirement: Reservation Status Overlay

The floor plan MUST display upcoming reservations as visual overlays on table representations.

#### Scenario: Show reservation count badge on tables

**Given** floor plan is displayed for current day  
**When** Table 5 has 3 reservations scheduled today  
**Then** Table 5 shows badge: "3 🗓️"  
**And** clicking table opens daily schedule:
  - "11:00-13:00 - Jane Smith (2 guests)"
  - "14:00-16:00 - Bob Jones (4 guests)"
  - "19:00-21:00 - Mike Wilson (3 guests)"

---

### Requirement: Timeline Overlay on Floor Plan

The floor plan MUST support a timeline slider to visualize table occupancy at different times.

#### Scenario: Slide timeline to view future availability

**Given** floor plan is displayed at 10:00 AM  
**And** timeline slider is at current time  
**When** staff drags slider to 19:00 (7:00 PM)  
**Then** floor plan updates to show 19:00 availability  
**And** tables with reservations at 19:00 turn red  
**And** tables available at 19:00 remain green  
**And** timeline shows: "Viewing: 7:00 PM - 8 tables occupied"

---

### Requirement: Quick Reservation from Floor Plan

Staff MUST be able to create reservations directly from the floor plan by clicking available tables.

#### Scenario: Quick create reservation from floor plan

**Given** floor plan is displayed for Dec 25 at 19:00  
**When** staff clicks an available table (Table 5)  
**Then** "Quick Create Reservation" dialog appears  
**And** pre-fills:
  - Table: Table 5
  - Date: Dec 25, 2024
  - Time: 19:00
**And** staff only needs to enter: Customer name, phone, party size  
**And** clicks "Create" to complete

---

### Requirement: Real-time Floor Plan Updates

The floor plan MUST update in real-time when reservations are created, modified, or cancelled.

#### Scenario: See new reservation appear on floor plan

**Given** User A has floor plan open for Dec 25  
**When** User B creates a reservation for Table 5 at 19:00  
**Then** User A's floor plan updates within 2 seconds  
**And** Table 5 color changes from green to red at 19:00  
**And** reservation count badge increments

---

### Requirement: Multi-Table Selection for Large Groups

The floor plan MUST support selecting multiple adjacent tables for large group reservations.

#### Scenario: Select multiple tables for group of 10

**Given** staff is creating reservation for 10 guests  
**And** floor plan is open for table selection  
**When** staff clicks "Multi-Table Mode"  
**And** selects Table 8 (6 seats) and Table 9 (4 seats)  
**Then** both tables highlight with linked border  
**And** system shows: "Combined capacity: 10 seats"  
**And** both tables are reserved with linked reservation IDs

---

## ADDED Requirements

### Requirement: Reservation Density Heatmap

The floor plan MUST support a heatmap view showing reservation density by area over time.

#### Scenario: View busiest areas during peak hours

**Given** staff opens floor plan analytics  
**When** they enable "Heatmap View" for evening service (18:00-22:00)  
**Then** floor plan displays color intensity by reservation frequency:
  - Deep red: Window tables (90% booked)
  - Orange: Center tables (70% booked)
  - Yellow: Corner tables (50% booked)
**And** helps identify underutilized areas

---

### Requirement: Table Status Legend

The floor plan MUST display a clear legend explaining table status colors and icons.

#### Scenario: Understand floor plan color coding

**Given** floor plan is displayed  
**When** staff views the legend panel  
**Then** legend shows:
  - "🟢 Available - Ready for reservation"
  - "🔴 Reserved - Confirmed reservation"
  - "🔵 Occupied - Currently dining"
  - "🟣 Reserved + Occupied - Has future reservation"
  - "🟡 Soon Available - Freeing up within 30 min"
  - "⚪ Blocked - Maintenance/Not available"

---

### Requirement: Filter Floor Plan by Criteria

The floor plan MUST support filtering tables by floor, capacity, location, and availability.

#### Scenario: Filter tables by capacity

**Given** floor plan displays all tables  
**When** staff sets filter: "Capacity: 4-6 seats"  
**Then** floor plan dims tables outside capacity range  
**And** highlights only tables matching: 4, 5, or 6 seats  
**And** count shows: "12 tables match your criteria"

#### Scenario: Filter by location preference

**Given** customer requests window seat  
**When** staff sets filter: "Location: Window"  
**Then** floor plan highlights only window tables  
**And** shows availability for each window table

---

### Requirement: Reservation Details Popup

Clicking a reserved table on the floor plan MUST show reservation details in a popup.

#### Scenario: View reservation details from floor plan

**Given** floor plan shows Table 5 as reserved  
**When** staff clicks Table 5  
**Then** popup displays:
  - "Table 5 - Window Seat"
  - "Current Reservation:"
  - "John Smith - 19:00-21:00"
  - "Party size: 4 guests"
  - "Status: Confirmed"
  - "Special: Birthday celebration 🎂"
  - Actions: "[Edit]" "[Cancel]" "[Mark Seated]"
