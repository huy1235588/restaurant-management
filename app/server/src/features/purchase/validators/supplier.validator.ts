import { z } from 'zod';

export const createSupplierSchema = z.object({
    supplierCode: z.string().min(1).max(20),
    supplierName: z.string().min(1).max(255),
    contactPerson: z.string().max(255).optional(),
    phoneNumber: z.string().max(20).optional(),
    email: z.string().email().max(255).optional(),
    address: z.string().optional(),
    taxCode: z.string().max(50).optional(),
    paymentTerms: z.string().max(100).optional(),
});

export const updateSupplierSchema = z.object({
    supplierCode: z.string().min(1).max(20).optional(),
    supplierName: z.string().min(1).max(255).optional(),
    contactPerson: z.string().max(255).optional(),
    phoneNumber: z.string().max(20).optional(),
    email: z.string().email().max(255).optional(),
    address: z.string().optional(),
    taxCode: z.string().max(50).optional(),
    paymentTerms: z.string().max(100).optional(),
    isActive: z.boolean().optional(),
});

export const supplierQuerySchema = z.object({
    page: z.coerce.number().int().positive().optional().default(1),
    limit: z.coerce.number().int().positive().max(100).optional().default(20),
    search: z.string().optional(),
    isActive: z.coerce.boolean().optional(),
});
