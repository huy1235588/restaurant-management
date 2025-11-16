# Spec: Customer Management

**Capability:** `customer-management`  
**Change:** `implement-reservation-management`  
**Type:** New Capability

## ADDED Requirements

### Requirement: Customer Profile Creation

The system MUST allow creation and management of customer profiles with contact information, preferences, and history.

#### Scenario: Create customer profile from reservation

**Given** a staff member is creating a reservation for a new customer  
**When** they enter:
  - Name: "John Smith"
  - Phone: "555-123-4567"
  - Email: "john@example.com"
**And** check "Add to customer database"  
**Then** system creates a Customer record  
**And** links the reservation to this customer  
**And** assigns unique customerId

#### Scenario: Prevent duplicate customer profiles

**Given** a customer "John Smith" with phone "555-123-4567" already exists  
**When** staff creates reservation with same phone number  
**Then** system detects existing customer  
**And** shows: "⚠️ Existing customer found: John Smith (Last visit: 2 days ago)"  
**And** auto-links to existing customer profile  
**And** offers: "Update details" or "Create separate profile"

---

### Requirement: Customer Search and Autocomplete

The system MUST provide fast search across customer names, phone numbers, and emails with fuzzy matching.

#### Scenario: Autocomplete during reservation creation

**Given** staff is creating a new reservation  
**When** they type "joh" in the customer name field  
**Then** system shows autocomplete dropdown within 200ms:
  - "⭐ John Smith - (555) 123-4567 - Last visit: 2 days ago"
  - "👤 John Doe - (555) 987-6543 - Last visit: 1 week ago"
  - "+ Create new customer"
**And** prioritizes VIP customers (with ⭐ icon)  
**And** shows recent visit information

#### Scenario: Search by partial phone number

**Given** staff searches for a customer  
**When** they enter phone "123-45"  
**Then** system returns all customers with "12345" in their phone  
**And** displays results with name, full phone, and last visit date

---

### Requirement: Customer Preferences Tracking

The system MUST track and auto-apply customer preferences for seating, dietary restrictions, and special needs.

#### Scenario: Save seating preference

**Given** John Smith always requests window seats  
**When** staff creates John's profile  
**And** enters preferences:
  - Seating: "Window"
  - Dietary: "Vegetarian"
  - Allergies: "Peanuts"
  - Notes: "Noise sensitive"
**Then** preferences are saved to customer profile

#### Scenario: Auto-apply preferences on new reservation

**Given** John Smith has saved preference for window seats  
**When** staff creates a new reservation for John  
**Then** system automatically:
  - Prioritizes window tables in auto-assignment
  - Shows alert: "✨ Customer prefers window seat"
  - Pre-fills dietary restrictions in special requests

---

### Requirement: VIP Customer Designation

The system MUST support marking customers as VIP and provide special handling.

#### Scenario: Mark customer as VIP

**Given** a customer profile exists  
**When** manager clicks "Mark as VIP" button  
**Then** customer profile is flagged: isVip = true  
**And** customer reservations display ⭐ icon in all views  
**And** VIP customers appear at top of search results

#### Scenario: VIP reservation special handling

**Given** a VIP customer creates a reservation  
**When** the reservation is confirmed  
**Then** system sends notification to manager: "VIP reservation - John Smith at 19:00"  
**And** prioritizes best available table (window, quiet location)  
**And** adds note: "Prepare special greeting"

---

### Requirement: Reservation History

The system MUST maintain complete reservation history for each customer.

#### Scenario: View customer reservation history

**Given** John Smith has 23 past reservations  
**When** staff opens John's customer profile  
**And** clicks "Reservation History"  
**Then** system displays chronological list:
  - "✅ Dec 10, 2024 - Table 5, 19:00, 3 guests"
  - "✅ Dec 3, 2024 - Table 8, 18:30, 4 guests"
  - "❌ Nov 12, 2024 - Cancelled"
  - "✅ Nov 5, 2024 - Table 12, 20:00, 4 guests"
**And** shows pagination: "Showing 10 of 23 reservations"  
**And** allows filtering by status and date range

---

### Requirement: Customer Statistics

The system MUST calculate and display customer statistics including visit frequency, spending patterns, and reliability.

#### Scenario: View customer insights

**Given** John Smith's profile is open  
**When** staff views the "Statistics" section  
**Then** system displays:
  - Total visits: 23
  - Last visit: Dec 10, 2024
  - Avg party size: 3 guests
  - Favorite table: Table 5 (window)
  - Cancellation rate: 4% (1 of 23)
  - No-show rate: 0%
  - Most frequent time: 19:00-20:00
  - Total estimated spending: $2,340

---

### Requirement: Birthday and Special Occasion Tracking

The system MUST track customer birthdays and automatically flag reservations near these dates.

#### Scenario: Record customer birthday

**Given** John Smith's birthday is March 15  
**When** staff enters this in customer profile  
**Then** birthday is saved to profile  
**And** becomes available for automatic detection

#### Scenario: Auto-detect birthday reservation

**Given** John Smith's birthday is March 15  
**When** John books reservation for March 14, 15, or 16  
**Then** system automatically adds "Birthday" tag  
**And** shows 🎂 icon on reservation  
**And** suggests: "Prepare birthday cake/special arrangement"  
**And** includes in special occasions count

---

### Requirement: Customer Notes and Flags

Staff MUST be able to add private notes and flags to customer profiles.

#### Scenario: Add staff notes to customer

**Given** staff wants to record important information  
**When** they add note: "Customer is food critic - ensure excellent service"  
**Then** note is saved to customer profile  
**And** displays with alert icon in all future reservations  
**And** only visible to staff (not customer-facing)

#### Scenario: Flag problematic customer

**Given** a customer has history of no-shows  
**When** manager adds flag: "High no-show risk - require deposit"  
**Then** flag is visible to all staff  
**And** system automatically requires deposit for future bookings

---

### Requirement: Customer Contact Preferences

The system MUST respect customer communication preferences for emails, SMS, and phone calls.

#### Scenario: Set notification preferences

**Given** a customer profile  
**When** staff or customer sets preferences:
  - Email notifications: ✓ Enabled
  - SMS reminders: ✓ Enabled
  - Marketing emails: ✗ Disabled
**Then** system only sends enabled notification types  
**And** respects opt-outs for marketing communications

---

### Requirement: Customer Data Export and Privacy

The system MUST support exporting customer data and handle PII in compliance with privacy regulations.

#### Scenario: Export customer data (GDPR request)

**Given** customer requests their data  
**When** manager initiates "Export Customer Data" for John Smith  
**Then** system generates JSON/PDF with:
  - Profile information
  - All reservation history
  - Preferences and notes
  - Communication history
**And** logs export action in audit trail

#### Scenario: Delete customer data

**Given** customer requests account deletion  
**When** manager executes "Delete Customer" action  
**Then** system:
  - Anonymizes historical reservations (removes PII, keeps stats)
  - Deletes contact information
  - Removes preferences and notes
  - Keeps anonymized data for reporting: "Guest #12345"
  - Logs deletion in compliance audit trail

---

### Requirement: Customer Loyalty Tracking

The system MUST identify and reward frequent customers.

#### Scenario: Identify repeat customer

**Given** Jane Doe has made 5 reservations in the past 30 days  
**When** staff views Jane's reservation  
**Then** system displays badge: "🔁 Frequent Guest"  
**And** suggests: "Consider VIP upgrade"

#### Scenario: Track customer lifetime value

**Given** John Smith has visited 23 times  
**And** average spend per visit is estimated at $100  
**When** viewing customer statistics  
**Then** system calculates: "Lifetime Value: $2,300"  
**And** ranks customer in top percentile: "Top 5% customer"

---

### Requirement: Customer Merge and Deduplication

The system MUST support merging duplicate customer profiles.

#### Scenario: Merge duplicate customer profiles

**Given** two profiles exist:
  - Customer A: "John Smith" phone "555-123-4567"
  - Customer B: "J. Smith" phone "555-123-4567"
**When** manager identifies duplicates  
**And** initiates "Merge Profiles"  
**And** selects Customer A as primary  
**Then** system:
  - Merges all reservations to Customer A
  - Combines preference data (keeps most recent)
  - Merges notes and history
  - Deletes Customer B profile
  - Logs merge action: "Merged B→A by Manager on Dec 16"
