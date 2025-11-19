// Kitchen Types - Synced with Backend API
export type KitchenOrderStatus = 'pending' | 'acknowledged' | 'preparing' | 'ready' | 'completed' | 'cancelled';

export interface KitchenOrder {
    kitchenOrderId: number;
    orderId: number;
    status: KitchenOrderStatus;
    priority: number; // 0-10, backend uses number
    staffId?: number;
    stationId?: number;
    startedAt?: string;
    completedAt?: string;
    estimatedTime?: number;
    prepTimeActual?: number;
    notes?: string;
    createdAt: string;
    updatedAt: string;
    order?: {
        orderNumber: string;
        tableId: number;
        orderItems?: any[];
    };
    chef?: {
        staffId: number;
        fullName: string;
    };
    station?: {
        stationId: number;
        name: string;
    };
}

export interface KitchenStation {
    stationId: number;
    name: string;
    description?: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

// DTOs for API calls
export interface CreateKitchenOrderDto {
    orderId: number;
    staffId?: number;
    priority?: number;
    estimatedTime?: number;
    notes?: string;
}

export interface UpdateKitchenOrderDto {
    staffId?: number;
    priority?: number;
    status?: KitchenOrderStatus;
    estimatedTime?: number;
    notes?: string;
}

export interface AssignChefDto {
    staffId: number;
}

export interface AssignStationDto {
    stationId: number;
}

export interface UpdateStatusDto {
    status: KitchenOrderStatus;
}

export interface HandleCancellationDto {
    accepted: boolean;
    reason?: string;
}

export interface KitchenStats {
    pending: number;
    preparing: number;
    ready: number;
    total: number;
}
