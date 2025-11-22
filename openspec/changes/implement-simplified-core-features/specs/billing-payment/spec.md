# Billing and Payment Specification

## ADDED Requirements

### Requirement: Create Bill from Completed Order

The system SHALL generate a bill from an order with automatic calculation of totals, taxes, and charges.

#### Scenario: Create bill from order with items

- **WHEN** waiter clicks "Create Bill" button on completed order
- **THEN** system validates order has at least one served item
- **AND** creates Bill record with:
  - billNumber (unique, auto-generated UUID)
  - orderId (FK to Order, unique constraint)
  - tableId (from order)
  - staffId (cashier or waiter)
  - subtotal = SUM(orderItem.totalPrice) for all items
  - taxAmount = subtotal × taxRate (default 10%)
  - serviceCharge = subtotal × serviceRate (default 5%) or fixed amount
  - discountAmount = 0 (default, can be applied separately)
  - totalAmount = subtotal + taxAmount + serviceCharge - discountAmount
  - paymentStatus = 'pending'
- **AND** creates BillItem records for each OrderItem
- **AND** returns bill with all calculated amounts

#### Scenario: Cannot create bill for incomplete order

- **WHEN** order has no items with status = 'served'
- **AND** waiter attempts to create bill
- **THEN** system returns error "Cannot create bill for order with no served items"
- **AND** does not create Bill record

#### Scenario: Prevent duplicate bills

- **WHEN** order already has associated Bill
- **AND** waiter attempts to create another bill
- **THEN** system returns error "Bill already exists for this order"
- **AND** suggests viewing existing bill instead

### Requirement: Apply Discount to Bill

The system SHALL allow applying discounts by percentage or fixed amount before payment.

#### Scenario: Apply percentage discount

- **WHEN** bill is in 'pending' status
- **AND** staff enters discount percentage (e.g., 10%)
- **THEN** system calculates discountAmount = subtotal × (percentage / 100)
- **AND** recalculates totalAmount = subtotal + taxAmount + serviceCharge - discountAmount
- **AND** updates Bill record
- **AND** displays new total on UI

#### Scenario: Apply fixed amount discount

- **WHEN** bill is in 'pending' status
- **AND** staff enters discount amount (e.g., 50,000 VND)
- **THEN** system sets discountAmount = entered amount
- **AND** validates discountAmount <= subtotal (cannot discount more than subtotal)
- **AND** recalculates totalAmount
- **AND** updates Bill record

#### Scenario: Discount requires manager approval for large amounts

- **WHEN** discount > 10% of subtotal OR discountAmount > configured threshold
- **AND** user role is NOT 'manager' or 'admin'
- **THEN** system prompts for manager approval
- **AND** requires manager PIN or authentication
- **AND** logs approval in audit trail
- **AND** applies discount only after approval

#### Scenario: Cannot apply discount to paid bill

- **WHEN** bill paymentStatus = 'paid'
- **AND** staff attempts to apply discount
- **THEN** system returns error "Cannot modify paid bill"
- **AND** suggests void/refund process instead

### Requirement: Single Payment Method per Bill

The system SHALL accept payment using one method per transaction in UI.

#### Scenario: Pay bill with cash

- **WHEN** bill paymentStatus = 'pending'
- **AND** staff selects paymentMethod = 'cash'
- **AND** enters receivedAmount (must equal totalAmount)
- **THEN** system creates Payment record:
  - billId (FK)
  - paymentMethod = 'cash'
  - amount = totalAmount
  - status = 'paid'
  - paymentDate = current timestamp
- **AND** updates Bill:
  - paidAmount = totalAmount
  - changeAmount = receivedAmount - totalAmount
  - paymentStatus = 'paid'
  - paymentMethod = 'cash'
  - paidAt = current timestamp
- **AND** updates Order status to 'completed'
- **AND** updates Table status to 'available'

#### Scenario: Pay bill with card

- **WHEN** staff selects paymentMethod = 'card'
- **AND** swipes card through POS terminal (simulated)
- **AND** enters last 4 digits and cardholder name (optional)
- **AND** transaction approved
- **THEN** system creates Payment record with transactionId
- **AND** updates Bill paymentStatus to 'paid'
- **AND** same downstream updates as cash payment

#### Scenario: Pay bill with mobile wallet

- **WHEN** staff selects paymentMethod = 'momo' or 'bank_transfer'
- **AND** displays QR code or account info to customer
- **AND** customer completes payment externally
- **AND** staff confirms payment received
- **THEN** system creates Payment record
- **AND** marks bill as paid
- **AND** releases table

#### Scenario: Payment amount must equal bill total

- **WHEN** staff enters payment amount ≠ bill.totalAmount
- **THEN** system returns error "Payment amount must equal bill total (no partial payments)"
- **AND** does not process payment
- **AND** prompts to adjust discount or verify amount

### Requirement: No Partial Payments

The system SHALL require full payment of bill total, not accepting partial amounts.

#### Scenario: Partial payment rejected

- **WHEN** bill totalAmount = 500,000 VND
- **AND** staff attempts to record payment of 300,000 VND
- **THEN** system returns error "Partial payments not supported. Please collect full amount."
- **AND** does not create Payment record
- **AND** bill remains paymentStatus = 'pending'

#### Scenario: Split payment workaround documented

- **WHEN** customer wants to split payment (e.g., cash + card)
- **THEN** staff can:
  - Option A: Process as two separate orders/bills beforehand
  - Option B: Accept full amount in one method, customer settles difference externally
  - Option C: Document limitation in training manual
- **AND** system does NOT provide built-in split payment UI

### Requirement: No Split Bill Functionality

The system SHALL enforce one bill per order with no ability to split by person or item.

#### Scenario: One order equals one bill

- **WHEN** order has multiple items for multiple people
- **AND** customers request separate bills
- **THEN** system does NOT provide split bill option
- **AND** staff explains customers must split payment externally
- **AND** creates single bill for full order total

#### Scenario: Workaround for separate billing

- **WHEN** customers want separate bills from the start
- **THEN** staff creates separate orders for each person during ordering phase
- **AND** each order gets its own bill
- **AND** avoids need to split after meal

### Requirement: View Bill Details

The system SHALL display comprehensive bill information for review before payment.

#### Scenario: Display bill summary

- **WHEN** staff opens bill view
- **THEN** system displays:
  - Bill header: billNumber, date, tableNumber, waiter name
  - Item list: itemName, quantity, unitPrice, subtotal for each BillItem
  - Financial summary:
    - Subtotal: XXX,XXX VND
    - Service charge (5%): XX,XXX VND
    - Tax (10%): XX,XXX VND
    - Discount: -XX,XXX VND
    - **Total Amount: XXX,XXX VND** (bold/large font)
  - Payment info: method, status, paid at timestamp
- **AND** formats currency as Vietnamese Dong (no decimals)

#### Scenario: Print bill for customer

- **WHEN** staff clicks "Print Bill" button
- **THEN** system generates thermal printer format (58mm or 80mm)
- **AND** includes restaurant header (name, address, phone)
- **AND** itemized list
- **AND** financial summary
- **AND** footer ("Thank you!" message)
- **AND** sends to connected printer or opens print dialog

### Requirement: Admin-Only Bill Void/Refund

The system SHALL restrict bill cancellation and refunds to admin role only.

#### Scenario: Admin voids paid bill

- **WHEN** user role = 'admin'
- **AND** bill paymentStatus = 'paid'
- **AND** admin clicks "Void Bill" with reason
- **THEN** system prompts for confirmation
- **AND** updates Bill paymentStatus to 'cancelled' or 'refunded'
- **AND** updates Payment status to 'refunded'
- **AND** logs action with userId, reason, timestamp in Winston logs
- **AND** does NOT automatically reverse payment (manual refund process)

#### Scenario: Non-admin cannot void bill

- **WHEN** user role IN ('waiter', 'cashier', 'chef')
- **AND** attempts to void or delete bill
- **THEN** system returns 403 Forbidden error
- **AND** displays message "Only administrators can void bills"
- **AND** does not show void/delete buttons in UI for non-admin users

#### Scenario: Void bill releases table

- **WHEN** admin voids bill
- **AND** bill was associated with table
- **THEN** system updates Table status to 'available'
- **AND** updates linked Order status to 'cancelled' or remains 'completed' with note

### Requirement: Bill List and Search

The system SHALL provide searchable list of all bills with filters.

#### Scenario: View all bills with filters

- **WHEN** staff opens billing management page
- **THEN** system displays paginated bill list
- **AND** shows: billNumber, date, tableNumber, totalAmount, paymentStatus, paymentMethod
- **AND** allows filtering by:
  - Payment status (pending, paid, refunded, cancelled)
  - Date range (today, this week, this month, custom)
  - Payment method (cash, card, momo, bank_transfer)
  - Amount range (min - max)
- **AND** allows sorting by date, amount, status

#### Scenario: Search bill by number or table

- **WHEN** staff enters search term
- **THEN** system searches billNumber (exact/partial) OR tableNumber
- **AND** displays matching bills
- **AND** highlights search term in results

### Requirement: Financial Calculations

The system SHALL accurately calculate all bill amounts according to configured rates.

#### Scenario: Calculate tax amount

- **WHEN** creating or updating bill
- **THEN** system reads taxRate from configuration (default 10% = 0.10)
- **AND** calculates taxAmount = (subtotal + serviceCharge) × taxRate
- **AND** rounds to nearest integer (VND has no cents)
- **AND** stores in bill.taxAmount

#### Scenario: Calculate service charge

- **WHEN** creating bill
- **THEN** system reads serviceRate from configuration (e.g., 5% = 0.05)
- **AND** calculates serviceCharge = subtotal × serviceRate
- **AND** OR uses fixed amount if configured differently
- **AND** stores in bill.serviceCharge

#### Scenario: Calculate final total

- **WHEN** all bill components are set
- **THEN** totalAmount = subtotal + serviceCharge + taxAmount - discountAmount
- **AND** validates totalAmount >= 0 (cannot be negative)
- **AND** updates bill.totalAmount

### Requirement: Payment Record Creation

The system SHALL create immutable payment records for each transaction.

#### Scenario: Create payment record on successful payment

- **WHEN** payment is confirmed
- **THEN** system creates Payment record with:
  - paymentId (auto-increment PK)
  - billId (FK)
  - paymentMethod (cash, card, momo, bank_transfer)
  - amount (equals bill.totalAmount)
  - transactionId (for card/online payments, null for cash)
  - cardNumber (last 4 digits only, if card payment)
  - status = 'paid'
  - paymentDate = current timestamp
- **AND** Payment records are never updated (only created)
- **AND** refunds create new Payment with status = 'refunded'

#### Scenario: Store transaction ID for card payments

- **WHEN** payment method = 'card'
- **AND** POS terminal returns transaction ID
- **THEN** system stores transactionId in Payment record
- **AND** useful for reconciliation and dispute resolution

### Requirement: Bill and Order Status Synchronization

The system SHALL synchronize status between Bill, Payment, Order, and Table.

#### Scenario: Payment completion triggers status updates

- **WHEN** payment is successfully processed
- **THEN** system atomically updates:
  1. Bill: paymentStatus = 'paid', paidAt = now()
  2. Payment: status = 'paid'
  3. Order: status = 'completed', completedAt = now()
  4. Table: status = 'available'
- **AND** uses database transaction to ensure all-or-nothing
- **AND** rolls back if any update fails

#### Scenario: Bill cancellation reverses order completion

- **WHEN** admin voids bill
- **THEN** system updates Order status back to previous state or marks as 'cancelled'
- **AND** logs reason for reversal
- **AND** maintains data integrity

### Requirement: Handle Payment Failures

The system SHALL gracefully handle payment failures and retry logic.

#### Scenario: Card payment declined

- **WHEN** card payment is submitted
- **AND** POS terminal returns decline (insufficient funds, invalid card)
- **THEN** system does NOT create Payment record
- **AND** bill remains paymentStatus = 'pending'
- **AND** displays error message to staff
- **AND** prompts to try different payment method

#### Scenario: Network error during payment

- **WHEN** submitting payment
- **AND** network connection lost or timeout occurs
- **THEN** system does NOT update bill status
- **AND** logs error with Winston
- **AND** prompts staff to verify payment status manually
- **AND** allows retry after network restored

### Requirement: Currency Formatting

The system SHALL format all amounts as Vietnamese Dong without decimals.

#### Scenario: Display amounts in VND format

- **WHEN** showing any bill amount in UI
- **THEN** format as: 123,456 VND or 123.456 VND (depending on locale)
- **AND** no decimal places (VND has no cents)
- **AND** uses thousand separators for readability

#### Scenario: Store amounts as integers or decimals

- **WHEN** storing in database
- **THEN** use Decimal(12, 2) type from Prisma schema
- **AND** store full precision even though VND doesn't use decimals
- **AND** supports future currency changes if needed

### Requirement: Audit Trail for Bill Changes

The system SHALL log all bill modifications and payment transactions.

#### Scenario: Log bill creation

- **WHEN** bill is created
- **THEN** Winston logger records: userId, action = 'bill_created', billId, orderId, totalAmount, timestamp

#### Scenario: Log discount application

- **WHEN** discount is applied
- **THEN** Winston logger records: userId, action = 'discount_applied', billId, discountAmount, reason, timestamp
- **AND** includes manager approval info if applicable

#### Scenario: Log payment transaction

- **WHEN** payment is processed
- **THEN** Winston logger records: userId, action = 'payment_processed', billId, paymentMethod, amount, transactionId, timestamp

#### Scenario: Log bill void/refund

- **WHEN** admin voids bill
- **THEN** Winston logger records: adminUserId, action = 'bill_voided', billId, reason, timestamp
- **AND** includes original payment details for reference

### Requirement: Multiple Payments Support (Schema Only)

The system SHALL support multiple payment records in schema but restrict UI to single payment.

#### Scenario: Database allows 1-to-many Bill to Payment

- **WHEN** database schema defines relationship
- **THEN** Bill 1 → * Payment (one-to-many)
- **AND** schema does NOT enforce single payment constraint
- **AND** future implementations could use multiple payments

#### Scenario: UI enforces single payment only

- **WHEN** creating payment through UI
- **AND** bill already has one Payment record
- **THEN** UI displays error "Bill already paid"
- **AND** does not allow second payment creation
- **AND** backend API could technically support multiple (for future extensibility)

#### Scenario: Query total paid amount

- **WHEN** retrieving bill with multiple payments (future scenario)
- **THEN** system calculates paidAmount = SUM(payment.amount WHERE billId = X)
- **AND** compares to totalAmount to determine if fully paid
- **AND** current implementation always has paidAmount = totalAmount (single payment)
