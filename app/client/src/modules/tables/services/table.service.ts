import axiosInstance from '@/lib/axios';
import { Table, ApiResponse, PaginatedResponse, TableStatus } from '@/types';

export const tableApi = {
    // Get all tables
    getAll: async (params?: {
        status?: TableStatus;
        floor?: number;
        section?: string;
        isActive?: boolean;
        search?: string;
        sortBy?: string;
        sortOrder?: 'asc' | 'desc';
        page?: number;
        limit?: number;
    }): Promise<PaginatedResponse<Table>> => {
        const response = await axiosInstance.get<ApiResponse<PaginatedResponse<Table>>>(
            '/tables',
            { params }
        );
        return response.data.data;
    },

    // Get available tables
    getAvailable: async (params?: {
        capacity?: number;
        floor?: number;
    }): Promise<Table[]> => {
        const response = await axiosInstance.get<ApiResponse<Table[]>>(
            '/tables/available',
            { params }
        );
        return response.data.data;
    },

    // Get table by ID
    getById: async (id: number): Promise<Table> => {
        const response = await axiosInstance.get<ApiResponse<Table>>(`/tables/${id}`);
        return response.data.data;
    },

    // Get table with current order
    getWithOrder: async (id: number): Promise<Table> => {
        const response = await axiosInstance.get<ApiResponse<Table>>(
            `/tables/${id}/current-order`
        );
        return response.data.data;
    },

    // Create table
    create: async (data: Partial<Table>): Promise<Table> => {
        const response = await axiosInstance.post<ApiResponse<Table>>('/tables', data);
        return response.data.data;
    },

    // Update table
    update: async (id: number, data: Partial<Table>): Promise<Table> => {
        const response = await axiosInstance.put<ApiResponse<Table>>(`/tables/${id}`, data);
        return response.data.data;
    },

    // Update table status
    updateStatus: async (id: number, status: TableStatus): Promise<Table> => {
        const response = await axiosInstance.patch<ApiResponse<Table>>(
            `/tables/${id}/status`,
            { status }
        );
        return response.data.data;
    },

    // Delete table
    delete: async (id: number): Promise<void> => {
        await axiosInstance.delete(`/tables/${id}`);
    },

    // Get table statistics
    getStats: async (): Promise<{
        total: number;
        available: number;
        occupied: number;
        reserved: number;
        maintenance: number;
        active: number;
        inactive: number;
        totalCapacity: number;
        occupancyRate: string;
    }> => {
        const response = await axiosInstance.get<ApiResponse<any>>('/tables/stats');
        return response.data.data;
    },

    // Bulk update tables
    bulkUpdate: async (updates: Array<{ tableId: number; data: Partial<Table> }>): Promise<any> => {
        const response = await axiosInstance.patch<ApiResponse<any>>('/tables/bulk', { updates });
        return response.data.data;
    },

    // Bulk update table status
    bulkUpdateStatus: async (tableIds: number[], status: TableStatus): Promise<any> => {
        const response = await axiosInstance.patch<ApiResponse<any>>('/tables/bulk-status', {
            tableIds,
            status,
        });
        return response.data.data;
    },
};
