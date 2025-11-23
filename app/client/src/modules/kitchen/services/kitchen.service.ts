import axiosInstance from "@/lib/axios";
import { ApiResponse, PaginatedResponse } from "@/types";
import { KitchenOrder, KitchenFilters } from "../types";

export const kitchenApi = {
    getAll: async (
        params?: KitchenFilters
    ): Promise<PaginatedResponse<KitchenOrder>> => {
        const response = await axiosInstance.get<KitchenOrder[]>(
            "/kitchen/orders",
            { params }
        );
        // Server returns array directly, not paginated
        // Wrap it in PaginatedResponse format for compatibility
        return {
            items: response.data,
            pagination: {
                page: 1,
                limit: response.data.length,
                total: response.data.length,
                totalPages: 1,
            },
        };
    },

    getById: async (id: number): Promise<KitchenOrder> => {
        const response = await axiosInstance.get<KitchenOrder>(
            `/kitchen/orders/${id}`
        );
        return response.data;
    },

    start: async (id: number): Promise<KitchenOrder> => {
        const response = await axiosInstance.patch<KitchenOrder>(
            `/kitchen/orders/${id}/start`
        );
        return response.data;
    },

    markReady: async (id: number): Promise<KitchenOrder> => {
        const response = await axiosInstance.patch<KitchenOrder>(
            `/kitchen/orders/${id}/ready`
        );
        return response.data;
    },

    markCompleted: async (id: number): Promise<KitchenOrder> => {
        const response = await axiosInstance.patch<KitchenOrder>(
            `/kitchen/orders/${id}/complete`
        );
        return response.data;
    },

    cancel: async (id: number): Promise<KitchenOrder> => {
        const response = await axiosInstance.patch<KitchenOrder>(
            `/kitchen/orders/${id}/cancel`
        );
        return response.data;
    },
};
