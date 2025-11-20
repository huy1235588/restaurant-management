import axiosInstance from '@/lib/axios';
import { MenuItem, Category, ApiResponse, PaginatedResponse } from '@/types';

// Helper function to convert string price to number
const normalizeMenuItem = (item: any): MenuItem => ({
    ...item,
    price: typeof item.price === 'string' ? parseFloat(item.price) : item.price,
    cost: item.cost ? (typeof item.cost === 'string' ? parseFloat(item.cost) : item.cost) : item.cost,
});

// Helper function to normalize array of menu items
const normalizeMenuItems = (items: any[]): MenuItem[] => items.map(normalizeMenuItem);

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
        return {
            ...response.data.data,
            items: normalizeMenuItems(response.data.data.items),
        };
    },

    // Get menu item by ID
    getById: async (id: number): Promise<MenuItem> => {
        const response = await axiosInstance.get<ApiResponse<MenuItem>>(`/menu/${id}`);
        return normalizeMenuItem(response.data.data);
    },

    // Get menu items by category
    getByCategory: async (categoryId: number): Promise<MenuItem[]> => {
        const response = await axiosInstance.get<ApiResponse<MenuItem[]>>(
            `/menu/category/${categoryId}`
        );
        return normalizeMenuItems(response.data.data);
    },

    // Create menu item
    create: async (data: Partial<MenuItem>): Promise<MenuItem> => {
        const response = await axiosInstance.post<ApiResponse<MenuItem>>('/menu', data);
        return normalizeMenuItem(response.data.data);
    },

    // Update menu item
    update: async (id: number, data: Partial<MenuItem>): Promise<MenuItem> => {
        const response = await axiosInstance.put<ApiResponse<MenuItem>>(`/menu/${id}`, data);
        return normalizeMenuItem(response.data.data);
    },

    // Update availability
    updateAvailability: async (id: number, isAvailable: boolean): Promise<MenuItem> => {
        const response = await axiosInstance.patch<ApiResponse<MenuItem>>(
            `/menu/${id}/availability`,
            { isAvailable }
        );
        return normalizeMenuItem(response.data.data);
    },

    // Delete menu item
    delete: async (id: number): Promise<void> => {
        await axiosInstance.delete(`/menu/${id}`);
    },
};
