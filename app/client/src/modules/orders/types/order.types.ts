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
    orderItemId: number;
    orderId: number;
    itemId: number;
    menuItemId: number;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    price: number;
    specialRequest?: string;
    note?: string;
    status: OrderItemStatus;
    createdAt: Date | string;
    updatedAt: Date | string;
    menuItem?: {
        itemId: number;
        id: number;
        itemName: string;
        name: string;
        code: string;
        price: number;
        imageUrl?: string;
    };
}

export interface Order {
    id: number;
    orderId: number;
    orderNumber: string;
    tableId: number;
    staffId?: number;
    reservationId?: number;
    customerName?: string;
    customerPhone?: string;
    partySize?: number;
    status: OrderStatus;
    notes?: string;
    note?: string;
    totalAmount: number;
    finalAmount: number;
    cancelledAt?: Date | string;
    cancellationReason?: string;
    confirmedAt?: Date | string;
    completedAt?: Date | string;
    createdAt: Date | string;
    updatedAt: Date | string;
    table?: {
        tableId: number;
        id: number;
        tableNumber: string;
        capacity: number;
    };
    staff?: {
        staffId: number;
        id: number;
        fullName: string;
    };
    reservation?: {
        reservationId: number;
        reservationCode: string;
        customerName: string;
    };
    orderItems?: OrderItem[];
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
    itemId: number;
    quantity: number;
    specialRequest?: string;
}

export interface CreateOrderDto {
    tableId: number;
    reservationId?: number;
    customerName?: string;
    customerPhone?: string;
    partySize: number;
    notes?: string;
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
