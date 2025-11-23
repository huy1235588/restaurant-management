import axiosInstance from "@/lib/axios";
import {
    Order,
    CreateOrderDto,
    AddItemsDto,
    CancelItemDto,
    CancelOrderDto,
    UpdateOrderStatusDto,
    PaginatedOrders,
    ApiResponse,
    OrderFilterOptions,
} from "../types";

export const orderApi = {
    // Get all orders with pagination and filters
    getAll: async (params?: OrderFilterOptions): Promise<PaginatedOrders> => {
        const response = await axiosInstance.get<ApiResponse<PaginatedOrders>>(
            "/orders",
            { params }
        );
        return response.data.data;
    },

    // Get orders count with filters
    getCount: async (params?: Partial<OrderFilterOptions>): Promise<number> => {
        const response = await axiosInstance.get<
            ApiResponse<{ count: number }>
        >("/orders/count", { params });
        return response.data.data.count;
    },

    // Get order by ID
    getById: async (id: number): Promise<Order> => {
        const response = await axiosInstance.get<ApiResponse<Order>>(
            `/orders/${id}`
        );
        return response.data.data;
    },

    // Create new order
    create: async (data: CreateOrderDto): Promise<Order> => {
        const response = await axiosInstance.post<ApiResponse<Order>>(
            "/orders",
            data
        );
        return response.data.data;
    },

    // Add items to existing order
    addItems: async (id: number, data: AddItemsDto): Promise<Order> => {
        const response = await axiosInstance.patch<ApiResponse<Order>>(
            `/orders/${id}/items`,
            data
        );
        return response.data.data;
    },

    // Cancel an order item
    cancelItem: async (
        orderId: number,
        orderItemId: number,
        data: CancelItemDto
    ): Promise<Order> => {
        const response = await axiosInstance.delete<ApiResponse<Order>>(
            `/orders/${orderId}/items/${orderItemId}`,
            { data }
        );
        return response.data.data;
    },

    // Cancel entire order
    cancelOrder: async (id: number, data: CancelOrderDto): Promise<Order> => {
        const response = await axiosInstance.delete<ApiResponse<Order>>(
            `/orders/${id}`,
            { data }
        );
        return response.data.data;
    },

    // Update order status
    updateStatus: async (
        id: number,
        data: UpdateOrderStatusDto
    ): Promise<Order> => {
        const response = await axiosInstance.patch<ApiResponse<Order>>(
            `/orders/${id}/status`,
            data
        );
        return response.data.data;
    },

    // Mark item as served
    markItemServed: async (
        orderId: number,
        orderItemId: number
    ): Promise<Order> => {
        const response = await axiosInstance.patch<ApiResponse<Order>>(
            `/orders/${orderId}/items/${orderItemId}/serve`
        );
        return response.data.data;
    },
};
