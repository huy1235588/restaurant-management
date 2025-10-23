import { z } from 'zod';
import { VALIDATION_RULES, VALIDATION_MESSAGES } from '@/shared/constants';

export const createTableSchema = z.object({
    tableNumber: z
        .string()
        .min(VALIDATION_RULES.TABLE_NUMBER_MIN_LENGTH, { message: VALIDATION_MESSAGES.TABLE_NUMBER_REQUIRED })
        .max(VALIDATION_RULES.TABLE_NUMBER_MAX_LENGTH),
    tableName: z
        .string()
        .max(VALIDATION_RULES.TABLE_NAME_MAX_LENGTH)
        .optional(),
    capacity: z
        .number()
        .int()
        .min(VALIDATION_RULES.CAPACITY_MIN, { message: VALIDATION_MESSAGES.CAPACITY_INVALID })
        .max(VALIDATION_RULES.CAPACITY_MAX),
    minCapacity: z
        .number()
        .int()
        .min(1)
        .optional()
        .default(1),
    floor: z.number().int().positive().optional().default(1),
    section: z.string().max(50).optional(),
    status: z.enum(['available', 'occupied', 'reserved', 'maintenance']).optional().default('available'),
    qrCode: z.string().optional(),
    isActive: z.boolean().optional().default(true),
});

export const updateTableSchema = z.object({
    tableNumber: z
        .string()
        .min(VALIDATION_RULES.TABLE_NUMBER_MIN_LENGTH)
        .max(VALIDATION_RULES.TABLE_NUMBER_MAX_LENGTH)
        .optional(),
    tableName: z.string().max(VALIDATION_RULES.TABLE_NAME_MAX_LENGTH).optional(),
    capacity: z
        .number()
        .int()
        .min(VALIDATION_RULES.CAPACITY_MIN)
        .max(VALIDATION_RULES.CAPACITY_MAX)
        .optional(),
    minCapacity: z.number().int().min(1).optional(),
    floor: z.number().int().positive().optional(),
    section: z.string().max(50).optional(),
    status: z.enum(['available', 'occupied', 'reserved', 'maintenance']).optional(),
    qrCode: z.string().optional(),
    isActive: z.boolean().optional(),
});

export const updateTableStatusSchema = z.object({
    status: z.enum(['available', 'occupied', 'reserved', 'maintenance'], {
        message: 'Invalid table status',
    }),
});
