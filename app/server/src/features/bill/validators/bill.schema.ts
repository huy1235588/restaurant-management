import { z } from 'zod';

export const CreateBillSchema = z.object({
    orderId: z.number(),
    tableId: z.number(),
    staffId: z.number().optional(),
    subtotal: z.number(),
    taxAmount: z.number(),
    taxRate: z.number(),
    discountAmount: z.number(),
    serviceCharge: z.number(),
    totalAmount: z.number(),
    notes: z.string().optional(),
});

export const ProcessPaymentSchema = z.object({
    billId: z.number(),
    paidAmount: z.number(),
    paymentMethod: z.string(),
});
