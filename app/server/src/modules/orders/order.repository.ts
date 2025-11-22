import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/database/prisma.service';
import { Prisma, Order, OrderStatus } from '@prisma/generated/client';

export interface OrderFilters {
    status?: OrderStatus;
    tableId?: number;
    staffId?: number;
    date?: string;
}

export interface FindOptions {
    filters?: OrderFilters;
    skip?: number;
    take?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

@Injectable()
export class OrderRepository {
    constructor(private readonly prisma: PrismaService) {}

    private buildWhereClause(
        filters?: OrderFilters,
    ): Prisma.OrderWhereInput {
        if (!filters) return {};

        const where: Prisma.OrderWhereInput = {};

        if (filters.status !== undefined) {
            where.status = filters.status;
        }

        if (filters.tableId !== undefined) {
            where.tableId = filters.tableId;
        }

        if (filters.staffId !== undefined) {
            where.staffId = filters.staffId;
        }

        if (filters.date) {
            const startDate = new Date(filters.date);
            const endDate = new Date(filters.date);
            endDate.setDate(endDate.getDate() + 1);

            where.orderTime = {
                gte: startDate,
                lt: endDate,
            };
        }

        return where;
    }

    async findAll(options?: FindOptions): Promise<Order[]> {
        const {
            filters,
            skip = 0,
            take = 20,
            sortBy = 'orderTime',
            sortOrder = 'desc',
        } = options || {};

        return this.prisma.order.findMany({
            where: this.buildWhereClause(filters),
            include: {
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
                        menuItem: true,
                    },
                },
                reservation: true,
                kitchenOrders: true,
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

    async count(filters?: OrderFilters): Promise<number> {
        return this.prisma.order.count({
            where: this.buildWhereClause(filters),
        });
    }

    async findById(orderId: number): Promise<Order | null> {
        return this.prisma.order.findUnique({
            where: { orderId },
            include: {
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
                        menuItem: true,
                    },
                },
                reservation: true,
                kitchenOrders: true,
                bill: true,
            },
        });
    }

    async findByOrderNumber(orderNumber: string): Promise<Order | null> {
        return this.prisma.order.findUnique({
            where: { orderNumber },
            include: {
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
                        menuItem: true,
                    },
                },
                reservation: true,
                kitchenOrders: true,
            },
        });
    }

    async findActiveByTable(tableId: number): Promise<Order | null> {
        return this.prisma.order.findFirst({
            where: {
                tableId,
                status: {
                    in: [OrderStatus.pending, OrderStatus.confirmed, OrderStatus.ready, OrderStatus.serving],
                },
            },
            include: {
                orderItems: {
                    include: {
                        menuItem: true,
                    },
                },
            },
        });
    }

    async create(data: Prisma.OrderCreateInput): Promise<Order> {
        return this.prisma.order.create({
            data,
            include: {
                table: true,
                orderItems: {
                    include: {
                        menuItem: true,
                    },
                },
            },
        });
    }

    async update(orderId: number, data: Prisma.OrderUpdateInput): Promise<Order> {
        return this.prisma.order.update({
            where: { orderId },
            data,
            include: {
                table: true,
                orderItems: {
                    include: {
                        menuItem: true,
                    },
                },
            },
        });
    }

    async delete(orderId: number): Promise<Order> {
        return this.prisma.order.delete({
            where: { orderId },
        });
    }
}
