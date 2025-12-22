import { PaymentMethod, PaymentStatus } from "../types";

/**
 * Billing Module Constants
 */

// Pagination defaults
export const BILLING_CONSTANTS = {
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 20,
    MAX_LIMIT: 100,
} as const;

// Payment methods configuration - Chỉ hỗ trợ tiền mặt và chuyển khoản (có QR)
export const PAYMENT_METHODS: {
    value: PaymentMethod;
    labelKey: string;
    icon: string;
}[] = [
    { value: "cash", labelKey: "billing.paymentMethods.cash", icon: "Banknote" },
    {
        value: "bank_transfer",
        labelKey: "billing.paymentMethods.bank_transfer",
        icon: "QrCode",
    },
];

// Payment status configuration
export const PAYMENT_STATUS_CONFIG: Record<
    PaymentStatus,
    {
        labelKey: string;
        variant: "default" | "secondary" | "destructive" | "outline";
        color: string;
    }
> = {
    pending: {
        labelKey: "billing.status.pending",
        variant: "outline",
        color: "text-yellow-600 border-yellow-600",
    },
    paid: {
        labelKey: "billing.status.paid",
        variant: "default",
        color: "text-green-600 bg-green-100",
    },
    refunded: {
        labelKey: "billing.status.refunded",
        variant: "secondary",
        color: "text-blue-600 bg-blue-100",
    },
    cancelled: {
        labelKey: "billing.status.cancelled",
        variant: "destructive",
        color: "text-gray-600 bg-gray-100",
    },
};

// Messages
export const BILLING_MESSAGES = {
    SUCCESS: {
        BILL_CREATED: "billing.messages.billCreated",
        DISCOUNT_APPLIED: "billing.messages.discountApplied",
        PAYMENT_PROCESSED: "billing.messages.paymentProcessed",
        BILL_VOIDED: "billing.messages.billVoided",
    },
    ERROR: {
        BILL_NOT_FOUND: "billing.errors.billNotFound",
        ORDER_NOT_FOUND: "billing.errors.orderNotFound",
        BILL_ALREADY_EXISTS: "billing.errors.billAlreadyExists",
        INVALID_DISCOUNT: "billing.errors.invalidDiscount",
        INVALID_PAYMENT: "billing.errors.invalidPayment",
        CANNOT_VOID: "billing.errors.cannotVoid",
    },
} as const;

// Query keys for React Query
export const BILLING_QUERY_KEYS = {
    bills: ["bills"] as const,
    bill: (id: number) => ["bills", id] as const,
    billsByOrder: (orderId: number) => ["bills", "order", orderId] as const,
} as const;
