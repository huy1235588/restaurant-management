import { z } from 'zod';

export const createStockTransactionSchema = z.object({
    ingredientId: z.number().int().positive(),
    transactionType: z.enum(['in', 'out', 'adjustment', 'waste']),
    quantity: z.number().positive(),
    unit: z.string().min(1).max(20),
    referenceType: z.string().max(50).optional(),
    referenceId: z.number().int().positive().optional(),
    notes: z.string().optional(),
});

export const stockAdjustmentSchema = z.object({
    ingredientId: z.number().int().positive(),
    newQuantity: z.number().nonnegative(),
    notes: z.string().optional(),
});

export const stockTransactionQuerySchema = z.object({
    page: z.coerce.number().int().positive().optional().default(1),
    limit: z.coerce.number().int().positive().max(100).optional().default(20),
    ingredientId: z.coerce.number().int().positive().optional(),
    transactionType: z.enum(['in', 'out', 'adjustment', 'waste']).optional(),
    fromDate: z.string().datetime().optional(),
    toDate: z.string().datetime().optional(),
});

export const createIngredientBatchSchema = z.object({
    ingredientId: z.number().int().positive(),
    purchaseOrderId: z.number().int().positive().optional(),
    batchNumber: z.string().min(1).max(50),
    quantity: z.number().positive(),
    unit: z.string().min(1).max(20),
    unitCost: z.number().nonnegative().optional(),
    expiryDate: z.string().datetime().optional(),
    receivedDate: z.string().datetime(),
});

export const stockAlertQuerySchema = z.object({
    page: z.coerce.number().int().positive().optional().default(1),
    limit: z.coerce.number().int().positive().max(100).optional().default(20),
    alertType: z.enum(['low_stock', 'expiring_soon', 'expired']).optional(),
    isResolved: z.coerce.boolean().optional(),
});

export const resolveStockAlertSchema = z.object({
    notes: z.string().optional(),
});
