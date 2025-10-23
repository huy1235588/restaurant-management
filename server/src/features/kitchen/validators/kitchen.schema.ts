import { z } from 'zod';
import { VALIDATION_MESSAGES } from '@/shared/constants';

export const createKitchenOrderSchema = z.object({
    orderId: z.number().int().positive({ message: VALIDATION_MESSAGES.REQUIRED_FIELD }),
    staffId: z.number().int().positive().optional(),
    priority: z.number().int().min(0).max(10).optional().default(0),
    estimatedTime: z.number().int().positive().optional(),
    notes: z.string().optional(),
});

export const updateKitchenOrderSchema = z.object({
    staffId: z.number().int().positive().optional(),
    priority: z.number().int().min(0).max(10).optional(),
    status: z.enum(['pending', 'confirmed', 'preparing', 'ready', 'served', 'cancelled']).optional(),
    estimatedTime: z.number().int().positive().optional(),
    notes: z.string().optional(),
});

export const updateKitchenOrderStatusSchema = z.object({
    status: z.enum(['pending', 'confirmed', 'preparing', 'ready', 'served', 'cancelled'], {
        message: 'Invalid kitchen order status',
    }),
});

export const assignChefSchema = z.object({
    staffId: z.number().int().positive({ message: VALIDATION_MESSAGES.REQUIRED_FIELD }),
});
