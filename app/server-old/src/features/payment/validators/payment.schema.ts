import { z } from 'zod';
import { VALIDATION_MESSAGES } from '@/shared/constants';

export const createPaymentSchema = z.object({
    billId: z.number().int().positive({ message: VALIDATION_MESSAGES.REQUIRED_FIELD }),
    paymentMethod: z.enum(['cash', 'card', 'momo', 'bank_transfer'], {
        message: 'Invalid payment method',
    }),
    amount: z.number().min(0, { message: VALIDATION_MESSAGES.INVALID_POSITIVE_NUMBER }),
    transactionId: z.string().optional(),
    cardNumber: z.string().max(20).optional(),
    cardHolderName: z.string().max(255).optional(),
    notes: z.string().optional(),
});

export const updatePaymentSchema = z.object({
    paymentMethod: z.enum(['cash', 'card', 'momo', 'bank_transfer']).optional(),
    amount: z.number().min(0).optional(),
    transactionId: z.string().optional(),
    cardNumber: z.string().max(20).optional(),
    cardHolderName: z.string().max(255).optional(),
    status: z.enum(['pending', 'paid', 'refunded', 'cancelled']).optional(),
    notes: z.string().optional(),
});

export const updatePaymentStatusSchema = z.object({
    status: z.enum(['pending', 'paid', 'refunded', 'cancelled'], {
        message: 'Invalid payment status',
    }),
});
