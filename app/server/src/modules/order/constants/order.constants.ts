/**
 * Order Module Constants
 * Defines all constant values used throughout the order module
 */

export const ORDER_CONSTANTS = {
    // Default pagination
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 20,
    MAX_LIMIT: 100,

    // Order number format
    ORDER_NUMBER_PREFIX: 'ORD',
    ORDER_NUMBER_LENGTH: 10,

    // Business rules
    MAX_ORDER_ITEMS: 50,
    MAX_SPECIAL_REQUEST_LENGTH: 500,
    MAX_CANCELLATION_REASON_LENGTH: 500,
    MAX_NOTES_LENGTH: 1000,

    // Time limits (in minutes)
    ORDER_TIMEOUT_MINUTES: 120,
    CANCELLATION_WINDOW_MINUTES: 5,
} as const;

export const ORDER_MESSAGES = {
    // Success messages
    SUCCESS: {
        ORDER_CREATED: 'Order created successfully',
        ORDER_UPDATED: 'Order updated successfully',
        ORDER_CANCELLED: 'Order cancelled successfully',
        ORDER_STATUS_UPDATED: 'Order status updated successfully',
        ITEMS_ADDED: 'Items added to order successfully',
        ITEM_CANCELLED: 'Item cancelled successfully',
        ITEM_SERVED: 'Item marked as served successfully',
        ORDERS_RETRIEVED: 'Orders retrieved successfully',
        ORDER_RETRIEVED: 'Order retrieved successfully',
        COUNT_RETRIEVED: 'Orders count retrieved successfully',
    },

    // Error messages
    ERROR: {
        ORDER_NOT_FOUND: 'Order not found',
        ITEM_NOT_FOUND: 'Order item not found',
        TABLE_NOT_FOUND: 'Table not found',
        TABLE_OCCUPIED:
            'Table already has an active order. Please add items to the existing order.',
        MENU_ITEM_NOT_FOUND: 'Menu item not found',
        MENU_ITEM_NOT_AVAILABLE: 'Menu item is not available',
        MENU_ITEM_NOT_ACTIVE: 'Menu item is not active',
        CANNOT_MODIFY_COMPLETED: 'Cannot modify completed order',
        CANNOT_MODIFY_CANCELLED: 'Cannot modify cancelled order',
        CANNOT_CANCEL_COMPLETED: 'Cannot cancel completed order',
        ORDER_ALREADY_CANCELLED: 'Order already cancelled',
        BILL_ALREADY_CREATED: 'Cannot modify order after bill creation',
        INVALID_STATUS_TRANSITION: 'Invalid order status transition',
    },
} as const;

export const KITCHEN_MESSAGES = {
    SUCCESS: {
        QUEUE_RETRIEVED: 'Kitchen queue retrieved successfully',
        ORDER_READY: 'Kitchen order marked as ready successfully',
        ORDER_COMPLETED: 'Kitchen order marked as completed successfully',
    },
    ERROR: {
        ORDER_NOT_FOUND: 'Kitchen order not found',
        CANNOT_COMPLETE_CANCELLED: 'Cannot complete cancelled order',
        ORDER_ALREADY_COMPLETED: 'Order already completed',
        ORDER_NOT_READY: 'Can only mark ready orders as completed',
    },
} as const;
