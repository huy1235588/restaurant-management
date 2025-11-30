import { z } from 'zod';

// Menu item form validation schema
export const menuItemFormSchema = z.object({
    itemCode: z
        .string()
        .min(1, 'Item code is required')
        .max(50, 'Item code must be at most 50 characters')
        .regex(/^[A-Z0-9-]+$/, 'Item code must contain only uppercase letters, numbers, and hyphens'),
    itemName: z
        .string()
        .min(1, 'Item name is required')
        .max(100, 'Item name must be at most 100 characters'),
    categoryId: z.number({ message: 'Category must be selected' })
        .int()
        .positive('Category is required'),
    price: z.number({ message: 'Price must be a number' })
        .positive('Price must be greater than 0')
        .max(100000000, 'Price is too high'),
    cost: z.number()
        .positive('Cost must be greater than 0')
        .max(100000000, 'Cost is too high')
        .optional()
        .nullable(),
    description: z
        .string()
        .max(1000, 'Description must be at most 1000 characters')
        .optional()
        .nullable(),
    imagePath: z.string().optional().nullable().or(z.literal('')),
    isAvailable: z.boolean(),
    isActive: z.boolean(),
    preparationTime: z.number()
        .int('Preparation time must be an integer')
        .positive('Preparation time must be greater than 0')
        .max(300, 'Preparation time is too long')
        .optional()
        .nullable(),
    spicyLevel: z.number()
        .int('Spicy level must be an integer')
        .min(0, 'Spicy level must be between 0 and 5')
        .max(5, 'Spicy level must be between 0 and 5')
        .optional()
        .nullable(),
    isVegetarian: z.boolean(),
    calories: z.number()
        .int('Calories must be an integer')
        .positive('Calories must be greater than 0')
        .max(10000, 'Calories value is too high')
        .optional().nullable(),
    displayOrder: z.number()
        .int('Display order must be an integer')
        .min(0, 'Display order must be 0 or greater')
        .optional()
        .nullable(),
});

// Menu filter validation schema
export const menuFilterSchema = z.object({
    categoryId: z.number().int().positive().optional(),
    isAvailable: z.boolean().optional(),
    isActive: z.boolean().optional(),
    search: z.string().max(200).optional(),
    minPrice: z.number().positive().optional(),
    maxPrice: z.number().positive().optional(),
    isVegetarian: z.boolean().optional(),
    spicyLevel: z.number().int().min(0).max(5).optional(),
    preparationTime: z.enum(['quick', 'normal', 'long']).optional(),
});

// Export types inferred from schemas
