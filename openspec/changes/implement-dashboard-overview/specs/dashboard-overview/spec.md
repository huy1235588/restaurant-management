# Dashboard Overview Specification

## ADDED Requirements

### Requirement: Dashboard Today Stats
The dashboard SHALL display key performance indicators (KPIs) for the current day including total revenue, total orders, total reservations, and comparison percentages with the previous day.

#### Scenario: View today's KPIs
- **GIVEN** user is authenticated as admin or manager
- **WHEN** user navigates to `/admin/dashboard`
- **THEN** the system SHALL display today's revenue, orders count, and reservations count
- **AND** each KPI SHALL show percentage change compared to yesterday

#### Scenario: KPIs loading state
- **GIVEN** user navigates to dashboard
- **WHEN** data is being fetched
- **THEN** skeleton loaders SHALL be displayed for each KPI card

### Requirement: Dashboard Real-time Status
The dashboard SHALL display current operational status including table availability and kitchen queue summary.

#### Scenario: View table status summary
- **GIVEN** user is on dashboard page
- **WHEN** table data is loaded
- **THEN** the system SHALL display count of tables by status (available, occupied, reserved, maintenance)
- **AND** display visual indicators (icons/colors) for each status

#### Scenario: View kitchen queue summary
- **GIVEN** user is on dashboard page
- **WHEN** kitchen data is loaded
- **THEN** the system SHALL display count of orders in kitchen queue
- **AND** group by status (pending, preparing, ready)

### Requirement: Dashboard Quick Actions
The dashboard SHALL provide quick action buttons for common operations accessible to users based on their role permissions.

#### Scenario: Admin/Manager quick actions
- **GIVEN** user is authenticated as admin or manager
- **WHEN** user views dashboard
- **THEN** quick actions SHALL include: Create Order, Create Reservation, View Kitchen, View Reports

#### Scenario: Quick action navigation
- **GIVEN** user clicks a quick action button
- **WHEN** the action is triggered
- **THEN** user SHALL be navigated to the corresponding page

### Requirement: Dashboard Recent Activity
The dashboard SHALL display a timeline of recent activities in the restaurant.

#### Scenario: View recent activities
- **GIVEN** user is on dashboard page
- **WHEN** activity data is loaded
- **THEN** the system SHALL display up to 10 most recent activities
- **AND** each activity SHALL show type (order/reservation/payment), description, timestamp, and status

#### Scenario: Activity types
- **GIVEN** recent activity is displayed
- **WHEN** user views the activity list
- **THEN** activities SHALL include new orders, reservation changes, and completed payments
- **AND** each type SHALL have a distinct icon/color

### Requirement: Dashboard API Endpoints
The backend SHALL provide API endpoints for dashboard data aggregation.

#### Scenario: Get dashboard status
- **GIVEN** authenticated request to `GET /api/v1/dashboard/status`
- **WHEN** request is valid
- **THEN** response SHALL include table summary (counts by status) and kitchen queue summary

#### Scenario: Get recent activity
- **GIVEN** authenticated request to `GET /api/v1/dashboard/recent-activity`
- **WHEN** request includes optional `limit` parameter
- **THEN** response SHALL include array of recent activities with type, description, timestamp, and related entity info

### Requirement: Dashboard Responsive Layout
The dashboard SHALL be responsive and display properly on different screen sizes.

#### Scenario: Desktop layout
- **GIVEN** viewport width >= 1024px
- **WHEN** user views dashboard
- **THEN** content SHALL be arranged in multi-column grid layout

#### Scenario: Mobile layout
- **GIVEN** viewport width < 768px
- **WHEN** user views dashboard
- **THEN** content SHALL stack vertically with appropriate spacing
