import axiosInstance from '@/lib/axios';
import { Category, ApiResponse } from '@/types';

export const categoryApi = {
    // Count categories
    count: async (params?: { isActive?: boolean }): Promise<number> => {
        const response = await axiosInstance.get<ApiResponse<{ count: number }>>(
            '/categories/count',
            { params }
        );
        return response.data.data.count;
    },

    // Get all categories
    getAll: async (params?: { isActive?: boolean }): Promise<Category[]> => {
        const response = await axiosInstance.get<ApiResponse<Category[]>>(
            '/categories',
            { params }
        );
        return response.data.data;
    },

    // Get category by ID
    getById: async (id: number): Promise<Category> => {
        const response = await axiosInstance.get<ApiResponse<Category>>(`/categories/${id}`);
        return response.data.data;
    },

    // Get category with items
    getWithItems: async (id: number): Promise<Category> => {
        const response = await axiosInstance.get<ApiResponse<Category>>(
            `/categories/${id}/items`
        );
        return response.data.data;
    },

    // Create category
    create: async (data: Partial<Category>): Promise<Category> => {
        const response = await axiosInstance.post<ApiResponse<Category>>('/categories', data);
        return response.data.data;
    },

    // Update category
    update: async (id: number, data: Partial<Category>): Promise<Category> => {
        const response = await axiosInstance.put<ApiResponse<Category>>(
            `/categories/${id}`,
            data
        );
        return response.data.data;
    },

    // Delete category
    delete: async (id: number): Promise<void> => {
        await axiosInstance.delete(`/categories/${id}`);
    },
};
