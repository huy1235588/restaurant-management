import { prisma } from '@/config/database';
import { Prisma, MenuItem } from '@prisma/client';
import { BaseRepository, BaseFindOptions } from '@/shared/base';

interface MenuItemFilter {
    categoryId?: number;
    isAvailable?: boolean;
    isActive?: boolean;
    search?: string;
}

export class MenuItemRepository extends BaseRepository<MenuItem, MenuItemFilter> {
    protected buildWhereClause(filters?: MenuItemFilter): Prisma.MenuItemWhereInput {
        if (!filters) {
            return {};
        }

        const { categoryId, isAvailable, isActive, search } = filters;

        const where: Prisma.MenuItemWhereInput = {};

        if (categoryId) {
            where.categoryId = categoryId;
        }
        if (isAvailable !== undefined) {
            where.isAvailable = isAvailable;
        }
        if (isActive !== undefined) {
            where.isActive = isActive;
        }
        if (search) {
            where.OR = [
                { itemName: { contains: search, mode: 'insensitive' } },
                { itemCode: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } },
            ];
        }

        return where;
    }

    async findAll(options?: BaseFindOptions<MenuItemFilter>): Promise<MenuItem[]> {
        const { filters, skip = 0, take = 10, sortBy = 'displayOrder', sortOrder = 'asc' } = options || {};

        return prisma.menuItem.findMany({
            where: this.buildWhereClause(filters),
            include: { category: true },
            skip,
            take,
            orderBy: this.buildOrderBy(sortBy, sortOrder) as Prisma.MenuItemOrderByWithRelationInput,
        });
    }

    async count(filters?: MenuItemFilter): Promise<number> {
        return prisma.menuItem.count({
            where: this.buildWhereClause(filters),
        });
    }

    /**
     * Find item by ID
     */
    async findById(itemId: number): Promise<MenuItem | null> {
        return prisma.menuItem.findUnique({
            where: { itemId },
            include: { category: true },
        });
    }

    /**
     * Find item by code
     */
    async findByCode(itemCode: string): Promise<MenuItem | null> {
        return prisma.menuItem.findUnique({
            where: { itemCode },
            include: { category: true },
        });
    }

    /**
     * Create item
     */
    async create(data: Prisma.MenuItemCreateInput): Promise<MenuItem> {
        return prisma.menuItem.create({
            data,
            include: { category: true },
        });
    }

    /**
     * Update item
     */
    async update(itemId: number, data: Prisma.MenuItemUpdateInput): Promise<MenuItem> {
        return prisma.menuItem.update({
            where: { itemId },
            data,
            include: { category: true },
        });
    }

    /**
     * Delete item
     */
    async delete(itemId: number): Promise<MenuItem> {
        return prisma.menuItem.delete({ where: { itemId } });
    }
}

export default new MenuItemRepository();
