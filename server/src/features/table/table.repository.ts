import { prisma } from '@/config/database';
import { Prisma, RestaurantTable } from '@prisma/client';
import { TableStatus } from '@/shared/types';

export type TableWithOrders = Prisma.RestaurantTableGetPayload<{
    include: { orders: true; reservations: true }
}>;

export class RestaurantTableRepository {
    async create(data: Prisma.RestaurantTableCreateInput): Promise<RestaurantTable> {
        return prisma.restaurantTable.create({ data });
    }

    async findById(tableId: number): Promise<TableWithOrders | null> {
        return prisma.restaurantTable.findUnique({
            where: { tableId },
            include: {
                reservations: {
                    where: { status: { in: ['pending', 'confirmed'] } },
                },
                orders: {
                    where: { status: { notIn: ['served', 'cancelled'] } },
                },
            },
        });
    }

    async findByIdWithDetails(tableId: number, includeOptions?: any) {
        return prisma.restaurantTable.findUnique({
            where: { tableId },
            ...includeOptions,
        });
    }

    async findByNumber(tableNumber: string): Promise<RestaurantTable | null> {
        return prisma.restaurantTable.findUnique({
            where: { tableNumber },
        });
    }

    async findAll(params?: {
        status?: TableStatus;
        floor?: number;
        isActive?: boolean;
        skip?: number;
        take?: number;
    }): Promise<RestaurantTable[]> {
        const { status, floor, isActive, skip, take } = params || {};
        return prisma.restaurantTable.findMany({
            where: {
                ...(status && { status }),
                ...(floor && { floor }),
                ...(isActive !== undefined && { isActive }),
            },
            include: {
                reservations: {
                    where: { status: { in: ['pending', 'confirmed'] } },
                },
            },
            skip,
            take,
            orderBy: { tableNumber: 'asc' },
        });
    }

    async count(params?: {
        status?: TableStatus;
        floor?: number;
        isActive?: boolean;
    }): Promise<number> {
        const { status, floor, isActive } = params || {};
        return prisma.restaurantTable.count({
            where: {
                ...(status && { status }),
                ...(floor && { floor }),
                ...(isActive !== undefined && { isActive }),
            },
        });
    }

    async update(tableId: number, data: Prisma.RestaurantTableUpdateInput): Promise<RestaurantTable> {
        return prisma.restaurantTable.update({
            where: { tableId },
            data,
        });
    }

    async updateStatus(tableId: number, status: TableStatus): Promise<RestaurantTable> {
        return this.update(tableId, { status });
    }

    async delete(tableId: number): Promise<RestaurantTable> {
        return prisma.restaurantTable.delete({ where: { tableId } });
    }

    async findAvailable(params?: { capacity?: number; floor?: number }): Promise<RestaurantTable[]> {
        const { capacity, floor } = params || {};
        return prisma.restaurantTable.findMany({
            where: {
                status: 'available',
                isActive: true,
                ...(capacity && { capacity: { gte: capacity } }),
                ...(floor && { floor }),
            },
            orderBy: { capacity: 'asc' },
        });
    }

    async getAvailableTables(params?: { capacity?: number; floor?: number }): Promise<RestaurantTable[]> {
        return this.findAvailable(params);
    }
}

export default new RestaurantTableRepository();
