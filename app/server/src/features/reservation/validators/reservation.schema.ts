import { z } from 'zod';
import { VALIDATION_RULES, VALIDATION_MESSAGES } from '@/shared/constants';

export const createReservationSchema = z.object({
    customerName: z
        .string()
        .min(VALIDATION_RULES.CUSTOMER_NAME_MIN_LENGTH, { message: VALIDATION_MESSAGES.CUSTOMER_NAME_REQUIRED })
        .max(VALIDATION_RULES.CUSTOMER_NAME_MAX_LENGTH),
    phoneNumber: z
        .string()
        .min(VALIDATION_RULES.PHONE_MIN_LENGTH, { message: VALIDATION_MESSAGES.INVALID_PHONE })
        .max(VALIDATION_RULES.PHONE_MAX_LENGTH),
    email: z.string().email().optional(),
    tableId: z.number().int().positive({ message: VALIDATION_MESSAGES.REQUIRED_FIELD }),
    reservationDate: z.string().datetime({ message: VALIDATION_MESSAGES.RESERVATION_DATE_REQUIRED }),
    reservationTime: z.string({ message: VALIDATION_MESSAGES.RESERVATION_TIME_REQUIRED }),
    duration: z
        .number()
        .int()
        .min(VALIDATION_RULES.DURATION_MIN)
        .max(VALIDATION_RULES.DURATION_MAX)
        .optional()
        .default(120),
    headCount: z
        .number()
        .int()
        .min(VALIDATION_RULES.HEADCOUNT_MIN, { message: VALIDATION_MESSAGES.HEADCOUNT_INVALID })
        .max(VALIDATION_RULES.HEADCOUNT_MAX),
    specialRequest: z.string().optional(),
    depositAmount: z.number().min(0).optional(),
    notes: z.string().optional(),
});

export const updateReservationSchema = z.object({
    customerName: z
        .string()
        .min(VALIDATION_RULES.CUSTOMER_NAME_MIN_LENGTH)
        .max(VALIDATION_RULES.CUSTOMER_NAME_MAX_LENGTH)
        .optional(),
    phoneNumber: z
        .string()
        .min(VALIDATION_RULES.PHONE_MIN_LENGTH)
        .max(VALIDATION_RULES.PHONE_MAX_LENGTH)
        .optional(),
    email: z.string().email().optional(),
    tableId: z.number().int().positive().optional(),
    reservationDate: z.string().datetime().optional(),
    reservationTime: z.string().optional(),
    duration: z.number().int().min(VALIDATION_RULES.DURATION_MIN).max(VALIDATION_RULES.DURATION_MAX).optional(),
    headCount: z.number().int().min(VALIDATION_RULES.HEADCOUNT_MIN).max(VALIDATION_RULES.HEADCOUNT_MAX).optional(),
    specialRequest: z.string().optional(),
    depositAmount: z.number().min(0).optional(),
    status: z
        .enum(['pending', 'confirmed', 'seated', 'completed', 'cancelled', 'no_show'])
        .optional(),
    notes: z.string().optional(),
});

export const updateReservationStatusSchema = z.object({
    status: z.enum(['pending', 'confirmed', 'seated', 'completed', 'cancelled', 'no_show'], {
        message: 'Invalid reservation status',
    }),
});
