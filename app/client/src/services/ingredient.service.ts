import axios from '@/lib/axios';
import type {
    Ingredient,
    IngredientCategory,
    CreateIngredientDto,
    UpdateIngredientDto,
    PaginatedResponse,
} from '@/types';

export interface IngredientQueryParams {
    page?: number;
    limit?: number;
    search?: string;
    categoryId?: number;
    isActive?: boolean;
    lowStock?: boolean;
}

export const ingredientService = {
    // ============================================
    // INGREDIENT APIS
    // ============================================

    /**
     * Get all ingredients with filters
     */
    async getAll(params?: IngredientQueryParams): Promise<PaginatedResponse<Ingredient>> {
        const response = await axios.get('/ingredients', { params });
        return response.data.data;
    },

    /**
     * Get ingredient by ID
     */
    async getById(id: number): Promise<Ingredient> {
        const response = await axios.get(`/ingredients/${id}`);
        return response.data.data;
    },

    /**
     * Get ingredient by code
     */
    async getByCode(code: string): Promise<Ingredient> {
        const response = await axios.get(`/ingredients/code/${code}`);
        return response.data.data;
    },

    /**
     * Get low stock ingredients
     */
    async getLowStock(): Promise<Ingredient[]> {
        const response = await axios.get('/ingredients/low-stock');
        return response.data.data;
    },

    /**
     * Create new ingredient
     */
    async create(data: CreateIngredientDto): Promise<Ingredient> {
        const response = await axios.post('/ingredients', data);
        return response.data.data;
    },

    /**
     * Update ingredient
     */
    async update(id: number, data: UpdateIngredientDto): Promise<Ingredient> {
        const response = await axios.patch(`/ingredients/${id}`, data);
        return response.data.data;
    },

    /**
     * Delete ingredient
     */
    async delete(id: number): Promise<void> {
        await axios.delete(`/ingredients/${id}`);
    },

    // ============================================
    // INGREDIENT CATEGORY APIS
    // ============================================

    /**
     * Get all categories
     */
    async getCategories(isActive?: boolean): Promise<IngredientCategory[]> {
        const response = await axios.get('/ingredients/categories', {
            params: { isActive },
        });
        return response.data.data;
    },

    /**
     * Get category by ID
     */
    async getCategoryById(id: number): Promise<IngredientCategory> {
        const response = await axios.get(`/ingredients/categories/${id}`);
        return response.data.data;
    },

    /**
     * Create new category
     */
    async createCategory(data: {
        categoryName: string;
        description?: string;
    }): Promise<IngredientCategory> {
        const response = await axios.post('/ingredients/categories', data);
        return response.data.data;
    },

    /**
     * Update category
     */
    async updateCategory(
        id: number,
        data: {
            categoryName?: string;
            description?: string;
            isActive?: boolean;
        }
    ): Promise<IngredientCategory> {
        const response = await axios.patch(`/ingredients/categories/${id}`, data);
        return response.data.data;
    },

    /**
     * Delete category
     */
    async deleteCategory(id: number): Promise<void> {
        await axios.delete(`/ingredients/categories/${id}`);
    },
};

export default ingredientService;
