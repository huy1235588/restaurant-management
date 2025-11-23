import { z } from 'zod';

// Order item schema
export const createOrderItemSchema = z.object({
    itemId: z.number().positive('Item ID must be positive'),
    quantity: z.number().min(1, 'Quantity must be at least 1'),
    specialRequest: z.string().max(500).optional(),
});

// Create order schema
export const createOrderSchema = z.object({
    tableId: z.number().positive('Table ID is required'),
    reservationId: z.number().positive().optional(),
    customerName: z.string().max(255).optional(),
    customerPhone: z
        .string()
        .regex(/^[0-9]{10,20}$/, 'Invalid phone number format')
        .optional()
        .or(z.literal('')),
    partySize: z.number().min(1, 'Party size must be at least 1'),
    notes: z.string().max(1000).optional(),
    items: z
        .array(createOrderItemSchema)
        .min(1, 'At least one item is required'),
});

// Add items schema
export const addItemsSchema = z.object({
    items: z
        .array(createOrderItemSchema)
        .min(1, 'At least one item is required'),
});

// Cancel item schema
export const cancelItemSchema = z.object({
    reason: z.string().min(1, 'Reason is required').max(500),
});

// Cancel order schema
export const cancelOrderSchema = z.object({
    reason: z.string().min(1, 'Reason is required').max(500),
});

// Update order status schema
export const updateOrderStatusSchema = z.object({
    status: z.enum(['pending', 'confirmed', 'ready', 'serving', 'completed', 'cancelled']),
});

// Step 1: Table selection schema
export const step1TableSchema = z.object({
    tableId: z.number().positive('Please select a table'),
});

// Step 2: Customer info schema
export const step2CustomerSchema = z.object({
    customerName: z.string().max(255).optional(),
    customerPhone: z
        .string()
        .regex(/^[0-9]{10,20}$/, 'Invalid phone number format')
        .optional()
        .or(z.literal('')),
    partySize: z.number().min(1, 'Party size must be at least 1'),
    reservationId: z.number().positive().optional(),
});

// Step 3: Menu items schema
export const step3MenuItemsSchema = z.object({
    items: z
        .array(createOrderItemSchema)
        .min(1, 'Please add at least one item'),
});

// Step 4: Review schema
export const step4ReviewSchema = z.object({
    notes: z.string().max(1000).optional(),
});
