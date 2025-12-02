import { PaymentMethod } from "../types";

/**
 * Format number as VND currency
 */
export function formatCurrency(amount: number): string {
    return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
        maximumFractionDigits: 0,
    }).format(amount);
}

/**
 * Format date time string
 */
export function formatDateTime(dateString: string): string {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    }).format(date);
}

/**
 * Format date only
 */
export function formatDate(dateString: string): string {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    }).format(date);
}

/**
 * Calculate change amount for cash payment
 */
export function calculateChange(paidAmount: number, totalAmount: number): number {
    const change = paidAmount - totalAmount;
    return change > 0 ? change : 0;
}

/**
 * Get payment method label key
 */
export function getPaymentMethodLabel(method: PaymentMethod): string {
    const labels: Record<PaymentMethod, string> = {
        cash: "billing.paymentMethods.cash",
        transfer: "billing.paymentMethods.transfer",
    };
    return labels[method];
}

/**
 * Validate discount amount
 */
export function isValidDiscountAmount(
    amount: number,
    subtotal: number
): boolean {
    return amount >= 0 && amount <= subtotal;
}

/**
 * Validate discount percentage
 */
export function isValidDiscountPercentage(percentage: number): boolean {
    return percentage >= 0 && percentage <= 100;
}

/**
 * Calculate discount amount from percentage
 */
export function calculateDiscountFromPercentage(
    subtotal: number,
    percentage: number
): number {
    return Math.round((subtotal * percentage) / 100);
}
