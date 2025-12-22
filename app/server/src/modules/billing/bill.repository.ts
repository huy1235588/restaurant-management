import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/database/prisma.service';
import { DateTimeService } from '@/shared/utils';
import { Prisma, Bill, PaymentStatus, PaymentMethod } from '@/lib/prisma';

export interface BillFilters {
    paymentStatus?: PaymentStatus;
    paymentMethod?: PaymentMethod;
    date?: string;
}

export interface FindOptions {
    filters?: BillFilters;
    skip?: number;
    take?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

@Injectable()
export class BillRepository {
    constructor(
        private readonly prisma: PrismaService,
        private readonly dateTimeService: DateTimeService,
    ) {}

    private buildWhereClause(filters?: BillFilters): Prisma.BillWhereInput {
        if (!filters) return {};

        const where: Prisma.BillWhereInput = {};

        if (filters.paymentStatus !== undefined) {
            where.paymentStatus = filters.paymentStatus;
        }

        if (filters.paymentMethod !== undefined) {
            where.paymentMethod = filters.paymentMethod;
        }

        if (filters.date) {
            // Use DateTimeService for timezone-aware date range
            const date = new Date(filters.date);
            const startDate = this.dateTimeService.startOfDay(date);
            const endDate = this.dateTimeService.endOfDay(date);

            where.createdAt = {
                gte: startDate,
                lte: endDate,
            };
        }

        return where;
    }

    async findAll(options?: FindOptions): Promise<Bill[]> {
        const {
            filters,
            skip = 0,
            take = 20,
            sortBy = 'createdAt',
            sortOrder = 'desc',
        } = options || {};

        return this.prisma.bill.findMany({
            where: this.buildWhereClause(filters),
            include: {
                order: {
                    include: {
                        table: true,
                        orderItems: {
                            include: {
                                menuItem: true,
                            },
                        },
                    },
                },
                table: true,
                staff: {
                    select: {
                        staffId: true,
                        fullName: true,
                        role: true,
                    },
                },
                billItems: {
                    include: {
                        menuItem: true,
                    },
                },
                payments: true,
            },
            skip,
            take,
            orderBy: { [sortBy]: sortOrder },
        });
    }

    async findAllPaginated(options?: FindOptions) {
        const items = await this.findAll(options);
        const total = await this.count(options?.filters);
        const limit = options?.take || 20;
        const page = options?.skip ? Math.floor(options.skip / limit) + 1 : 1;
        const totalPages = Math.ceil(total / limit);

        return {
            items,
            pagination: {
                total,
                page,
                limit,
                totalPages,
            },
        };
    }

    async count(filters?: BillFilters): Promise<number> {
        return this.prisma.bill.count({
            where: this.buildWhereClause(filters),
        });
    }

    async findById(billId: number): Promise<Bill | null> {
        return this.prisma.bill.findUnique({
            where: { billId },
            include: {
                order: {
                    include: {
                        table: true,
                        orderItems: {
                            include: {
                                menuItem: true,
                            },
                        },
                    },
                },
                table: true,
                staff: {
                    select: {
                        staffId: true,
                        fullName: true,
                        role: true,
                    },
                },
                billItems: {
                    include: {
                        menuItem: true,
                    },
                },
                payments: true,
            },
        });
    }

    async findByOrderId(orderId: number): Promise<Bill | null> {
        return this.prisma.bill.findUnique({
            where: { orderId },
            include: {
                order: true,
                table: true,
                billItems: {
                    include: {
                        menuItem: true,
                    },
                },
                payments: true,
            },
        });
    }

    async create(data: Prisma.BillCreateInput): Promise<Bill> {
        return this.prisma.bill.create({
            data,
            include: {
                order: true,
                table: true,
                billItems: {
                    include: {
                        menuItem: true,
                    },
                },
            },
        });
    }

    async update(billId: number, data: Prisma.BillUpdateInput): Promise<Bill> {
        return this.prisma.bill.update({
            where: { billId },
            data,
            include: {
                order: true,
                table: true,
                billItems: {
                    include: {
                        menuItem: true,
                    },
                },
                payments: true,
            },
        });
    }

    async delete(billId: number): Promise<Bill> {
        return this.prisma.bill.delete({
            where: { billId },
        });
    }
}
