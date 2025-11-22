import axiosInstance from '@/lib/axios';
import {
    Order,
    OrderListResponse,
    OrderResponse,
    CreateOrderDto,
    AddItemsDto,
    CancelItemDto,
    CancelOrderDto,
    UpdateOrderStatusDto,
    OrderFilters,
    KitchenOrder,
    KitchenQueueResponse,
} from '../types';

export const orderApi = {
    // Count orders
    count: async (filters?: OrderFilters): Promise<number> => {
        const response = await axiosInstance.get<{ message: string; data: { count: number } }>(
            '/orders/count',
            { params: filters }
        );
        return response.data.data.count;
    },

    // Get all orders with pagination
    getAll: async (params?: {
        page?: number;
        limit?: number;
        status?: string;
        tableId?: number;
        staffId?: number;
        startDate?: string;
        endDate?: string;
        search?: string;
        sortBy?: string;
        sortOrder?: 'asc' | 'desc';
    }): Promise<OrderListResponse> => {
        const response = await axiosInstance.get<OrderListResponse>('/orders', { params });
        return response.data;
    },

    // Get order by ID
    getById: async (id: number): Promise<Order> => {
        const response = await axiosInstance.get<OrderResponse>(`/orders/${id}`);
        return response.data.data;
    },

    // Create new order
    create: async (data: CreateOrderDto): Promise<Order> => {
        const response = await axiosInstance.post<OrderResponse>('/orders', data);
        return response.data.data;
    },

    // Add items to existing order
    addItems: async (orderId: number, data: AddItemsDto): Promise<Order> => {
        const response = await axiosInstance.patch<OrderResponse>(
            `/orders/${orderId}/items`,
            data
        );
        return response.data.data;
    },

    // Cancel item in order
    cancelItem: async (
        orderId: number,
        itemId: number,
        data: CancelItemDto
    ): Promise<Order> => {
        const response = await axiosInstance.delete<OrderResponse>(
            `/orders/${orderId}/items/${itemId}`,
            { data }
        );
        return response.data.data;
    },

    // Cancel entire order
    cancel: async (orderId: number, data: CancelOrderDto): Promise<Order> => {
        const response = await axiosInstance.delete<OrderResponse>(`/orders/${orderId}`, {
            data,
        });
        return response.data.data;
    },

    // Update order status
    updateStatus: async (orderId: number, data: UpdateOrderStatusDto): Promise<Order> => {
        const response = await axiosInstance.patch<OrderResponse>(
            `/orders/${orderId}/status`,
            data
        );
        return response.data.data;
    },

    // Mark item as served
    markItemAsServed: async (orderId: number, itemId: number): Promise<Order> => {
        const response = await axiosInstance.patch<OrderResponse>(
            `/orders/${orderId}/items/${itemId}/serve`
        );
        return response.data.data;
    },
};

export const kitchenApi = {
    // Get kitchen queue (pending orders)
    getQueue: async (): Promise<KitchenOrder[]> => {
        const response = await axiosInstance.get<KitchenQueueResponse>(
            '/kitchen/queue'
        );
        return response.data.data;
    },

    // Get all kitchen orders
    getAll: async (): Promise<KitchenOrder[]> => {
        const response = await axiosInstance.get<{ message: string; data: KitchenOrder[] }>(
            '/kitchen/orders'
        );
        return response.data.data;
    },

    // Get kitchen order by ID
    getById: async (id: number): Promise<KitchenOrder> => {
        const response = await axiosInstance.get<{ message: string; data: KitchenOrder }>(
            `/kitchen/orders/${id}`
        );
        return response.data.data;
    },

    // Mark kitchen order as ready (done)
    markAsReady: async (kitchenOrderId: number): Promise<KitchenOrder> => {
        const response = await axiosInstance.patch<{ message: string; data: KitchenOrder }>(
            `/kitchen/orders/${kitchenOrderId}/ready`
        );
        return response.data.data;
    },

    // Mark kitchen order as completed (picked up by waiter)
    markAsCompleted: async (kitchenOrderId: number): Promise<KitchenOrder> => {
        const response = await axiosInstance.patch<{ message: string; data: KitchenOrder }>(
            `/kitchen/orders/${kitchenOrderId}/complete`
        );
        return response.data.data;
    },
};
