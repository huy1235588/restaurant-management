export enum OrderStatus {
    PENDING = "pending",
    CONFIRMED = "confirmed",
    READY = "ready",
    SERVING = "serving",
    COMPLETED = "completed",
    CANCELLED = "cancelled",
}

export enum OrderItemStatus {
    PENDING = "pending",
    READY = "ready",
    SERVED = "served",
    CANCELLED = "cancelled",
}

export enum KitchenOrderStatus {
    PENDING = "pending",
    READY = "ready",
    COMPLETED = "completed",
    CANCELLED = "cancelled",
}

export enum OrderPriority {
    NORMAL = "normal",
    EXPRESS = "express",
    VIP = "vip",
}

export interface OrderItem {
    orderItemId: number;
    orderId: number;
    itemId: number;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    specialRequest?: string | null;
    status: OrderItemStatus;
    createdAt: Date | string;
    updatedAt: Date | string;
    menuItem?: {
        itemId: number;
        itemName: string;
        code: string;
        price: number;
        imageUrl?: string | null;
    };
}

export interface Order {
    orderId: number;
    orderNumber: string;
    tableId: number;
    staffId?: number | null;
    reservationId?: number | null;
    customerName?: string | null;
    customerPhone?: string | null;
    partySize: number;
    status: OrderStatus;
    notes?: string | null;
    totalAmount: number;
    finalAmount: number;
    cancelledAt?: Date | string | null;
    cancellationReason?: string | null;
    confirmedAt?: Date | string | null;
    completedAt?: Date | string | null;
    createdAt: Date | string;
    updatedAt: Date | string;
    table?: {
        tableId: number;
        tableNumber: string;
        capacity: number;
    };
    staff?: {
        staffId: number;
        fullName: string;
    };
    reservation?: {
        reservationId: number;
        reservationCode: string;
        customerName: string;
    };
    orderItems?: OrderItem[];
}

export interface KitchenOrder {
    kitchenOrderId: number;
    orderId: number;
    status: KitchenOrderStatus;
    preparedBy?: number | null;
    preparedAt?: Date | string | null;
    completedAt?: Date | string | null;
    createdAt: Date | string;
    updatedAt: Date | string;
    order?: Order;
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
