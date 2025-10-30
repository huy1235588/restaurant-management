import { prisma } from '@/config/database';
import { Prisma } from '@prisma/client';

class IngredientCategoryRepository {
    /**
     * Find all ingredient categories
     */
    async findAll(isActive?: boolean) {
        const where: Prisma.IngredientCategoryWhereInput = {};

        if (isActive !== undefined) {
            where.isActive = isActive;
        }

        return prisma.ingredientCategory.findMany({
            where,
            include: {
                _count: {
                    select: {
                        ingredients: true,
                    },
                },
            },
            orderBy: { categoryName: 'asc' },
        });
    }

    /**
     * Find category by ID
     */
    async findById(categoryId: number) {
        return prisma.ingredientCategory.findUnique({
            where: { categoryId },
            include: {
                ingredients: {
                    where: { isActive: true },
                },
            },
        });
    }

    /**
     * Find category by name
     */
    async findByName(categoryName: string) {
        return prisma.ingredientCategory.findUnique({
            where: { categoryName },
        });
    }

    /**
     * Create new category
     */
    async create(data: Prisma.IngredientCategoryCreateInput) {
        return prisma.ingredientCategory.create({
            data,
        });
    }

    /**
     * Update category
     */
    async update(categoryId: number, data: Prisma.IngredientCategoryUpdateInput) {
        return prisma.ingredientCategory.update({
            where: { categoryId },
            data,
        });
    }

    /**
     * Delete category
     */
    async delete(categoryId: number) {
        return prisma.ingredientCategory.delete({
            where: { categoryId },
        });
    }
}

export default new IngredientCategoryRepository();
