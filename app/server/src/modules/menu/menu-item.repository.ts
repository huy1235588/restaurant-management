import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/database/prisma.service';
import { Prisma, MenuItem } from '@prisma/generated/client';

export interface MenuItemFilters {
    categoryId?: number;
    isAvailable?: boolean;
    isActive?: boolean;
    search?: string;
}

export interface FindOptions {
    filters?: MenuItemFilters;
    skip?: number;
    take?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

@Injectable()
export class MenuItemRepository {
    constructor(private readonly prisma: PrismaService) {}

    private buildWhereClause(
        filters?: MenuItemFilters,
    ): Prisma.MenuItemWhereInput {
        if (!filters) return {};

        const where: Prisma.MenuItemWhereInput = {};

        if (filters.categoryId !== undefined) {
            where.categoryId = filters.categoryId;
        }

        if (filters.isAvailable !== undefined) {
            where.isAvailable = filters.isAvailable;
        }

        if (filters.isActive !== undefined) {
            where.isActive = filters.isActive;
        }

        if (filters.search) {
            where.OR = [
                { itemName: { contains: filters.search, mode: 'insensitive' } },
                { itemCode: { contains: filters.search, mode: 'insensitive' } },
                {
                    description: {
                        contains: filters.search,
                        mode: 'insensitive',
                    },
                },
            ];
        }

        return where;
    }

    async findAll(options?: FindOptions): Promise<MenuItem[]> {
        const {
            filters,
            skip = 0,
            take = 10,
            sortBy = 'displayOrder',
            sortOrder = 'asc',
        } = options || {};

        return this.prisma.menuItem.findMany({
            where: this.buildWhereClause(filters),
            include: {
                category: true,
            },
            skip,
            take,
            orderBy: { [sortBy]: sortOrder },
        });
    }

    async findAllPaginated(options?: FindOptions) {
        const items = await this.findAll(options);
        const total = await this.count(options?.filters);

        return {
            items,
            total,
            page: options?.skip
                ? Math.floor(options.skip / (options.take || 10)) + 1
                : 1,
            limit: options?.take || 10,
        };
    }

    async count(filters?: MenuItemFilters): Promise<number> {
        return this.prisma.menuItem.count({
            where: this.buildWhereClause(filters),
        });
    }

    async create(data: Prisma.MenuItemCreateInput): Promise<MenuItem> {
        return this.prisma.menuItem.create({
            data,
            include: { category: true },
        });
    }

    async findById(itemId: number): Promise<MenuItem | null> {
        return this.prisma.menuItem.findUnique({
            where: { itemId },
            include: { category: true },
        });
    }

    async findByCode(itemCode: string): Promise<MenuItem | null> {
        return this.prisma.menuItem.findUnique({
            where: { itemCode },
            include: { category: true },
        });
    }

    async update(
        itemId: number,
        data: Prisma.MenuItemUpdateInput,
    ): Promise<MenuItem> {
        return this.prisma.menuItem.update({
            where: { itemId },
            data,
            include: { category: true },
        });
    }

    async delete(itemId: number): Promise<MenuItem> {
        return this.prisma.menuItem.delete({ where: { itemId } });
    }
}
