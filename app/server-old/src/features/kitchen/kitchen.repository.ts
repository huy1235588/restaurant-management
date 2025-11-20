import { prisma } from '@/config/database';
import { Prisma, KitchenOrder } from '@prisma/client';
import { BaseFilter, BaseFindOptions, BaseRepository } from '@/shared';

interface KitchenOrderFilter extends BaseFilter {
    status?: any; // KitchenOrderStatus
    staffId?: number;
    stationId?: number;
}

export class KitchenOrderRepository extends BaseRepository<KitchenOrder, KitchenOrderFilter> {
    protected buildWhereClause(filters?: KitchenOrderFilter): Prisma.KitchenOrderWhereInput {
        if (!filters) return {};

        const where: Prisma.KitchenOrderWhereInput = {};

        if (filters.status) where.status = filters.status;
        if (filters.staffId) where.staffId = filters.staffId;
        if (filters.stationId) where.stationId = filters.stationId;
        if (filters.search) {
            where.OR = [
                { notes: { contains: filters.search, mode: 'insensitive' } },
            ];
        }

        return where;
    }

    async findAll(options?: BaseFindOptions<KitchenOrderFilter>): Promise<KitchenOrder[]> {
        const { filters, skip = 0, take = 20, sortBy = 'createdAt', sortOrder = 'asc' } = options || {};

        return prisma.kitchenOrder.findMany({
            where: this.buildWhereClause(filters),
            include: { order: true, chef: true },
            skip,
            take,
            orderBy: this.buildOrderBy(sortBy, sortOrder),
        });
    }

    async count(filters?: KitchenOrderFilter): Promise<number> {
        return prisma.kitchenOrder.count({
            where: this.buildWhereClause(filters),
        });
    }

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

    async findById(kitchenOrderId: number): Promise<any> {
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
                station: true,
            },
        });
    }

    async findPending(): Promise<KitchenOrder[]> {
        return prisma.kitchenOrder.findMany({
            where: { status: 'pending' },
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
            orderBy: [{ priority: 'desc' }, { createdAt: 'asc' }],
        });
    }

    async findInProgress(staffId?: number): Promise<KitchenOrder[]> {
        return prisma.kitchenOrder.findMany({
            where: {
                status: 'preparing',
                ...(staffId && { staffId }),
            },
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
            orderBy: [{ priority: 'desc' }, { createdAt: 'asc' }],
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

    async updateStatus(kitchenOrderId: number, status: string, staffId?: number): Promise<any> {
        const updateData: Prisma.KitchenOrderUpdateInput = { status: status as any };

        if (status === 'preparing') {
            updateData.startedAt = new Date();
            if (staffId) {
                updateData.chef = { connect: { staffId } };
            }
        } else if (status === 'ready' || status === 'completed') {
            updateData.completedAt = new Date();
        }

        return this.update(kitchenOrderId, updateData);
    }

    async delete(kitchenOrderId: number): Promise<KitchenOrder> {
        return prisma.kitchenOrder.delete({ where: { kitchenOrderId } });
    }

    async getAllStations() {
        return prisma.kitchenStation.findMany({
            where: { isActive: true },
            orderBy: { name: 'asc' },
        });
    }

    async findByStation(stationId: number): Promise<KitchenOrder[]> {
        return prisma.kitchenOrder.findMany({
            where: { stationId, status: { in: ['pending', 'preparing'] } },
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
                station: true,
            },
            orderBy: [{ priority: 'desc' }, { createdAt: 'asc' }],
        });
    }

    async countByStatus(status: string) {
        return prisma.kitchenOrder.count({
            where: { status: status as any },
        });
    }
}

export default new KitchenOrderRepository();
