import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/database/prisma.service';
import { Prisma, OrderStatus } from '@prisma/generated/client';

export interface OrderFilters {
    status?: OrderStatus;
    tableId?: number;
    staffId?: number;
    startDate?: Date;
    endDate?: Date;
    search?: string;
}

export interface FindOrdersOptions {
    filters?: OrderFilters;
    pagination?: {
        page: number;
        limit: number;
    };
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

@Injectable()
export class OrderRepository {
    constructor(private readonly prisma: PrismaService) {}

    private readonly includeRelations = {
        table: true,
        staff: {
            select: {
                staffId: true,
                fullName: true,
                role: true,
            },
        },
        orderItems: {
            include: {
                menuItem: {
                    select: {
                        itemId: true,
                        itemName: true,
                        itemCode: true,
                        price: true,
                        imageUrl: true,
                    },
                },
            },
        },
        reservation: {
            select: {
                reservationId: true,
                reservationCode: true,
                customerName: true,
            },
        },
    };

    async findById(orderId: number) {
        return this.prisma.order.findUnique({
            where: { orderId },
            include: this.includeRelations,
        });
    }

    async findByOrderNumber(orderNumber: string) {
        return this.prisma.order.findUnique({
            where: { orderNumber },
            include: this.includeRelations,
        });
    }

    async findAll(options?: FindOrdersOptions) {
        const where = this.buildWhereClause(options?.filters);
        const orderBy = this.buildOrderBy(options?.sortBy, options?.sortOrder);

        if (options?.pagination) {
            const { page, limit } = options.pagination;
            const skip = (page - 1) * limit;

            const [orders, total] = await Promise.all([
                this.prisma.order.findMany({
                    where,
                    include: this.includeRelations,
                    orderBy,
                    skip,
                    take: limit,
                }),
                this.prisma.order.count({ where }),
            ]);

            return {
                data: orders,
                meta: {
                    total,
                    page,
                    limit,
                    totalPages: Math.ceil(total / limit),
                },
            };
        }

        const orders = await this.prisma.order.findMany({
            where,
            include: this.includeRelations,
            orderBy,
        });

        return { data: orders };
    }

    async count(filters?: OrderFilters) {
        const where = this.buildWhereClause(filters);
        return this.prisma.order.count({ where });
    }

    async create(data: Prisma.OrderCreateInput) {
        return this.prisma.order.create({
            data,
            include: this.includeRelations,
        });
    }

    async update(orderId: number, data: Prisma.OrderUpdateInput) {
        return this.prisma.order.update({
            where: { orderId },
            data,
            include: this.includeRelations,
        });
    }

    async delete(orderId: number) {
        return this.prisma.order.delete({
            where: { orderId },
        });
    }

    async findActiveOrderByTable(tableId: number) {
        return this.prisma.order.findFirst({
            where: {
                tableId,
                status: {
                    notIn: [OrderStatus.completed, OrderStatus.cancelled],
                },
            },
            include: this.includeRelations,
        });
    }

    private buildWhereClause(filters?: OrderFilters): Prisma.OrderWhereInput {
        if (!filters) return {};

        const where: Prisma.OrderWhereInput = {};

        if (filters.status) {
            where.status = filters.status;
        }

        if (filters.tableId) {
            where.tableId = filters.tableId;
        }

        if (filters.staffId) {
            where.staffId = filters.staffId;
        }

        if (filters.startDate || filters.endDate) {
            where.orderTime = {};
            if (filters.startDate) {
                where.orderTime.gte = filters.startDate;
            }
            if (filters.endDate) {
                where.orderTime.lte = filters.endDate;
            }
        }

        if (filters.search) {
            where.OR = [
                {
                    orderNumber: {
                        contains: filters.search,
                        mode: 'insensitive',
                    },
                },
                {
                    customerName: {
                        contains: filters.search,
                        mode: 'insensitive',
                    },
                },
                {
                    customerPhone: {
                        contains: filters.search,
                        mode: 'insensitive',
                    },
                },
            ];
        }

        return where;
    }

    private buildOrderBy(
        sortBy?: string,
        sortOrder: 'asc' | 'desc' = 'desc',
    ): Prisma.OrderOrderByWithRelationInput {
        if (!sortBy) {
            return { orderTime: sortOrder };
        }

        return { [sortBy]: sortOrder };
    }
}
