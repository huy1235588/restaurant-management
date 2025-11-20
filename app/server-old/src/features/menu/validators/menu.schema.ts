import { z } from 'zod';
import { VALIDATION_RULES, VALIDATION_MESSAGES } from '@/shared/constants';

export const createMenuItemSchema = z.object({
    itemCode: z
        .string()
        .min(VALIDATION_RULES.ITEM_CODE_MIN_LENGTH, { message: VALIDATION_MESSAGES.ITEM_CODE_REQUIRED })
        .max(VALIDATION_RULES.ITEM_CODE_MAX_LENGTH),
    itemName: z
        .string()
        .min(VALIDATION_RULES.ITEM_NAME_MIN_LENGTH, { message: VALIDATION_MESSAGES.ITEM_NAME_REQUIRED })
        .max(VALIDATION_RULES.ITEM_NAME_MAX_LENGTH),
    categoryId: z
        .number()
        .int()
        .positive({ message: VALIDATION_MESSAGES.REQUIRED_FIELD }),
    price: z
        .number()
        .min(VALIDATION_RULES.PRICE_MIN, { message: VALIDATION_MESSAGES.PRICE_INVALID })
        .max(VALIDATION_RULES.PRICE_MAX),
    cost: z
        .number()
        .min(VALIDATION_RULES.PRICE_MIN, { message: VALIDATION_MESSAGES.PRICE_INVALID })
        .max(VALIDATION_RULES.PRICE_MAX)
        .optional(),
    description: z
        .string()
        .max(VALIDATION_RULES.DESCRIPTION_MAX_LENGTH)
        .optional(),
    imageUrl: z.url().optional().or(z.literal('')),
    isAvailable: z.boolean().optional().default(true),
    isActive: z.boolean().optional().default(true),
    preparationTime: z.number().int().positive().optional(),
    spicyLevel: z.number().int().min(0).max(5).optional().default(0),
    isVegetarian: z.boolean().optional().default(false),
    calories: z.number().int().positive().optional(),
    displayOrder: z.number().int().optional().default(0),
});

export const updateMenuItemSchema = z.object({
    itemCode: z
        .string()
        .min(VALIDATION_RULES.ITEM_CODE_MIN_LENGTH)
        .max(VALIDATION_RULES.ITEM_CODE_MAX_LENGTH)
        .optional(),
    itemName: z
        .string()
        .min(VALIDATION_RULES.ITEM_NAME_MIN_LENGTH)
        .max(VALIDATION_RULES.ITEM_NAME_MAX_LENGTH)
        .optional(),
    categoryId: z.number().int().positive().optional(),
    price: z
        .number()
        .min(VALIDATION_RULES.PRICE_MIN)
        .max(VALIDATION_RULES.PRICE_MAX)
        .optional(),
    cost: z
        .number()
        .min(VALIDATION_RULES.PRICE_MIN)
        .max(VALIDATION_RULES.PRICE_MAX)
        .optional(),
    description: z.string().max(VALIDATION_RULES.DESCRIPTION_MAX_LENGTH).optional(),
    imageUrl: z.string().url().optional().or(z.literal('')),
    isAvailable: z.boolean().optional(),
    isActive: z.boolean().optional(),
    preparationTime: z.number().int().positive().optional(),
    spicyLevel: z.number().int().min(0).max(5).optional(),
    isVegetarian: z.boolean().optional(),
    calories: z.number().int().positive().optional(),
    displayOrder: z.number().int().optional(),
});

export const updateMenuItemAvailabilitySchema = z.object({
    isAvailable: z.boolean({ message: VALIDATION_MESSAGES.REQUIRED_FIELD }),
});

export const menuItemQuerySchema = z.object({
    categoryId: z.string().optional(),
    isAvailable: z.string().optional(),
    isActive: z.string().optional(),
    search: z.string().optional(),
});
