export enum KitchenOrderStatus {
    PENDING = "pending",
    READY = "ready",
    COMPLETED = "completed",
    CANCELLED = "cancelled",
}

export type KitchenPriority = "low" | "normal" | "high" | "urgent";

export interface KitchenOrder {
    kitchenOrderId: number;
    orderId: number;
    order: {
        orderNumber: string;
        table: {
            tableId: number;
            name: string;
        };
        customerName?: string;
        customerPhone?: string;
        orderItems: OrderItem[];
    };
    status: KitchenOrderStatus;
    priority: KitchenPriority;
    chefId?: number;
    chef?: {
        staffId: number;
        fullName: string;
    };
    startedAt?: string;
    completedAt?: string;
    prepTimeActual?: number; // in minutes
    createdAt: string;
    updatedAt: string;
}

export interface OrderItem {
    orderItemId: number;
    menuItem: {
        itemId: number;
        itemName: string;
        imageUrl?: string;
    };
    quantity: number;
    specialRequest?: string;
}

export interface KitchenOrderFilters {
    status?: KitchenOrderStatus;
    priority?: KitchenPriority;
}

export interface NewOrderEvent {
    event: "order:new";
    data: KitchenOrder;
    timestamp: string;
}

export interface OrderUpdateEvent {
    event: "order:update";
    data: KitchenOrder;
    timestamp: string;
}

export interface OrderCompletedEvent {
    event: "order:completed";
    data: KitchenOrder;
    timestamp: string;
}

export enum KitchenSocketEvents {
    NEW_ORDER = "order:new",
    ORDER_UPDATED = "order:update",
    ORDER_COMPLETED = "order:completed",
}
