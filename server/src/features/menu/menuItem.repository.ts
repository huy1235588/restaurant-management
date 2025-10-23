import { prisma } from '@/config/database';
import { Prisma, MenuItem } from '@prisma/client';

export class MenuItemRepository {
    async create(data: Prisma.MenuItemCreateInput): Promise<MenuItem> {
        return prisma.menuItem.create({
            data,
            include: { category: true },
        });
    }

    async findById(itemId: number): Promise<MenuItem | null> {
        return prisma.menuItem.findUnique({
            where: { itemId },
            include: { category: true },
        });
    }

    async findByCode(itemCode: string): Promise<MenuItem | null> {
        return prisma.menuItem.findUnique({
            where: { itemCode },
            include: { category: true },
        });
    }

    async findAll(params?: {
        categoryId?: number;
        isAvailable?: boolean;
        isActive?: boolean;
        skip?: number;
        take?: number;
    }): Promise<MenuItem[]> {
        const { categoryId, isAvailable, isActive, skip, take } = params || {};
        return prisma.menuItem.findMany({
            where: {
                ...(categoryId && { categoryId }),
                ...(isAvailable !== undefined && { isAvailable }),
                ...(isActive !== undefined && { isActive }),
            },
            include: { category: true },
            skip,
            take,
            orderBy: { displayOrder: 'asc' },
        });
    }

    async count(params?: {
        categoryId?: number;
        isAvailable?: boolean;
        isActive?: boolean;
    }): Promise<number> {
        const { categoryId, isAvailable, isActive } = params || {};
        return prisma.menuItem.count({
            where: {
                ...(categoryId && { categoryId }),
                ...(isAvailable !== undefined && { isAvailable }),
                ...(isActive !== undefined && { isActive }),
            },
        });
    }

    async update(itemId: number, data: Prisma.MenuItemUpdateInput): Promise<MenuItem> {
        return prisma.menuItem.update({
            where: { itemId },
            data,
            include: { category: true },
        });
    }

    async delete(itemId: number): Promise<MenuItem> {
        return prisma.menuItem.delete({ where: { itemId } });
    }
}

export default new MenuItemRepository();
