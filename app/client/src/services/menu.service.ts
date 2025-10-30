import axiosInstance from '@/lib/axios';
import { MenuItem, Category, ApiResponse, PaginatedResponse } from '@/types';

export const menuApi = {
    // Count menu items
    count: async (params?: {
        categoryId?: number;
        isAvailable?: boolean;
        isActive?: boolean;
    }): Promise<number> => {
        const response = await axiosInstance.get<ApiResponse<{ count: number }>>(
            '/menu/count',
            { params }
        );
        return response.data.data.count;
    },

    // Get all menu items
    getAll: async (params?: {
        categoryId?: number;
        isAvailable?: boolean;
        isActive?: boolean;
        search?: string;
        page?: number;
        limit?: number;
        sortBy?: string;
        sortOrder?: string;
    }): Promise<PaginatedResponse<MenuItem>> => {
        const response = await axiosInstance.get<ApiResponse<PaginatedResponse<MenuItem>>>(
            '/menu',
            { params }
        );
        return response.data.data;
    },

    // Get menu item by ID
    getById: async (id: number): Promise<MenuItem> => {
        const response = await axiosInstance.get<ApiResponse<MenuItem>>(`/menu/${id}`);
        return response.data.data;
    },

    // Get menu items by category
    getByCategory: async (categoryId: number): Promise<MenuItem[]> => {
        const response = await axiosInstance.get<ApiResponse<MenuItem[]>>(
            `/menu/category/${categoryId}`
        );
        return response.data.data;
    },

    // Create menu item
    create: async (data: Partial<MenuItem>): Promise<MenuItem> => {
        const response = await axiosInstance.post<ApiResponse<MenuItem>>('/menu', data);
        return response.data.data;
    },

    // Update menu item
    update: async (id: number, data: Partial<MenuItem>): Promise<MenuItem> => {
        const response = await axiosInstance.put<ApiResponse<MenuItem>>(`/menu/${id}`, data);
        return response.data.data;
    },

    // Update availability
    updateAvailability: async (id: number, isAvailable: boolean): Promise<MenuItem> => {
        const response = await axiosInstance.patch<ApiResponse<MenuItem>>(
            `/menu/${id}/availability`,
            { isAvailable }
        );
        return response.data.data;
    },

    // Delete menu item
    delete: async (id: number): Promise<void> => {
        await axiosInstance.delete(`/menu/${id}`);
    },
};

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
