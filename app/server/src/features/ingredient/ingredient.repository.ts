import { prisma } from '@/config/database';
import { Prisma, Ingredient } from '@prisma/client';
import { BaseRepository, BaseFindOptions, BaseFilter } from '@/shared/base';

export interface IngredientFilters extends BaseFilter {
    categoryId?: number;
    isActive?: boolean;
    lowStock?: boolean;
    search?: string;
}

export class IngredientRepository extends BaseRepository<Ingredient, IngredientFilters> {
    protected buildWhereClause(filters?: IngredientFilters): Prisma.IngredientWhereInput {
        if (!filters) {
            return {};
        }

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

        return where;
    }

    async findAll(options?: BaseFindOptions<IngredientFilters>): Promise<Ingredient[]> {
        const { filters, skip = 0, take = 20, sortBy = 'createdAt', sortOrder = 'desc' } = options || {};

        let where = this.buildWhereClause(filters);

        // Apply lowStock filter separately if needed
        if (filters?.lowStock) {
            const lowStockIngredients = await this.findLowStock();
            const lowStockIds = (lowStockIngredients as any[]).map(ing => ing.ingredientId);
            where = {
                ...where,
                ingredientId: { in: lowStockIds },
            };
        }

        return prisma.ingredient.findMany({
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
            skip,
            take,
            orderBy: this.buildOrderBy(sortBy, sortOrder) as Prisma.IngredientOrderByWithRelationInput,
        });
    }

    async count(filters?: IngredientFilters): Promise<number> {
        return prisma.ingredient.count({
            where: this.buildWhereClause(filters),
        });
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
