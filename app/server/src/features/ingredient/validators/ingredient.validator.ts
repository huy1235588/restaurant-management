import { z } from 'zod';

export const createIngredientSchema = z.object({
    ingredientCode: z.string().min(1).max(20),
    ingredientName: z.string().min(1).max(100),
    unit: z.string().min(1).max(20),
    categoryId: z.number().int().positive().optional(),
    minimumStock: z.number().nonnegative().optional().default(0),
    unitCost: z.number().nonnegative().optional(),
});

export const updateIngredientSchema = z.object({
    ingredientCode: z.string().min(1).max(20).optional(),
    ingredientName: z.string().min(1).max(100).optional(),
    unit: z.string().min(1).max(20).optional(),
    categoryId: z.number().int().positive().nullable().optional(),
    minimumStock: z.number().nonnegative().optional(),
    unitCost: z.number().nonnegative().optional(),
    isActive: z.boolean().optional(),
});

export const ingredientQuerySchema = z.object({
    page: z.coerce.number().int().positive().optional().default(1),
    limit: z.coerce.number().int().positive().max(100).optional().default(20),
    search: z.string().optional(),
    categoryId: z.coerce.number().int().positive().optional(),
    isActive: z.coerce.boolean().optional(),
    lowStock: z.coerce.boolean().optional(),
});

export const createIngredientCategorySchema = z.object({
    categoryName: z.string().min(1).max(100),
    description: z.string().optional(),
});

export const updateIngredientCategorySchema = z.object({
    categoryName: z.string().min(1).max(100).optional(),
    description: z.string().optional(),
    isActive: z.boolean().optional(),
});

export const createRecipeSchema = z.object({
    itemId: z.number().int().positive(),
    ingredientId: z.number().int().positive(),
    quantity: z.number().positive(),
    unit: z.string().min(1).max(20),
    notes: z.string().optional(),
});

export const updateRecipeSchema = z.object({
    quantity: z.number().positive().optional(),
    unit: z.string().min(1).max(20).optional(),
    notes: z.string().optional(),
});
