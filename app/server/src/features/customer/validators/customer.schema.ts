import { z } from 'zod';
import { VALIDATION_MESSAGES, VALIDATION_RULES } from '@/shared/constants';

const phoneRegex = /^\+?\d{10,15}$/;
const isoDateRegex = /^\d{4}-\d{2}-\d{2}$/;
const positiveIntegerString = z
    .string()
    .regex(/^[1-9]\d*$/, { message: VALIDATION_MESSAGES.INVALID_POSITIVE_NUMBER });
const paginationLimitString = positiveIntegerString.refine((value) => Number(value) <= 100, {
    message: 'Limit cannot exceed 100 items per page',
});
const historyLimitString = positiveIntegerString.refine((value) => Number(value) <= 200, {
    message: 'History limit cannot exceed 200 records',
});
const autocompleteLimitString = positiveIntegerString.refine((value) => Number(value) <= 50, {
    message: 'Autocomplete limit cannot exceed 50 results',
});
const jsonValueSchema = z.any();

const baseCustomerSchema = z.object({
    name: z
        .string()
        .min(VALIDATION_RULES.CUSTOMER_NAME_MIN_LENGTH, VALIDATION_MESSAGES.CUSTOMER_NAME_REQUIRED)
        .max(VALIDATION_RULES.CUSTOMER_NAME_MAX_LENGTH),
    phoneNumber: z.string().regex(phoneRegex, { message: VALIDATION_MESSAGES.INVALID_PHONE }),
    email: z.string().email(VALIDATION_MESSAGES.INVALID_EMAIL).optional(),
    birthday: z.string().regex(isoDateRegex, { message: VALIDATION_MESSAGES.INVALID_DATE }).optional(),
    isVip: z.boolean().optional(),
    notes: z.string().max(VALIDATION_RULES.DESCRIPTION_MAX_LENGTH).optional(),
    preferences: jsonValueSchema.optional(),
});

export const createCustomerSchema = baseCustomerSchema;

export const updateCustomerSchema = baseCustomerSchema.partial();

export const mergeCustomerSchema = z.object({
    duplicateCustomerId: z.number().int().positive(),
});

export const autocompleteCustomerSchema = z.object({
    term: z.string().min(1),
    limit: autocompleteLimitString.optional(),
});

export const listCustomersQuerySchema = z.object({
    page: positiveIntegerString.optional(),
    limit: paginationLimitString.optional(),
    search: z.string().min(1).max(VALIDATION_RULES.CUSTOMER_NAME_MAX_LENGTH).optional(),
    isVip: z.enum(['true', 'false']).optional(),
    phoneNumber: z.string().regex(phoneRegex, { message: VALIDATION_MESSAGES.INVALID_PHONE }).optional(),
    email: z.string().email(VALIDATION_MESSAGES.INVALID_EMAIL).optional(),
});

export const customerIdParamSchema = z.object({
    id: positiveIntegerString,
});

export const customerHistoryQuerySchema = z.object({
    limit: historyLimitString.optional(),
});
