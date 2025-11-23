# Billing Module Documentation

## Overview

The Billing Module manages the complete billing and payment workflow for restaurant orders. It handles bill creation, discount application, and payment processing with support for multiple payment methods.

## Architecture

### Module Structure

```
billing/
├── constants/
│   └── billing.constants.ts    # Constants and messages
├── dto/
│   ├── create-bill.dto.ts      # Bill creation DTO
│   ├── apply-discount.dto.ts   # Discount application DTO
│   ├── process-payment.dto.ts  # Payment processing DTO
│   ├── bill-filters.dto.ts     # Query/filter DTOs
│   └── index.ts                # DTO exports
├── exceptions/
│   └── billing.exceptions.ts   # Custom exceptions
├── helpers/
│   └── billing.helper.ts       # Utility functions
├── billing.controller.ts       # HTTP endpoints
├── billing.service.ts          # Business logic
├── bill.repository.ts          # Bill data access
├── payment.repository.ts       # Payment data access
├── billing.module.ts           # Module definition
├── index.ts                    # Central exports
└── README.md                   # Documentation
```

## API Endpoints

### Main Endpoints

- **GET** `/bills` - List all bills (paginated)
- **GET** `/bills/:id` - Get bill by ID
- **POST** `/bills` - Create bill from order
- **PATCH** `/bills/:id/discount` - Apply discount to bill
- **POST** `/bills/:id/payment` - Process payment
- **DELETE** `/bills/:id` - Void/delete bill (admin only)

## Key Features

### 1. Bill Creation

Automatically creates bills from orders with:

- Subtotal calculation from order items
- Tax calculation (configurable rate)
- Service charge calculation (configurable rate)
- Bill number generation

### 2. Discount Management

- **Amount-based discounts**: Fixed amount reduction
- **Percentage-based discounts**: Percentage of subtotal
- **Manager approval**: Required for discounts > 10%
- **Discount validation**: Cannot exceed subtotal

### 3. Payment Processing

Supports multiple payment methods:

- **Cash**: With change calculation
- **Card**: Credit/debit card payments
- **E-wallet**: Digital wallet payments
- **Transfer**: Bank transfers

### 4. Business Logic

- **Order status validation**: Only ready/serving orders can be billed
- **Automatic status updates**: Completes order and frees table on payment
- **Single bill per order**: Prevents duplicate billing
- **Audit trail**: Logs all major operations

## Custom Exceptions

### Bill Exceptions

- `BillNotFoundException` - Bill not found
- `BillAlreadyExistsException` - Bill already exists for order
- `BillNotPendingException` - Bill not in pending state
- `CannotVoidPaidBillException` - Cannot void paid bill

### Discount Exceptions

- `InvalidDiscountAmountException` - Invalid discount amount
- `DiscountExceedsSubtotalException` - Discount exceeds subtotal
- `InvalidDiscountPercentageException` - Invalid percentage
- `ManagerApprovalRequiredException` - Manager approval needed

### Payment Exceptions

- `InvalidPaymentAmountException` - Payment amount mismatch
- `InvalidPaymentMethodException` - Invalid payment method
- `InsufficientPaymentException` - Payment less than total

### Validation Exceptions

- `OrderNotReadyForBillingException` - Order not ready

## Helper Functions

### Calculation Helpers

```typescript
BillingHelper.calculateTaxAmount(subtotal, taxRate);
BillingHelper.calculateServiceCharge(subtotal, serviceRate);
BillingHelper.calculateTotalAmount(subtotal, tax, service, discount);
BillingHelper.calculateDiscountPercentage(discountAmount, subtotal);
BillingHelper.calculateDiscountAmount(subtotal, percentage);
BillingHelper.calculateChange(paidAmount, totalAmount);
BillingHelper.calculateBillSummary({
    subtotal,
    taxRate,
    serviceRate,
    discountAmount,
});
```

### Validation Helpers

```typescript
BillingHelper.isValidDiscountAmount(amount, subtotal);
BillingHelper.isValidDiscountPercentage(percentage);
BillingHelper.requiresManagerApproval(discountPercentage);
BillingHelper.isValidPaymentMethod(method);
BillingHelper.isValidPaymentAmount(paymentAmount, totalAmount);
BillingHelper.isSufficientPayment(paymentAmount, totalAmount);
BillingHelper.isValidTaxRate(rate);
BillingHelper.isValidServiceRate(rate);
```

### State Helpers

```typescript
BillingHelper.canModifyBill(status);
BillingHelper.canVoidBill(status);
BillingHelper.isPaid(status);
BillingHelper.isPending(status);
```

### Formatting Helpers

```typescript
BillingHelper.formatBillNumber(billNumber);
BillingHelper.formatCurrency(amount, currency);
BillingHelper.getPaymentMethodDisplayName(method);
BillingHelper.getPaymentStatusDisplayName(status);
BillingHelper.roundAmount(amount);
```

## Constants

### Configuration

```typescript
BILLING_CONSTANTS = {
    DEFAULT_TAX_RATE: 0.1, // 10%
    DEFAULT_SERVICE_RATE: 0.05, // 5%
    MAX_DISCOUNT_PERCENTAGE: 100,
    MANAGER_APPROVAL_THRESHOLD: 10, // 10%
    PAYMENT_METHODS: ['cash', 'card', 'e-wallet', 'transfer'],
    // ... more constants
};
```

### Messages

```typescript
BILLING_MESSAGES.SUCCESS.BILL_CREATED;
BILLING_MESSAGES.SUCCESS.PAYMENT_PROCESSED;
BILLING_MESSAGES.ERROR.BILL_NOT_FOUND;
BILLING_MESSAGES.ERROR.DISCOUNT_EXCEEDS_SUBTOTAL;
BILLING_MESSAGES.WARNING.LARGE_DISCOUNT;
```

## Usage Examples

### 1. Create Bill from Order

```typescript
const createBillDto = {
    orderId: 123,
};

const bill = await billingService.createBill(createBillDto, staffId);
```

### 2. Apply Percentage Discount

```typescript
const discountDto = {
    percentage: 15,
    reason: 'VIP customer discount',
};

const updatedBill = await billingService.applyDiscount(
    billId,
    discountDto,
    userId,
);
```

### 3. Apply Amount Discount

```typescript
const discountDto = {
    amount: 50000,
    reason: 'Promotional discount',
};

const updatedBill = await billingService.applyDiscount(
    billId,
    discountDto,
    userId,
);
```

### 4. Process Cash Payment

```typescript
const paymentDto = {
    amount: 250000,
    paymentMethod: 'cash',
};

const result = await billingService.processPayment(billId, paymentDto, staffId);
// Returns: { payment, bill }
// Change is automatically calculated
```

### 5. Process Card Payment

```typescript
const paymentDto = {
    amount: 250000,
    paymentMethod: 'card',
    cardNumber: '**** 1234',
    cardHolderName: 'NGUYEN VAN A',
    transactionId: 'TXN123456',
};

const result = await billingService.processPayment(billId, paymentDto, staffId);
```

## Bill Calculation Flow

```
1. Get order subtotal (sum of all order items)
   ↓
2. Calculate tax amount (subtotal × tax rate)
   ↓
3. Calculate service charge (subtotal × service rate)
   ↓
4. Apply discount (if any)
   ↓
5. Calculate total = subtotal + tax + service - discount
   ↓
6. On payment: Calculate change (for cash payments)
```

## Workflow

### Complete Billing Flow

```
1. Order Ready/Serving
   ↓
2. Create Bill (POST /bills)
   → Bill status: pending
   → Bill items created from order items
   ↓
3. (Optional) Apply Discount (PATCH /bills/:id/discount)
   → Recalculate total
   ↓
4. Process Payment (POST /bills/:id/payment)
   → Bill status: paid
   → Order status: completed
   → Table status: available
   → Payment record created
```

## Validation Rules

### Bill Creation

- Order must exist
- Order must be in `ready` or `serving` status
- Order cannot already have a bill
- Subtotal must be > 0

### Discount Application

- Bill must be in `pending` status
- Discount amount: 0 ≤ amount ≤ subtotal
- Discount percentage: 0 ≤ percentage ≤ 100
- Discount > 10% triggers manager approval warning

### Payment Processing

- Bill must be in `pending` status
- Payment amount must equal total amount (no partial payments)
- Payment method must be valid
- For cash: change is calculated automatically
- For card: transaction details required

## Error Handling

All errors use custom exceptions with clear context:

```typescript
try {
    await billingService.createBill(dto, staffId);
} catch (error) {
    if (error instanceof BillAlreadyExistsException) {
        // Handle duplicate bill
    } else if (error instanceof OrderNotReadyForBillingException) {
        // Handle order not ready
    } else if (error instanceof ManagerApprovalRequiredException) {
        // Handle large discount approval
    }
}
```

## Best Practices

1. **Always validate order status** before creating bill
2. **Use helper functions** for calculations to ensure consistency
3. **Log large discounts** for audit purposes
4. **Verify payment amount** matches total before processing
5. **Use transactions** for payment processing (order + bill + table updates)
6. **Check permissions** for void operations (admin only)
7. **Include reason** for discounts and voids
8. **Validate payment method** before processing

## Performance Considerations

- Repository uses optimized Prisma queries
- Pagination supported on list endpoints
- Database indexes on: `billId`, `orderId`, `paymentStatus`
- Transactions used for atomic operations
- Number fields use Decimal for precision

## Security Considerations

- **Admin-only operations**: Void bill requires admin role
- **Audit logging**: All major operations logged
- **Discount approval**: Large discounts trigger warnings
- **Payment validation**: Amount verification before processing
- **Authorization**: Staff ID tracked for all operations

## Future Enhancements

- [ ] Partial payment support
- [ ] Multiple payment methods per bill
- [ ] Split billing (multiple bills per order)
- [ ] Refund processing
- [ ] Receipt printing integration
- [ ] Email/SMS receipt delivery
- [ ] Payment gateway integration
- [ ] Loyalty points integration
- [ ] Analytics and reporting
- [ ] Bill templates customization
