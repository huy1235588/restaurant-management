// Order types based on backend schema

export enum OrderStatus {
    PENDING = "pending",
    CONFIRMED = "confirmed",
    READY = "ready",
    SERVING = "serving",
    COMPLETED = "completed",
    CANCELLED = "cancelled",
}

export interface OrderItem {
    orderItemId: number;
    orderId: number;
    itemId: number;
    quantity: number;
    unitPrice: number;
    subtotal: number;
    specialRequest?: string | null;
    menuItem?: {
        itemId: number;
        itemCode: string;
        itemName: string;
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
    partySize?: number | null;
    status: OrderStatus;
    subtotal: number;
    taxAmount: number;
    totalAmount: number;
    cancellationReason?: string | null;
    orderItems?: OrderItem[];
    table?: {
        tableId: number;
        tableNumber: string;
        capacity: number;
    };
    staff?: {
        staffId: number;
        fullName: string;
    };
    createdAt: string;
    updatedAt: string;
}

// Form data types
export interface CreateOrderDto {
    tableId: number;
    customerName?: string;
    customerPhone?: string;
    partySize?: number;
    reservationId?: number;
}

export interface AddOrderItemDto {
    itemId: number;
    quantity: number;
    specialRequest?: string;
}

export interface UpdateOrderItemDto {
    quantity?: number;
    specialRequest?: string;
}

export interface CancelOrderDto {
    cancellationReason: string;
}

// Filter types
export interface OrderFilters {
    status?: OrderStatus;
    tableId?: number;
    staffId?: number;
    startDate?: string;
    endDate?: string;
    search?: string;
}

// Statistics
export interface OrderStatistics {
    total: number;
    pending: number;
    confirmed: number;
    serving: number;
    completed: number;
    cancelled: number;
}
