import {
    NotFoundException,
    BadRequestException,
    ConflictException,
    ForbiddenException,
} from '@nestjs/common';
import { BILLING_MESSAGES } from '../constants/billing.constants';

/**
 * Bill not found exception
 */
export class BillNotFoundException extends NotFoundException {
    constructor(billId: number) {
        super({
            message: BILLING_MESSAGES.ERROR.BILL_NOT_FOUND,
            error: 'Bill Not Found',
            billId,
        });
    }
}

/**
 * Bill already exists exception
 */
export class BillAlreadyExistsException extends ConflictException {
    constructor(orderId: number) {
        super({
            message: BILLING_MESSAGES.ERROR.BILL_ALREADY_EXISTS,
            error: 'Bill Already Exists',
            orderId,
        });
    }
}

/**
 * Order not ready for billing exception
 */
export class OrderNotReadyForBillingException extends BadRequestException {
    constructor(orderId: number, currentStatus: string) {
        super({
            message: BILLING_MESSAGES.ERROR.ORDER_NOT_READY,
            error: 'Order Not Ready',
            orderId,
            currentStatus,
        });
    }
}

/**
 * Bill not pending exception
 */
export class BillNotPendingException extends BadRequestException {
    constructor(billId: number, currentStatus: string) {
        super({
            message: BILLING_MESSAGES.ERROR.BILL_NOT_PENDING,
            error: 'Bill Not Pending',
            billId,
            currentStatus,
        });
    }
}

/**
 * Invalid discount amount exception
 */
export class InvalidDiscountAmountException extends BadRequestException {
    constructor(amount: number, subtotal: number) {
        super({
            message: BILLING_MESSAGES.ERROR.INVALID_DISCOUNT_AMOUNT,
            error: 'Invalid Discount Amount',
            amount,
            subtotal,
            details: 'Discount amount must be between 0 and subtotal',
        });
    }
}

/**
 * Discount exceeds subtotal exception
 */
export class DiscountExceedsSubtotalException extends BadRequestException {
    constructor(discountAmount: number, subtotal: number) {
        super({
            message: BILLING_MESSAGES.ERROR.DISCOUNT_EXCEEDS_SUBTOTAL,
            error: 'Discount Exceeds Subtotal',
            discountAmount,
            subtotal,
        });
    }
}

/**
 * Invalid discount percentage exception
 */
export class InvalidDiscountPercentageException extends BadRequestException {
    constructor(percentage: number) {
        super({
            message: BILLING_MESSAGES.ERROR.DISCOUNT_PERCENTAGE_INVALID,
            error: 'Invalid Discount Percentage',
            percentage,
        });
    }
}

/**
 * Manager approval required exception
 */
export class ManagerApprovalRequiredException extends ForbiddenException {
    constructor(discountPercentage: number, threshold: number) {
        super({
            message: BILLING_MESSAGES.ERROR.REQUIRES_MANAGER_APPROVAL,
            error: 'Manager Approval Required',
            discountPercentage,
            threshold,
        });
    }
}

/**
 * Invalid payment amount exception
 */
export class InvalidPaymentAmountException extends BadRequestException {
    constructor(paymentAmount: number, totalAmount: number) {
        super({
            message: BILLING_MESSAGES.ERROR.PAYMENT_AMOUNT_MISMATCH,
            error: 'Invalid Payment Amount',
            paymentAmount,
            totalAmount,
        });
    }
}

/**
 * Invalid payment method exception
 */
export class InvalidPaymentMethodException extends BadRequestException {
    constructor(method: string, validMethods: readonly string[]) {
        super({
            message: BILLING_MESSAGES.ERROR.PAYMENT_METHOD_INVALID,
            error: 'Invalid Payment Method',
            providedMethod: method,
            validMethods,
        });
    }
}

/**
 * Cannot void paid bill exception
 */
export class CannotVoidPaidBillException extends ForbiddenException {
    constructor(billId: number, billNumber: string) {
        super({
            message: BILLING_MESSAGES.ERROR.CANNOT_VOID_PAID_BILL,
            error: 'Cannot Void Paid Bill',
            billId,
            billNumber,
        });
    }
}

/**
 * Insufficient payment exception
 */
export class InsufficientPaymentException extends BadRequestException {
    constructor(paymentAmount: number, totalAmount: number) {
        super({
            message: BILLING_MESSAGES.ERROR.INSUFFICIENT_PAYMENT,
            error: 'Insufficient Payment',
            paymentAmount,
            totalAmount,
            shortfall: totalAmount - paymentAmount,
        });
    }
}
