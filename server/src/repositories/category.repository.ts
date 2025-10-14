import { prisma } from '@/config/database';
import { Prisma, Category } from '@prisma/client';

export type CategoryWithItems = Prisma.CategoryGetPayload<{
    include: { menuItems: true }
}>;

export class CategoryRepository {
    async create(data: Prisma.CategoryCreateInput): Promise<Category> {
        return prisma.category.create({ data });
    }

    async findById(categoryId: number): Promise<CategoryWithItems | null> {
        return prisma.category.findUnique({
            where: { categoryId },
            include: { menuItems: true },
        });
    }

    async findByName(categoryName: string): Promise<Category | null> {
        return prisma.category.findFirst({
            where: { categoryName },
        });
    }

    async findByIdWithItems(categoryId: number, activeOnly: boolean = true) {
        return prisma.category.findUnique({
            where: { categoryId },
            include: {
                menuItems: {
                    where: activeOnly ? { isActive: true } : undefined,
                    orderBy: { displayOrder: 'asc' }
                }
            }
        });
    }

    async findAll(params?: { isActive?: boolean }): Promise<Category[]> {
        const { isActive } = params || {};
        return prisma.category.findMany({
            where: {
                ...(isActive !== undefined && { isActive }),
            },
            orderBy: { displayOrder: 'asc' },
            include: {
                menuItems: {
                    where: { isActive: true },
                },
            },
        });
    }

    async update(categoryId: number, data: Prisma.CategoryUpdateInput): Promise<Category> {
        return prisma.category.update({
            where: { categoryId },
            data,
        });
    }

    async delete(categoryId: number): Promise<Category> {
        return prisma.category.delete({ where: { categoryId } });
    }
}

export default new CategoryRepository();
