import { z } from 'zod';
import { VALIDATION_RULES, VALIDATION_MESSAGES } from '@/shared/constants';

export const createCategorySchema = z.object({
    categoryName: z
        .string()
        .min(VALIDATION_RULES.CATEGORY_NAME_MIN_LENGTH, { message: VALIDATION_MESSAGES.CATEGORY_NAME_REQUIRED })
        .max(VALIDATION_RULES.CATEGORY_NAME_MAX_LENGTH),
    description: z
        .string()
        .max(VALIDATION_RULES.DESCRIPTION_MAX_LENGTH)
        .optional(),
    displayOrder: z.number().int().optional().default(0),
    isActive: z.boolean().optional().default(true),
    imageUrl: z.string().url().optional().or(z.literal('')),
});

export const updateCategorySchema = z.object({
    categoryName: z
        .string()
        .min(VALIDATION_RULES.CATEGORY_NAME_MIN_LENGTH)
        .max(VALIDATION_RULES.CATEGORY_NAME_MAX_LENGTH)
        .optional(),
    description: z.string().max(VALIDATION_RULES.DESCRIPTION_MAX_LENGTH).optional(),
    displayOrder: z.number().int().optional(),
    isActive: z.boolean().optional(),
    imageUrl: z.string().url().optional().or(z.literal('')),
});

export const categoryQuerySchema = z.object({
    isActive: z.string().optional(),
});
