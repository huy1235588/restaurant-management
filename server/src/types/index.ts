// ============================================
// Common Types
// ============================================

export interface ApiResponse<T = any> {
    success: boolean;
    message: string;
    data?: T;
    error?: any;
}

export interface PaginationParams {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
    data: T[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

// ============================================
// Re-export Prisma Enum Types
// ============================================

import { $Enums } from '@prisma/client';

export type Role = $Enums.Role;
export type TableStatus = $Enums.TableStatus;
export type OrderStatus = $Enums.OrderStatus;
export type PaymentStatus = $Enums.PaymentStatus;
export type PaymentMethod = $Enums.PaymentMethod;
export type ReservationStatus = $Enums.ReservationStatus;

// ============================================
// Entity Interfaces
// ============================================

export interface IAccount {
    accountId: number;
    username: string;
    email: string;
    phoneNumber: string;
    password: string;
    isActive: boolean;
    lastLogin?: Date | null;
    createdAt: Date;
    updatedAt: Date;
}

export interface IStaff {
    staffId: number;
    accountId: number;
    fullName: string;
    address?: string | null;
    dateOfBirth?: Date | null;
    hireDate: Date;
    salary?: number | null;
    role: Role;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface ICategory {
    categoryId: number;
    categoryName: string;
    description?: string | null;
    displayOrder: number;
    isActive: boolean;
    imageUrl?: string | null;
    createdAt: Date;
    updatedAt: Date;
}

export interface IMenuItem {
    itemId: number;
    itemCode: string;
    itemName: string;
    categoryId: number;
    price: number;
    cost?: number | null;
    description?: string | null;
    imageUrl?: string | null;
    isAvailable: boolean;
    isActive: boolean;
    preparationTime?: number | null;
    spicyLevel?: number | null;
    isVegetarian: boolean;
    calories?: number | null;
    displayOrder: number;
    createdAt: Date;
    updatedAt: Date;
}

export interface IRestaurantTable {
    tableId: number;
    tableNumber: string;
    tableName?: string | null;
    capacity: number;
    minCapacity: number;
    floor: number;
    section?: string | null;
    status: TableStatus;
    qrCode?: string | null;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface IReservation {
    reservationId: number;
    reservationCode: string;
    customerName: string;
    phoneNumber: string;
    email?: string | null;
    tableId: number;
    reservationDate: Date;
    reservationTime: Date;
    duration: number;
    headCount: number;
    specialRequest?: string | null;
    depositAmount?: number | null;
    status: ReservationStatus;
    notes?: string | null;
    createdAt: Date;
    updatedAt: Date;
}

export interface IOrder {
    orderId: number;
    orderNumber: string;
    tableId: number;
    staffId?: number | null;
    reservationId?: number | null;
    customerName?: string | null;
    customerPhone?: string | null;
    headCount: number;
    status: OrderStatus;
    notes?: string | null;
    orderTime: Date;
    confirmedAt?: Date | null;
    completedAt?: Date | null;
    createdAt: Date;
    updatedAt: Date;
}

export interface IOrderItem {
    orderItemId: number;
    orderId: number;
    itemId: number;
    quantity: number;
    unitPrice: number;
    subtotal: number;
    specialRequest?: string | null;
    status: OrderStatus;
    createdAt: Date;
    updatedAt: Date;
}

export interface IBill {
    billId: number;
    billNumber: string;
    orderId: number;
    tableId: number;
    staffId?: number | null;
    subtotal: number;
    taxAmount: number;
    taxRate: number;
    discountAmount: number;
    serviceCharge: number;
    totalAmount: number;
    paidAmount: number;
    changeAmount: number;
    paymentStatus: PaymentStatus;
    paymentMethod?: PaymentMethod | null;
    notes?: string | null;
    createdAt: Date;
    paidAt?: Date | null;
    updatedAt: Date;
}

export interface IKitchenOrder {
    kitchenOrderId: number;
    orderId: number;
    staffId?: number | null;
    priority: number;
    status: OrderStatus;
    startedAt?: Date | null;
    completedAt?: Date | null;
    estimatedTime?: number | null;
    notes?: string | null;
    createdAt: Date;
    updatedAt: Date;
}
