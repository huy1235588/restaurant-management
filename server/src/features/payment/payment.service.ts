import { PaymentStatus, PaymentMethod } from '@prisma/client';
import { prisma } from '@/config/database';
import billRepository from '@/features/bill/bill.repository';
import { NotFoundError, BadRequestError } from '@/shared/utils/errors';

interface PaymentFilters {
    billId?: number;
    status?: PaymentStatus;
    paymentMethod?: PaymentMethod;
}

interface CreatePaymentData {
    billId: number;
    paymentMethod: PaymentMethod;
    amount: number;
    transactionId?: string;
    cardNumber?: string;
    cardHolderName?: string;
    status?: PaymentStatus;
    notes?: string;
}

interface ProcessPaymentData {
    billId: number;
    paymentMethod: PaymentMethod;
    amount: number;
    transactionId?: string;
    cardNumber?: string;
    cardHolderName?: string;
}

export class PaymentService {
    /**
     * Get all payments
     */
    async getAllPayments(filters: PaymentFilters = {}) {
        return prisma.payment.findMany({
            where: {
                ...(filters.billId && { billId: filters.billId }),
                ...(filters.status && { status: filters.status }),
                ...(filters.paymentMethod && { paymentMethod: filters.paymentMethod }),
            },
            include: {
                bill: {
                    include: {
                        order: true,
                        table: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
    }

    /**
     * Get payment by ID
     */
    async getPaymentById(paymentId: number) {
        const payment = await prisma.payment.findUnique({
            where: { paymentId },
            include: {
                bill: {
                    include: {
                        order: true,
                        table: true,
                    },
                },
            },
        });

        if (!payment) {
            throw new NotFoundError('Payment not found');
        }

        return payment;
    }

    /**
     * Create new payment
     */
    async createPayment(data: CreatePaymentData) {
        // Check if bill exists
        const bill = await billRepository.findById(data.billId);

        if (!bill) {
            throw new NotFoundError('Bill not found');
        }

        if (bill.paymentStatus === 'paid') {
            throw new BadRequestError('Bill is already paid');
        }

        return prisma.payment.create({
            data: {
                ...data,
                paymentDate: new Date(),
            },
            include: {
                bill: true,
            },
        });
    }

    /**
     * Process payment
     */
    async processPayment(data: ProcessPaymentData) {
        const bill = await billRepository.findById(data.billId);

        if (!bill) {
            throw new NotFoundError('Bill not found');
        }

        if (bill.paymentStatus === 'paid') {
            throw new BadRequestError('Bill is already paid');
        }

        // Create payment record
        const payment = await prisma.payment.create({
            data: {
                ...data,
                status: 'paid',
                paymentDate: new Date(),
            },
        });

        // Update bill payment status and amounts
        const newPaidAmount = Number(bill.paidAmount) + data.amount;
        const changeAmount = newPaidAmount > Number(bill.totalAmount)
            ? newPaidAmount - Number(bill.totalAmount)
            : 0;

        await billRepository.update(data.billId, {
            paidAmount: newPaidAmount,
            changeAmount,
            paymentStatus: newPaidAmount >= Number(bill.totalAmount) ? 'paid' : 'pending',
            paymentMethod: data.paymentMethod,
            paidAt: newPaidAmount >= Number(bill.totalAmount) ? new Date() : undefined,
        } as any);

        return this.getPaymentById(payment.paymentId);
    }

    /**
     * Refund payment
     */
    async refundPayment(paymentId: number, reason?: string) {
        const payment = await this.getPaymentById(paymentId);

        if (payment.status === 'refunded') {
            throw new BadRequestError('Payment is already refunded');
        }

        if (payment.status !== 'paid') {
            throw new BadRequestError('Only paid payments can be refunded');
        }

        // Update payment status
        await prisma.payment.update({
            where: { paymentId },
            data: {
                status: 'refunded',
                notes: reason ? `Refunded: ${reason}` : 'Refunded',
            },
        });

        // Update bill payment status
        const bill = await billRepository.findById(payment.billId);

        if (bill) {
            const newPaidAmount = Number(bill.paidAmount) - Number(payment.amount);

            await billRepository.update(payment.billId, {
                paidAmount: Math.max(0, newPaidAmount),
                paymentStatus: newPaidAmount > 0 ? 'pending' : 'refunded',
            } as any);
        }

        return this.getPaymentById(paymentId);
    }

    /**
     * Cancel payment
     */
    async cancelPayment(paymentId: number, reason?: string) {
        const payment = await this.getPaymentById(paymentId);

        if (payment.status === 'cancelled') {
            throw new BadRequestError('Payment is already cancelled');
        }

        if (payment.status === 'paid') {
            throw new BadRequestError('Cannot cancel paid payment. Use refund instead');
        }

        return prisma.payment.update({
            where: { paymentId },
            data: {
                status: 'cancelled',
                notes: reason ? `Cancelled: ${reason}` : 'Cancelled',
            },
            include: {
                bill: true,
            },
        });
    }

    /**
     * Get payments by bill
     */
    async getPaymentsByBill(billId: number) {
        const bill = await billRepository.findById(billId);

        if (!bill) {
            throw new NotFoundError('Bill not found');
        }

        return prisma.payment.findMany({
            where: { billId },
            orderBy: {
                createdAt: 'desc',
            },
        });
    }

    /**
     * Verify payment transaction
     */
    async verifyTransaction(transactionId: string) {
        const payment = await prisma.payment.findFirst({
            where: { transactionId },
            include: {
                bill: true,
            },
        });

        if (!payment) {
            throw new NotFoundError('Payment transaction not found');
        }

        return payment;
    }
}

export const paymentService = new PaymentService();
