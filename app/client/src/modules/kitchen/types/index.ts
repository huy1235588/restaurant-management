// Kitchen types based on backend schema

export enum KitchenOrderStatus {
    PENDING = 'pending',
    READY = 'ready',
    COMPLETED = 'completed',
    CANCELLED = 'cancelled',
}

export interface KitchenOrderItem {
    itemId: number;
    itemName: string;
    quantity: number;
    specialRequest?: string | null;
}

export interface KitchenOrder {
    kitchenOrderId: number;
    orderId: number;
    status: KitchenOrderStatus;
    priority: string;
    startedAt?: string | null;
    completedAt?: string | null;
    prepTimeActual?: number | null;
    order: {
        orderNumber: string;
        tableId: number;
        table: {
            tableNumber: string;
        };
        orderItems: Array<{
            menuItem: {
                itemName: string;
            };
            quantity: number;
            specialRequest?: string | null;
        }>;
    };
    createdAt: string;
}

export interface KitchenFilters {
    status?: KitchenOrderStatus;
}
