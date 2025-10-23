import { prisma } from '@/config/database';
import { Prisma, KitchenOrder } from '@prisma/client';
import { OrderStatus } from '@/shared/types';

export class KitchenOrderRepository {
    async create(data: Prisma.KitchenOrderCreateInput): Promise<KitchenOrder> {
        return prisma.kitchenOrder.create({
            data,
            include: {
                order: {
                    include: {
                        table: true,
                        orderItems: {
                            include: { menuItem: true },
                        },
                    },
                },
                chef: true,
            },
        });
    }

    async findById(kitchenOrderId: number): Promise<KitchenOrder | null> {
        return prisma.kitchenOrder.findUnique({
            where: { kitchenOrderId },
            include: {
                order: {
                    include: {
                        table: true,
                        orderItems: {
                            include: { menuItem: true },
                        },
                    },
                },
                chef: true,
            },
        });
    }

    async findAll(params?: {
        status?: OrderStatus;
        staffId?: number;
        skip?: number;
        take?: number;
    }): Promise<KitchenOrder[]> {
        const { status, staffId, skip, take } = params || {};
        return prisma.kitchenOrder.findMany({
            where: {
                ...(status && { status }),
                ...(staffId && { staffId }),
            },
            include: {
                order: {
                    include: {
                        table: true,
                        orderItems: {
                            include: { menuItem: true },
                            where: { status: { notIn: ['served', 'cancelled'] } },
                        },
                    },
                },
                chef: true,
            },
            skip,
            take,
            orderBy: [{ priority: 'desc' }, { createdAt: 'asc' }],
        });
    }

    async findPending(): Promise<KitchenOrder[]> {
        return this.findAll({
            status: 'pending',
        });
    }

    async findInProgress(staffId?: number): Promise<KitchenOrder[]> {
        return this.findAll({
            status: 'preparing',
            staffId,
        });
    }

    async count(params?: { status?: OrderStatus; staffId?: number }): Promise<number> {
        const { status, staffId } = params || {};
        return prisma.kitchenOrder.count({
            where: {
                ...(status && { status }),
                ...(staffId && { staffId }),
            },
        });
    }

    async update(kitchenOrderId: number, data: Prisma.KitchenOrderUpdateInput): Promise<KitchenOrder> {
        return prisma.kitchenOrder.update({
            where: { kitchenOrderId },
            data,
            include: {
                order: {
                    include: {
                        table: true,
                        orderItems: {
                            include: { menuItem: true },
                        },
                    },
                },
                chef: true,
            },
        });
    }

    async updateStatus(kitchenOrderId: number, status: OrderStatus, staffId?: number): Promise<KitchenOrder> {
        const updateData: Prisma.KitchenOrderUpdateInput = { status };

        if (status === 'preparing' && !updateData.startedAt) {
            updateData.startedAt = new Date();
            if (staffId) {
                updateData.chef = { connect: { staffId } };
            }
        } else if (status === 'ready' || status === 'served') {
            updateData.completedAt = new Date();
        }

        return this.update(kitchenOrderId, updateData);
    }

    async delete(kitchenOrderId: number): Promise<KitchenOrder> {
        return prisma.kitchenOrder.delete({ where: { kitchenOrderId } });
    }
}

export default new KitchenOrderRepository();
