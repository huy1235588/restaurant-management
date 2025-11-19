import { OrderStatus } from '@/shared/types';

export interface CreateOrderDTO {
    tableId: number;
    staffId?: number;
    reservationId?: number;
    customerName?: string;
    customerPhone?: string;
    headCount: number;
    items: Array<{
        itemId: number;
        quantity: number;
        specialRequest?: string;
    }>;
    notes?: string;
    // Financial fields
    discountAmount?: number;
    taxRate?: number; // Percentage (e.g., 10 for 10%)
}

export interface UpdateOrderDTO {
    status?: OrderStatus;
    notes?: string;
    discountAmount?: number;
    taxRate?: number;
}

export interface CancelOrderDTO {
    reason: string;
}

export interface OrderReportByTableDTO {
    tableId: number;
    tableName: string;
    totalOrders: number;
    totalRevenue: number;
    averageOrderValue: number;
}

export interface OrderReportPopularItemsDTO {
    itemId: number;
    itemName: string;
    category: string;
    totalQuantity: number;
    totalRevenue: number;
    orderCount: number;
}

export interface OrderReportByWaiterDTO {
    staffId: number;
    staffName: string;
    totalOrders: number;
    totalRevenue: number;
    averageOrderValue: number;
}

export interface OrderReportCustomerHistoryDTO {
    customerPhone: string;
    customerName: string;
    totalOrders: number;
    totalSpent: number;
    lastOrderDate: Date;
    averageOrderValue: number;
}
