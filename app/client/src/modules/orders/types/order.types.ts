export enum OrderStatus {
    PENDING = "pending",
    CONFIRMED = "confirmed",
    PREPARING = "preparing",
    READY = "ready",
    SERVED = "served",
    COMPLETED = "completed",
    CANCELLED = "cancelled",
    PAID = "paid",
}

export enum OrderItemStatus {
    PENDING = "pending",
    PREPARING = "preparing",
    READY = "ready",
    SERVED = "served",
    CANCELLED = "cancelled",
}

export enum KitchenOrderStatus {
    PENDING = "pending",
    PREPARING = "preparing",
    READY = "ready",
    CANCELLED = "cancelled",
}

export enum OrderPriority {
    NORMAL = "normal",
    EXPRESS = "express",
    VIP = "vip",
}

export interface OrderItem {
    id: number;
    orderId: number;
    menuItemId: number;
    quantity: number;
    price: number;
    note?: string;
    status: OrderItemStatus;
    createdAt: Date | string;
    updatedAt: Date | string;
    menuItem?: {
        id: number;
        name: string;
        code: string;
        price: number;
        imageUrl?: string;
    };
}

export interface Order {
    id: number;
    tableId: number;
    staffId?: number;
    status: OrderStatus;
    note?: string;
    totalAmount: number;
    createdAt: Date | string;
    updatedAt: Date | string;
    table?: {
        id: number;
        tableNumber: string;
    };
    staff?: {
        id: number;
        fullName: string;
    };
    items?: OrderItem[];
}

export interface KitchenOrder {
    id: number;
    orderId: number;
    orderItemId: number;
    quantity: number;
    status: KitchenOrderStatus;
    createdAt: Date | string;
    updatedAt: Date | string;
    order?: Order;
    orderItem?: OrderItem;
}

export interface CreateOrderItemDto {
    menuItemId: number;
    quantity: number;
    note?: string;
}

export interface CreateOrderDto {
    tableId: number;
    note?: string;
    items: CreateOrderItemDto[];
}

export interface AddItemsDto {
    items: CreateOrderItemDto[];
}

export interface CancelItemDto {
    reason: string;
}

export interface CancelOrderDto {
    reason: string;
}

export interface UpdateOrderStatusDto {
    status: OrderStatus;
}

export interface OrderFilters {
    status?: OrderStatus;
    tableId?: number;
    staffId?: number;
    startDate?: string;
    endDate?: string;
    search?: string;
}

export interface OrderListResponse {
    message: string;
    data: Order[];
    meta?: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}

export interface OrderResponse {
    message: string;
    data: Order;
}

export interface KitchenQueueResponse {
    message: string;
    data: KitchenOrder[];
}
