import axiosInstance from '@/lib/axios';
import { ApiResponse, PaginatedResponse } from '@/types';

// ============================================
// Order Types (Extended from existing)
// ============================================

export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'PREPARING' | 'READY' | 'SERVING' | 'COMPLETED' | 'CANCELLED';
export type OrderItemStatus = 'PENDING' | 'PREPARING' | 'READY' | 'SERVED' | 'CANCELLED';
export type OrderPriority = 'NORMAL' | 'EXPRESS' | 'VIP';

export interface OrderItem {
    id: number;
    orderId: number;
    menuItemId: number;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    specialRequest?: string;
    status: OrderItemStatus;
    createdAt: string;
    updatedAt: string;
    menuItem?: {
        itemId: number;
        name: string;
        price: number;
        imageUrl?: string;
        category?: string;
    };
}

export interface Order {
    id: number;
    orderNumber: string;
    tableId: number;
    staffId: number;
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
    };
    staff?: {
        staffId: number;
        firstName: string;
        lastName: string;
    };
    items: OrderItem[];
}

export interface CreateOrderDto {
    tableId: number;
    staffId?: number;
    reservationId?: number;
    customerName?: string;
    customerPhone?: string;
    headCount?: number;
    notes?: string;
    items: {
        itemId: number;
        quantity: number;
        specialRequest?: string;
    }[];
}

export interface UpdateOrderDto {
    tableId?: number;
    customerName?: string;
    customerPhone?: string;
    headCount?: number;
    notes?: string;
    items?: {
        itemId: number;
        quantity: number;
        specialRequest?: string;
    }[];
}

export interface AddOrderItemsDto {
    items: {
        itemId: number;
        quantity: number;
        specialRequest?: string;
    }[];
}

export interface UpdateOrderStatusDto {
    status: OrderStatus;
}

export interface UpdateOrderItemStatusDto {
    status: OrderItemStatus;
}

export interface CancelOrderDto {
    reason?: string;
}

// Reports interfaces
export interface SalesByTableReport {
    tableId: number;
    tableNumber: string;
    floor: number;
    totalOrders: number;
    totalRevenue: number;
    averageOrderValue: number;
}

export interface PopularItemsReport {
    itemId: number;
    itemName: string;
    category: string;
    totalOrdered: number;
    totalRevenue: number;
    imageUrl?: string;
}

export interface WaiterPerformanceReport {
    staffId: number;
    staffName: string;
    totalOrders: number;
    completedOrders: number;
    cancelledOrders: number;
    totalRevenue: number;
    averageOrderValue: number;
}

export interface CustomerHistoryReport {
    customerPhone: string;
    customerName?: string;
    totalOrders: number;
    totalSpent: number;
    lastOrderDate: string;
    orders: Order[];
}

// ============================================
// Order Management API
// ============================================

export const orderManagementApi = {
    // ========== Order CRUD ==========
    
    /**
     * Get all orders with filters and pagination
     */
    getAll: async (params?: {
        tableId?: number;
        status?: OrderStatus;
        startDate?: string;
        endDate?: string;
        page?: number;
        limit?: number;
        sortBy?: string;
        sortOrder?: 'asc' | 'desc';
    }): Promise<PaginatedResponse<Order>> => {
        const response = await axiosInstance.get<ApiResponse<PaginatedResponse<Order>>>(
            '/orders',
            { params }
        );
        return response.data.data;
    },

    /**
     * Get order by ID
     */
    getById: async (id: number): Promise<Order> => {
        const response = await axiosInstance.get<ApiResponse<Order>>(
            `/orders/${id}`
        );
        return response.data.data;
    },

    /**
     * Create a new order
     */
    create: async (data: CreateOrderDto): Promise<Order> => {
        const response = await axiosInstance.post<ApiResponse<Order>>(
            '/orders',
            data
        );
        return response.data.data;
    },

    /**
     * Update an existing order
     */
    update: async (id: number, data: UpdateOrderDto): Promise<Order> => {
        const response = await axiosInstance.put<ApiResponse<Order>>(
            `/orders/${id}`,
            data
        );
        return response.data.data;
    },

    /**
     * Delete/Cancel an order
     */
    delete: async (id: number): Promise<void> => {
        await axiosInstance.delete(`/orders/${id}`);
    },

    // ========== Order Status Management ==========
    
    /**
     * Update order status
     */
    updateStatus: async (id: number, status: OrderStatus): Promise<Order> => {
        const response = await axiosInstance.patch<ApiResponse<Order>>(
            `/orders/${id}/status`,
            { status }
        );
        return response.data.data;
    },

    /**
     * Cancel order with reason
     */
    cancel: async (id: number, reason?: string): Promise<Order> => {
        const response = await axiosInstance.post<ApiResponse<Order>>(
            `/orders/${id}/cancel`,
            { reason }
        );
        return response.data.data;
    },

    // ========== Order Items Management ==========
    
    /**
     * Add items to existing order
     */
    addItems: async (id: number, data: AddOrderItemsDto): Promise<Order> => {
        const response = await axiosInstance.post<ApiResponse<Order>>(
            `/orders/${id}/items`,
            data
        );
        return response.data.data;
    },

    /**
     * Update order item status
     */
    updateItemStatus: async (
        orderId: number,
        itemId: number,
        status: OrderItemStatus
    ): Promise<Order> => {
        const response = await axiosInstance.patch<ApiResponse<Order>>(
            `/orders/${orderId}/items/${itemId}/status`,
            { status }
        );
        return response.data.data;
    },

    // ========== Reports ==========
    
    /**
     * Get sales by table report
     */
    getSalesByTable: async (params?: {
        startDate?: string;
        endDate?: string;
        floor?: number;
    }): Promise<SalesByTableReport[]> => {
        const response = await axiosInstance.get<ApiResponse<SalesByTableReport[]>>(
            '/orders/reports/by-table',
            { params }
        );
        return response.data.data;
    },

    /**
     * Get popular items report
     */
    getPopularItems: async (params?: {
        startDate?: string;
        endDate?: string;
        limit?: number;
    }): Promise<PopularItemsReport[]> => {
        const response = await axiosInstance.get<ApiResponse<PopularItemsReport[]>>(
            '/orders/reports/popular-items',
            { params }
        );
        return response.data.data;
    },

    /**
     * Get waiter performance report
     */
    getWaiterPerformance: async (params?: {
        startDate?: string;
        endDate?: string;
        staffId?: number;
    }): Promise<WaiterPerformanceReport[]> => {
        const response = await axiosInstance.get<ApiResponse<WaiterPerformanceReport[]>>(
            '/orders/reports/by-waiter',
            { params }
        );
        return response.data.data;
    },

    /**
     * Get customer order history by phone
     */
    getCustomerHistory: async (phone: string): Promise<CustomerHistoryReport> => {
        const response = await axiosInstance.get<ApiResponse<CustomerHistoryReport>>(
            `/orders/reports/customer-history/${phone}`
        );
        return response.data.data;
    },
};
