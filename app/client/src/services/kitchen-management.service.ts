import axiosInstance from '@/lib/axios';
import { ApiResponse, PaginatedResponse } from '@/types';
import { Order, OrderItem } from './order-management.service';

// ============================================
// Kitchen Types
// ============================================

export type KitchenOrderStatus = 'PENDING' | 'CONFIRMED' | 'PREPARING' | 'ALMOST_READY' | 'READY' | 'COMPLETED' | 'CANCELLED';
export type OrderPriority = 'NORMAL' | 'EXPRESS' | 'VIP';
export type StationType = 'GRILL' | 'FRY' | 'STEAM' | 'DESSERT' | 'DRINKS';

export interface KitchenOrder {
    id: number;
    orderId: number;
    status: KitchenOrderStatus;
    priority: OrderPriority;
    chefId?: number;
    stationId?: number;
    prepTimeEstimated: number; // in minutes
    prepTimeActual?: number; // in minutes
    startedAt?: string;
    completedAt?: string;
    createdAt: string;
    updatedAt: string;
    order?: Order;
    chef?: {
        staffId: number;
        firstName: string;
        lastName: string;
    };
    station?: KitchenStation;
}

export interface KitchenStation {
    id: number;
    name: string;
    type: StationType;
    isActive: boolean;
    createdAt: string;
    currentWorkload?: number; // Number of active orders assigned
}

export interface CreateKitchenOrderDto {
    orderId: number;
    priority?: OrderPriority;
    chefId?: number;
    stationId?: number;
    prepTimeEstimated?: number;
}

export interface UpdateKitchenOrderDto {
    priority?: OrderPriority;
    chefId?: number;
    stationId?: number;
    status?: KitchenOrderStatus;
}

export interface StartPreparingDto {
    chefId?: number;
    stationId?: number;
}

export interface CompleteOrderDto {
    prepTimeActual?: number;
}

export interface UpdatePriorityDto {
    priority: OrderPriority;
}

export interface AssignChefDto {
    chefId: number;
}

export interface AssignStationDto {
    stationId: number;
}

export interface UpdateStatusDto {
    status: KitchenOrderStatus;
}

export interface CancelKitchenOrderDto {
    reason: string;
}

export interface KitchenStats {
    pending: number;
    preparing: number;
    ready: number;
    completed: number;
    averagePrepTime: number; // in minutes
    overdueOrders: number; // orders waiting > 20 minutes
    totalOrdersToday: number;
}

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
        priority?: OrderPriority;
        chefId?: number;
        stationId?: string;
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
    startPreparing: async (id: number, data?: StartPreparingDto): Promise<KitchenOrder> => {
        const response = await axiosInstance.patch<ApiResponse<KitchenOrder>>(
            `/kitchen/${id}/start`,
            data
        );
        return response.data.data;
    },

    /**
     * Mark order as complete
     */
    complete: async (id: number, data?: CompleteOrderDto): Promise<KitchenOrder> => {
        const response = await axiosInstance.patch<ApiResponse<KitchenOrder>>(
            `/kitchen/${id}/complete`,
            data
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
     * Cancel kitchen order
     */
    cancel: async (id: number, reason: string): Promise<KitchenOrder> => {
        const response = await axiosInstance.post<ApiResponse<KitchenOrder>>(
            `/kitchen/${id}/cancel`,
            { reason }
        );
        return response.data.data;
    },

    // ========== Assignment Management ==========
    
    /**
     * Update order priority
     */
    updatePriority: async (id: number, priority: OrderPriority): Promise<KitchenOrder> => {
        const response = await axiosInstance.patch<ApiResponse<KitchenOrder>>(
            `/kitchen/${id}/priority`,
            { priority }
        );
        return response.data.data;
    },

    /**
     * Assign chef to order
     */
    assignChef: async (id: number, chefId: number): Promise<KitchenOrder> => {
        const response = await axiosInstance.patch<ApiResponse<KitchenOrder>>(
            `/kitchen/${id}/assign`,
            { chefId }
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
