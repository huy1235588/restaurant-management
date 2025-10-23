import { z } from 'zod';
import { VALIDATION_RULES, VALIDATION_MESSAGES } from '@/shared/constants';

export const createStaffSchema = z.object({
    accountId: z.number().int().positive({ message: VALIDATION_MESSAGES.REQUIRED_FIELD }),
    fullName: z
        .string()
        .min(VALIDATION_RULES.FULL_NAME_MIN_LENGTH, { message: VALIDATION_MESSAGES.FULL_NAME_REQUIRED })
        .max(VALIDATION_RULES.FULL_NAME_MAX_LENGTH),
    address: z.string().max(VALIDATION_RULES.ADDRESS_MAX_LENGTH).optional(),
    dateOfBirth: z.string().datetime().optional(),
    hireDate: z.string().datetime().optional(),
    salary: z
        .number()
        .min(VALIDATION_RULES.SALARY_MIN)
        .max(VALIDATION_RULES.SALARY_MAX)
        .optional(),
    role: z.enum(['admin', 'manager', 'waiter', 'chef', 'bartender', 'cashier'], {
        message: VALIDATION_MESSAGES.ROLE_INVALID,
    }),
    isActive: z.boolean().optional().default(true),
});

export const updateStaffSchema = z.object({
    fullName: z
        .string()
        .min(VALIDATION_RULES.FULL_NAME_MIN_LENGTH)
        .max(VALIDATION_RULES.FULL_NAME_MAX_LENGTH)
        .optional(),
    address: z.string().max(VALIDATION_RULES.ADDRESS_MAX_LENGTH).optional(),
    dateOfBirth: z.string().datetime().optional(),
    hireDate: z.string().datetime().optional(),
    salary: z.number().min(VALIDATION_RULES.SALARY_MIN).max(VALIDATION_RULES.SALARY_MAX).optional(),
    role: z.enum(['admin', 'manager', 'waiter', 'chef', 'bartender', 'cashier']).optional(),
    isActive: z.boolean().optional(),
});

export const updateStaffStatusSchema = z.object({
    isActive: z.boolean({ message: VALIDATION_MESSAGES.REQUIRED_FIELD }),
});
