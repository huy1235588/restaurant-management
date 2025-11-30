import { z } from 'zod';

// Category form validation schema
export const categoryFormSchema = z.object({
    categoryName: z
        .string()
        .min(1, 'Category name is required')
        .max(100, 'Category name must be at most 100 characters'),
    description: z
        .string()
        .max(500, 'Description must be at most 500 characters')
        .optional()
        .nullable(),
    displayOrder: z
        .number()
        .int('Display order must be an integer')
        .min(0, 'Display order must be 0 or greater')
        .optional()
        .nullable(),
    isActive: z.boolean(),
    imagePath: z.string().optional().nullable().or(z.literal('')),
});
