/**
 * Order module constants
 * Centralized configuration for Order management
 */

export const ORDER_CONSTANTS = {
    // Pagination
    DEFAULT_PAGE_SIZE: 20,
    MAX_PAGE_SIZE: 100,

    // LocalStorage keys
    STORAGE_KEYS: {
        ORDER_DRAFT: 'order-draft',
        ORDER_FILTERS: 'order-filters',
    },

    // Debounce delays (milliseconds)
    DEBOUNCE_DELAYS: {
        STORAGE: 1000,
        SEARCH: 300,
    },

    // React Query configuration
    QUERY_CONFIG: {
        STALE_TIME: 30000, // 30 seconds
        REFETCH_ON_WINDOW_FOCUS: true,
    },

    // WebSocket configuration
    SOCKET_CONFIG: {
        NAMESPACE: '/orders',
        RECONNECTION_ATTEMPTS: 5,
        RECONNECTION_DELAY: 1000,
    },

    // UI Configuration
    UI: {
        FULLSCREEN_TOAST_DURATION: 3000,
        SKELETON_LOADING_COUNT: 6,
    },

    // Order status colors
    STATUS_COLORS: {
        pending: {
            bg: 'bg-yellow-100',
            text: 'text-yellow-800',
            border: 'border-yellow-300',
        },
        confirmed: {
            bg: 'bg-blue-100',
            text: 'text-blue-800',
            border: 'border-blue-300',
        },
        completed: {
            bg: 'bg-green-100',
            text: 'text-green-800',
            border: 'border-green-300',
        },
        cancelled: {
            bg: 'bg-red-100',
            text: 'text-red-800',
            border: 'border-red-300',
        },
    },
} as const;

/**
 * Order status enum
 */
export const ORDER_STATUS = {
    PENDING: 'pending',
    CONFIRMED: 'confirmed',
    COMPLETED: 'completed',
    CANCELLED: 'cancelled',
} as const;

/**
 * Step IDs for order creation wizard
 */
export const ORDER_CREATION_STEPS = {
    TABLE_SELECTION: 1,
    CUSTOMER_INFO: 2,
    MENU_ITEMS: 3,
    REVIEW: 4,
} as const;
