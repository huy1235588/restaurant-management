# Reservation Management - Comprehensive Feature Documentation

## Overview

Reservation Management là hệ thống quản lý đặt bàn toàn diện cho nhà hàng với giao diện trực quan, hỗ trợ đặt bàn theo thời gian thực, quản lý khách hàng, và tích hợp sơ đồ mặt bằng.

**Đặc điểm chính:**
- **Multi-view Interface:** Calendar view, Timeline view, và List view để phù hợp với nhiều workflow
- **Real-time Availability:** Kiểm tra bàn trống theo thời gian thực dựa trên orders và reservations hiện có
- **Customer Management:** Tích hợp quản lý thông tin khách hàng và lịch sử đặt bàn
- **Smart Table Allocation:** Gợi ý bàn phù hợp dựa trên số người và thời gian
- **Notification System:** Thông báo nhắc nhở cho khách và nhân viên

---

## 1. RESERVATION INTERFACE (Giao diện đặt bàn)

### 1.1 View Modes

**Calendar View:**
```
┌────────────────────────────────────────┐
│  [Today] [Week] [Month]    [+ New]     │
├────────────────────────────────────────┤
│  Mon  Tue  Wed  Thu  Fri  Sat  Sun     │
│   15   16   17   18   19   20   21     │
│                                        │
│        [Reservation Cards]             │
│        with Time Blocks                │
│                                        │
└────────────────────────────────────────┘
```

**Timeline View:**
```
┌────────────────────────────────────────┐
│  [Date Picker]  [Floor Filter]  [+ New]│
├────────────────────────────────────────┤
│ Time │ Table 1 │ Table 2 │ Table 3     │
├──────┼─────────┼─────────┼─────────────┤
│ 10AM │         │  [Res]  │             │
│ 11AM │  [Res]  │  [Res]  │             │
│ 12PM │  [Res]  │         │  [Res]      │
│ 1PM  │         │         │  [Res]      │
└────────────────────────────────────────┘
```

**List View:**
```
┌────────────────────────────────────────┐
│  [Search] [Filter] [Status]    [+ New] │
├────────────────────────────────────────┤
│ ┌────────────────────────────────────┐ │
│ │ 11:30 AM • Table 5 • John Smith    │ │
│ │ 4 guests • Confirmed               │ │
│ └────────────────────────────────────┘ │
│ ┌────────────────────────────────────┐ │
│ │ 12:00 PM • Table 8 • Jane Doe      │ │
│ │ 2 guests • Pending                 │ │
│ └────────────────────────────────────┘ │
└────────────────────────────────────────┘
```

**View Switching:**
- Quick toggle buttons: Calendar / Timeline / List
- View preference saved per user
- Keyboard shortcuts: `Ctrl+1`, `Ctrl+2`, `Ctrl+3`

### 1.2 Header & Actions

**Header Components:**
- **Date Selector:** Quick navigation to specific dates
- **View Toggle:** Switch between Calendar/Timeline/List
- **Filter Panel:** Filter by status, floor, time range
- **Search Bar:** Search by customer name, phone, or table
- **Create Button:** Large prominent "+ New Reservation" button

**Quick Stats Display:**
```
┌──────────────────────────────────────────────┐
│  Today's Reservations                        │
│  📊 24 Total  ✅ 18 Confirmed  ⏳ 6 Pending │
│  🎂 2 Special Occasions                      │
└──────────────────────────────────────────────┘
```

### 1.3 Color Coding & Status

**Reservation Status Colors:**
- 🟢 **Confirmed** (Green): Đã xác nhận
- 🟡 **Pending** (Yellow): Chờ xác nhận
- 🔵 **Seated** (Blue): Đã đến và ngồi
- ⚪ **Completed** (Gray): Đã hoàn thành
- 🔴 **Cancelled** (Red): Đã hủy
- ⚫ **No-show** (Black): Không đến

**Priority Indicators:**
- ⭐ VIP Customer
- 🎂 Birthday/Special Occasion
- 👥 Large Group (>8 people)
- 🔁 Repeat Customer

---

## 2. CREATE RESERVATION (Tạo đặt bàn)

### 2.1 Reservation Creation Dialog

**Step 1: Customer Information**
```
┌─────────────────────────────────────┐
│  New Reservation                    │
├─────────────────────────────────────┤
│  Customer Name: [____________]      │
│  Phone Number:  [____________]      │
│  Email:         [____________]      │
│                                     │
│  ☐ Add to customer database         │
│  [Search existing customers]        │
└─────────────────────────────────────┘
```

**Step 2: Reservation Details**
```
┌─────────────────────────────────────┐
│  Date:          [📅 12/25/2024]     │
│  Time:          [⏰ 7:00 PM]  ▼     │
│  Duration:      [⏱️ 2 hours]   ▼     │
│  Party Size:    [👥 4 guests]  ▼     │
│                                     │
│  Floor:         [🏢 All Floors] ▼   │
│  Table:         [Auto-assign]   ▼   │
│                                     │
│  Special Requests:                  │
│  [________________________]         │
│  [________________________]         │
└─────────────────────────────────────┘
```

**Step 3: Table Selection (Optional)**
```
┌─────────────────────────────────────┐
│  Available Tables for 4 guests      │
│  at 7:00 PM on Dec 25, 2024        │
├─────────────────────────────────────┤
│  ✅ Table 5  (4 seats) - Window     │
│  ✅ Table 8  (6 seats) - Center     │
│  ✅ Table 12 (4 seats) - Corner     │
│  ❌ Table 3  (4 seats) - Reserved   │
│                                     │
│  [Show Floor Plan View]             │
└─────────────────────────────────────┘
```

**Step 4: Confirmation & Options**
```
┌─────────────────────────────────────┐
│  ☐ Send confirmation email          │
│  ☐ Send confirmation SMS            │
│  ☐ Add reminder notification        │
│     [30 minutes before] ▼           │
│                                     │
│  Notes for staff:                   │
│  [________________________]         │
│                                     │
│  [Cancel]  [Create Reservation]     │
└─────────────────────────────────────┘
```

### 2.2 Quick Create Mode

**Phím tắt:** `Ctrl + N` hoặc `Cmd + N`

**Features:**
- Simplified single-screen form
- Pre-filled with common defaults
- Instant availability check
- One-click create for regular customers

**Workflow:**
1. Press `Ctrl + N` anywhere in the app
2. Quick dialog appears
3. Fill minimum required fields:
   - Customer name
   - Phone
   - Date & time
   - Party size
4. System auto-suggests available tables
5. Click "Quick Create" → Done!

### 2.3 Table Auto-Assignment Logic

**Priority Factors:**
1. **Capacity Match:** Ưu tiên bàn có sức chứa phù hợp nhất
2. **Table Status:** Bàn trống > Bàn sắp trống > Bàn đã đặt
3. **Location Preference:** Cửa sổ, góc, trung tâm theo yêu cầu
4. **Previous Preference:** Bàn khách đã ngồi lần trước (nếu có)
5. **Floor Preference:** Tầng ưu tiên của khách

**Smart Suggestions:**
```javascript
// Example algorithm
function suggestTables(partySize, datetime, preferences) {
  const availableTables = getAvailableTables(datetime);
  
  return availableTables
    .filter(t => t.capacity >= partySize && t.capacity <= partySize + 2)
    .sort((a, b) => {
      // Exact match first
      if (a.capacity === partySize && b.capacity !== partySize) return -1;
      if (b.capacity === partySize && a.capacity !== partySize) return 1;
      
      // Then by preference score
      return calculatePreferenceScore(b) - calculatePreferenceScore(a);
    });
}
```

### 2.4 Validation & Conflict Detection

**Real-time Validations:**
- ✅ Customer phone number format
- ✅ Date not in the past
- ✅ Time within restaurant hours
- ✅ Party size within table capacity
- ✅ Table availability at selected time

**Conflict Detection:**
```
⚠️  Warning: Table 5 is reserved until 6:45 PM
    Suggested alternatives:
    • Table 8 (available now)
    • Table 5 (available after 7:00 PM)
    • Table 12 (available now)
```

**Overbooking Prevention:**
- Maximum reservations per time slot configurable
- Buffer time between reservations (default: 15 min)
- Warning when approaching capacity limit

---

## 3. EDIT & MANAGE RESERVATIONS

### 3.1 Reservation Details View

**Click on any reservation to view details:**
```
┌─────────────────────────────────────────┐
│  Reservation #R-2024-001234             │
│  Status: ✅ Confirmed                   │
├─────────────────────────────────────────┤
│  👤 John Smith                          │
│  📞 (555) 123-4567                      │
│  📧 john@example.com                    │
│                                         │
│  📅 December 25, 2024                   │
│  ⏰ 7:00 PM - 9:00 PM (2 hours)         │
│  👥 4 guests                            │
│  🪑 Table 5 (Window seat)               │
│  🏢 Floor 2                             │
│                                         │
│  📝 Special Requests:                   │
│  "Birthday celebration, need cake"      │
│                                         │
│  Created: Dec 20, 2024 by Sarah        │
│  Last Modified: Dec 22, 2024           │
│                                         │
│  [Edit] [Cancel] [Mark as Seated]      │
│  [Print] [Send Reminder] [More...]     │
└─────────────────────────────────────────┘
```

### 3.2 Edit Reservation

**Editable Fields:**
- Date and time
- Party size
- Table assignment
- Special requests
- Contact information
- Status

**Edit Workflow:**
1. Click "Edit" button
2. Modify desired fields
3. System re-validates availability
4. If conflicts exist, show alternatives
5. Confirm changes
6. Update notifications sent automatically

**Change History:**
```
📜 Change Log:
- Dec 22: Time changed from 6:30 PM to 7:00 PM (by Sarah)
- Dec 21: Party size changed from 2 to 4 (by Sarah)
- Dec 20: Reservation created (by Sarah)
```

### 3.3 Reservation Status Actions

**Status Transitions:**
```
Pending → Confirmed → Seated → Completed
           ↓            ↓
        Cancelled   No-show
```

**Action Buttons per Status:**

**Pending:**
- ✅ Confirm
- ✏️ Edit
- ❌ Cancel
- 📞 Call Customer

**Confirmed:**
- ✏️ Edit
- 🪑 Mark as Seated
- ❌ Cancel
- 📧 Send Reminder

**Seated:**
- ✅ Complete
- 🧾 Create Order
- ⏱️ Extend Time

**Completed/Cancelled:**
- 📊 View Details
- 🔁 Create New (for same customer)

### 3.4 Bulk Operations

**Multi-select Support:**
- `Shift + Click` to select range
- `Ctrl/Cmd + Click` to toggle selection
- "Select All" checkbox

**Bulk Actions:**
- ✉️ Send reminder to selected
- ✅ Confirm all selected
- ❌ Cancel selected
- 📄 Export to CSV
- 🖨️ Print reservation list

---

## 4. AVAILABILITY MANAGEMENT

### 4.1 Real-time Availability Check

**Visual Availability Indicator:**
```
Time Slot Availability for Dec 25, 2024:

11:00 AM  ████████░░  80% available (8/10 tables)
12:00 PM  ██████░░░░  60% available (6/10 tables)
 1:00 PM  ████░░░░░░  40% available (4/10 tables)
 2:00 PM  ██████████ 100% available (10/10 tables)
 6:00 PM  ██░░░░░░░░  20% available (2/10 tables)
 7:00 PM  ░░░░░░░░░░   0% available (0/10 tables)
 8:00 PM  ████░░░░░░  40% available (4/10 tables)
```

**Capacity Calculation:**
```javascript
function calculateAvailability(datetime, duration) {
  const reservationStart = datetime;
  const reservationEnd = datetime + duration;
  
  // Get all tables
  const allTables = getTables();
  
  // Check conflicts
  const availableTables = allTables.filter(table => {
    const conflicts = getTableReservations(table.id)
      .filter(res => 
        res.start < reservationEnd && 
        res.end > reservationStart
      );
    
    return conflicts.length === 0;
  });
  
  return {
    total: allTables.length,
    available: availableTables.length,
    percentage: (availableTables.length / allTables.length) * 100
  };
}
```

### 4.2 Table Turnover Tracking

**Turnover Calculation:**
- Average dining duration per table size
- Historical data analysis
- Real-time order status integration
- Predictive availability

**Display:**
```
Table 5 Status Timeline:

10:00 AM ─────────────────────────
         [Reserved] 
11:00 AM ─────────────────────────
         [Seated]
12:30 PM ─────────────────────────
         [Eating]
 1:45 PM ─────────────────────────
         [Available] ← Can book from here
 2:00 PM ─────────────────────────
```

### 4.3 Buffer Time Configuration

**Settings:**
```
┌─────────────────────────────────────┐
│  Reservation Settings               │
├─────────────────────────────────────┤
│  Default Duration:  [2 hours]  ▼    │
│  Buffer Between:    [15 min]   ▼    │
│  Cleanup Time:      [10 min]   ▼    │
│                                     │
│  Max Overlap:       [20%]      ▼    │
│  Allow Overbooking: ☐               │
└─────────────────────────────────────┘
```

**Buffer Types:**
- **Pre-buffer:** Time before reservation (for early arrivals)
- **Post-buffer:** Time after reservation (for cleanup)
- **Turn buffer:** Time between different parties at same table

### 4.4 Waitlist Management

**When Fully Booked:**
```
┌─────────────────────────────────────┐
│  ⚠️  No tables available            │
│                                     │
│  Would you like to:                 │
│  • Add to waitlist                  │
│  • See alternative times            │
│  • Check other floors               │
│                                     │
│  [Add to Waitlist] [Show Options]   │
└─────────────────────────────────────┘
```

**Waitlist Features:**
- Priority queue management
- Automatic notification when table available
- Estimated wait time calculation
- SMS/Email alerts

**Waitlist Display:**
```
🕐 Current Waitlist (7:00 PM)

1. John Smith - 4 guests (Waiting 10 min)
2. Jane Doe - 2 guests (Waiting 5 min)
3. Bob Johnson - 6 guests (Just added)

Estimated wait: 15-25 minutes
```

---

## 5. CUSTOMER MANAGEMENT

### 5.1 Customer Database Integration

**Customer Profile:**
```
┌─────────────────────────────────────────┐
│  👤 John Smith                          │
│  ⭐ VIP Customer                         │
├─────────────────────────────────────────┤
│  📞 (555) 123-4567                      │
│  📧 john@example.com                    │
│  🎂 Birthday: March 15                  │
│                                         │
│  Preferences:                           │
│  • Window seat                          │
│  • Vegetarian options                   │
│  • Allergies: Peanuts                   │
│                                         │
│  History:                               │
│  • Total visits: 23                     │
│  • Last visit: Dec 10, 2024            │
│  • Avg party size: 3 guests            │
│  • Favorite table: Table 5             │
│  • Total spent: $2,340                 │
│                                         │
│  [View Full History] [Edit Profile]    │
└─────────────────────────────────────────┘
```

### 5.2 Customer Search & Autocomplete

**Smart Search:**
- Search by name, phone, email
- Fuzzy matching for typos
- Recent customers first
- VIP customers highlighted

**Autocomplete Example:**
```
Customer Name: [Joh________]
               
Suggestions:
  ⭐ John Smith - (555) 123-4567
     Last visit: 2 days ago
  
  👤 John Doe - (555) 987-6543
     Last visit: 1 week ago
     
  [+ Create new customer]
```

### 5.3 Customer Preferences

**Saved Preferences:**
- Seating location (window, corner, center)
- Floor preference
- Dietary restrictions
- Accessibility needs
- Special occasions (birthdays, anniversaries)

**Auto-apply on Booking:**
```
✨ Applying saved preferences for John Smith:
   • Window seat requested
   • Vegetarian menu preferred
   • Avoid tables near kitchen (noise sensitive)
```

### 5.4 Reservation History

**Customer Timeline:**
```
📅 Reservation History - John Smith

December 2024:
  ✅ Dec 10 - Table 5, 7:00 PM, 3 guests
  ✅ Dec 3  - Table 8, 6:30 PM, 4 guests

November 2024:
  ✅ Nov 20 - Table 5, 7:00 PM, 2 guests
  ❌ Nov 12 - Cancelled
  ✅ Nov 5  - Table 12, 8:00 PM, 4 guests

[Load More]  [Export History]
```

**Stats & Insights:**
- Most frequent booking time
- Average party size
- Cancellation rate
- Preferred tables
- Spending patterns

---

## 6. NOTIFICATION SYSTEM

### 6.1 Automated Notifications

**Notification Types:**

**Confirmation (Immediate):**
```
📧 Email:
Subject: Reservation Confirmed - [Restaurant Name]

Dear John Smith,

Your reservation is confirmed!

📅 Date: December 25, 2024
⏰ Time: 7:00 PM
👥 Party Size: 4 guests
🪑 Table: 5 (Window seat)

Special Requests: Birthday celebration

Looking forward to seeing you!

[Add to Calendar] [View/Modify]
```

**Reminder (24 hours before):**
```
📱 SMS:
Hi John! Reminder: You have a reservation tomorrow at 7:00 PM for 4 guests at [Restaurant]. Reply C to confirm, R to reschedule, or X to cancel.
```

**Reminder (2 hours before):**
```
📧 Email:
Hi John! Your reservation is coming up in 2 hours (7:00 PM). See you soon! Need to make changes? [Click here]
```

**No-show Follow-up:**
```
📧 Email:
Hi John, we missed you yesterday! If something came up, no worries. Would you like to reschedule? [Book again]
```

### 6.2 Staff Notifications

**Internal Alerts:**

**New Reservation:**
```
🔔 New reservation created
   John Smith, 4 guests, Table 5
   Dec 25 at 7:00 PM
   Special: Birthday celebration
   [View Details]
```

**Upcoming Arrival (15 min before):**
```
🔔 Guest arriving soon
   Table 5 - John Smith (4 guests)
   Expected: 7:00 PM (in 15 min)
   Note: Birthday - prepare cake
   [Mark as Arrived]
```

**Late Arrival Warning:**
```
⚠️ Late arrival
   Table 5 - John Smith
   Expected: 7:00 PM (15 min late)
   [Call Customer] [Release Table]
```

### 6.3 Notification Preferences

**Customer Opt-in:**
```
┌─────────────────────────────────────┐
│  Notification Preferences           │
├─────────────────────────────────────┤
│  ☑️ Email notifications             │
│  ☑️ SMS reminders                   │
│  ☐ Push notifications (app)        │
│                                     │
│  Reminder timing:                   │
│  ☑️ 24 hours before                 │
│  ☑️ 2 hours before                  │
│  ☐ 30 minutes before                │
│                                     │
│  [Save Preferences]                 │
└─────────────────────────────────────┘
```

**Staff Notification Settings:**
```
┌─────────────────────────────────────┐
│  Staff Alert Settings               │
├─────────────────────────────────────┤
│  New Reservations:                  │
│  ☑️ Desktop notification            │
│  ☑️ Sound alert                     │
│                                     │
│  Upcoming Arrivals:                 │
│  ☑️ Show 15 min before              │
│  ☑️ Show 5 min before               │
│                                     │
│  Late Arrivals:                     │
│  ☑️ Alert after 10 min              │
│  ☑️ Auto-release after 20 min       │
└─────────────────────────────────────┘
```

### 6.4 Custom Templates

**Email Templates:**
- Confirmation email
- Reminder email
- Cancellation notification
- Special occasion template
- Feedback request

**Template Variables:**
```
Available variables:
  {{customer_name}}
  {{date}}
  {{time}}
  {{party_size}}
  {{table_number}}
  {{special_requests}}
  {{restaurant_name}}
  {{restaurant_phone}}
```

---

## 7. INTEGRATION WITH FLOOR PLAN

### 7.1 Visual Table Selection

**Floor Plan Integration:**
```
┌─────────────────────────────────────┐
│  Select Table from Floor Plan       │
├─────────────────────────────────────┤
│  Date: Dec 25, 2024  Time: 7:00 PM │
│  Party Size: 4 guests               │
│                                     │
│  [Floor Plan Canvas]                │
│                                     │
│  Legend:                            │
│  🟢 Available   🔴 Reserved         │
│  🟡 Soon Free   🔵 Occupied         │
│                                     │
│  Click a green table to select      │
└─────────────────────────────────────┘
```

**Interactive Features:**
- Click available tables to select
- Hover to see table details
- Color-coded availability status
- Time slider to check different times

### 7.2 Real-time Status Sync

**Bidirectional Sync:**
- Reservation updates reflect on floor plan
- Order status affects table availability
- Real-time updates across all views

**Status Colors:**
- 🟢 Green: Available for reservation
- 🟡 Yellow: Reserved (upcoming)
- 🔵 Blue: Currently occupied (seated)
- 🟣 Purple: Reservation + Order active
- 🔴 Red: Blocked/Maintenance

### 7.3 Timeline Overlay

**Show Reservations on Floor Plan:**
```
Table View with Timeline:

Table 5:  [─Reserved─][─Available─][─Reserved─]
          10AM      12PM       2PM        4PM

Click any segment to:
  • View reservation details
  • Book available slot
  • Modify existing reservation
```

---

## 8. REPORTS & ANALYTICS

### 8.1 Reservation Analytics

**Dashboard Metrics:**
```
┌─────────────────────────────────────────┐
│  Reservation Analytics - December 2024  │
├─────────────────────────────────────────┤
│  Total Reservations:     156            │
│  Confirmed:             142 (91%)       │
│  Cancelled:              10 (6%)        │
│  No-shows:                4 (3%)        │
│                                         │
│  Avg Party Size:         3.2 guests     │
│  Total Guests:          499             │
│  Most Popular Time:     7:00 PM         │
│  Most Popular Table:    Table 5         │
│                                         │
│  [View Detailed Report]                 │
└─────────────────────────────────────────┘
```

**Trend Charts:**
- Daily reservation count
- Peak hours heatmap
- Cancellation rate trends
- Capacity utilization

### 8.2 Occupancy Reports

**Daily Occupancy:**
```
Date: December 25, 2024

Time Slot     Tables Used    Capacity
10:00 AM         2/10          20%
11:00 AM         5/10          50%
12:00 PM         8/10          80%
 1:00 PM         9/10          90%
 2:00 PM         6/10          60%
 6:00 PM        10/10         100% ⚠️
 7:00 PM        10/10         100% ⚠️
 8:00 PM         7/10          70%

Average: 72%
Peak: 6:00-8:00 PM (100%)
```

### 8.3 Customer Reports

**Customer Insights:**
- New vs returning customers
- VIP customer activity
- Average spend per reservation
- Customer lifetime value
- Feedback ratings

**Export Options:**
- CSV export
- PDF reports
- Excel format
- Email scheduled reports

### 8.4 Performance Metrics

**Staff Performance:**
- Reservations handled per staff
- Conversion rate (calls to bookings)
- Customer satisfaction scores
- Response time metrics

**Restaurant Performance:**
- Table turnover rate
- Revenue per available seat hour (RevPASH)
- Booking lead time
- Cancellation patterns

---

## 9. ADVANCED FEATURES

### 9.1 Recurring Reservations

**Setup Recurring:**
```
┌─────────────────────────────────────┐
│  Recurring Reservation              │
├─────────────────────────────────────┤
│  Repeat:  [Every Week] ▼            │
│  On:      ☑️ Friday                 │
│  At:      [7:00 PM]                 │
│  For:     [4 guests]                │
│                                     │
│  Start:   [Jan 5, 2025]             │
│  End:     ⦿ After 10 occurrences    │
│           ○ On [date]               │
│           ○ Never                   │
│                                     │
│  [Preview Dates] [Create Series]    │
└─────────────────────────────────────┘
```

**Management:**
- Edit single occurrence
- Edit entire series
- Cancel remaining occurrences
- Skip specific dates

### 9.2 Group Reservations

**Large Party Handling:**
```
┌─────────────────────────────────────┐
│  Group Reservation                  │
├─────────────────────────────────────┤
│  Party Size: [24 guests]            │
│                                     │
│  ⚠️ Large group detected            │
│                                     │
│  Suggested options:                 │
│  • Reserve entire section (6 tables)│
│  • Private room available           │
│  • Request special menu             │
│                                     │
│  Deposit Required: $200             │
│  [Contact for Group Booking]        │
└─────────────────────────────────────┘
```

**Features:**
- Multi-table allocation
- Custom menu options
- Deposit requirements
- Special setup notes

### 9.3 Special Events

**Event Management:**
```
┌─────────────────────────────────────┐
│  Special Event Setup                │
├─────────────────────────────────────┤
│  Event Name: [New Year's Eve]       │
│  Date: [Dec 31, 2024]               │
│  Time: [6:00 PM - 12:00 AM]         │
│                                     │
│  Capacity Override:                 │
│  • Normal: 50 seats                 │
│  • Event: 60 seats (extra setup)    │
│                                     │
│  ☑️ Fixed seating times             │
│  ☑️ Special menu required           │
│  ☑️ Minimum spend: $150/person      │
│                                     │
│  [Create Event] [Block Regular]     │
└─────────────────────────────────────┘
```

### 9.4 Reservation Tags

**Tagging System:**
- 🎂 Birthday
- 💍 Anniversary
- 💼 Business
- 🎉 Celebration
- 🌟 VIP
- 👶 Kids Friendly
- ♿ Accessibility

**Use Cases:**
- Quick filtering
- Special preparation alerts
- Service customization
- Analytics segmentation

### 9.5 Payment Integration

**Deposit Collection:**
```
┌─────────────────────────────────────┐
│  Deposit Required                   │
├─────────────────────────────────────┤
│  Reservation for: 8 guests          │
│  Deposit Amount: $100               │
│                                     │
│  Payment Method:                    │
│  ⦿ Credit Card                      │
│  ○ Debit Card                       │
│                                     │
│  [💳 Enter Card Details]            │
│                                     │
│  Refund Policy:                     │
│  • Full refund if cancelled 24h+    │
│  • 50% refund if cancelled 12-24h   │
│  • No refund if cancelled < 12h     │
│                                     │
│  [Cancel] [Pay Deposit]             │
└─────────────────────────────────────┘
```

**Features:**
- Automatic deposit requirement for large groups
- Payment gateway integration
- Refund management
- Receipt generation

---

## 10. MOBILE & ACCESSIBILITY

### 10.1 Mobile Interface

**Responsive Design:**
```
Mobile View:
┌─────────────────┐
│ [≡] Reservations│
├─────────────────┤
│ [+ New]         │
├─────────────────┤
│ ┌─────────────┐ │
│ │ 7:00 PM     │ │
│ │ John Smith  │ │
│ │ 4 guests    │ │
│ │ Table 5     │ │
│ └─────────────┘ │
├─────────────────┤
│ [Calendar] [→]  │
└─────────────────┘
```

**Touch Gestures:**
- Swipe to navigate dates
- Pull to refresh
- Long press for quick actions
- Pinch to zoom (floor plan)

### 10.2 Accessibility Features

**ARIA Support:**
- Screen reader compatible
- Keyboard navigation
- Focus management
- High contrast mode

**Keyboard Shortcuts:**
```
Ctrl/Cmd + N  : New reservation
Ctrl/Cmd + F  : Search
Ctrl/Cmd + S  : Save changes
Ctrl/Cmd + P  : Print
Arrow Keys    : Navigate calendar
Enter         : Open selected
Esc           : Close dialog
/             : Focus search
```

### 10.3 Offline Support

**Offline Capabilities:**
- View existing reservations
- Create new (sync when online)
- Edit pending changes
- Conflict resolution on sync

**Sync Indicator:**
```
🟢 Online - All synced
🟡 Syncing... (3 changes pending)
🔴 Offline - 5 changes pending
```

---

## 11. SETTINGS & CONFIGURATION

### 11.1 Reservation Settings

**General Settings:**
```
┌─────────────────────────────────────┐
│  Reservation Configuration          │
├─────────────────────────────────────┤
│  Default Duration:   [2 hours]  ▼   │
│  Buffer Time:        [15 min]   ▼   │
│  Max Advance Days:   [90 days]  ▼   │
│                                     │
│  Time Slots:                        │
│  Start: [10:00 AM]  End: [10:00 PM]│
│  Interval: [30 minutes] ▼           │
│                                     │
│  Capacity Settings:                 │
│  ☑️ Allow overbooking (10%)         │
│  ☑️ Enable waitlist                 │
│  ☐ Require deposit for groups 8+   │
│                                     │
│  [Save Settings]                    │
└─────────────────────────────────────┘
```

### 11.2 Cancellation Policy

**Policy Configuration:**
```
┌─────────────────────────────────────┐
│  Cancellation Policy                │
├─────────────────────────────────────┤
│  Allow customer cancellation:       │
│  ☑️ Up to 24 hours before           │
│  ☑️ Up to 12 hours before (fee)     │
│  ☐ Up to 2 hours before (fee)      │
│                                     │
│  Cancellation Fee:                  │
│  24h+:    [No fee]                  │
│  12-24h:  [$25] or [50%] deposit    │
│  < 12h:   [$50] or [100%] deposit   │
│                                     │
│  No-show Policy:                    │
│  • Charge full deposit              │
│  • Mark customer record             │
│  • Require deposit for next booking │
│                                     │
│  [Save Policy] [Preview Message]    │
└─────────────────────────────────────┘
```

### 11.3 User Permissions

**Role-based Access:**
```
┌─────────────────────────────────────┐
│  Staff Role Permissions             │
├─────────────────────────────────────┤
│  Manager:                           │
│  ✅ Create/Edit/Cancel all          │
│  ✅ Access analytics                │
│  ✅ Change settings                 │
│  ✅ Manage waitlist                 │
│                                     │
│  Host/Receptionist:                 │
│  ✅ Create/Edit/Cancel              │
│  ✅ View today's reservations       │
│  ✅ Manage waitlist                 │
│  ❌ Access analytics                │
│  ❌ Change settings                 │
│                                     │
│  Server/Waiter:                     │
│  ✅ View assigned tables            │
│  ✅ Update status (seated/complete) │
│  ❌ Create/Cancel reservations      │
│  ❌ Access full list                │
│                                     │
│  [Save Permissions]                 │
└─────────────────────────────────────┘
```

### 11.4 Integration Settings

**Third-party Integrations:**
```
┌─────────────────────────────────────┐
│  External Integrations              │
├─────────────────────────────────────┤
│  Online Booking Widget:             │
│  ✅ Enabled                          │
│  [Copy Embed Code]                  │
│                                     │
│  Google Calendar Sync:              │
│  ✅ Enabled                          │
│  [Reconnect Account]                │
│                                     │
│  SMS Provider:                      │
│  ⦿ Twilio  ○ Vonage                 │
│  [Configure API Keys]               │
│                                     │
│  Email Service:                     │
│  ⦿ SendGrid  ○ SMTP                 │
│  [Test Connection]                  │
│                                     │
│  Payment Gateway:                   │
│  ☑️ Stripe                           │
│  ☐ PayPal                           │
│  [Manage Keys]                      │
└─────────────────────────────────────┘
```

---

## 12. BEST PRACTICES & WORKFLOWS

### 12.1 Daily Operations

**Morning Routine:**
1. Review today's reservations
2. Confirm all pending reservations
3. Check special requests/notes
4. Verify table setup
5. Send reminders for lunch bookings

**During Service:**
1. Monitor upcoming arrivals (15-30 min view)
2. Update status as guests arrive
3. Manage waitlist actively
4. Handle walk-ins and cancellations
5. Coordinate with kitchen on special orders

**End of Day:**
1. Mark all completed reservations
2. Follow up on no-shows
3. Review tomorrow's bookings
4. Prepare special setup notes
5. Generate daily report

### 12.2 Phone Booking Workflow

**Efficient Phone Script:**
```
1. Greet: "Thank you for calling [Restaurant], 
           how may I help you?"

2. Collect: 
   - Name
   - Phone number
   - Date and time
   - Party size
   - Any special requests

3. Check: Search available tables

4. Confirm: Read back all details

5. Close: "Great! Your reservation is confirmed.
          You'll receive a confirmation email.
          Looking forward to seeing you!"
```

**System Actions:**
- Type as customer speaks
- Use autocomplete for returning customers
- Real-time availability check
- One-click confirmation
- Auto-send confirmation

### 12.3 Handling Conflicts

**Double Booking Resolution:**
```
⚠️  Conflict Detected!
    Table 5 has overlapping reservations:
    
    A) John Smith - 7:00-9:00 PM (existing)
    B) Jane Doe - 8:00-10:00 PM (new)
    
    Options:
    1. Assign Jane to different table (auto-suggest)
    2. Call John to confirm early departure
    3. Add Jane to waitlist
    4. Contact Jane for alternative time
    
    [Resolve Now]
```

### 12.4 VIP Customer Service

**VIP Handling:**
- Automatic recognition when booking
- Priority table assignment
- Personal greeting preparation
- Special amenities ready
- Manager notification
- Post-visit follow-up

---

## 13. TROUBLESHOOTING & FAQ

### 13.1 Common Issues

**Issue: Customer didn't receive confirmation**
```
Solutions:
1. Check spam folder
2. Verify email address
3. Resend confirmation manually
4. Check email service status
5. Use SMS backup notification
```

**Issue: Table appears unavailable but should be free**
```
Solutions:
1. Check for orphaned orders
2. Verify time zone settings
3. Review buffer time configuration
4. Manual refresh of availability
5. Check for system sync issues
```

**Issue: Cannot cancel past reservation**
```
Solution:
Past reservations are locked.
Use "Mark as No-show" or "Mark as Completed" instead.
```

### 13.2 FAQ

**Q: How far in advance can customers book?**
A: Configurable in settings (default: 90 days)

**Q: Can customers book multiple tables?**
A: Yes, for large groups or events

**Q: What happens to deposits if customer cancels?**
A: Follows cancellation policy (configurable)

**Q: Can we block specific times from booking?**
A: Yes, use "Block Time" feature for maintenance/events

**Q: How are walk-ins handled?**
A: Create reservation with status "Walk-in" for tracking

---

## 14. API & WEBHOOKS

### 14.1 Reservation API

**Create Reservation:**
```javascript
POST /api/reservations
{
  "customerName": "John Smith",
  "phone": "5551234567",
  "email": "john@example.com",
  "date": "2024-12-25",
  "time": "19:00",
  "partySize": 4,
  "tableId": 5, // optional
  "specialRequests": "Birthday celebration",
  "floor": 2
}

Response:
{
  "id": "R-2024-001234",
  "status": "confirmed",
  "table": {
    "id": 5,
    "number": "5",
    "floor": 2
  },
  "confirmationCode": "ABC123"
}
```

**Check Availability:**
```javascript
GET /api/reservations/availability
?date=2024-12-25
&time=19:00
&partySize=4
&duration=120

Response:
{
  "available": true,
  "tables": [
    { "id": 5, "capacity": 4, "location": "window" },
    { "id": 8, "capacity": 6, "location": "center" }
  ],
  "alternatives": [
    { "time": "18:30", "tables": 3 },
    { "time": "20:00", "tables": 5 }
  ]
}
```

### 14.2 Webhooks

**Event Subscriptions:**
```
Available webhook events:
- reservation.created
- reservation.updated
- reservation.cancelled
- reservation.confirmed
- reservation.seated
- reservation.completed
- reservation.no_show
```

**Webhook Payload Example:**
```javascript
{
  "event": "reservation.confirmed",
  "timestamp": "2024-12-20T10:30:00Z",
  "data": {
    "reservationId": "R-2024-001234",
    "customerName": "John Smith",
    "phone": "5551234567",
    "date": "2024-12-25",
    "time": "19:00",
    "partySize": 4,
    "tableId": 5,
    "status": "confirmed"
  }
}
```

---

## 15. FUTURE ENHANCEMENTS

### 15.1 Planned Features

**AI-powered Suggestions:**
- Predict no-show probability
- Optimal table assignment
- Dynamic pricing based on demand
- Smart overbooking recommendations

**Customer Self-service:**
- Online booking portal
- Mobile app for customers
- Real-time modification
- Digital check-in

**Advanced Analytics:**
- Predictive demand forecasting
- Revenue optimization
- Customer segmentation
- Marketing campaign integration

**Social Integration:**
- Instagram/Facebook booking
- Social media check-ins
- Review integration
- Influencer tracking

### 15.2 Requested Features

- QR code check-in
- Digital waitlist display
- Multi-location support
- Franchise management
- Gift card integration
- Loyalty program linkage

---

## APPENDIX

### A. Keyboard Shortcuts Reference

```
Global:
  Ctrl/Cmd + N     New reservation
  Ctrl/Cmd + F     Search
  Ctrl/Cmd + ,     Settings
  
Navigation:
  Ctrl/Cmd + 1     Calendar view
  Ctrl/Cmd + 2     Timeline view
  Ctrl/Cmd + 3     List view
  
  Arrow Left/Right Navigate dates
  Home/End         First/Last date
  
Editing:
  Enter            Edit selected
  Delete           Cancel selected
  Esc              Close dialog
  
  Ctrl/Cmd + S     Save changes
  Ctrl/Cmd + Z     Undo
  Ctrl/Cmd + Y     Redo
```

### B. Status Code Reference

```
Reservation Status Codes:
  PENDING      - Awaiting confirmation
  CONFIRMED    - Confirmed by customer/staff
  SEATED       - Customer arrived and seated
  COMPLETED    - Service finished
  CANCELLED    - Cancelled by customer
  NO_SHOW      - Customer didn't arrive
  WALK_IN      - Walk-in customer (no prior reservation)
```

### C. Validation Rules

```
Customer Name:     2-50 characters
Phone Number:      10-15 digits, valid format
Email:             Valid email format (optional)
Party Size:        1-20 guests (configurable)
Date:              Not in past, within advance booking window
Time:              Within operating hours, 30-min intervals
Duration:          30 min - 4 hours (configurable)
Special Requests:  Max 500 characters
```

### D. Database Schema

```sql
CREATE TABLE reservations (
  id SERIAL PRIMARY KEY,
  confirmation_code VARCHAR(10) UNIQUE,
  customer_id INTEGER REFERENCES customers(id),
  table_id INTEGER REFERENCES restaurant_tables(table_id),
  
  reservation_date DATE NOT NULL,
  reservation_time TIME NOT NULL,
  duration INTEGER DEFAULT 120, -- minutes
  party_size INTEGER NOT NULL,
  
  status VARCHAR(20) DEFAULT 'pending',
  special_requests TEXT,
  
  deposit_amount DECIMAL(10,2),
  deposit_paid BOOLEAN DEFAULT false,
  
  created_by INTEGER REFERENCES users(user_id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  cancelled_at TIMESTAMP,
  seated_at TIMESTAMP,
  completed_at TIMESTAMP,
  
  CONSTRAINT valid_party_size CHECK (party_size > 0),
  CONSTRAINT valid_status CHECK (status IN (
    'pending', 'confirmed', 'seated', 
    'completed', 'cancelled', 'no_show'
  ))
);

CREATE INDEX idx_reservations_date_time 
  ON reservations(reservation_date, reservation_time);
  
CREATE INDEX idx_reservations_status 
  ON reservations(status);
  
CREATE INDEX idx_reservations_customer 
  ON reservations(customer_id);
```

---

**Document Version:** 1.0  
**Last Updated:** December 2024  
**Author:** Restaurant Management System Team  
**Status:** ✅ Approved for Implementation
