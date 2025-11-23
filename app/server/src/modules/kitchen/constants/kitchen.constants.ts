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

    // Preparation time estimates (in minutes)
    DEFAULT_PREP_TIME: 20,
    MIN_PREP_TIME: 5,
    MAX_PREP_TIME: 120,

    // Priority levels
    PRIORITIES: ['low', 'normal', 'high', 'urgent'] as const,
    DEFAULT_PRIORITY: 'normal' as const,

    // Auto-cancellation
    AUTO_CANCEL_TIMEOUT_MINUTES: 60, // Cancel if not started in 60 min

    // Business rules
    MAX_NOTES_LENGTH: 1000,
    MAX_SPECIAL_INSTRUCTIONS_LENGTH: 500,

    // Queue management
    MAX_CONCURRENT_ORDERS: 20, // Maximum orders in preparing state

    // Performance thresholds
    SLOW_PREP_TIME_THRESHOLD: 30, // Minutes - flag as slow if exceeds
    FAST_PREP_TIME_THRESHOLD: 10, // Minutes - flag as fast
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
        ORDER_READY: 'Order is ready for pickup',
        ORDER_COMPLETED: 'Order completed (picked up)',
        ORDER_CANCELLED: 'Kitchen order cancelled',
        PRIORITY_UPDATED: 'Order priority updated',
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
        ORDER_NOT_CONFIRMED: 'Order must be confirmed before sending to kitchen',
        CANNOT_CANCEL_COMPLETED: 'Cannot cancel completed kitchen order',
        CANNOT_MODIFY_COMPLETED: 'Cannot modify completed kitchen order',

        // Status transition errors
        INVALID_STATUS_TRANSITION: 'Invalid kitchen order status transition',
        CANNOT_MARK_READY: 'Cannot mark order as ready in current state',
        CANNOT_COMPLETE: 'Can only complete ready orders',

        // Queue errors
        QUEUE_FULL: 'Kitchen queue is full, cannot accept more orders',
        NO_CHEF_AVAILABLE: 'No chef available to prepare order',

        // Priority errors
        INVALID_PRIORITY: 'Invalid priority level',
    },
    WARNING: {
        SLOW_PREPARATION: 'Order preparation is taking longer than expected',
        QUEUE_NEAR_CAPACITY: 'Kitchen queue is near capacity',
        ORDER_WAITING_TOO_LONG: 'Order has been waiting too long',
    },
} as const;

/**
 * Priority levels type
 */
export type KitchenPriority = (typeof KITCHEN_CONSTANTS.PRIORITIES)[number];

/**
 * Status flow validation
 */
export const KITCHEN_STATUS_FLOW = {
    pending: ['preparing', 'cancelled'],
    preparing: ['ready', 'cancelled'],
    ready: ['completed'],
    completed: [],
    cancelled: [],
} as const;
