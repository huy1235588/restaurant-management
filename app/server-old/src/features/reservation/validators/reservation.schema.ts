import { z } from 'zod';
import { VALIDATION_RULES, VALIDATION_MESSAGES } from '@/shared/constants';

const timeRegex = /^([01]\d|2[0-3]):[0-5]\d$/;

export const createReservationSchema = z.object({
    customerId: z.number().int().positive().optional(),
    customerName: z
        .string()
        .min(VALIDATION_RULES.CUSTOMER_NAME_MIN_LENGTH, { message: VALIDATION_MESSAGES.CUSTOMER_NAME_REQUIRED })
        .max(VALIDATION_RULES.CUSTOMER_NAME_MAX_LENGTH),
    phoneNumber: z
        .string()
        .min(VALIDATION_RULES.PHONE_MIN_LENGTH, { message: VALIDATION_MESSAGES.INVALID_PHONE })
        .max(VALIDATION_RULES.PHONE_MAX_LENGTH),
    email: z.email().optional(),
    tableId: z.number().int().positive().optional(),
    floor: z.number().int().positive().optional(),
    preferredTableId: z.number().int().positive().optional(),
    reservationDate: z.iso.date({ message: VALIDATION_MESSAGES.RESERVATION_DATE_REQUIRED }),
    reservationTime: z
        .string({ message: VALIDATION_MESSAGES.RESERVATION_TIME_REQUIRED })
        .regex(timeRegex, 'Time must be in HH:mm format'),
    duration: z
        .number()
        .int()
        .min(VALIDATION_RULES.DURATION_MIN)
        .max(VALIDATION_RULES.DURATION_MAX)
        .optional(),
    headCount: z
        .number()
        .int()
        .min(VALIDATION_RULES.HEADCOUNT_MIN, { message: VALIDATION_MESSAGES.HEADCOUNT_INVALID })
        .max(VALIDATION_RULES.HEADCOUNT_MAX),
    specialRequest: z.string().optional(),
    depositAmount: z.number().min(0).optional(),
    status: z.enum(['pending', 'confirmed', 'seated', 'completed', 'cancelled', 'no_show']).optional(),
    notes: z.string().optional(),
    tags: z.array(z.string()).optional(),
});

export const updateReservationSchema = createReservationSchema.partial();

export const updateReservationStatusSchema = z.object({
    status: z.enum(['pending', 'confirmed', 'seated', 'completed', 'cancelled', 'no_show'], {
        message: 'Invalid reservation status',
    }),
});

export const cancelReservationSchema = z.object({
    reason: z.string().max(VALIDATION_RULES.DESCRIPTION_MAX_LENGTH).optional(),
});
