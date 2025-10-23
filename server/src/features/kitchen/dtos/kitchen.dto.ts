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
    status?: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'served' | 'cancelled';
    estimatedTime?: number;
    notes?: string;
}

export interface KitchenOrderResponseDto {
    kitchenOrderId: number;
    orderId: number;
    staffId?: number;
    priority: number;
    status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'served' | 'cancelled';
    startedAt?: Date;
    completedAt?: Date;
    estimatedTime?: number;
    notes?: string;
    createdAt: Date;
    updatedAt: Date;
    order?: {
        orderNumber: string;
        tableId: number;
    };
    chef?: {
        staffId: number;
        fullName: string;
    };
}
