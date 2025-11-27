# Billing Frontend Specification

## ADDED Requirements

### Requirement: Bill List View
The system SHALL provide a paginated list view of all bills with filtering and search capabilities.

#### Scenario: View bills list
- **WHEN** user navigates to /billing
- **THEN** system displays a grid of bill cards
- **AND** each card shows bill number, table, total amount, and payment status
- **AND** pagination controls are displayed if more than one page

#### Scenario: Filter bills by status
- **WHEN** user selects a payment status filter (pending, paid, refunded, cancelled)
- **THEN** system displays only bills matching that status
- **AND** pagination resets to page 1

#### Scenario: Search bills
- **WHEN** user enters search text
- **THEN** system filters bills by bill number, table number, or order number
- **AND** results update in real-time with debounce

#### Scenario: Empty state
- **WHEN** no bills match the current filters
- **THEN** system displays an empty state message
- **AND** suggests clearing filters

---

### Requirement: Bill Detail View
The system SHALL provide a detailed view of a single bill with all items, calculations, and payment information.

#### Scenario: View bill details
- **WHEN** user clicks on a bill card or navigates to /billing/:id
- **THEN** system displays full bill information including:
  - Bill number and creation date
  - Associated table and order
  - List of all bill items with quantities and prices
  - Bill summary (subtotal, tax, service charge, discount, total)
  - Payment status and history
  - Staff who created the bill

#### Scenario: Bill not found
- **WHEN** user navigates to a non-existent bill ID
- **THEN** system displays a 404 error page
- **AND** provides a link back to bills list

---

### Requirement: Create Bill from Order
The system SHALL allow users to create a bill from a confirmed order.

#### Scenario: Create bill button visibility
- **WHEN** an order has status "confirmed" and no existing bill
- **THEN** system displays "Tạo hóa đơn" button on the order card

#### Scenario: Create bill dialog
- **WHEN** user clicks "Tạo hóa đơn" button
- **THEN** system opens a confirmation dialog showing:
  - Order number and table
  - List of order items
  - Calculated subtotal, tax, and service charge
  - Total amount

#### Scenario: Confirm bill creation
- **WHEN** user confirms bill creation
- **THEN** system calls POST /bills with orderId
- **AND** displays success message
- **AND** redirects to bill detail page or closes dialog

#### Scenario: Bill creation error
- **WHEN** bill creation fails (order already has bill, order not confirmed)
- **THEN** system displays error message with reason
- **AND** dialog remains open for user to dismiss

---

### Requirement: Apply Discount
The system SHALL allow users to apply discounts to pending bills.

#### Scenario: Open discount dialog
- **WHEN** user clicks "Áp dụng giảm giá" on a pending bill
- **THEN** system opens discount dialog with:
  - Toggle between percentage and fixed amount
  - Input field for discount value
  - Required reason field
  - Preview of new total

#### Scenario: Apply percentage discount
- **WHEN** user enters a percentage (e.g., 10%)
- **THEN** system calculates discount amount from subtotal
- **AND** displays new total in real-time

#### Scenario: Apply fixed amount discount
- **WHEN** user enters a fixed amount (e.g., 50000 VND)
- **THEN** system subtracts amount from total
- **AND** validates amount does not exceed subtotal

#### Scenario: Confirm discount
- **WHEN** user confirms discount with valid reason
- **THEN** system calls PATCH /bills/:id/discount
- **AND** updates bill display with new amounts
- **AND** shows success message

#### Scenario: Large discount warning
- **WHEN** discount exceeds 10% of subtotal
- **THEN** system displays warning about manager approval
- **AND** still allows submission (backend logs warning)

#### Scenario: Discount validation error
- **WHEN** discount amount exceeds subtotal or reason is empty
- **THEN** system displays validation error
- **AND** prevents form submission

---

### Requirement: Process Payment
The system SHALL allow users to process payments for pending bills.

#### Scenario: Open payment dialog
- **WHEN** user clicks "Thanh toán" on a pending bill
- **THEN** system opens payment dialog showing:
  - Total amount due
  - Payment method selector (Cash, Card, E-wallet, Transfer)

#### Scenario: Select cash payment
- **WHEN** user selects "Tiền mặt" payment method
- **THEN** system shows input for amount received
- **AND** calculates and displays change amount
- **AND** validates received amount >= total

#### Scenario: Select card payment
- **WHEN** user selects "Thẻ" payment method
- **THEN** system shows optional fields for:
  - Last 4 digits of card
  - Cardholder name
  - Transaction ID

#### Scenario: Select e-wallet or transfer payment
- **WHEN** user selects "Ví điện tử" or "Chuyển khoản"
- **THEN** system shows optional transaction ID field
- **AND** notes field for additional info

#### Scenario: Confirm payment
- **WHEN** user confirms payment with valid amount
- **THEN** system calls POST /bills/:id/payment
- **AND** displays success message with change amount (for cash)
- **AND** updates bill status to "paid"
- **AND** updates order status to "completed"
- **AND** updates table status to "available"

#### Scenario: Payment error
- **WHEN** payment processing fails
- **THEN** system displays error message
- **AND** allows user to retry

---

### Requirement: Void Bill (Admin Only)
The system SHALL allow admin users to void/delete bills.

#### Scenario: Void bill button visibility
- **WHEN** user has admin role
- **THEN** "Hủy hóa đơn" button is visible on bill detail

#### Scenario: Void bill dialog
- **WHEN** admin clicks "Hủy hóa đơn"
- **THEN** system opens dialog with:
  - Required reason field
  - Warning about side effects (order/table status reversal)

#### Scenario: Confirm void
- **WHEN** admin confirms with valid reason
- **THEN** system calls DELETE /bills/:id
- **AND** displays success message
- **AND** redirects to bills list

#### Scenario: Void bill side effects
- **WHEN** a paid bill is voided
- **THEN** order status reverts to "confirmed"
- **AND** table status reverts to "occupied"

---

### Requirement: Bill Status Badge
The system SHALL display clear visual indicators for bill payment status.

#### Scenario: Pending status display
- **WHEN** bill has paymentStatus "pending"
- **THEN** system displays yellow/warning badge with "Chờ thanh toán"

#### Scenario: Paid status display
- **WHEN** bill has paymentStatus "paid"
- **THEN** system displays green/success badge with "Đã thanh toán"

#### Scenario: Refunded status display
- **WHEN** bill has paymentStatus "refunded"
- **THEN** system displays blue/info badge with "Đã hoàn tiền"

#### Scenario: Cancelled status display
- **WHEN** bill has paymentStatus "cancelled"
- **THEN** system displays gray badge with "Đã hủy"

---

### Requirement: Currency Formatting
The system SHALL format all monetary values consistently.

#### Scenario: Display VND currency
- **WHEN** displaying any monetary amount
- **THEN** system formats as Vietnamese Dong (e.g., "150.000 ₫")
- **AND** uses thousands separator (period for Vietnamese locale)

---

### Requirement: Internationalization
The system SHALL support English and Vietnamese languages for all billing UI text.

#### Scenario: Language switching
- **WHEN** user changes language preference
- **THEN** all billing labels, messages, and status texts update
- **AND** currency formatting remains consistent (VND)
