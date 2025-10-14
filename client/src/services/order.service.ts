import axiosInstance from '@/lib/axios';
import { Order, OrderFormData, ApiResponse, PaginatedResponse, OrderStatus } from '@/types';

export const orderApi = {
    // Get all orders
    getAll: async (params?: {
        status?: OrderStatus;
        tableId?: number;
        date?: string;
        page?: number;
        limit?: number;
    }): Promise<PaginatedResponse<Order>> => {
        const response = await axiosInstance.get<ApiResponse<PaginatedResponse<Order>>>(
            '/orders',
            { params }
        );
        return response.data.data;
    },

    // Get order by ID
    getById: async (id: number): Promise<Order> => {
        const response = await axiosInstance.get<ApiResponse<Order>>(`/orders/${id}`);
        return response.data.data;
    },

    // Create order
    create: async (data: OrderFormData): Promise<Order> => {
        const response = await axiosInstance.post<ApiResponse<Order>>('/orders', data);
        return response.data.data;
    },

    // Update order
    update: async (id: number, data: Partial<OrderFormData>): Promise<Order> => {
        const response = await axiosInstance.put<ApiResponse<Order>>(`/orders/${id}`, data);
        return response.data.data;
    },

    // Update order status
    updateStatus: async (id: number, status: OrderStatus): Promise<Order> => {
        const response = await axiosInstance.patch<ApiResponse<Order>>(
            `/orders/${id}/status`,
            { status }
        );
        return response.data.data;
    },

    // Delete order
    delete: async (id: number): Promise<void> => {
        await axiosInstance.delete(`/orders/${id}`);
    },
};
