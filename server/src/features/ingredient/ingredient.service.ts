import ingredientRepository from './ingredient.repository';
import ingredientCategoryRepository from './ingredientCategory.repository';
import { NotFoundError, BadRequestError } from '@/shared/utils/errors';
import {
    CreateIngredientDto,
    UpdateIngredientDto,
    IngredientQueryDto,
    CreateIngredientCategoryDto,
    UpdateIngredientCategoryDto,
} from '@/features/ingredient/dtos/ingredient.dto';

export class IngredientService {
    // ============================================
    // INGREDIENT MANAGEMENT
    // ============================================

    /**
     * Get all ingredients with filters
     */
    async getAllIngredients(query: IngredientQueryDto) {
        const { page = 1, limit = 20, ...filters } = query;
        return ingredientRepository.findAll(filters, page, limit);
    }

    /**
     * Get ingredient by ID
     */
    async getIngredientById(ingredientId: number) {
        const ingredient = await ingredientRepository.findById(ingredientId);

        if (!ingredient) {
            throw new NotFoundError('Ingredient not found');
        }

        return ingredient;
    }

    /**
     * Get ingredient by code
     */
    async getIngredientByCode(ingredientCode: string) {
        const ingredient = await ingredientRepository.findByCode(ingredientCode);

        if (!ingredient) {
            throw new NotFoundError('Ingredient not found');
        }

        return ingredient;
    }

    /**
     * Create new ingredient
     */
    async createIngredient(data: CreateIngredientDto) {
        // Check if ingredient code already exists
        const existingIngredient = await ingredientRepository.findByCode(
            data.ingredientCode
        );

        if (existingIngredient) {
            throw new BadRequestError('Ingredient code already exists');
        }

        // Check if category exists (if provided)
        if (data.categoryId) {
            const category = await ingredientCategoryRepository.findById(
                data.categoryId
            );

            if (!category) {
                throw new NotFoundError('Category not found');
            }
        }

        return ingredientRepository.create({
            ingredientCode: data.ingredientCode,
            ingredientName: data.ingredientName,
            unit: data.unit,
            minimumStock: data.minimumStock || 0,
            unitCost: data.unitCost,
            category: data.categoryId
                ? { connect: { categoryId: data.categoryId } }
                : undefined,
        });
    }

    /**
     * Update ingredient
     */
    async updateIngredient(ingredientId: number, data: UpdateIngredientDto) {
        // Check if ingredient exists
        const ingredient = await ingredientRepository.findById(ingredientId);

        if (!ingredient) {
            throw new NotFoundError('Ingredient not found');
        }

        // Check if new code already exists
        if (data.ingredientCode && data.ingredientCode !== ingredient.ingredientCode) {
            const existingIngredient = await ingredientRepository.findByCode(
                data.ingredientCode
            );

            if (existingIngredient) {
                throw new BadRequestError('Ingredient code already exists');
            }
        }

        // Check if category exists (if provided)
        if (data.categoryId) {
            const category = await ingredientCategoryRepository.findById(
                data.categoryId
            );

            if (!category) {
                throw new NotFoundError('Category not found');
            }
        }

        const updateData: any = {
            ingredientCode: data.ingredientCode,
            ingredientName: data.ingredientName,
            unit: data.unit,
            minimumStock: data.minimumStock,
            unitCost: data.unitCost,
            isActive: data.isActive,
        };

        if (data.categoryId !== undefined) {
            updateData.category =
                data.categoryId === null
                    ? { disconnect: true }
                    : { connect: { categoryId: data.categoryId } };
        }

        return ingredientRepository.update(ingredientId, updateData);
    }

    /**
     * Delete ingredient
     */
    async deleteIngredient(ingredientId: number) {
        const ingredient = await ingredientRepository.findById(ingredientId);

        if (!ingredient) {
            throw new NotFoundError('Ingredient not found');
        }

        // Check if ingredient is used in any recipes
        if (ingredient._count.recipes > 0) {
            throw new BadRequestError(
                'Cannot delete ingredient that is used in recipes'
            );
        }

        return ingredientRepository.delete(ingredientId);
    }

    /**
     * Get low stock ingredients
     */
    async getLowStockIngredients() {
        return ingredientRepository.findLowStock();
    }

    // ============================================
    // INGREDIENT CATEGORY MANAGEMENT
    // ============================================

    /**
     * Get all ingredient categories
     */
    async getAllCategories(isActive?: boolean) {
        return ingredientCategoryRepository.findAll(isActive);
    }

    /**
     * Get category by ID
     */
    async getCategoryById(categoryId: number) {
        const category = await ingredientCategoryRepository.findById(categoryId);

        if (!category) {
            throw new NotFoundError('Category not found');
        }

        return category;
    }

    /**
     * Create new category
     */
    async createCategory(data: CreateIngredientCategoryDto) {
        // Check if category name already exists
        const existingCategory = await ingredientCategoryRepository.findByName(
            data.categoryName
        );

        if (existingCategory) {
            throw new BadRequestError('Category name already exists');
        }

        return ingredientCategoryRepository.create({
            categoryName: data.categoryName,
            description: data.description,
        });
    }

    /**
     * Update category
     */
    async updateCategory(
        categoryId: number,
        data: UpdateIngredientCategoryDto
    ) {
        const category = await ingredientCategoryRepository.findById(categoryId);

        if (!category) {
            throw new NotFoundError('Category not found');
        }

        // Check if new name already exists
        if (data.categoryName && data.categoryName !== category.categoryName) {
            const existingCategory = await ingredientCategoryRepository.findByName(
                data.categoryName
            );

            if (existingCategory) {
                throw new BadRequestError('Category name already exists');
            }
        }

        return ingredientCategoryRepository.update(categoryId, data);
    }

    /**
     * Delete category
     */
    async deleteCategory(categoryId: number) {
        const category = await ingredientCategoryRepository.findById(categoryId);

        if (!category) {
            throw new NotFoundError('Category not found');
        }

        // Check if category has ingredients
        if (category.ingredients.length > 0) {
            throw new BadRequestError(
                'Cannot delete category that has ingredients'
            );
        }

        return ingredientCategoryRepository.delete(categoryId);
    }
}

export default new IngredientService();
