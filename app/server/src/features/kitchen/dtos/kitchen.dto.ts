/**
 * Kitchen DTOs - Synced with Frontend Types
 */

export type KitchenOrderStatus = 'pending' | 'acknowledged' | 'preparing' | 'ready' | 'completed' | 'cancelled';

export interface CreateKitchenOrderDto {
    orderId: number;
    staffId?: number;
    priority?: number; // 0-10
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

export interface KitchenOrderResponseDto {
    kitchenOrderId: number;
    orderId: number;
    staffId?: number;
    stationId?: number;
    priority: number;
    status: KitchenOrderStatus;
    startedAt?: Date;
    completedAt?: Date;
    estimatedTime?: number;
    prepTimeActual?: number;
    notes?: string;
    createdAt: Date;
    updatedAt: Date;
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

export interface KitchenStatsDto {
    pending: number;
    preparing: number;
    ready: number;
    total: number;
}
