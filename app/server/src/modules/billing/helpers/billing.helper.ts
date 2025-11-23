import { BILLING_CONSTANTS, PaymentMethod } from '../constants/billing.constants';
import { PaymentStatus } from '@prisma/generated/client';

/**
 * Billing Helper Functions
 * Reusable utility functions for billing operations
 */
export class BillingHelper {
    /**
     * Calculate tax amount from subtotal
     */
    static calculateTaxAmount(subtotal: number, taxRate: number): number {
        return Number((subtotal * taxRate).toFixed(2));
    }

    /**
     * Calculate service charge from subtotal
     */
    static calculateServiceCharge(subtotal: number, serviceRate: number): number {
        return Number((subtotal * serviceRate).toFixed(2));
    }

    /**
     * Calculate total amount
     */
    static calculateTotalAmount(
        subtotal: number,
        taxAmount: number,
        serviceCharge: number,
        discountAmount: number = 0,
    ): number {
        return Number((subtotal + taxAmount + serviceCharge - discountAmount).toFixed(2));
    }

    /**
     * Calculate discount percentage from amount
     */
    static calculateDiscountPercentage(discountAmount: number, subtotal: number): number {
        if (subtotal === 0) return 0;
        return Number(((discountAmount / subtotal) * 100).toFixed(2));
    }

    /**
     * Calculate discount amount from percentage
     */
    static calculateDiscountAmount(subtotal: number, percentage: number): number {
        return Number((subtotal * (percentage / 100)).toFixed(2));
    }

    /**
     * Calculate change amount for cash payments
     */
    static calculateChange(paidAmount: number, totalAmount: number): number {
        const change = paidAmount - totalAmount;
        return change > 0 ? Number(change.toFixed(2)) : 0;
    }

    /**
     * Validate discount amount
     */
    static isValidDiscountAmount(discountAmount: number, subtotal: number): boolean {
        return discountAmount >= 0 && discountAmount <= subtotal;
    }

    /**
     * Validate discount percentage
     */
    static isValidDiscountPercentage(percentage: number): boolean {
        return percentage >= 0 && percentage <= BILLING_CONSTANTS.MAX_DISCOUNT_PERCENTAGE;
    }

    /**
     * Check if discount requires manager approval
     */
    static requiresManagerApproval(discountPercentage: number): boolean {
        return discountPercentage > BILLING_CONSTANTS.MANAGER_APPROVAL_THRESHOLD;
    }

    /**
     * Validate payment method
     */
    static isValidPaymentMethod(method: string): method is PaymentMethod {
        return BILLING_CONSTANTS.PAYMENT_METHODS.includes(method as PaymentMethod);
    }

    /**
     * Check if bill can be modified
     */
    static canModifyBill(status: PaymentStatus): boolean {
        return status === PaymentStatus.pending;
    }

    /**
     * Check if bill can be voided
     */
    static canVoidBill(status: PaymentStatus): boolean {
        return status === PaymentStatus.pending;
    }

    /**
     * Check if bill is paid
     */
    static isPaid(status: PaymentStatus): boolean {
        return status === PaymentStatus.paid;
    }

    /**
     * Check if bill is pending
     */
    static isPending(status: PaymentStatus): boolean {
        return status === PaymentStatus.pending;
    }

    /**
     * Format bill number
     */
    static formatBillNumber(billNumber: string): string {
        return `${BILLING_CONSTANTS.BILL_NUMBER_PREFIX}-${billNumber.padStart(BILLING_CONSTANTS.BILL_NUMBER_LENGTH, '0')}`;
    }

    /**
     * Format currency amount
     */
    static formatCurrency(amount: number, currency: string = 'VND'): string {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency,
        }).format(amount);
    }

    /**
     * Validate payment amount matches total
     */
    static isValidPaymentAmount(paymentAmount: number, totalAmount: number): boolean {
        return Math.abs(paymentAmount - totalAmount) < 0.01; // Allow for floating point precision
    }

    /**
     * Check if payment is sufficient
     */
    static isSufficientPayment(paymentAmount: number, totalAmount: number): boolean {
        return paymentAmount >= totalAmount;
    }

    /**
     * Calculate bill summary
     */
    static calculateBillSummary(params: {
        subtotal: number;
        taxRate: number;
        serviceRate: number;
        discountAmount?: number;
    }) {
        const { subtotal, taxRate, serviceRate, discountAmount = 0 } = params;

        const taxAmount = this.calculateTaxAmount(subtotal, taxRate);
        const serviceCharge = this.calculateServiceCharge(subtotal, serviceRate);
        const totalAmount = this.calculateTotalAmount(
            subtotal,
            taxAmount,
            serviceCharge,
            discountAmount,
        );

        return {
            subtotal: Number(subtotal.toFixed(2)),
            taxAmount,
            taxRate,
            serviceCharge,
            serviceRate,
            discountAmount: Number(discountAmount.toFixed(2)),
            totalAmount,
        };
    }

    /**
     * Get payment method display name
     */
    static getPaymentMethodDisplayName(method: PaymentMethod): string {
        const displayNames: Record<PaymentMethod, string> = {
            cash: 'Tiền mặt',
            card: 'Thẻ tín dụng/ghi nợ',
            'e-wallet': 'Ví điện tử',
            transfer: 'Chuyển khoản',
        };
        return displayNames[method] || method;
    }

    /**
     * Get payment status display name
     */
    static getPaymentStatusDisplayName(status: PaymentStatus): string {
        const displayNames: Record<PaymentStatus, string> = {
            [PaymentStatus.pending]: 'Chờ thanh toán',
            [PaymentStatus.paid]: 'Đã thanh toán',
            [PaymentStatus.refunded]: 'Đã hoàn tiền',
            [PaymentStatus.cancelled]: 'Đã hủy',
        };
        return displayNames[status] || status;
    }

    /**
     * Validate tax rate
     */
    static isValidTaxRate(rate: number): boolean {
        return rate >= 0 && rate <= 1;
    }

    /**
     * Validate service rate
     */
    static isValidServiceRate(rate: number): boolean {
        return rate >= 0 && rate <= 1;
    }

    /**
     * Round to 2 decimal places
     */
    static roundAmount(amount: number): number {
        return Number(amount.toFixed(2));
    }
}
