import { prisma } from '@/config/database';
import { Prisma, Order, OrderItem } from '@prisma/client';
import { OrderStatus } from '@/shared/types';

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

export class OrderRepository {
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

    async findAll(params?: {
        tableId?: number;
        status?: OrderStatus;
        startDate?: Date;
        endDate?: Date;
        skip?: number;
        take?: number;
    }): Promise<Order[]> {
        const { tableId, status, startDate, endDate, skip, take } = params || {};
        return prisma.order.findMany({
            where: {
                ...(tableId && { tableId }),
                ...(status && { status }),
                ...(startDate &&
                    endDate && {
                    orderTime: {
                        gte: startDate,
                        lte: endDate,
                    },
                }),
            },
            include: {
                table: true,
                staff: true,
                orderItems: {
                    include: { menuItem: true },
                },
            },
            skip,
            take,
            orderBy: { orderTime: 'desc' },
        });
    }

    async count(params?: {
        tableId?: number;
        status?: OrderStatus;
        startDate?: Date;
        endDate?: Date;
    }): Promise<number> {
        const { tableId, status, startDate, endDate } = params || {};
        return prisma.order.count({
            where: {
                ...(tableId && { tableId }),
                ...(status && { status }),
                ...(startDate &&
                    endDate && {
                    orderTime: {
                        gte: startDate,
                        lte: endDate,
                    },
                }),
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
