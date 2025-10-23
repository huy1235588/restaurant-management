import { prisma } from '@/config/database';
import { Prisma, Bill } from '@prisma/client';
import { PaymentStatus, PaymentMethod } from '@/shared/types';

export class BillRepository {
    async create(data: Prisma.BillCreateInput): Promise<Bill> {
        return prisma.bill.create({
            data,
            include: {
                order: {
                    include: {
                        orderItems: {
                            include: { menuItem: true },
                        },
                    },
                },
                table: true,
                staff: true,
                billItems: true,
            },
        });
    }

    async findById(billId: number): Promise<Bill | null> {
        return prisma.bill.findUnique({
            where: { billId },
            include: {
                order: {
                    include: {
                        orderItems: {
                            include: { menuItem: true },
                        },
                    },
                },
                table: true,
                staff: true,
                billItems: {
                    include: { menuItem: true },
                },
                payments: true,
            },
        });
    }

    async findByBillNumber(billNumber: string): Promise<Bill | null> {
        return prisma.bill.findUnique({
            where: { billNumber },
            include: {
                order: true,
                table: true,
                billItems: {
                    include: { menuItem: true },
                },
                payments: true,
            },
        });
    }

    async findByOrderId(orderId: number): Promise<Bill | null> {
        return prisma.bill.findUnique({
            where: { orderId },
            include: {
                order: true,
                table: true,
                billItems: {
                    include: { menuItem: true },
                },
                payments: true,
            },
        });
    }

    async findAll(params?: {
        paymentStatus?: PaymentStatus;
        startDate?: Date;
        endDate?: Date;
        skip?: number;
        take?: number;
    }): Promise<Bill[]> {
        const { paymentStatus, startDate, endDate, skip, take } = params || {};
        return prisma.bill.findMany({
            where: {
                ...(paymentStatus && { paymentStatus }),
                ...(startDate &&
                    endDate && {
                    createdAt: {
                        gte: startDate,
                        lte: endDate,
                    },
                }),
            },
            include: {
                order: true,
                table: true,
                staff: true,
                billItems: true,
            },
            skip,
            take,
            orderBy: { createdAt: 'desc' },
        });
    }

    async count(params?: {
        paymentStatus?: PaymentStatus;
        startDate?: Date;
        endDate?: Date;
    }): Promise<number> {
        const { paymentStatus, startDate, endDate } = params || {};
        return prisma.bill.count({
            where: {
                ...(paymentStatus && { paymentStatus }),
                ...(startDate &&
                    endDate && {
                    createdAt: {
                        gte: startDate,
                        lte: endDate,
                    },
                }),
            },
        });
    }

    async update(billId: number, data: Prisma.BillUpdateInput): Promise<Bill> {
        return prisma.bill.update({
            where: { billId },
            data,
            include: {
                order: true,
                table: true,
                billItems: {
                    include: { menuItem: true },
                },
                payments: true,
            },
        });
    }

    async processPayment(
        billId: number,
        paymentData: {
            paymentMethod: PaymentMethod;
            amount: number;
            transactionId?: string;
            cardNumber?: string;
            cardHolderName?: string;
            notes?: string;
        }
    ): Promise<Bill> {
        return prisma.$transaction(async (tx) => {
            const bill = await tx.bill.findUnique({ where: { billId } });
            if (!bill) throw new Error('Bill not found');

            const newPaidAmount = Number(bill.paidAmount) + paymentData.amount;
            const changeAmount = Math.max(0, newPaidAmount - Number(bill.totalAmount));
            const paymentStatus: PaymentStatus =
                newPaidAmount >= Number(bill.totalAmount) ? 'paid' : 'pending';

            // Create payment record
            await tx.payment.create({
                data: {
                    billId,
                    paymentMethod: paymentData.paymentMethod,
                    amount: paymentData.amount,
                    transactionId: paymentData.transactionId,
                    cardNumber: paymentData.cardNumber,
                    cardHolderName: paymentData.cardHolderName,
                    status: 'paid',
                    notes: paymentData.notes,
                },
            });

            // Update bill
            return tx.bill.update({
                where: { billId },
                data: {
                    paidAmount: newPaidAmount,
                    changeAmount,
                    paymentStatus,
                    paymentMethod: paymentData.paymentMethod,
                    paidAt: paymentStatus === 'paid' ? new Date() : undefined,
                },
                include: {
                    order: true,
                    table: true,
                    billItems: {
                        include: { menuItem: true },
                    },
                    payments: true,
                },
            });
        });
    }

    async getTotalRevenue(params?: { startDate?: Date; endDate?: Date }): Promise<number> {
        const { startDate, endDate } = params || {};
        const result = await prisma.bill.aggregate({
            where: {
                paymentStatus: 'paid',
                ...(startDate &&
                    endDate && {
                    paidAt: {
                        gte: startDate,
                        lte: endDate,
                    },
                }),
            },
            _sum: {
                totalAmount: true,
            },
        });
        return Number(result._sum.totalAmount) || 0;
    }

    async delete(billId: number): Promise<Bill> {
        return prisma.bill.delete({ where: { billId } });
    }
}

export default new BillRepository();
