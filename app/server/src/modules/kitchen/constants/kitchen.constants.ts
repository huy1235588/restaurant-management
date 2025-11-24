/**
 * Kitchen Module Constants
 * Centralized configuration and messages for kitchen operations
 */

/**
 * Kitchen business rules and configuration
 */
export const KITCHEN_CONSTANTS = {
    // Pagination
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 50,
    MAX_LIMIT: 200,

    // Business rules
    MAX_NOTES_LENGTH: 1000,
    MAX_SPECIAL_INSTRUCTIONS_LENGTH: 500,
} as const;

/**
 * Success messages for kitchen operations
 */
export const KITCHEN_MESSAGES = {
    SUCCESS: {
        ORDER_CREATED: 'Kitchen order created successfully',
        ORDER_RETRIEVED: 'Kitchen order retrieved successfully',
        ORDERS_RETRIEVED: 'Kitchen orders retrieved successfully',
        PREPARATION_STARTED: 'Order preparation started',
        ORDER_COMPLETED: 'Order completed successfully',
        ORDER_CANCELLED: 'Kitchen order cancelled',
        CHEF_ASSIGNED: 'Chef assigned to order',
    },
    ERROR: {
        // Kitchen order errors
        ORDER_NOT_FOUND: 'Kitchen order not found',
        ORDER_ALREADY_EXISTS: 'Kitchen order already exists for this order',
        ORDER_NOT_PENDING: 'Can only start preparing pending orders',
        ORDER_NOT_READY: 'Order is not ready for pickup',
        ORDER_ALREADY_COMPLETED: 'Kitchen order is already completed',
        ORDER_ALREADY_CANCELLED: 'Kitchen order is already cancelled',

        // Order validation
        MAIN_ORDER_NOT_FOUND: 'Main order not found',
        ORDER_NOT_CONFIRMED:
            'Order must be confirmed before sending to kitchen',
        CANNOT_CANCEL_COMPLETED: 'Cannot cancel completed kitchen order',
        CANNOT_MODIFY_COMPLETED: 'Cannot modify completed kitchen order',

        // Status transition errors
        INVALID_STATUS_TRANSITION: 'Invalid kitchen order status transition',
        CANNOT_COMPLETE: 'Cannot complete order in current state',

        // Queue errors
        QUEUE_FULL: 'Kitchen queue is full, cannot accept more orders',
        NO_CHEF_AVAILABLE: 'No chef available to prepare order',
    },
    WARNING: {
        SLOW_PREPARATION: 'Order preparation is taking longer than expected',
        QUEUE_NEAR_CAPACITY: 'Kitchen queue is near capacity',
        ORDER_WAITING_TOO_LONG: 'Order has been waiting too long',
    },
} as const;

/**
 * Status flow validation
 * Simplified flow: pending → preparing → completed (with cancellation at any point)
 */
export const KITCHEN_STATUS_FLOW = {
    pending: ['preparing', 'cancelled'],
    preparing: ['completed', 'cancelled'],
    completed: [],
    cancelled: [],
} as const;
