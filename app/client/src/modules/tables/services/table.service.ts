import axiosInstance from '@/lib/axios';
import {
    Table,
    CreateTableDto,
    UpdateTableDto,
    ApiResponse,
    PaginatedResponse,
    TableStatus,
    TableFilters,
    TableStats,
} from '@/types';

/**
 * Table API Service
 * Handles all table-related API calls to backend
 */
export const tableApi = {
    /**
     * Get all tables with pagination and filters
     */
    getAll: async (filters?: TableFilters): Promise<PaginatedResponse<Table>> => {
        const response = await axiosInstance.get<ApiResponse<PaginatedResponse<Table>>>(
            '/table',
            { params: filters }
        );
        return response.data.data;
    },

    /**
     * Count tables matching filters
     */
    count: async (filters?: TableFilters): Promise<number> => {
        const response = await axiosInstance.get<ApiResponse<{ count: number }>>(
            '/table/count',
            { params: filters }
        );
        return response.data.data.count;
    },

    /**
     * Get available tables
     */
    getAvailable: async (capacity?: number): Promise<Table[]> => {
        const response = await axiosInstance.get<ApiResponse<Table[]>>(
            '/table/available',
            { params: { capacity } }
        );
        return response.data.data;
    },

    /**
     * Get tables by floor
     */
    getByFloor: async (floor: number): Promise<Table[]> => {
        const response = await axiosInstance.get<ApiResponse<Table[]>>(
            `/table/floor/${floor}`
        );
        return response.data.data;
    },

    /**
     * Get tables by section
     */
    getBySection: async (section: string): Promise<Table[]> => {
        const response = await axiosInstance.get<ApiResponse<Table[]>>(
            `/table/section/${section}`
        );
        return response.data.data;
    },

    /**
     * Get table by ID
     */
    getById: async (id: number): Promise<Table> => {
        const response = await axiosInstance.get<ApiResponse<Table>>(`/table/${id}`);
        return response.data.data;
    },

    /**
     * Get table by table number
     */
    getByNumber: async (tableNumber: string): Promise<Table> => {
        const response = await axiosInstance.get<ApiResponse<Table>>(
            `/table/number/${tableNumber}`
        );
        return response.data.data;
    },

    /**
     * Create new table
     */
    create: async (data: CreateTableDto): Promise<Table> => {
        const response = await axiosInstance.post<ApiResponse<Table>>('/table', data);
        return response.data.data;
    },

    /**
     * Update table
     */
    update: async (id: number, data: UpdateTableDto): Promise<Table> => {
        const response = await axiosInstance.put<ApiResponse<Table>>(
            `/table/${id}`,
            data
        );
        return response.data.data;
    },

    /**
     * Update table status
     */
    updateStatus: async (id: number, status: TableStatus): Promise<Table> => {
        const response = await axiosInstance.patch<ApiResponse<Table>>(
            `/table/${id}/status`,
            { status }
        );
        return response.data.data;
    },

    /**
     * Delete table
     */
    delete: async (id: number): Promise<void> => {
        await axiosInstance.delete(`/table/${id}`);
    },

    /**
     * Get table statistics
     */
    getStats: async (): Promise<TableStats> => {
        const response = await axiosInstance.get<ApiResponse<TableStats>>('/table/stats');
        return response.data.data;
    },

    /**
     * Bulk update table status
     */
    bulkUpdateStatus: async (tableIds: number[], status: TableStatus): Promise<any> => {
        const response = await axiosInstance.patch<ApiResponse<any>>(
            '/table/bulk-status',
            { tableIds, status }
        );
        return response.data.data;
    },
};
