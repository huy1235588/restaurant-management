import { prisma } from '@/config/database';
import { Prisma, Order, OrderItem } from '@prisma/client';
import { OrderStatus } from '@/shared/types';
import { BaseRepository, BaseFindOptions, BaseFilter } from '@/shared/base';

interface OrderFilter extends BaseFilter {
    tableId?: number;
    status?: OrderStatus;
    startDate?: Date;
    endDate?: Date;
    search?: string;
}

// Type for Order with relations
type OrderWithRelations = Prisma.OrderGetPayload<{
    include: {
        table: true;
        staff: true;
        reservation: true;
        orderItems: {
            include: { menuItem: { include: { category: true } } };
        };
        kitchenOrders: {
            include: { chef: true };
        };
        bill: true;
    };
}>;

export class OrderRepository extends BaseRepository<Order, OrderFilter> {
    protected buildWhereClause(filters?: OrderFilter): Prisma.OrderWhereInput {
        if (!filters) {
            return {};
        }

        const { tableId, status, startDate, endDate, search } = filters;

        const where: Prisma.OrderWhereInput = {};

        if (tableId) {
            where.tableId = tableId;
        }
        if (status) {
            where.status = status;
        }
        if (startDate || endDate) {
            where.orderTime = {};
            if (startDate) {
                where.orderTime.gte = startDate;
            }
            if (endDate) {
                where.orderTime.lte = endDate;
            }
        }
        if (search) {
            where.OR = [
                { orderNumber: { contains: search, mode: 'insensitive' } },
                { notes: { contains: search, mode: 'insensitive' } },
            ];
        }

        return where;
    }

    async findAll(options?: BaseFindOptions<OrderFilter>): Promise<Order[]> {
        const { filters, skip = 0, take = 10, sortBy = 'orderTime', sortOrder = 'desc' } = options || {};

        return prisma.order.findMany({
            where: this.buildWhereClause(filters),
            include: {
                table: true,
                staff: true,
                orderItems: {
                    include: { menuItem: true },
                },
            },
            skip,
            take,
            orderBy: this.buildOrderBy(sortBy, sortOrder) as Prisma.OrderOrderByWithRelationInput,
        });
    }

    async count(filters?: OrderFilter): Promise<number> {
        return prisma.order.count({
            where: this.buildWhereClause(filters),
        });
    }

    async create(
        data: Prisma.OrderCreateInput,
        items: Omit<Prisma.OrderItemCreateManyInput, 'orderId'>[]
    ): Promise<OrderWithRelations> {
        return prisma.$transaction(async (tx) => {
            const order = await tx.order.create({
                data,
            });

            await tx.orderItem.createMany({
                data: items.map((item) => ({
                    ...item,
                    orderId: order.orderId,
                })),
            });

            const result = await tx.order.findUnique({
                where: { orderId: order.orderId },
                include: {
                    table: true,
                    staff: true,
                    reservation: true,
                    orderItems: {
                        include: { menuItem: { include: { category: true } } },
                    },
                    kitchenOrders: {
                        include: { chef: true },
                    },
                    bill: true,
                },
            });

            return result as OrderWithRelations;
        });
    }

    async findById(orderId: number): Promise<OrderWithRelations | null> {
        return prisma.order.findUnique({
            where: { orderId },
            include: {
                table: true,
                staff: true,
                reservation: true,
                orderItems: {
                    include: { menuItem: { include: { category: true } } },
                },
                kitchenOrders: {
                    include: { chef: true },
                },
                bill: true,
            },
        });
    }

    async findByOrderNumber(orderNumber: string): Promise<Order | null> {
        return prisma.order.findUnique({
            where: { orderNumber },
            include: {
                table: true,
                staff: true,
                orderItems: {
                    include: { menuItem: true },
                },
            },
        });
    }

    async update(orderId: number, data: Prisma.OrderUpdateInput): Promise<Order> {
        return prisma.order.update({
            where: { orderId },
            data,
            include: {
                table: true,
                staff: true,
                orderItems: {
                    include: { menuItem: true },
                },
            },
        });
    }

    async updateStatus(orderId: number, status: OrderStatus): Promise<Order> {
        const updateData: Prisma.OrderUpdateInput = { status };

        if (status === 'confirmed') {
            updateData.confirmedAt = new Date();
        } else if (status === 'served') {
            updateData.completedAt = new Date();
        }

        return this.update(orderId, updateData);
    }

    async addItems(orderId: number, items: Omit<Prisma.OrderItemCreateManyInput, 'orderId'>[]): Promise<OrderItem[]> {
        await prisma.orderItem.createMany({
            data: items.map((item) => ({
                ...item,
                orderId,
            })),
        });

        return prisma.orderItem.findMany({
            where: { orderId },
            include: { menuItem: true },
        });
    }

    async delete(orderId: number): Promise<Order> {
        return prisma.order.delete({ where: { orderId } });
    }
}

export default new OrderRepository();
