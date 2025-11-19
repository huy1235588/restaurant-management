// Order Types - Synced with Backend API
export type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'ready' | 'served' | 'completed' | 'cancelled';

export interface OrderItem {
    orderItemId: number;
    orderId: number;
    itemId: number;
    quantity: number;
    unitPrice: number;
    totalPrice: number; // Backend uses totalPrice, not subtotal
    specialRequest?: string;
    status: OrderStatus;
    createdAt: string;
    updatedAt: string;
    menuItem?: {
        itemId: number;
        itemName: string;
        price: number;
        imageUrl?: string;
        category?: string;
    };
}

export interface Order {
    orderId: number;
    orderNumber: string;
    tableId: number;
    staffId?: number;
    reservationId?: number;
    customerName?: string;
    customerPhone?: string;
    headCount: number;
    notes?: string;
    status: OrderStatus;
    totalAmount: number;
    discountAmount: number;
    taxAmount: number;
    finalAmount: number;
    createdAt: string;
    updatedAt: string;
    confirmedAt?: string;
    completedAt?: string;
    cancelledAt?: string;
    cancellationReason?: string;
    table?: {
        tableId: number;
        tableNumber: string;
        floor: number;
        status?: string;
    };
    staff?: {
        staffId: number;
        fullName: string;
        role?: string;
    };
    orderItems: OrderItem[];
}

// DTOs for API calls
export interface CreateOrderDto {
    tableId: number;
    staffId?: number;
    reservationId?: number;
    customerName?: string;
    customerPhone?: string;
    headCount: number;
    items: {
        itemId: number;
        quantity: number;
        specialRequest?: string;
    }[];
    notes?: string;
    discountAmount?: number;
    taxRate?: number;
}

export interface UpdateOrderDto {
    status?: OrderStatus;
    notes?: string;
    discountAmount?: number;
    taxRate?: number;
}

export interface AddOrderItemsDto {
    items: {
        itemId: number;
        quantity: number;
        specialRequest?: string;
    }[];
}

export interface CancelOrderDto {
    reason?: string;
}

export interface UpdateOrderItemStatusDto {
    status: OrderStatus;
}

// Form data for creating orders
export interface OrderFormData {
    tableId: number;
    customerName?: string;
    customerPhone?: string;
    headCount: number;
    items: {
        itemId: number;
        quantity: number;
        specialRequest?: string;
    }[];
    notes?: string;
}

// Reports
export interface OrderReportByTable {
    tableId: number;
    tableName: string;
    totalOrders: number;
    totalRevenue: number;
    averageOrderValue: number;
}

export interface OrderReportPopularItems {
    itemId: number;
    itemName: string;
    category: string;
    totalQuantity: number;
    totalRevenue: number;
    orderCount: number;
}

export interface OrderReportByWaiter {
    staffId: number;
    staffName: string;
    totalOrders: number;
    totalRevenue: number;
    averageOrderValue: number;
}

export interface OrderReportCustomerHistory {
    customerPhone: string;
    customerName?: string;
    totalOrders: number;
    totalSpent: number;
    lastOrderDate: string;
    averageOrderValue: number;
    orders?: Order[];
}
