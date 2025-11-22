import { PaymentMethod, PaymentStatus } from "../types";

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
    [PaymentMethod.CASH]: "Cash",
    [PaymentMethod.CARD]: "Card",
    [PaymentMethod.MOMO]: "MoMo",
    [PaymentMethod.BANK_TRANSFER]: "Bank Transfer",
};

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
    [PaymentStatus.PENDING]: "Pending",
    [PaymentStatus.PAID]: "Paid",
    [PaymentStatus.PARTIAL]: "Partial",
    [PaymentStatus.REFUNDED]: "Refunded",
};

export const PAYMENT_STATUS_COLORS: Record<
    PaymentStatus,
    "default" | "success" | "warning" | "destructive"
> = {
    [PaymentStatus.PENDING]: "warning",
    [PaymentStatus.PAID]: "success",
    [PaymentStatus.PARTIAL]: "default",
    [PaymentStatus.REFUNDED]: "destructive",
};

export function formatCurrency(amount: number): string {
    return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
    }).format(amount);
}

export function calculateChange(paid: number, total: number): number {
    return Math.max(0, paid - total);
}
