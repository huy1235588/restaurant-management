import { z } from 'zod';

export const CreateOrderSchema = z.object({
    tableId: z.number(),
    staffId: z.number().optional(),
    reservationId: z.number().optional(),
    customerName: z.string().optional(),
    customerPhone: z.string().optional(),
    headCount: z.number(),
    items: z.array(z.object({
        itemId: z.number(),
        quantity: z.number(),
        specialRequest: z.string().optional(),
    })),
    notes: z.string().optional(),
});

export const UpdateOrderSchema = z.object({
    status: z.string().optional(),
    notes: z.string().optional(),
});
