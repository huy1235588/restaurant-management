# Implementation Tasks: Reservation System

## 1. Backend Setup (Express + Prisma)

- [ ] 1.1 Verify database schema
  - Confirm `reservations`, `reservation_audits`, `customers`, `restaurant_tables` tables exist
  - Review indexes and relationships in schema.prisma
  - No migrations needed (schema already exists)

- [ ] 1.2 Create reservations feature module structure
  - Create `app/server/src/features/reservations/` directory
  - Create `reservations.types.ts` with TypeScript interfaces
  - Create `reservations.validation.ts` with Zod schemas
  - Create `reservations.service.ts` with business logic
  - Create `reservations.controller.ts` with HTTP handlers

- [ ] 1.3 Define TypeScript types and DTOs
  - CreateReservationDto with all required/optional fields
  - UpdateReservationDto as Partial<CreateReservationDto>
  - ReservationQueryDto for filtering/pagination
  - ReservationResponseDto with nested relations
  - Enum types for ReservationStatus

- [ ] 1.4 Create Zod validation schemas
  - createReservationSchema with field validations
  - updateReservationSchema (all fields optional)
  - queryReservationSchema for GET parameters
  - Validate: phone format, email format, date/time ranges, headCount 1-50, duration 30-480

- [ ] 1.5 Set up reservation routes
  - Add routes in `app/server/src/routes/index.ts`
  - Mount `/api/reservations` router
  - Apply authentication middleware
  - Apply role-based access control middleware

## 2. Backend Business Logic

- [ ] 2.1 Implement Create Reservation service
  - Validate customer inputs with Zod
  - Check if customer exists by phoneNumber, create if not
  - If tableId not provided, auto-assign suitable table
  - Check table availability in time slot (overlap detection)
  - Create reservation with status "pending"
  - Generate unique reservationCode (UUID)
  - Create audit log entry
  - Return reservation with nested table and customer

- [ ] 2.2 Implement table availability check logic
  - Query reservations for given date and time range
  - Calculate overlap: (start1 < end2) AND (start2 < end1)
  - Filter tables by capacity, minCapacity, isActive
  - Optionally filter by floor/section
  - Return list of available tables

- [ ] 2.3 Implement Get Reservations service (with filters)
  - Support pagination (page, limit)
  - Filter by status, date, dateRange, tableId
  - Search by customerName, phoneNumber, reservationCode (case-insensitive)
  - Sort by reservationDate, reservationTime, createdAt, status
  - Include related table and customer data
  - Return paginated response with metadata

- [ ] 2.4 Implement Get Reservation by ID/Code
  - Query by reservationId or reservationCode
  - Include related table, customer, audits
  - Return 404 if not found

- [ ] 2.5 Implement Update Reservation service
  - Validate status (cannot update completed/cancelled)
  - If date/time changed, re-check table availability
  - If tableId changed, validate new table availability and capacity
  - Update fields, save changes
  - Create audit log entry with changes JSON
  - Return updated reservation

- [ ] 2.6 Implement Confirm Reservation service
  - Validate current status is "pending"
  - Update status to "confirmed"
  - Set confirmedAt timestamp
  - Create audit log
  - Return updated reservation

- [ ] 2.7 Implement Check-in (Seat) service
  - Validate current status is "confirmed" (or "pending" if early)
  - Update status to "seated"
  - Set seatedAt timestamp
  - Update table status to "occupied"
  - Create audit log
  - Return updated reservation

- [ ] 2.8 Implement Complete Reservation service
  - Validate current status is "seated"
  - Update status to "completed"
  - Set completedAt timestamp
  - Update table status to "available"
  - Create audit log
  - Return updated reservation

- [ ] 2.9 Implement Cancel Reservation service
  - Validate status is not "completed"
  - Update status to "cancelled"
  - Set cancelledAt timestamp
  - Save cancellationReason if provided
  - Release table (status to "available")
  - Create audit log
  - Return updated reservation

- [ ] 2.10 Implement Mark No-Show service
  - Validate status is "pending" or "confirmed"
  - Update status to "no_show"
  - Set cancelledAt timestamp
  - Release table immediately
  - Increment customer no-show count (if customer record exists)
  - Create audit log
  - Return updated reservation

- [ ] 2.11 Implement Get Reservations by Phone
  - Query reservations by phoneNumber
  - Include all statuses
  - Sort by reservationDate DESC
  - Return array of reservations

- [ ] 2.12 Implement audit logging helper
  - Auto-create ReservationAudit on all changes
  - Capture action type (create, update, confirm, seat, complete, cancel, no_show)
  - Capture userId from JWT token
  - Capture changes as JSON (before/after values)
  - Store timestamp

- [ ] 2.13 Implement customer auto-management
  - Check if customer exists by phoneNumber
  - If exists, link reservation to existing customerId
  - If not, create new Customer with name + phone
  - Update customer name if changed on repeat reservations

## 3. Backend API Endpoints

- [ ] 3.1 POST /api/reservations - Create reservation
  - Validate request body with Zod
  - Call createReservation service
  - Return 201 with created reservation
  - Handle errors: 400 validation, 409 table conflict, 404 table not found

- [ ] 3.2 GET /api/reservations - List reservations (paginated)
  - Parse query parameters (page, limit, status, date, search, sort)
  - Call getReservations service
  - Return 200 with paginated data

- [ ] 3.3 GET /api/reservations/:id - Get reservation by ID
  - Parse reservationId from URL
  - Call getReservationById service
  - Return 200 with reservation or 404 if not found

- [ ] 3.4 GET /api/reservations/code/:code - Get by code
  - Parse reservationCode from URL
  - Call getReservationByCode service
  - Return 200 or 404

- [ ] 3.5 PUT /api/reservations/:id - Update reservation
  - Validate request body
  - Call updateReservation service
  - Return 200 with updated reservation
  - Handle errors: 400, 404, 409

- [ ] 3.6 PATCH /api/reservations/:id/confirm - Confirm
  - Call confirmReservation service
  - Return 200 or 400 if invalid status

- [ ] 3.7 PATCH /api/reservations/:id/seated - Check-in
  - Call seatReservation service
  - Return 200 or 400

- [ ] 3.8 PATCH /api/reservations/:id/complete - Complete
  - Call completeReservation service
  - Return 200 or 400

- [ ] 3.9 PATCH /api/reservations/:id/cancel - Cancel
  - Parse optional reason from body
  - Call cancelReservation service
  - Return 200 or 400/404

- [ ] 3.10 PATCH /api/reservations/:id/no-show - Mark no-show
  - Call markNoShow service
  - Return 200 or 400/404

- [ ] 3.11 GET /api/reservations/check-availability - Check tables
  - Parse date, partySize, duration from query
  - Call checkAvailability service
  - Return 200 with array of available tables

- [ ] 3.12 GET /api/reservations/phone/:phone - Get by phone
  - Parse phone from URL
  - Call getReservationsByPhone service
  - Return 200 with array

- [ ] 3.13 Add role-based access control middleware
  - Admin/Manager: full access to all endpoints
  - Waiter: read, create, confirm, seat, complete (no cancel)
  - Chef/Cashier: read-only
  - Apply middleware to each route

- [ ] 3.14 Add Swagger documentation
  - Document all endpoints with JSDoc comments
  - Include request/response schemas
  - Add example requests and responses
  - Tag endpoints as "reservations"

## 4. Backend Testing & Validation

- [ ] 4.1 Test overlap detection logic
  - Test case: overlapping reservations rejected
  - Test case: adjacent reservations allowed
  - Test case: same table, different times allowed
  - Verify edge cases (start/end boundary)

- [ ] 4.2 Test status transition logic
  - Valid transitions: pending→confirmed→seated→completed
  - Valid transitions: pending/confirmed→cancelled
  - Valid transitions: pending/confirmed→no_show
  - Invalid transitions: completed→anything (rejected)

- [ ] 4.3 Test validation rules
  - Required fields: customerName, phoneNumber, date, time, headCount
  - Format validation: phone 10-11 digits, email valid, time HH:mm
  - Range validation: headCount 1-50, duration 30-480
  - Date validation: must be future

- [ ] 4.4 Test customer auto-creation
  - New phone: creates customer, links reservation
  - Existing phone: reuses customer, links reservation
  - Updated name: updates customer record

- [ ] 4.5 Test audit logging
  - All mutations create audit entries
  - Audit contains action, userId, changes, timestamp
  - Audit visible in get reservation details

- [ ] 4.6 Manual API testing with Postman/Thunder Client
  - Test all endpoints with valid data
  - Test error cases (400, 404, 409)
  - Verify response formats match spec

## 5. Frontend Module Setup

- [ ] 5.1 Create reservations module structure
  - Create `app/client/src/modules/reservations/` directory
  - Create subdirectories: components, views, dialogs, services, hooks, types, utils
  - Create `index.ts` barrel export

- [ ] 5.2 Define TypeScript types
  - Create `types/reservation.types.ts`
  - Define Reservation interface matching backend
  - Define ReservationStatus enum
  - Define CreateReservationDto, UpdateReservationDto
  - Define PaginatedResponse<Reservation>

- [ ] 5.3 Create API service
  - Create `services/reservation.service.ts`
  - Implement all API calls using axios
  - getReservations(params) - GET /api/reservations
  - getReservationById(id) - GET /api/reservations/:id
  - getReservationByCode(code) - GET /api/reservations/code/:code
  - createReservation(data) - POST /api/reservations
  - updateReservation(id, data) - PUT /api/reservations/:id
  - confirmReservation(id) - PATCH /api/reservations/:id/confirm
  - seatReservation(id) - PATCH /api/reservations/:id/seated
  - completeReservation(id) - PATCH /api/reservations/:id/complete
  - cancelReservation(id, reason) - PATCH /api/reservations/:id/cancel
  - markNoShow(id) - PATCH /api/reservations/:id/no-show
  - checkAvailability(date, partySize, duration) - GET /api/reservations/check-availability
  - getReservationsByPhone(phone) - GET /api/reservations/phone/:phone

- [ ] 5.4 Create custom React hooks
  - Create `hooks/useReservations.ts` - Fetch paginated list
  - Create `hooks/useReservationDetail.ts` - Fetch single reservation
  - Create `hooks/useReservationActions.ts` - Mutations (create, update, cancel)
  - Create `hooks/useTableAvailability.ts` - Check available tables
  - Implement loading, error, and data states
  - Implement refetch functionality

- [ ] 5.5 Create utility functions
  - Create `utils/date-helpers.ts` - Format date/time for display
  - Create `utils/status-helpers.ts` - Get status color, label, icon
  - Create `utils/validation-helpers.ts` - Client-side validation

## 6. Frontend Components

- [ ] 6.1 Create ReservationCard component
  - Display reservation summary: code, customer, date/time, table, status
  - Show status badge with color coding
  - Display action buttons based on status and user role
  - Support compact and expanded views

- [ ] 6.2 Create ReservationList component
  - Render list of ReservationCard components
  - Handle empty state with illustration and message
  - Support loading state with skeletons
  - Support error state with retry button

- [ ] 6.3 Create ReservationTable component (alternative to list)
  - Tabular display with sortable columns
  - Columns: Code, Customer, Phone, Date, Time, Table, Status, Actions
  - Row actions dropdown menu
  - Pagination controls

- [ ] 6.4 Create ReservationFilters component
  - Status filter dropdown (all, pending, confirmed, seated, etc.)
  - Date filter: today, tomorrow, this week, custom range
  - Table filter dropdown
  - Search input for name/phone/code
  - Clear all filters button

- [ ] 6.5 Create ReservationStatusBadge component
  - Display status with color coding
  - pending: yellow, confirmed: blue, seated: green, completed: gray, cancelled: red, no_show: red
  - Show icon + label
  - Support tooltip with status description

- [ ] 6.6 Create TableAvailabilityList component
  - Display available tables as cards or list
  - Show table number, capacity, floor, section
  - Highlight preferred table if provided
  - Support table selection
  - Handle empty state (no tables available)

- [ ] 6.7 Create ReservationTimeline component (for detail view)
  - Visual timeline of reservation status changes
  - Show: created → confirmed → seated → completed
  - Display timestamps for each status change
  - Highlight current status

- [ ] 6.8 Create ReservationAuditLog component
  - Display list of audit entries
  - Show action, user, changes, timestamp
  - Format changes JSON as readable diff
  - Collapsible/expandable entries

## 7. Frontend Dialogs

- [ ] 7.1 Create CreateReservationDialog
  - Form with React Hook Form + Zod validation
  - Fields: customerName*, phoneNumber*, email, reservationDate*, reservationTime*, headCount*, specialRequest, notes
  - Auto-assign table button (opens TableAvailabilityList)
  - Manual table selection (dropdown with search)
  - Duration input (default 120 minutes)
  - Submit button with loading state
  - Display validation errors inline
  - On success: show toast, close dialog, refresh list

- [ ] 7.2 Create EditReservationDialog
  - Reuse form from CreateReservationDialog
  - Pre-fill with existing reservation data
  - Disable editing of completed/cancelled reservations
  - Warning when changing date/time (re-check availability)
  - On success: update local state, show toast

- [ ] 7.3 Create ConfirmReservationDialog
  - Simple confirmation dialog
  - Show reservation details (customer, date, time, table)
  - Confirm button to change status to "confirmed"
  - Cancel button
  - On success: update status, show toast

- [ ] 7.4 Create CheckInDialog
  - Display reservation details
  - Show customer info, table number
  - Check-in button to mark as "seated"
  - Handle early/late arrival scenarios
  - On success: update status, navigate to order creation (optional)

- [ ] 7.5 Create CancelReservationDialog
  - Confirmation dialog with reason input
  - Reason textarea (optional)
  - Warning message about cancellation
  - Cancel and Confirm buttons
  - On success: update status, show toast

- [ ] 7.6 Create NoShowDialog
  - Confirmation dialog
  - Warning about marking customer as no-show
  - Display customer's no-show history if available
  - Confirm button
  - On success: update status, release table

- [ ] 7.7 Create CompleteReservationDialog
  - Simple confirmation dialog
  - Show billing summary if order exists
  - Complete button to mark as "completed"
  - On success: release table, show toast

## 8. Frontend Views

- [ ] 8.1 Create ReservationListView
  - Main page for reservations at `/dashboard/reservations`
  - Header with title, create button, filters toggle
  - ReservationFilters component (collapsible)
  - ReservationList or ReservationTable component
  - Pagination controls
  - Loading and error states
  - Empty state with call-to-action button

- [ ] 8.2 Create ReservationDetailView
  - Detail page at `/dashboard/reservations/[id]`
  - Display full reservation information
  - ReservationTimeline component
  - ReservationAuditLog component
  - Action buttons in header (Edit, Cancel, Confirm, Check-in, Complete based on status)
  - Back button to list
  - Handle not found (404) with message

- [ ] 8.3 Create ReservationCalendarView (optional)
  - Calendar display of reservations
  - Monthly view with reservation dots on dates
  - Click date to view reservations for that day
  - Filter by status with color coding
  - Today highlight

## 9. Frontend App Router Integration

- [ ] 9.1 Create reservation pages in App Router
  - Create `app/client/src/app/dashboard/reservations/page.tsx` - List view
  - Create `app/client/src/app/dashboard/reservations/[id]/page.tsx` - Detail view
  - Create `app/client/src/app/dashboard/reservations/layout.tsx` - Shared layout (if needed)

- [ ] 9.2 Add navigation links
  - Update sidebar navigation to include "Reservations" menu item
  - Add icon (Calendar or BookOpen)
  - Highlight active when on reservations route

- [ ] 9.3 Add breadcrumbs
  - Dashboard > Reservations (list)
  - Dashboard > Reservations > [Code] (detail)

## 10. Localization (i18n)

- [ ] 10.1 Add English translations
  - Create keys in `app/client/locales/en.json`
  - reservation.title, reservation.create, reservation.edit, etc.
  - Status labels: pending, confirmed, seated, completed, cancelled, no_show
  - Form labels and placeholders
  - Error messages
  - Success messages

- [ ] 10.2 Add Vietnamese translations
  - Create keys in `app/client/locales/vi.json`
  - Match all keys from English
  - Translate status labels: "Chờ xác nhận", "Đã xác nhận", etc.

- [ ] 10.3 Use translations in components
  - Replace hardcoded strings with `t('reservation.key')`
  - Format dates with locale-aware formatters
  - Test language switching

## 11. Validation & Error Handling

- [ ] 11.1 Implement client-side validation
  - Zod schemas matching backend
  - Validate on form submit
  - Display inline errors under fields
  - Highlight invalid fields with red border

- [ ] 11.2 Implement API error handling
  - Catch 400 validation errors, display field-level errors
  - Catch 404 not found, show user-friendly message
  - Catch 409 conflict, show alternatives if available
  - Catch 500 server error, show generic error with retry
  - Display error toasts for all failed operations

- [ ] 11.3 Implement success feedback
  - Show success toast on create, update, cancel, confirm, etc.
  - Include reservation code in success message
  - Auto-close toasts after 5 seconds
  - Option to undo (if applicable)

## 12. Dashboard & Reports

- [ ] 12.1 Create reservation stats widget for dashboard
  - Display total reservations today
  - Display count by status (pending, confirmed, seated)
  - Display no-show count and rate
  - Link to full reservations list

- [ ] 12.2 Create basic reservation reports
  - Total reservations by date range
  - Reservations by status (pie chart)
  - No-show rate over time (line chart)
  - Popular time slots (bar chart)
  - Use Recharts for visualizations

- [ ] 12.3 Create report filters
  - Date range picker (last 7 days, last 30 days, custom)
  - Status filter
  - Export to CSV button (optional)

## 13. Role-Based UI

- [ ] 13.1 Implement role-based action buttons
  - Show "Create" button only for admin, manager, waiter
  - Show "Cancel" button only for admin, manager
  - Show "Confirm", "Check-in", "Complete" for admin, manager, waiter
  - Hide write operations for chef, cashier (read-only)

- [ ] 13.2 Implement role-based navigation
  - Show "Reservations" menu item for all roles
  - Disable create dialog for read-only roles

## 14. Testing & Quality Assurance

- [ ] 14.1 Manual testing: Create reservation flow
  - Test creating reservation with all fields
  - Test creating with auto-assigned table
  - Test validation errors display correctly
  - Test duplicate phone creates customer correctly

- [ ] 14.2 Manual testing: Update reservation flow
  - Test editing basic fields
  - Test changing date/time validates availability
  - Test changing table validates capacity
  - Test cannot edit completed/cancelled

- [ ] 14.3 Manual testing: Status transition flows
  - pending → confirmed → seated → completed
  - pending → cancelled
  - confirmed → no_show
  - Test invalid transitions are blocked

- [ ] 14.4 Manual testing: Table availability
  - Test overlap detection works correctly
  - Test auto-assignment picks suitable table
  - Test no tables available shows error

- [ ] 14.5 Manual testing: Search and filters
  - Test search by name, phone, code
  - Test filter by status, date, table
  - Test pagination works correctly
  - Test sorting works

- [ ] 14.6 Manual testing: Audit trail
  - Test all changes create audit logs
  - Test audit log displays in detail view
  - Verify timestamps and user info

- [ ] 14.7 Cross-browser testing
  - Test on Chrome, Firefox, Edge, Safari
  - Test responsive design on mobile, tablet, desktop

- [ ] 14.8 Localization testing
  - Test English language
  - Test Vietnamese language
  - Test language switching

- [ ] 14.9 Role-based access testing
  - Test admin can do everything
  - Test manager can do everything
  - Test waiter cannot cancel
  - Test chef/cashier read-only

- [ ] 14.10 Error scenario testing
  - Test network errors with retry
  - Test 404 reservation not found
  - Test 409 table conflict with alternatives
  - Test validation errors display correctly

## 15. Documentation & Polish

- [ ] 15.1 Write feature documentation
  - Document reservation workflow
  - Document status lifecycle
  - Document table availability logic
  - Add screenshots of key screens

- [ ] 15.2 Update API documentation
  - Ensure Swagger docs are complete
  - Add example requests/responses
  - Document error codes

- [ ] 15.3 Polish UI/UX
  - Consistent spacing and typography
  - Smooth transitions and animations
  - Loading states for all async operations
  - Empty states with helpful messages
  - Accessible (keyboard navigation, ARIA labels)

- [ ] 15.4 Performance optimization
  - Debounce search input
  - Virtualize long lists if needed
  - Optimize re-renders with React.memo
  - Cache API responses where appropriate

- [ ] 15.5 Prepare demo data
  - Seed database with sample reservations
  - Create test customers and tables
  - Prepare demo script for presentation

## 16. Final Review & Deployment

- [ ] 16.1 Code review
  - Review backend code for best practices
  - Review frontend code for React best practices
  - Ensure TypeScript types are correct
  - Check for console.log and debug code

- [ ] 16.2 Security review
  - Verify authentication on all endpoints
  - Verify role-based access control works
  - Check for SQL injection vulnerabilities (Prisma protects)
  - Validate all user inputs

- [ ] 16.3 Integration testing
  - Test full flow: create → confirm → seat → complete
  - Test with multiple concurrent reservations
  - Test with edge cases (same time, different tables)

- [ ] 16.4 Documentation finalization
  - Update README with reservation features
  - Document setup instructions
  - Document known limitations (no SMS, no payment)
  - Prepare demo video or slides

- [ ] 16.5 Deployment preparation (if applicable)
  - Ensure environment variables are set
  - Test in production-like environment
  - Prepare rollback plan
  - Monitor logs after deployment

---

**Total Tasks**: 113 (Backend: 30, Frontend: 73, Testing: 10)

**Estimated Effort**: 
- Backend: 2-3 days
- Frontend: 4-5 days
- Testing & Polish: 1-2 days
- **Total: 7-10 days** (for solo developer on graduation project)

**Priority Order**:
1. Backend API (Tasks 1-4) - Core functionality
2. Frontend Basic Views (Tasks 5-9) - Essential UI
3. Status Transitions & Validation (Tasks 11-13) - Business logic
4. Testing & Polish (Tasks 14-16) - Quality assurance
