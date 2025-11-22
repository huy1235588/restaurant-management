import axiosInstance from '@/lib/axios';
import { ApiResponse, PaginatedResponse } from '@/types';
import {
    Order,
    OrderItem,
    CreateOrderDto,
    AddOrderItemDto,
    UpdateOrderItemDto,
    CancelOrderDto,
    OrderFilters,
} from '../types';

export const orderApi = {
    // Get all orders with filters
    getAll: async (params?: OrderFilters & {
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

    // Create new order
    create: async (data: CreateOrderDto): Promise<Order> => {
        const response = await axiosInstance.post<ApiResponse<Order>>('/orders', data);
        return response.data.data;
    },

    // Update order (pending only)
    update: async (id: number, data: Partial<CreateOrderDto>): Promise<Order> => {
        const response = await axiosInstance.patch<ApiResponse<Order>>(
            `/orders/${id}`,
            data
        );
        return response.data.data;
    },

    // Confirm order (send to kitchen)
    confirm: async (id: number): Promise<Order> => {
        const response = await axiosInstance.post<ApiResponse<Order>>(
            `/orders/${id}/confirm`
        );
        return response.data.data;
    },

    // Cancel order
    cancel: async (id: number, data: CancelOrderDto): Promise<Order> => {
        const response = await axiosInstance.delete<ApiResponse<Order>>(
            `/orders/${id}`,
            { data }
        );
        return response.data.data;
    },

    // Add item to order
    addItem: async (orderId: number, data: AddOrderItemDto): Promise<OrderItem> => {
        const response = await axiosInstance.post<ApiResponse<OrderItem>>(
            `/orders/${orderId}/items`,
            data
        );
        return response.data.data;
    },

    // Update order item
    updateItem: async (
        orderId: number,
        itemId: number,
        data: UpdateOrderItemDto
    ): Promise<OrderItem> => {
        const response = await axiosInstance.patch<ApiResponse<OrderItem>>(
            `/orders/${orderId}/items/${itemId}`,
            data
        );
        return response.data.data;
    },

    // Remove item from order
    removeItem: async (orderId: number, itemId: number): Promise<void> => {
        await axiosInstance.delete(`/orders/${orderId}/items/${itemId}`);
    },
};
