# Reports & Analytics Specification

## ADDED Requirements

### Requirement: Reports Overview Dashboard
The system SHALL provide an overview dashboard displaying key performance indicators (KPIs) for the restaurant.

The dashboard SHALL display:
- Total revenue for the selected period
- Total number of orders
- Total number of reservations
- Average order value
- Comparison with previous period (percentage change)

#### Scenario: Manager views today's overview
- **GIVEN** a manager is logged in
- **WHEN** they navigate to the Reports page
- **THEN** the system SHALL display today's KPIs by default
- **AND** show comparison with yesterday's data

#### Scenario: Manager selects custom date range
- **GIVEN** a manager is on the Reports page
- **WHEN** they select a custom date range (e.g., last 7 days)
- **THEN** the system SHALL recalculate and display KPIs for that period
- **AND** show comparison with the previous equivalent period

---

### Requirement: Revenue Report
The system SHALL provide a revenue report with visual charts showing revenue trends over time.

The report SHALL support:
- Grouping by day, week, or month
- Line chart visualization
- Total revenue and order count per period
- Growth percentage compared to previous period

#### Scenario: View daily revenue for last 7 days
- **GIVEN** a manager selects "Last 7 days" date range
- **WHEN** the revenue chart is displayed
- **THEN** the system SHALL show a line chart with 7 data points
- **AND** each point SHALL represent daily revenue
- **AND** the chart SHALL be interactive (hover for details)

#### Scenario: View monthly revenue trends
- **GIVEN** a manager selects "Last 12 months" 
- **WHEN** they choose "Group by month"
- **THEN** the system SHALL display 12 data points
- **AND** each point SHALL represent total monthly revenue

---

### Requirement: Top Selling Items Report
The system SHALL provide a report showing the top selling menu items.

The report SHALL display:
- Top 10 items by quantity sold (default)
- Item name, quantity sold, and revenue generated
- Horizontal bar chart visualization

#### Scenario: View top 10 items this month
- **GIVEN** a manager selects "This month" date range
- **WHEN** they view the Top Items section
- **THEN** the system SHALL display up to 10 items sorted by quantity sold
- **AND** show revenue contribution for each item

#### Scenario: No sales data available
- **GIVEN** no orders exist in the selected date range
- **WHEN** the Top Items report is loaded
- **THEN** the system SHALL display an empty state message
- **AND** suggest selecting a different date range

---

### Requirement: Payment Methods Report
The system SHALL provide a breakdown of revenue by payment method.

The report SHALL display:
- Pie chart showing percentage distribution
- List with payment method, transaction count, and total amount
- Support for all payment methods: cash, card, momo, bank_transfer

#### Scenario: View payment distribution
- **GIVEN** bills have been paid with various payment methods
- **WHEN** the payment methods report is displayed
- **THEN** the system SHALL show a pie chart with percentage for each method
- **AND** display the total amount and count for each method

---

### Requirement: Orders Analysis Report
The system SHALL provide an analysis of orders including status distribution and peak hours.

The report SHALL support:
- Orders grouped by hour of day (to identify peak hours)
- Orders grouped by status
- Bar chart visualization

#### Scenario: Identify peak hours
- **GIVEN** a manager wants to analyze customer traffic patterns
- **WHEN** they view the Orders by Hour chart
- **THEN** the system SHALL display a bar chart with 24 bars (one per hour)
- **AND** each bar SHALL represent the number of orders placed during that hour

#### Scenario: View order status distribution
- **GIVEN** orders exist with various statuses
- **WHEN** the order status chart is displayed
- **THEN** the system SHALL show distribution across: pending, confirmed, completed, cancelled

---

### Requirement: Date Range Filter
The system SHALL provide a date range filter with preset options and custom selection.

The filter SHALL support:
- Preset options: Today, Last 7 days, Last 30 days, This month
- Custom date range selection with date pickers
- Persistence of selected range within the session

#### Scenario: Select preset date range
- **GIVEN** a user is on the Reports page
- **WHEN** they click on "Last 7 days" preset
- **THEN** all reports SHALL update to show data for the last 7 days
- **AND** the selected preset SHALL be visually highlighted

#### Scenario: Select custom date range
- **GIVEN** a user clicks on "Custom" option
- **WHEN** they select start date and end date
- **AND** click "Apply"
- **THEN** all reports SHALL update to show data for the custom range

---

### Requirement: Reports Access Control
The system SHALL restrict access to reports based on user roles.

Access levels:
- `admin`, `manager`: Full access to all reports
- `cashier`: Access to daily revenue overview only
- `waiter`, `chef`: No access to reports

#### Scenario: Manager accesses reports
- **GIVEN** a user with role "manager" is logged in
- **WHEN** they navigate to /reports
- **THEN** the system SHALL display the full reports dashboard

#### Scenario: Waiter tries to access reports
- **GIVEN** a user with role "waiter" is logged in
- **WHEN** they try to navigate to /reports
- **THEN** the system SHALL redirect to dashboard
- **AND** display an access denied message

---

### Requirement: Reports Localization
The system SHALL support Vietnamese and English languages for all report labels, values, and messages.

#### Scenario: View reports in Vietnamese
- **GIVEN** the user's language is set to Vietnamese
- **WHEN** they view the Reports page
- **THEN** all labels SHALL be displayed in Vietnamese
- **AND** currency SHALL be formatted as VND (e.g., "1.500.000 ₫")
- **AND** dates SHALL use Vietnamese format (e.g., "01/12/2025")

#### Scenario: View reports in English
- **GIVEN** the user's language is set to English
- **WHEN** they view the Reports page
- **THEN** all labels SHALL be displayed in English
- **AND** currency SHALL be formatted as VND with English notation
