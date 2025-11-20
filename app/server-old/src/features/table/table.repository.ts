import { prisma } from '@/config/database';
import { Prisma, RestaurantTable } from '@prisma/client';
import { TableStatus } from '@/shared/types';
import { BaseRepository, BaseFindOptions, BaseFilter } from '@/shared/base';

interface TableFilter extends BaseFilter {
    status?: TableStatus;
    floor?: number;
    isActive?: boolean;
    search?: string;
    section?: string;
}

export type TableWithOrders = Prisma.RestaurantTableGetPayload<{
    include: { orders: true; reservations: true }
}>;

export class RestaurantTableRepository extends BaseRepository<RestaurantTable, TableFilter> {
    protected buildWhereClause(filters?: TableFilter): Prisma.RestaurantTableWhereInput {
        if (!filters) {
            return {};
        }

    const { status, floor, isActive, search, section } = filters;

        const where: Prisma.RestaurantTableWhereInput = {};

        if (status) {
            where.status = status;
        }
        if (floor) {
            where.floor = floor;
        }
        if (isActive !== undefined) {
            where.isActive = isActive;
        }
        if (search) {
            where.OR = [
                { tableNumber: { contains: search, mode: 'insensitive' } },
                { tableName: { contains: search, mode: 'insensitive' } },
            ];
        }
        if (section) {
            where.section = {
                equals: section,
                mode: 'insensitive',
            };
        }

        return where;
    }

    async findAll(options?: BaseFindOptions<TableFilter>): Promise<RestaurantTable[]> {
        const { filters, skip = 0, take = 10, sortBy = 'tableNumber', sortOrder = 'asc' } = options || {};

        return prisma.restaurantTable.findMany({
            where: this.buildWhereClause(filters),
            include: {
                reservations: {
                    where: { status: { in: ['pending', 'confirmed'] } },
                },
            },
            skip,
            take,
            orderBy: this.buildOrderBy(sortBy, sortOrder) as Prisma.RestaurantTableOrderByWithRelationInput,
        });
    }

    async count(filters?: TableFilter): Promise<number> {
        return prisma.restaurantTable.count({
            where: this.buildWhereClause(filters),
        });
    }

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
                    where: { status: { notIn: ['completed', 'cancelled'] } },
                },
            },
        });
    }

    async findByIdWithDetails(tableId: number, includeOptions?: Prisma.RestaurantTableFindUniqueArgs['include']) {
        return prisma.restaurantTable.findUnique({
            where: { tableId },
            include: includeOptions,
        });
    }

    async findByNumber(tableNumber: string): Promise<RestaurantTable | null> {
        return prisma.restaurantTable.findUnique({
            where: { tableNumber },
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
