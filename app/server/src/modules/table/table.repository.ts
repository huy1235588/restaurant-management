import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/database/prisma.service';
import { Prisma, RestaurantTable, TableStatus } from '@prisma/generated/client';

export interface TableFilters {
    floor?: number;
    section?: string;
    status?: TableStatus;
    capacity?: number;
    minCapacity?: number;
    maxCapacity?: number;
    search?: string;
}

export interface FindOptions {
    filters?: TableFilters;
    skip?: number;
    take?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

@Injectable()
export class TableRepository {
    constructor(private readonly prisma: PrismaService) {}

    private buildWhereClause(
        filters?: TableFilters,
    ): Prisma.RestaurantTableWhereInput {
        if (!filters) return {};

        const where: Prisma.RestaurantTableWhereInput = {};

        if (filters.floor !== undefined) {
            where.floor = filters.floor;
        }

        if (filters.section) {
            where.section = {
                contains: filters.section,
                mode: 'insensitive',
            };
        }

        if (filters.status !== undefined) {
            where.status = filters.status;
        }

        if (filters.capacity !== undefined) {
            where.capacity = filters.capacity;
        }

        if (
            filters.minCapacity !== undefined ||
            filters.maxCapacity !== undefined
        ) {
            where.capacity = {};
            if (filters.minCapacity !== undefined) {
                where.capacity.gte = filters.minCapacity;
            }
            if (filters.maxCapacity !== undefined) {
                where.capacity.lte = filters.maxCapacity;
            }
        }

        if (filters.search) {
            where.OR = [
                {
                    tableNumber: {
                        contains: filters.search,
                        mode: 'insensitive',
                    },
                },
                {
                    tableName: {
                        contains: filters.search,
                        mode: 'insensitive',
                    },
                },
            ];
        }

        return where;
    }

    async findAll(options?: FindOptions): Promise<RestaurantTable[]> {
        const {
            filters,
            skip = 0,
            take = 10,
            sortBy = 'tableNumber',
            sortOrder = 'asc',
        } = options || {};

        return this.prisma.restaurantTable.findMany({
            where: this.buildWhereClause(filters),
            skip,
            take,
            orderBy: { [sortBy]: sortOrder },
        });
    }

    async findAllPaginated(options?: FindOptions) {
        const tables = await this.findAll(options);
        const total = await this.count(options?.filters);
        const limit = options?.take || 10;
        const page = options?.skip ? Math.floor(options.skip / limit) + 1 : 1;
        const totalPages = Math.ceil(total / limit);

        return {
            items: tables,
            pagination: {
                total,
                page,
                limit,
                totalPages,
            },
        };
    }

    async count(filters?: TableFilters): Promise<number> {
        return this.prisma.restaurantTable.count({
            where: this.buildWhereClause(filters),
        });
    }

    async create(
        data: Prisma.RestaurantTableCreateInput,
    ): Promise<RestaurantTable> {
        return this.prisma.restaurantTable.create({
            data,
        });
    }

    async findById(tableId: number): Promise<RestaurantTable | null> {
        return this.prisma.restaurantTable.findUnique({
            where: { tableId },
        });
    }

    async findByTableNumber(
        tableNumber: string,
    ): Promise<RestaurantTable | null> {
        return this.prisma.restaurantTable.findUnique({
            where: { tableNumber },
        });
    }

    async findByFloor(floor: number): Promise<RestaurantTable[]> {
        return this.prisma.restaurantTable.findMany({
            where: { floor },
            orderBy: { tableNumber: 'asc' },
        });
    }

    async findBySection(section: string): Promise<RestaurantTable[]> {
        return this.prisma.restaurantTable.findMany({
            where: { section },
            orderBy: { tableNumber: 'asc' },
        });
    }

    async findAvailable(capacity?: number): Promise<RestaurantTable[]> {
        const where: Prisma.RestaurantTableWhereInput = {
            status: 'available',
            isActive: true,
        };

        if (capacity) {
            where.capacity = { gte: capacity };
        }

        return this.prisma.restaurantTable.findMany({
            where,
            orderBy: { capacity: 'asc' },
        });
    }

    async update(
        tableId: number,
        data: Prisma.RestaurantTableUpdateInput,
    ): Promise<RestaurantTable> {
        return this.prisma.restaurantTable.update({
            where: { tableId },
            data,
        });
    }

    async delete(tableId: number): Promise<RestaurantTable> {
        return this.prisma.restaurantTable.delete({ where: { tableId } });
    }

    async updateStatus(
        tableId: number,
        status: TableStatus,
    ): Promise<RestaurantTable> {
        return this.prisma.restaurantTable.update({
            where: { tableId },
            data: { status },
        });
    }

    async bulkUpdateStatus(
        tableIds: number[],
        status: TableStatus,
    ): Promise<Prisma.BatchPayload> {
        return this.prisma.restaurantTable.updateMany({
            where: {
                tableId: {
                    in: tableIds,
                },
            },
            data: { status },
        });
    }
}
