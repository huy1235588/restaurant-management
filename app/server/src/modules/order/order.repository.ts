import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/database/prisma.service';
import { Prisma, OrderStatus } from '@/lib/prisma';
import { OrderQueryHelper } from './helpers/order-query.helper';

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
    minimal?: boolean; // Use minimal includes for better performance
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
        kitchenOrders: {
            select: {
                kitchenOrderId: true,
                status: true,
                startedAt: true,
                completedAt: true,
                staffId: true,
                chef: {
                    select: {
                        staffId: true,
                        fullName: true,
                    },
                },
            },
        },
    };

    /**
     * Get appropriate includes based on query type
     */
    private getIncludes(minimal: boolean = false): Prisma.OrderInclude {
        return minimal
            ? OrderQueryHelper.LIST_INCLUDES
            : OrderQueryHelper.STANDARD_INCLUDES;
    }

    async findById(orderId: number) {
        return this.prisma.order.findUnique({
            where: { orderId },
            include: OrderQueryHelper.STANDARD_INCLUDES,
        });
    }

    async findByOrderNumber(orderNumber: string) {
        return this.prisma.order.findUnique({
            where: { orderNumber },
            include: OrderQueryHelper.STANDARD_INCLUDES,
        });
    }

    async findAll(options?: FindOrdersOptions) {
        const where = this.buildWhereClause(options?.filters);
        const orderBy = this.buildOrderBy(options?.sortBy, options?.sortOrder);
        const includes = this.getIncludes(options?.minimal);

        if (options?.pagination) {
            const { page, limit } = options.pagination;
            const skip = (page - 1) * limit;

            // Use Promise.all for parallel execution
            const [orders, total] = await Promise.all([
                this.prisma.order.findMany({
                    where,
                    include: includes,
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
            include: includes,
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
            include: OrderQueryHelper.STANDARD_INCLUDES,
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
            include: OrderQueryHelper.STANDARD_INCLUDES,
        });
    }

    async findByReservation(reservationId: number) {
        return this.prisma.order.findFirst({
            where: { reservationId },
            include: OrderQueryHelper.STANDARD_INCLUDES,
        });
    }

    /**
     * Batch update order items status (optimized for multiple items)
     */
    async updateOrderItemsStatus(
        orderId: number,
        status: string,
    ): Promise<number> {
        const result = await this.prisma.orderItem.updateMany({
            where: { orderId },
            data: { status: status as any },
        });
        return result.count;
    }

    /**
     * Get order with minimal data (for cache/quick lookups)
     */
    async findByIdMinimal(orderId: number) {
        return this.prisma.order.findUnique({
            where: { orderId },
            select: OrderQueryHelper.ORDER_NUMBER_SELECT,
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
