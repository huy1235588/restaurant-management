import { prisma } from '@/config/database';
import { Prisma } from '@prisma/client';

export interface IngredientFilters {
    categoryId?: number;
    isActive?: boolean;
    lowStock?: boolean;
    search?: string;
}

class IngredientRepository {
    /**
     * Find all ingredients with filters and pagination
     */
    async findAll(
        filters: IngredientFilters = {},
        page: number = 1,
        limit: number = 20
    ) {
        const where: Prisma.IngredientWhereInput = {};

        if (filters.categoryId) {
            where.categoryId = filters.categoryId;
        }

        if (filters.isActive !== undefined) {
            where.isActive = filters.isActive;
        }

        if (filters.search) {
            where.OR = [
                { ingredientCode: { contains: filters.search, mode: 'insensitive' } },
                { ingredientName: { contains: filters.search, mode: 'insensitive' } },
            ];
        }

        const [ingredients, total] = await Promise.all([
            prisma.ingredient.findMany({
                where,
                include: {
                    category: true,
                    _count: {
                        select: {
                            recipes: true,
                            batches: true,
                        },
                    },
                },
                skip: (page - 1) * limit,
                take: limit,
                orderBy: { createdAt: 'desc' },
            }),
            prisma.ingredient.count({ where }),
        ]);

        return {
            data: ingredients,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    /**
     * Find ingredient by ID
     */
    async findById(ingredientId: number) {
        return prisma.ingredient.findUnique({
            where: { ingredientId },
            include: {
                category: true,
                recipes: {
                    include: {
                        menuItem: true,
                    },
                },
                stockAlerts: {
                    where: { isResolved: false },
                },
                _count: {
                    select: {
                        recipes: true,
                        stockTransactions: true,
                        batches: true,
                    },
                },
            },
        });
    }

    /**
     * Find ingredient by code
     */
    async findByCode(ingredientCode: string) {
        return prisma.ingredient.findUnique({
            where: { ingredientCode },
            include: {
                category: true,
            },
        });
    }

    /**
     * Create new ingredient
     */
    async create(data: Prisma.IngredientCreateInput) {
        return prisma.ingredient.create({
            data,
            include: {
                category: true,
            },
        });
    }

    /**
     * Update ingredient
     */
    async update(ingredientId: number, data: Prisma.IngredientUpdateInput) {
        return prisma.ingredient.update({
            where: { ingredientId },
            data,
            include: {
                category: true,
            },
        });
    }

    /**
     * Delete ingredient
     */
    async delete(ingredientId: number) {
        return prisma.ingredient.delete({
            where: { ingredientId },
        });
    }

    /**
     * Update stock quantity
     */
    async updateStock(ingredientId: number, quantity: number) {
        return prisma.ingredient.update({
            where: { ingredientId },
            data: {
                currentStock: quantity,
            },
        });
    }

    /**
     * Get low stock ingredients
     */
    async findLowStock() {
        return prisma.$queryRaw`
      SELECT * FROM ingredients 
      WHERE "currentStock" <= "minimumStock" 
      AND "isActive" = true
      ORDER BY "currentStock" ASC
    `;
    }
}

export default new IngredientRepository();
