import { prisma } from '@/config/database';
import { Prisma, Bill } from '@prisma/client';
import { PaymentStatus, PaymentMethod } from '@/shared/types';
import { BaseRepository, BaseFindOptions, BaseFilter } from '@/shared/base';

interface BillFilter extends BaseFilter {
    paymentStatus?: PaymentStatus;
    startDate?: Date;
    endDate?: Date;
    search?: string;
}

export class BillRepository extends BaseRepository<Bill, BillFilter> {
    protected buildWhereClause(filters?: BillFilter): Prisma.BillWhereInput {
        if (!filters) {
            return {};
        }

        const { paymentStatus, startDate, endDate, search } = filters;

        const where: Prisma.BillWhereInput = {};

        if (paymentStatus) {
            where.paymentStatus = paymentStatus;
        }
        if (startDate || endDate) {
            where.createdAt = {};
            if (startDate) {
                where.createdAt.gte = startDate;
            }
            if (endDate) {
                where.createdAt.lte = endDate;
            }
        }
        if (search) {
            where.OR = [
                { billNumber: { contains: search, mode: 'insensitive' } },
            ];
        }

        return where;
    }

    async findAll(options?: BaseFindOptions<BillFilter>): Promise<Bill[]> {
        const { filters, skip = 0, take = 10, sortBy = 'createdAt', sortOrder = 'desc' } = options || {};

        return prisma.bill.findMany({
            where: this.buildWhereClause(filters),
            include: {
                order: true,
                table: true,
                staff: true,
                billItems: true,
            },
            skip,
            take,
            orderBy: this.buildOrderBy(sortBy, sortOrder) as Prisma.BillOrderByWithRelationInput,
        });
    }

    async count(filters?: BillFilter): Promise<number> {
        return prisma.bill.count({
            where: this.buildWhereClause(filters),
        });
    }

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
