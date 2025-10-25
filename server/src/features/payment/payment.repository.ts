import { prisma } from '@/config/database';
import { BaseFilter, BaseFindOptions, BaseRepository } from '@/shared';
import { Prisma, Payment, PaymentMethod, PaymentStatus } from '@prisma/client';

export interface PaymentFilter extends BaseFilter {
    paymentMethod?: PaymentMethod;
    status?: PaymentStatus;
}

export class PaymentRepository extends BaseRepository<Payment, PaymentFilter> {
    protected buildWhereClause(filters?: PaymentFilter): Prisma.PaymentWhereInput {
        if (!filters) return {};

        const where: Prisma.PaymentWhereInput = {};

        if (filters.paymentMethod) where.paymentMethod = filters.paymentMethod;
        if (filters.status) where.status = filters.status;
        if (filters.search) {
            where.OR = [
                { transactionId: { contains: filters.search, mode: 'insensitive' } },
            ];
        }

        return where;
    }

    async findAll(options?: BaseFindOptions<PaymentFilter>): Promise<Payment[]> {
        const { filters, skip = 0, take = 10, sortBy = 'createdAt', sortOrder = 'desc' } = options || {};

        return prisma.payment.findMany({
            where: this.buildWhereClause(filters),
            include: { bill: true },
            skip,
            take,
            orderBy: this.buildOrderBy(sortBy, sortOrder),
        });
    }

    async count(filters?: PaymentFilter): Promise<number> {
        return prisma.payment.count({
            where: this.buildWhereClause(filters),
        });
    }

    async create(data: Prisma.PaymentCreateInput): Promise<Payment> {
        return prisma.payment.create({
            data,
            include: {
                bill: {
                    include: {
                        order: true,
                        table: true,
                    },
                },
            },
        });
    }

    async findById(paymentId: number): Promise<Payment | null> {
        return prisma.payment.findUnique({
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
    }

    async findByTransactionId(transactionId: string): Promise<Payment | null> {
        return prisma.payment.findFirst({
            where: { transactionId },
            include: {
                bill: {
                    include: {
                        order: true,
                        table: true,
                    },
                },
            },
        });
    }

    async findByBillId(billId: number): Promise<Payment | null> {
        return prisma.payment.findFirst({
            where: { billId },
            include: {
                bill: {
                    include: {
                        order: true,
                        table: true,
                    },
                },
            },
        });
    }

    async update(paymentId: number, data: Prisma.PaymentUpdateInput): Promise<Payment> {
        return prisma.payment.update({
            where: { paymentId },
            data,
            include: {
                bill: {
                    include: {
                        order: true,
                        table: true,
                    },
                },
            },
        });
    }

    async delete(paymentId: number): Promise<Payment> {
        return prisma.payment.delete({
            where: { paymentId },
        });
    }
}

export default new PaymentRepository();
