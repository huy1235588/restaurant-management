# Billing & Payment Module

## Overview
The Billing & Payment module handles bill creation, discount management, and payment processing for restaurant orders with full audit trails.

## Features
- Automatic bill creation from completed orders
- Tax (10%) and service charge (5%) calculation
- Discount management with manager approval warnings
- Multiple payment methods (Cash, Card, Bank Transfer, E-Wallet)
- Change calculation for cash payments
- Full payment only (no partial payments)
- Admin-only bill voiding with audit

## Components

### Views
- **BillListView**: Main view displaying all bills with filtering

### Components
- **PaymentStatusBadge**: Visual status indicator
- **BillSummary**: Detailed bill breakdown with totals

### Dialogs
- **ApplyDiscountDialog**: Form to apply discounts (warns if >10%)
- **ProcessPaymentDialog**: Payment processing with method selection

## Hooks

### Data Fetching
- `useBills(filters?)`: Fetch all bills with optional filters
- `useBill(id)`: Fetch single bill by ID

### Mutations
- `useCreateBill()`: Create bill from order
- `useApplyDiscount()`: Apply discount to bill
- `useProcessPayment()`: Process payment (full amount only)

## Types

### Enums
```typescript
enum PaymentMethod {
  CASH = 'CASH',
  CARD = 'CARD',
  BANK_TRANSFER = 'BANK_TRANSFER',
  E_WALLET = 'E_WALLET'
}

enum PaymentStatus {
  UNPAID = 'UNPAID',
  PARTIALLY_PAID = 'PARTIALLY_PAID',
  PAID = 'PAID',
  VOIDED = 'VOIDED'
}
```

### Interfaces
- `Bill`: Complete bill with items and payments
- `BillItem`: Individual bill line item
- `Payment`: Payment transaction record
- `CreateBillDto`, `ApplyDiscountDto`, `ProcessPaymentDto`: Request DTOs
- `BillFilters`: Filter criteria

## Services
All API calls are handled through `billingApi`:
- `getAll()`, `getById()`, `create()`
- `applyDiscount()`, `processPayment()`, `voidBill()` (admin only)

## Utilities
- `PAYMENT_METHOD_LABELS`: Human-readable payment method labels
- `PAYMENT_STATUS_LABELS/COLORS`: Status labels and badge colors
- `formatCurrency()`: Format amounts as VND
- `calculateChange()`: Calculate change for cash payments

## Workflow
1. **Create Bill**: Order completed → Bill auto-created with tax & service charge
2. **Apply Discount** (Optional): 
   - Staff applies discount → System warns if >10%
   - Discount reason required for audit
3. **Process Payment**: 
   - Select payment method → Enter amount (must equal total)
   - For cash: System calculates change
   - Payment recorded → Bill marked PAID → Table freed
4. **Void Bill** (Admin Only): Manager can void with reason (audit trail)

## Business Rules
- Tax: 10% of subtotal
- Service Charge: 5% of subtotal
- Discounts >10% require manager approval (warning shown)
- No partial payments (must pay full amount)
- Voiding requires admin role and reason

## Integration Points
- **Order Module**: Bills created from completed orders
- **Table Module**: Tables freed upon payment completion
- **Backend**: BillingService with rate configuration via ConfigService

## Usage Example
```typescript
import { BillListView } from '@/modules/billing';

export default function BillingPage() {
  return <BillListView />;
}
```

## Audit & Compliance
- All discounts logged with reason
- Payment transactions immutable
- Bill void creates audit entry
- Full payment history maintained
