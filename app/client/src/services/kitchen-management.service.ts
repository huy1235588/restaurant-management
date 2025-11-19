import axiosInstance from '@/lib/axios';
import { ApiResponse, PaginatedResponse } from '@/types';
import { 
    KitchenOrder, 
    KitchenOrderStatus, 
    KitchenStation,
    CreateKitchenOrderDto,
    UpdateKitchenOrderDto,
    AssignChefDto,
    AssignStationDto,
    UpdateStatusDto,
    HandleCancellationDto,
    KitchenStats
} from '@/types/kitchen';

// ============================================
// Kitchen Management API
// ============================================

// ============================================
// Kitchen Management API
// ============================================

export const kitchenManagementApi = {
    // ========== Kitchen Order CRUD ==========
    
    /**
     * Get all kitchen orders with filters and pagination
     */
    getAll: async (params?: {
        status?: KitchenOrderStatus;
        stationId?: number;
        page?: number;
        limit?: number;
        sortBy?: string;
        sortOrder?: 'asc' | 'desc';
    }): Promise<PaginatedResponse<KitchenOrder>> => {
        const response = await axiosInstance.get<ApiResponse<PaginatedResponse<KitchenOrder>>>(
            '/kitchen',
            { params }
        );
        return response.data.data;
    },

    /**
     * Get pending kitchen orders (for KDS display)
     */
    getPending: async (): Promise<KitchenOrder[]> => {
        const response = await axiosInstance.get<ApiResponse<KitchenOrder[]>>(
            '/kitchen/pending'
        );
        return response.data.data;
    },

    /**
     * Get kitchen order by ID
     */
    getById: async (id: number): Promise<KitchenOrder> => {
        const response = await axiosInstance.get<ApiResponse<KitchenOrder>>(
            `/kitchen/${id}`
        );
        return response.data.data;
    },

    /**
     * Get kitchen orders by chef
     */
    getByChef: async (staffId: number): Promise<KitchenOrder[]> => {
        const response = await axiosInstance.get<ApiResponse<KitchenOrder[]>>(
            `/kitchen/chef/${staffId}`
        );
        return response.data.data;
    },

    /**
     * Create a new kitchen order
     */
    create: async (data: CreateKitchenOrderDto): Promise<KitchenOrder> => {
        const response = await axiosInstance.post<ApiResponse<KitchenOrder>>(
            '/kitchen',
            data
        );
        return response.data.data;
    },

    /**
     * Update kitchen order
     */
    update: async (id: number, data: UpdateKitchenOrderDto): Promise<KitchenOrder> => {
        const response = await axiosInstance.put<ApiResponse<KitchenOrder>>(
            `/kitchen/${id}`,
            data
        );
        return response.data.data;
    },

    // ========== Kitchen Order Status Management ==========
    
    /**
     * Start preparing order
     */
    startPreparing: async (id: number, staffId?: number): Promise<KitchenOrder> => {
        const response = await axiosInstance.patch<ApiResponse<KitchenOrder>>(
            `/kitchen/${id}/start`,
            staffId ? { staffId } : undefined
        );
        return response.data.data;
    },

    /**
     * Mark order as complete
     */
    complete: async (id: number): Promise<KitchenOrder> => {
        const response = await axiosInstance.patch<ApiResponse<KitchenOrder>>(
            `/kitchen/${id}/complete`
        );
        return response.data.data;
    },

    /**
     * Update kitchen order status
     */
    updateStatus: async (id: number, status: KitchenOrderStatus): Promise<KitchenOrder> => {
        const response = await axiosInstance.patch<ApiResponse<KitchenOrder>>(
            `/kitchen/${id}/status`,
            { status }
        );
        return response.data.data;
    },

    /**
     * Handle cancellation request (accept or reject)
     */
    handleCancellation: async (id: number, accepted: boolean, reason?: string): Promise<any> => {
        const response = await axiosInstance.post<ApiResponse<any>>(
            `/kitchen/${id}/cancel`,
            { accepted, reason }
        );
        return response.data.data;
    },

    // ========== Assignment Management ==========
    
    /**
     * Update order priority (0-10)
     */
    updatePriority: async (id: number, priority: number): Promise<KitchenOrder> => {
        const response = await axiosInstance.patch<ApiResponse<KitchenOrder>>(
            `/kitchen/${id}/priority`,
            { priority }
        );
        return response.data.data;
    },

    /**
     * Assign chef to order
     */
    assignChef: async (id: number, staffId: number): Promise<KitchenOrder> => {
        const response = await axiosInstance.patch<ApiResponse<KitchenOrder>>(
            `/kitchen/${id}/assign`,
            { staffId }
        );
        return response.data.data;
    },

    /**
     * Assign station to order
     */
    assignStation: async (id: number, stationId: number): Promise<KitchenOrder> => {
        const response = await axiosInstance.patch<ApiResponse<KitchenOrder>>(
            `/kitchen/${id}/assign-station`,
            { stationId }
        );
        return response.data.data;
    },

    // ========== Kitchen Stats & Stations ==========
    
    /**
     * Get kitchen statistics
     */
    getStats: async (): Promise<KitchenStats> => {
        const response = await axiosInstance.get<ApiResponse<KitchenStats>>(
            '/kitchen/stats'
        );
        return response.data.data;
    },

    /**
     * Get all kitchen stations
     */
    getStations: async (): Promise<KitchenStation[]> => {
        const response = await axiosInstance.get<ApiResponse<KitchenStation[]>>(
            '/kitchen/stations'
        );
        return response.data.data;
    },
};
