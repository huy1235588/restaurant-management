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

// Payment methods configuration
export const PAYMENT_METHODS: {
    value: PaymentMethod;
    labelKey: string;
    icon: string;
}[] = [
    { value: "cash", labelKey: "billing.paymentMethod.cash", icon: "Banknote" },
    {
        value: "card",
        labelKey: "billing.paymentMethod.card",
        icon: "CreditCard",
    },
    {
        value: "e-wallet",
        labelKey: "billing.paymentMethod.eWallet",
        icon: "Wallet",
    },
    {
        value: "transfer",
        labelKey: "billing.paymentMethod.transfer",
        icon: "ArrowLeftRight",
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
