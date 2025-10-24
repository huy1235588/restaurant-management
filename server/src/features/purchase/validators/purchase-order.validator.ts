import { z } from 'zod';

const purchaseOrderItemSchema = z.object({
    ingredientId: z.number().int().positive(),
    quantity: z.number().positive(),
    unit: z.string().min(1).max(20),
    unitPrice: z.number().nonnegative(),
});

export const createPurchaseOrderSchema = z.object({
    supplierId: z.number().int().positive(),
    expectedDate: z.string().datetime().optional(),
    notes: z.string().optional(),
    items: z.array(purchaseOrderItemSchema).min(1),
});

export const updatePurchaseOrderSchema = z.object({
    supplierId: z.number().int().positive().optional(),
    expectedDate: z.string().datetime().optional(),
    status: z.enum(['pending', 'ordered', 'received', 'cancelled']).optional(),
    notes: z.string().optional(),
});

const receivePurchaseOrderItemSchema = z.object({
    itemId: z.number().int().positive(),
    receivedQuantity: z.number().nonnegative(),
    batchNumber: z.string().min(1).max(50),
    expiryDate: z.string().datetime().optional(),
});

export const receivePurchaseOrderSchema = z.object({
    receivedDate: z.string().datetime().optional(),
    items: z.array(receivePurchaseOrderItemSchema).min(1),
});

export const purchaseOrderQuerySchema = z.object({
    page: z.coerce.number().int().positive().optional().default(1),
    limit: z.coerce.number().int().positive().max(100).optional().default(20),
    supplierId: z.coerce.number().int().positive().optional(),
    status: z.enum(['pending', 'ordered', 'received', 'cancelled']).optional(),
    fromDate: z.string().datetime().optional(),
    toDate: z.string().datetime().optional(),
});
