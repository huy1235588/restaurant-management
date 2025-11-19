import axiosInstance from '@/lib/axios';
import { 
    Order, 
    OrderFormData, 
    CreateOrderDto,
    UpdateOrderDto,
    AddOrderItemsDto,
    CancelOrderDto,
    OrderStatus,
    OrderReportByTable,
    OrderReportPopularItems,
    OrderReportByWaiter,
    OrderReportCustomerHistory
} from '@/types/order';
import { ApiResponse, PaginatedResponse } from '@/types';

/**
 * Order API Service - Synced with Backend API
 */
export const orderApi = {
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
        const response = await axiosInstance.get<ApiResponse<Order>>(`/orders/${id}`);
        return response.data.data;
    },

    /**
     * Create order
     */
    create: async (data: CreateOrderDto): Promise<Order> => {
        const response = await axiosInstance.post<ApiResponse<Order>>('/orders', data);
        return response.data.data;
    },

    /**
     * Update order
     */
    update: async (id: number, data: UpdateOrderDto): Promise<Order> => {
        const response = await axiosInstance.put<ApiResponse<Order>>(`/orders/${id}`, data);
        return response.data.data;
    },

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
     * Delete order (Admin/Manager only)
     */
    delete: async (id: number): Promise<void> => {
        await axiosInstance.delete(`/orders/${id}`);
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
    updateItemStatus: async (orderId: number, itemId: number, status: OrderStatus): Promise<Order> => {
        const response = await axiosInstance.patch<ApiResponse<Order>>(
            `/orders/${orderId}/items/${itemId}/status`,
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

    // ========== Reports ==========

    /**
     * Get orders report by table
     */
    getReportByTable: async (params?: {
        startDate?: string;
        endDate?: string;
    }): Promise<OrderReportByTable[]> => {
        const response = await axiosInstance.get<ApiResponse<OrderReportByTable[]>>(
            '/orders/reports/by-table',
            { params }
        );
        return response.data.data;
    },

    /**
     * Get popular items report
     */
    getReportPopularItems: async (params?: {
        startDate?: string;
        endDate?: string;
        limit?: number;
    }): Promise<OrderReportPopularItems[]> => {
        const response = await axiosInstance.get<ApiResponse<OrderReportPopularItems[]>>(
            '/orders/reports/popular-items',
            { params }
        );
        return response.data.data;
    },

    /**
     * Get waiter performance report
     */
    getReportByWaiter: async (params?: {
        startDate?: string;
        endDate?: string;
        staffId?: number;
    }): Promise<OrderReportByWaiter[]> => {
        const response = await axiosInstance.get<ApiResponse<OrderReportByWaiter[]>>(
            '/orders/reports/by-waiter',
            { params }
        );
        return response.data.data;
    },

    /**
     * Get customer order history by phone
     */
    getReportCustomerHistory: async (phone: string): Promise<OrderReportCustomerHistory> => {
        const response = await axiosInstance.get<ApiResponse<OrderReportCustomerHistory>>(
            `/orders/reports/customer-history/${phone}`
        );
        return response.data.data;
    },
};
