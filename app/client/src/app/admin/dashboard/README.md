# Dashboard Page

## Overview
This is the main dashboard page for the Restaurant Management System. It provides an overview of the restaurant's operations with real-time statistics and recent activity.

## Features

### 1. **Statistics Cards**
- **Today's Revenue**: Shows total revenue with percentage change from yesterday
- **Today's Orders**: Displays number of orders with trend indicator
- **Active Orders**: Shows currently processing orders (pending, confirmed, preparing)
- **Tables Status**: Displays occupied vs available tables

### 2. **Tabbed Interface**
The dashboard includes four tabs:

#### Overview Tab
- Quick Statistics: Summary of key metrics
  - Total Orders
  - Active Orders
  - Reservations
  - Revenue
- Table Occupancy: Visual progress bars showing occupied vs available tables

#### Recent Orders Tab
- List of the 5 most recent orders
- Shows order number, table/type, time, amount, and status
- Color-coded status badges

#### Recent Bills Tab
- List of the 5 most recent bills
- Shows bill number, date, amount, and payment status
- Quick overview of payment transactions

#### Reservations Tab
- Today's reservations
- Customer information, party size, date/time
- Status tracking (pending, confirmed, cancelled, etc.)

## Data Sources

The dashboard fetches data from multiple API services:
- `orderApi.getAll()` - Orders data
- `billApi.getAll()` - Bills and payment data
- `tableApi.getAll()` - Table status and availability
- `reservationApi.getAll()` - Reservation information

## Technical Details

### Components Used
- Card components from shadcn/ui
- Tabs for navigation
- Badge for status indicators
- Skeleton for loading states
- Icons from lucide-react

### State Management
- Local state with React hooks
- Fetches data on component mount
- Automatic data aggregation and calculation

### Internationalization
Supports both English and Vietnamese translations through i18next:
- `dashboard.title`
- `dashboard.subtitle`
- `dashboard.stats.*`

## Usage

The dashboard is automatically displayed when admin or manager users log in. It's accessible at the `/dashboard` route for all authenticated users with dashboard access.

## Future Enhancements

Potential improvements:
1. Real-time updates with WebSocket integration
2. Date range filters for historical data
3. Interactive charts (revenue trends, popular items)
4. Export functionality for reports
5. Customizable widgets/cards
6. Comparison with previous periods (week/month)
7. Performance metrics and KPIs
