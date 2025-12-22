/**
 * Billing Module Constants
 * Centralized configuration and messages for billing operations
 */

/**
 * Billing business rules and configuration
 */
export const BILLING_CONSTANTS = {
    // Pagination
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 20,
    MAX_LIMIT: 100,

    // Tax and charges
    DEFAULT_TAX_RATE: 0.1, // 10%
    DEFAULT_SERVICE_RATE: 0.05, // 5%

    // Discount rules
    MAX_DISCOUNT_PERCENTAGE: 100,
    MANAGER_APPROVAL_THRESHOLD: 10, // Discount > 10% requires manager approval

    // Bill number format
    BILL_NUMBER_PREFIX: 'BILL',
    BILL_NUMBER_LENGTH: 8,

    // Payment methods - Chỉ hỗ trợ tiền mặt và chuyển khoản (có QR)
    PAYMENT_METHODS: ['cash', 'bank_transfer'] as const,

    // Business rules
    MIN_PAYMENT_AMOUNT: 0,
    MAX_NOTES_LENGTH: 1000,
    MAX_DISCOUNT_REASON_LENGTH: 500,
    MAX_PAYMENT_NOTES_LENGTH: 500,

    // Validation
    MIN_SUBTOTAL: 0,
    MIN_TAX_AMOUNT: 0,
    MIN_SERVICE_CHARGE: 0,
} as const;

/**
 * Success messages for billing operations
 */
export const BILLING_MESSAGES = {
    SUCCESS: {
        BILL_CREATED: 'Bill created successfully',
        BILL_RETRIEVED: 'Bill retrieved successfully',
        BILLS_RETRIEVED: 'Bills retrieved successfully',
        DISCOUNT_APPLIED: 'Discount applied successfully',
        PAYMENT_PROCESSED: 'Payment processed successfully',
        BILL_VOIDED: 'Bill voided successfully',
        BILL_UPDATED: 'Bill updated successfully',
    },
    ERROR: {
        // Bill errors
        BILL_NOT_FOUND: 'Bill not found',
        BILL_ALREADY_EXISTS: 'Bill already exists for this order',
        BILL_NOT_PENDING: 'Bill is not pending payment',
        CANNOT_VOID_PAID_BILL:
            'Cannot void a paid bill without proper authorization',

        // Order validation
        ORDER_NOT_FOUND: 'Order not found',
        ORDER_NOT_READY:
            'Order must be ready or being served before creating bill',
        ORDER_ALREADY_HAS_BILL: 'Order already has an associated bill',

        // Discount errors
        INVALID_DISCOUNT_AMOUNT: 'Invalid discount amount',
        DISCOUNT_EXCEEDS_SUBTOTAL: 'Discount amount cannot exceed subtotal',
        DISCOUNT_NEGATIVE: 'Discount amount cannot be negative',
        DISCOUNT_PERCENTAGE_INVALID:
            'Discount percentage must be between 0 and 100',
        REQUIRES_MANAGER_APPROVAL: 'This discount requires manager approval',

        // Payment errors
        INVALID_PAYMENT_AMOUNT: 'Invalid payment amount',
        PAYMENT_AMOUNT_MISMATCH: 'Payment amount must equal total amount',
        PAYMENT_METHOD_INVALID: 'Invalid payment method',
        INSUFFICIENT_PAYMENT: 'Payment amount is less than total amount',

        // Validation errors
        INVALID_TAX_RATE: 'Invalid tax rate',
        INVALID_SERVICE_RATE: 'Invalid service rate',
        INVALID_SUBTOTAL: 'Invalid subtotal amount',
    },
    WARNING: {
        LARGE_DISCOUNT: 'Large discount amount detected',
        MANAGER_APPROVAL_REQUIRED:
            'Manager approval required for this discount',
    },
} as const;

/**
 * Payment method types
 */
export type PaymentMethod = (typeof BILLING_CONSTANTS.PAYMENT_METHODS)[number];
