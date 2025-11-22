import axiosInstance from '@/lib/axios';
import { ApiResponse, PaginatedResponse } from '@/types';
import { KitchenOrder, KitchenFilters } from '../types';

export const kitchenApi = {
    getAll: async (params?: KitchenFilters): Promise<PaginatedResponse<KitchenOrder>> => {
        const response = await axiosInstance.get<ApiResponse<PaginatedResponse<KitchenOrder>>>('/kitchen/orders', { params });
        return response.data.data;
    },

    getById: async (id: number): Promise<KitchenOrder> => {
        const response = await axiosInstance.get<ApiResponse<KitchenOrder>>(`/kitchen/orders/${id}`);
        return response.data.data;
    },

    start: async (id: number): Promise<KitchenOrder> => {
        const response = await axiosInstance.patch<ApiResponse<KitchenOrder>>(`/kitchen/orders/${id}/start`);
        return response.data.data;
    },

    markReady: async (id: number): Promise<KitchenOrder> => {
        const response = await axiosInstance.patch<ApiResponse<KitchenOrder>>(`/kitchen/orders/${id}/ready`);
        return response.data.data;
    },

    markCompleted: async (id: number): Promise<KitchenOrder> => {
        const response = await axiosInstance.patch<ApiResponse<KitchenOrder>>(`/kitchen/orders/${id}/complete`);
        return response.data.data;
    },

    cancel: async (id: number): Promise<KitchenOrder> => {
        const response = await axiosInstance.patch<ApiResponse<KitchenOrder>>(`/kitchen/orders/${id}/cancel`);
        return response.data.data;
    },
};
