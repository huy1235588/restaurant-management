export interface CreateIngredientDto {
    ingredientCode: string;
    ingredientName: string;
    unit: string;
    categoryId?: number;
    minimumStock?: number;
    unitCost?: number;
}

export interface UpdateIngredientDto {
    ingredientCode?: string;
    ingredientName?: string;
    unit?: string;
    categoryId?: number | null;
    minimumStock?: number;
    unitCost?: number;
    isActive?: boolean;
}

export interface IngredientQueryDto {
    page?: number;
    limit?: number;
    search?: string;
    categoryId?: number;
    isActive?: boolean;
    lowStock?: boolean;
}

export interface CreateIngredientCategoryDto {
    categoryName: string;
    description?: string;
}

export interface UpdateIngredientCategoryDto {
    categoryName?: string;
    description?: string;
    isActive?: boolean;
}

export interface CreateRecipeDto {
    itemId: number;
    ingredientId: number;
    quantity: number;
    unit: string;
    notes?: string;
}

export interface UpdateRecipeDto {
    quantity?: number;
    unit?: string;
    notes?: string;
}
