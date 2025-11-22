/**
 * WebSocket Events Constants
 */
export const SOCKET_EVENTS = {
    // Room Management
    JOIN_KITCHEN: 'join-kitchen' as const,
    LEAVE_KITCHEN: 'leave-kitchen' as const,
    JOIN_WAITER: 'join-waiter' as const,
    LEAVE_WAITER: 'leave-waiter' as const,

    // Order Events
    ORDER_CREATED: 'order:created' as const,
    ORDER_STATUS_CHANGED: 'order:status-changed' as const,
    ORDER_CANCELLED: 'order:cancelled' as const,
    ORDER_UPDATED: 'order:updated' as const,
    ORDER_ITEMS_ADDED: 'order:items-added' as const,
    ORDER_ITEM_CANCELLED: 'order:item-cancelled' as const,
    ORDER_ITEM_SERVED: 'order:item-served' as const,

    // Kitchen Events
    KITCHEN_ORDER_DONE: 'kitchen:order-done' as const,
    KITCHEN_ORDER_READY: 'kitchen:order-ready' as const,

    // Table Events
    TABLE_STATUS_CHANGED: 'table:status-changed' as const,

    // Payment Events
    PAYMENT_COMPLETED: 'payment:completed' as const,
    BILL_CREATED: 'bill:created' as const,

    // Error Events
    ERROR: 'error' as const,
} as const;

/**
 * WebSocket Rooms
 */
export const SOCKET_ROOMS = {
    KITCHEN: 'kitchen' as const,
    WAITER: (staffId: number) => `waiter-${staffId}`,
    TABLE: (tableId: number) => `table-${tableId}`,
    STAFF: (staffId: number) => `staff-${staffId}`,
} as const;

/**
 * Socket Event Payloads
 */
export interface SocketEventPayload<T = any> {
    event: string;
    data: T;
    timestamp: Date;
}

export interface OrderEventData {
    orderId: number;
    orderNumber: string;
    tableId: number;
    status: string;
    [key: string]: any;
}

export interface KitchenEventData {
    kitchenOrderId: number;
    orderId: number;
    orderNumber: string;
    status: string;
    [key: string]: any;
}

export interface TableEventData {
    tableId: number;
    status: string;
    [key: string]: any;
}

export interface PaymentEventData {
    billId: number;
    orderId: number;
    orderNumber: string;
    totalAmount: number;
    [key: string]: any;
}
