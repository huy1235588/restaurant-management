# Implementation Tasks: Reservation Management System (MVP)

**Change ID:** `implement-reservation-management`  
**Status:** Not Started  
**Estimated Effort:** 1-2 weeks (MVP focused)
**Scope:** Core reservation CRUD, availability, email confirmations, basic customer management. Reports, advanced settings, SMS, recurring bookings, and waitlist deferred to Phase 2.

## Phase 1: Database & Backend Foundation (Week 1)

### Database Schema

- [ ] Create `Customer` model in Prisma schema with fields: customerId, name, phoneNumber, email, birthday, preferences (JSON), notes, isVip, createdAt, updatedAt
- [ ] Add unique constraints on Customer phoneNumber and email
- [ ] Extend `Reservation` model with additional fields: customerId (foreign key), createdBy (staffId), confirmedAt, seatedAt, completedAt, cancelledAt, cancellationReason, tags (array)
- [ ] Create database indexes: `reservationDate`, `reservationTime`, `status`, `customerId`, `tableId`, `phoneNumber`
- [ ] Create `ReservationAudit` table for change history: reservationId, action, userId, changes (JSON), timestamp
- [ ] Generate and run Prisma migration: `pnpm prisma migrate dev --name add_reservation_management`
- [ ] Seed database with test data: 5 customers, 10 reservations across different statuses and dates

### Backend API - Core Endpoints

- [ ] Create `/api/reservations` GET endpoint with query filters: date, startDate, endDate, status, tableId, floor, search, page, limit
- [ ] Create `/api/reservations/:id` GET endpoint to fetch single reservation with related data (customer, table)
- [ ] Create `/api/reservations` POST endpoint with validation (Zod schema), conflict detection, and auto-assignment logic
- [ ] Create `/api/reservations/:id` PATCH endpoint with re-validation and change history logging
- [ ] Create `/api/reservations/:id/cancel` POST endpoint with reason tracking
- [ ] Create `/api/reservations/:id/status` POST endpoint for status transitions (confirm, seat, complete, no-show)
- [ ] Implement validation middleware with comprehensive rules: date range, party size, time slots, phone format
- [ ] Add role-based authorization middleware: manager, host, receptionist, waiter permissions

### Backend API - Availability

- [ ] Create `/api/reservations/availability` GET endpoint with real-time conflict checking
- [ ] Implement availability calculation function considering: reservations, active orders, buffer times, table capacity
- [ ] Add alternative time suggestion logic when requested time is unavailable
- [ ] Create buffer time calculation utility function
- [ ] Implement table turnover prediction based on order status and average dining duration
- [ ] Add capacity threshold checking (warn at 90%, block at 100% unless overbooking enabled)

### Backend API - Customers

- [ ] Create `/api/customers` GET endpoint with search and pagination
- [ ] Create `/api/customers/:id` GET endpoint
- [ ] Create `/api/customers` POST endpoint with duplicate detection (phone/email)
- [ ] Create `/api/customers/:id` PATCH endpoint
- [ ] Create `/api/customers/:id/history` GET endpoint returning reservation history
- [ ] Implement customer autocomplete search with fuzzy matching
- [ ] Add customer merge functionality for deduplication

### Backend Services

- [ ] Create `ReservationService` class with business logic methods: create, update, cancel, changeStatus, checkAvailability
- [ ] Create `AvailabilityService` class with: calculateAvailability, suggestAlternatives, autoAssignTable
- [ ] Create `CustomerService` class with: findOrCreate, search, updatePreferences, getHistory
- [ ] Implement auto-assignment algorithm with scoring: capacity match, location preference, previous preference
- [ ] Create recurring reservation logic: generate series, link by recurringGroupId
- [ ] Implement conflict detection with database-level locking (Prisma transactions)
- [ ] Add validation utilities: validateTimeSlot, validateDateRange, validatePartySize

## Phase 2: Frontend - Core UI (Week 2)

### Routing & Layout

- [ ] Create `/reservations` page as main entry point
- [ ] Create `/reservations/new` page for creating reservations
- [ ] Create `/reservations/:id` page for viewing reservation details
- [ ] Create `/reservations/:id/edit` page for editing reservations
- [ ] Add "Reservations" link to main navigation sidebar
- [ ] Create reservation layout component with header and view toggle

### State Management

- [ ] Create Zustand store: `useReservationStore` with state: reservations, selectedDate, viewMode, filters, loading
- [ ] Add store actions: fetchReservations, createReservation, updateReservation, cancelReservation, changeStatus
- [ ] Add store actions: setDate, setViewMode, setFilters
- [ ] Create custom hook: `useReservations` for fetching with filters
- [ ] Create custom hook: `useAvailability` for checking table availability
- [ ] Create custom hook: `useCustomers` for customer search/autocomplete

### Reservation Interface - Calendar View

- [ ] Create `CalendarView` component with day/week/month toggle
- [ ] Implement date navigation with prev/next buttons and date picker
- [ ] Create `ReservationCard` component displaying: time, customer, party size, table, status badge
- [ ] Implement status color coding: green, yellow, blue, gray, red, black per status
- [ ] Add priority indicators: ⭐ VIP, 🎂 Birthday, 👥 Large group, 🔁 Repeat customer
- [ ] Create calendar grid with time slots and reservation placement
- [ ] Add click handlers to open reservation details dialog
- [ ] Implement drag-to-reschedule functionality (optional enhancement)

### Reservation Interface - Timeline View

- [ ] Create `TimelineView` component with table columns and time rows
- [ ] Fetch and display all active tables for selected floor
- [ ] Create time slot grid from opening to closing hours (30-min intervals)
- [ ] Render reservation blocks on timeline with customer name and party size
- [ ] Add floor filter dropdown
- [ ] Implement hover tooltips showing reservation details
- [ ] Add click handler to open/edit reservation

### Reservation Interface - List View

- [ ] Create `ListView` component with sortable, filterable table
- [ ] Implement columns: Time, Customer, Phone, Party Size, Table, Status, Actions
- [ ] Add search bar for filtering by name/phone
- [ ] Add status filter dropdown (multi-select)
- [ ] Add date range picker for filtering
- [ ] Implement sorting by time, customer name, status
- [ ] Add pagination controls (10/25/50 per page)
- [ ] Implement row selection for bulk operations

### Header & Quick Stats

- [ ] Create `ReservationHeader` component with date selector, view toggle, filter panel, create button
- [ ] Create `QuickStats` component showing: total, confirmed, pending, cancelled, no-shows, special occasions
- [ ] Implement real-time stats updates via WebSocket or polling
- [ ] Add keyboard shortcut handler: Ctrl+N for quick create, Ctrl+1/2/3 for view switching

### Create/Edit Reservation Forms

- [ ] Create `ReservationForm` component with multi-step or single-page layout
- [ ] Implement `CustomerSection` with autocomplete search and new customer fields
- [ ] Create `ReservationDetails` section with date, time, duration, party size pickers
- [ ] Implement `TableSelection` section with auto-assign option and manual selection
- [ ] Create table list display showing available tables with capacity, location, floor
- [ ] Add "Show Floor Plan" button to open floor plan selector
- [ ] Implement special requests text area with tag selection (birthday, VIP, business, etc.)
- [ ] Add notification preferences checkboxes (email confirmation, SMS reminder)
- [ ] Implement real-time validation with error messages
- [ ] Add conflict detection feedback showing alternative suggestions
- [ ] Create form submission handler with success/error toast notifications

### Reservation Details & Actions

- [ ] Create `ReservationDetails` dialog/modal showing full reservation info
- [ ] Display customer info, reservation details, table, special requests, status, timestamps
- [ ] Add action buttons based on status and permissions: Edit, Cancel, Mark as Seated, Complete, Send Reminder
- [ ] Implement quick status change buttons with confirmation dialogs
- [ ] Create `ChangeHistory` section showing audit log of modifications
- [ ] Add "Print Reservation" button (optional)

## Phase 3: Frontend - Advanced Features (Week 2-3)

### Floor Plan Integration

- [ ] Import existing `FloorPlanCanvas` component or create integration wrapper
- [ ] Add reservation overlay layer to floor plan showing reservation status colors
- [ ] Implement click handler on floor plan tables to select table during reservation creation
- [ ] Create hover tooltips showing reservation details for reserved tables
- [ ] Add timeline slider to floor plan to preview availability at different times
- [ ] Implement reservation count badges on tables showing daily reservation count
- [ ] Create floor plan quick-create flow: click table → pre-fill form → submit
- [ ] Add multi-table selection mode for large group reservations

### Customer Management UI

- [ ] Create `/customers` page with list view
- [ ] Create `/customers/:id` page showing profile and reservation history
- [ ] Create `CustomerProfile` component with editable fields: name, phone, email, birthday, preferences, notes
- [ ] Implement VIP toggle switch
- [ ] Create `CustomerHistory` component showing past reservations with status, date, party size
- [ ] Add customer statistics display: total visits, favorite table, avg party size, cancellation rate
- [ ] Implement customer search page with filters
- [ ] Create customer merge dialog for deduplication

### Bulk Operations

- [ ] Add multi-select checkboxes to list view rows
- [ ] Create "Select All" checkbox in table header
- [ ] Implement shift-click range selection
- [ ] Create bulk actions dropdown: Confirm Selected, Cancel Selected
- [ ] Implement bulk confirm with progress indicator and success/failure summary
- [ ] Implement bulk cancel with reason input

## Phase 4: Notifications & Integration (Week 2)

### Email Confirmation Only

- [ ] Create `EmailService` class with method: sendConfirmationEmail
- [ ] Create email template for: reservation confirmation
- [ ] Implement template variable substitution: {{customer_name}}, {{date}}, {{time}}, {{table}}, {{partySize}}, {{restaurantName}}
- [ ] Configure email service (SendGrid or SMTP) via environment variables
- [ ] Create email sending utility function with error handling and retry logic
- [ ] Add HTML email template with restaurant branding
- [ ] Implement automatic email sending on reservation creation (if customer email provided)
- [ ] Create `/api/reservations/:id/send-confirmation` endpoint for manual resend
- [ ] Add error handling for failed email delivery (log and store in audit trail)
- [ ] Test email delivery with sample reservations

---

**Notes:**
- SMS notifications, reminders, WebSocket real-time updates, waitlist notifications, and desktop alerts deferred to Phase 2
- Phase 4 focused solely on reliable confirmation email delivery

---

## FUTURE WORK (Deferred to Phase 2)

**These features will NOT be implemented in MVP:**

### Reminders & Updates (Phase 2)
- [ ] 24-hour and 2-hour reminder emails (deferred)
- [ ] SMS reminders and confirmations (deferred)
- [ ] Update notifications for reservations modified (deferred)
- [ ] Cancellation confirmations (deferred)

### Real-time Features (Phase 2)
- [ ] WebSocket event emitters for real-time updates (deferred)
- [ ] Browser desktop notifications (deferred)
- [ ] Notification sound alerts (deferred)
- [ ] Real-time dashboard updates via WebSocket (deferred)

### Advanced Notifications (Phase 2)
- [ ] SMS reply parsing and two-way communication (deferred)
- [ ] Waitlist notifications and auto-alerts (deferred)
- [ ] Staff internal notifications (deferred)
- [ ] No-show follow-up emails (deferred)
- [ ] Emergency broadcast capability (deferred)
- [ ] Notification preferences and templates (deferred)

### Reports & Analytics (Phase 2)
- [ ] Dashboard with reservation metrics (deferred)
- [ ] Occupancy reports and heatmaps (deferred)
- [ ] Customer insights and no-show analysis (deferred)
- [ ] Revenue impact analysis (deferred)
- [ ] Staff performance metrics (deferred)
- [ ] Table utilization reports (deferred)
- [ ] Lead time analysis and demand forecasting (deferred)
- [ ] Report scheduling and export (PDF, CSV, Excel) (deferred)
- [ ] Custom report builder (deferred)

### Advanced Settings (Phase 2)
- [ ] Recurring reservations (daily, weekly, monthly patterns) (deferred)
- [ ] Waitlist queue management (deferred)
- [ ] Deposit tracking and payment integration (deferred)
- [ ] Cancellation policy editor (deferred)
- [ ] No-show fee policies (deferred)
- [ ] Advanced SMS integration with Twilio (deferred)
- [ ] Notification template customization (deferred)

---


### Dashboard

- [ ] Create `/reservations/dashboard` page
- [ ] Create `ReservationDashboard` component with metric cards: total, confirmed, pending, cancelled, no-shows
- [ ] Add date range selector: Today, This Week, This Month, Last 30 Days, Custom
- [ ] Implement week-over-week comparison with change indicators (↑↓→)
- [ ] Create "Special Occasions" section showing birthday/anniversary count
- [ ] Add "Most Popular Time" and "Most Popular Table" metrics
- [ ] Implement real-time dashboard updates via WebSocket

### Occupancy Reports

- [ ] Create `/reservations/reports/occupancy` page
- [ ] Implement time slot breakdown table showing tables used, capacity %, utilization level
- [ ] Create visual occupancy timeline/heatmap with color intensity
- [ ] Add average occupancy calculation
- [ ] Identify and highlight peak hours (90%+ occupancy)
- [ ] Add CSV export functionality

### Customer Insights

- [ ] Create `/reservations/reports/customers` page
- [ ] Display new vs returning customer breakdown
- [ ] Show VIP customer count and activity
- [ ] List top 10 frequent guests with visit counts
- [ ] Calculate customer retention rate
- [ ] Create no-show analysis section: total, customers with multiple no-shows, highest risk times
- [ ] Generate recommendations based on patterns

### Charts & Visualizations

- [ ] Create reservation trend line chart (daily/weekly/monthly totals) using Recharts
- [ ] Create peak hours heatmap by day-of-week and time-slot
- [ ] Create status distribution pie chart (confirmed, pending, cancelled, etc.)
- [ ] Create party size distribution bar chart
- [ ] Create table utilization horizontal bar chart
- [ ] Implement responsive chart sizing for mobile/desktop

### Report Export

- [ ] Create report PDF generation using library (e.g., jsPDF or react-pdf)
- [ ] Implement CSV export for all report types
- [ ] Add "Export" dropdown with format options: PDF, CSV, Excel
- [ ] Create Excel export with basic formatting (optional, using library like xlsx)

## Phase 5: Hardcoded Defaults & Core Settings (Week 2)

### Hardcoded Configuration

The MVP uses hardcoded defaults instead of a configuration UI. These can be changed as environment variables or constants:

- [ ] Set default reservation duration: 2 hours (in `reservationUtils.ts`)
- [ ] Set buffer time between reservations: 15 minutes (in `reservationUtils.ts`)
- [ ] Set max advance booking: 90 days (in `reservationUtils.ts`)
- [ ] Set operating hours: 10:00 AM - 10:00 PM daily (in `reservationUtils.ts`)
- [ ] Set time slot interval: 30 minutes (in `reservationUtils.ts`)
- [ ] Disable overbooking by default (in availability calculation)
- [ ] Disable waitlist feature (remove from UI)
- [ ] Disable deposits feature (remove from schema and UI)
- [ ] Disable recurring reservations (remove from schema and UI)

### User Permissions

- [ ] Implement role-based authorization in API middleware
- [ ] Add permission checks for: Manager (full access), Host/Receptionist (CRUD), Waiter (view-only)
- [ ] Add permission gates in frontend (hide buttons/routes based on role)
- [ ] Test permissions for all three roles

### Email Configuration

- [ ] Add SendGrid API key to environment variables
- [ ] Create configuration helper to validate email service setup
- [ ] Add fallback SMTP configuration option in environment
- [ ] Document required environment variables

---

**Total Tasks (MVP):** 93  
**Completed:** 0  
**Progress:** 0%

**Notes:**
- MVP reduces scope to essential features only, estimated 1-2 weeks
- All advanced features (reports, recurring, waitlist, deposits, SMS, etc.) deferred to Phase 2
- Hardcoded defaults enable fast implementation without configuration UI
- Tasks can be parallelized within phases (backend API and frontend UI simultaneously)
- Dependencies: Phase 2-3 depend on Phase 1 backend completion
- Critical path: Database → Backend API → Frontend Core → Email Integration

---

## DEFERRED FEATURES (Phase 2 Work)

The following features have been intentionally deferred to focus on MVP core functionality:

### Phase 2 - Notifications
- Reminder emails (24h, 2h before)
- SMS confirmations and reminders
- Update notifications
- Cancellation confirmations
- No-show follow-up emails
- Two-way SMS communication with Twilio
- WebSocket real-time updates
- Browser desktop notifications
- Notification preferences UI

### Phase 2 - Recurring & Waitlist
- Recurring reservations (daily/weekly/monthly patterns)
- Waitlist queue management
- Automatic waitlist notifications
- Deposit tracking and fees
- Cancellation policy enforcement
- No-show penalties

### Phase 2 - Reports & Analytics
- Reservation dashboard with metrics
- Occupancy heatmaps and reports
- Customer insights (new vs returning, VIP analysis)
- Revenue impact analysis
- Staff performance tracking
- Table utilization reports
- Lead time and demand forecasting
- Report export (PDF, CSV, Excel)
- Custom report builder
- Real-time analytics updates

### Phase 2 - Settings UI
- Configuration page for all hardcoded values
- Advanced settings interface
- Notification template editor
- Deposit policy configuration
- Feature flag management
- SMS provider setup

