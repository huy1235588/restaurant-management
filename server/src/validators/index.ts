import { z } from 'zod';

// ============================================
// Authentication DTOs
// ============================================

export const LoginSchema = z.object({
    username: z.string().min(3, 'Username must be at least 3 characters'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const RegisterSchema = z.object({
    username: z.string().min(3).max(50),
    email: z.email(),
    phoneNumber: z.string().regex(/^[0-9]{10,11}$/, 'Invalid phone number'),
    password: z.string().min(6),
});

export type LoginDTO = z.infer<typeof LoginSchema>;
export type RegisterDTO = z.infer<typeof RegisterSchema>;

// ============================================
// Staff DTOs
// ============================================

export const CreateStaffSchema = z.object({
    username: z.string().min(3).max(50),
    email: z.email(),
    phoneNumber: z.string().regex(/^[0-9]{10,11}$/),
    password: z.string().min(6),
    fullName: z.string().min(2),
    address: z.string().optional(),
    dateOfBirth: z.iso.datetime().optional(),
    hireDate: z.iso.datetime().optional(),
    salary: z.number().positive().optional(),
    role: z.enum(['admin', 'manager', 'waiter', 'chef', 'bartender', 'cashier']),
});

export const UpdateStaffSchema = z.object({
    fullName: z.string().min(2).optional(),
    address: z.string().optional(),
    dateOfBirth: z.iso.datetime().optional(),
    salary: z.number().positive().optional(),
    role: z.enum(['admin', 'manager', 'waiter', 'chef', 'bartender', 'cashier']).optional(),
    isActive: z.boolean().optional(),
});

export type CreateStaffDTO = z.infer<typeof CreateStaffSchema>;
export type UpdateStaffDTO = z.infer<typeof UpdateStaffSchema>;

// ============================================
// Category DTOs
// ============================================

export const CreateCategorySchema = z.object({
    categoryName: z.string().min(2).max(100),
    description: z.string().max(500).optional(),
    displayOrder: z.number().int().optional(),
    imageUrl: z.url().optional(),
});

export const UpdateCategorySchema = CreateCategorySchema.partial().extend({
    isActive: z.boolean().optional(),
});

export type CreateCategoryDTO = z.infer<typeof CreateCategorySchema>;
export type UpdateCategoryDTO = z.infer<typeof UpdateCategorySchema>;

// ============================================
// Menu Item DTOs
// ============================================

export const CreateMenuItemSchema = z.object({
    itemCode: z.string().min(2).max(20),
    itemName: z.string().min(2).max(100),
    categoryId: z.number().int().positive(),
    price: z.number().positive(),
    cost: z.number().positive().optional(),
    description: z.string().max(1000).optional(),
    imageUrl: z.url().optional(),
    preparationTime: z.number().int().positive().optional(),
    spicyLevel: z.number().int().min(0).max(5).optional(),
    isVegetarian: z.boolean().optional(),
    calories: z.number().int().positive().optional(),
    displayOrder: z.number().int().optional(),
});

export const UpdateMenuItemSchema = CreateMenuItemSchema.partial().extend({
    isAvailable: z.boolean().optional(),
    isActive: z.boolean().optional(),
});

export type CreateMenuItemDTO = z.infer<typeof CreateMenuItemSchema>;
export type UpdateMenuItemDTO = z.infer<typeof UpdateMenuItemSchema>;

// ============================================
// Table DTOs
// ============================================

export const CreateTableSchema = z.object({
    tableNumber: z.string().min(1).max(20),
    tableName: z.string().max(50).optional(),
    capacity: z.number().int().positive(),
    minCapacity: z.number().int().positive().optional(),
    floor: z.number().int().positive().optional(),
    section: z.string().max(50).optional(),
});

export const UpdateTableSchema = CreateTableSchema.partial().extend({
    status: z.enum(['available', 'occupied', 'reserved', 'maintenance']).optional(),
    isActive: z.boolean().optional(),
});

export type CreateTableDTO = z.infer<typeof CreateTableSchema>;
export type UpdateTableDTO = z.infer<typeof UpdateTableSchema>;

// ============================================
// Reservation DTOs
// ============================================

export const CreateReservationSchema = z.object({
    customerName: z.string().min(2).max(255),
    phoneNumber: z.string().regex(/^[0-9]{10,11}$/),
    email: z.email().optional(),
    tableId: z.number().int().positive(),
    reservationDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    reservationTime: z.string().regex(/^\d{2}:\d{2}$/),
    duration: z.number().int().positive().optional(),
    headCount: z.number().int().positive(),
    specialRequest: z.string().optional(),
    depositAmount: z.number().positive().optional(),
    notes: z.string().optional(),
});

export const UpdateReservationSchema = CreateReservationSchema.partial().extend({
    status: z.enum(['pending', 'confirmed', 'seated', 'completed', 'cancelled', 'no_show']).optional(),
});

export type CreateReservationDTO = z.infer<typeof CreateReservationSchema>;
export type UpdateReservationDTO = z.infer<typeof UpdateReservationSchema>;

// ============================================
// Order DTOs
// ============================================

export const CreateOrderItemSchema = z.object({
    itemId: z.number().int().positive(),
    quantity: z.number().int().positive(),
    specialRequest: z.string().optional(),
});

export const CreateOrderSchema = z.object({
    tableId: z.number().int().positive(),
    staffId: z.number().int().positive().optional(),
    reservationId: z.number().int().positive().optional(),
    customerName: z.string().max(255).optional(),
    customerPhone: z.string().regex(/^[0-9]{10,11}$/).optional(),
    headCount: z.number().int().positive().optional(),
    notes: z.string().optional(),
    items: z.array(CreateOrderItemSchema).min(1),
});

export const UpdateOrderSchema = z.object({
    status: z.enum(['pending', 'confirmed', 'preparing', 'ready', 'served', 'cancelled']).optional(),
    notes: z.string().optional(),
});

export type CreateOrderItemDTO = z.infer<typeof CreateOrderItemSchema>;
export type CreateOrderDTO = z.infer<typeof CreateOrderSchema>;
export type UpdateOrderDTO = z.infer<typeof UpdateOrderSchema>;

// ============================================
// Bill DTOs
// ============================================

export const CreateBillSchema = z.object({
    orderId: z.number().int().positive(),
    taxRate: z.number().min(0).max(100).optional(),
    discountAmount: z.number().min(0).optional(),
    serviceCharge: z.number().min(0).optional(),
});

export const ProcessPaymentSchema = z.object({
    paymentMethod: z.enum(['cash', 'card', 'momo', 'bank_transfer']),
    paidAmount: z.number().positive(),
    transactionId: z.string().optional(),
    cardNumber: z.string().max(4).optional(),
    cardHolderName: z.string().max(255).optional(),
    notes: z.string().optional(),
});

export type CreateBillDTO = z.infer<typeof CreateBillSchema>;
export type ProcessPaymentDTO = z.infer<typeof ProcessPaymentSchema>;

// ============================================
// Kitchen Order DTOs
// ============================================

export const UpdateKitchenOrderSchema = z.object({
    staffId: z.number().int().positive().optional(),
    priority: z.number().int().optional(),
    status: z.enum(['pending', 'confirmed', 'preparing', 'ready', 'served', 'cancelled']).optional(),
    estimatedTime: z.number().int().positive().optional(),
    notes: z.string().optional(),
});

export type UpdateKitchenOrderDTO = z.infer<typeof UpdateKitchenOrderSchema>;
