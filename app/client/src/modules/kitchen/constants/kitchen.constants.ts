import { KitchenOrderStatus } from "../types/kitchen.types";

/**
 * Status colors for kitchen orders
 */
export const STATUS_COLORS: Record<
    KitchenOrderStatus,
    { bg: string; text: string; border: string }
> = {
    [KitchenOrderStatus.PENDING]: {
        bg: "bg-gray-100",
        text: "text-gray-800",
        border: "border-gray-300",
    },
    [KitchenOrderStatus.PREPARING]: {
        bg: "bg-yellow-100",
        text: "text-yellow-800",
        border: "border-yellow-300",
    },
    [KitchenOrderStatus.READY]: {
        bg: "bg-blue-100",
        text: "text-blue-800",
        border: "border-blue-300",
    },
    [KitchenOrderStatus.COMPLETED]: {
        bg: "bg-green-100",
        text: "text-green-800",
        border: "border-green-300",
    },
};

/**
 * Auto-refresh and polling configuration
 */
export const KITCHEN_CONFIG = {
    // Polling fallback interval (30 seconds)
    REFETCH_INTERVAL: 30000,

    // Stale time for queries
    ORDERS_STALE_TIME: 10000, // 10 seconds
    ORDER_DETAIL_STALE_TIME: 5000, // 5 seconds

    // WebSocket reconnection settings
    WS_RECONNECTION_ATTEMPTS: 5,
    WS_RECONNECTION_DELAY: 2000, // 2 seconds
    WS_RECONNECTION_DELAY_MAX: 30000, // 30 seconds max

    // Audio notification settings
    AUDIO_ENABLED: true,
    DEFAULT_SOUND_VOLUME: 0.8,
    SOUND_ENABLED_KEY: "kitchenSoundEnabled",
    SOUND_VOLUME_KEY: "kitchenSoundVolume",
    SOUND_URLS: {
        newOrder: "/sounds/kitchen/new-order.mp3",
        orderReady: "/sounds/kitchen/order-ready.mp3",
        urgent: "/sounds/kitchen/urgent.mp3",
    },

    // Browser Notifications
    NOTIFICATION_ENABLED: true,

    // Prep time thresholds (in minutes)
    PREP_TIME_FAST: 10, // < 10 min = fast
    PREP_TIME_SLOW: 30, // > 30 min = slow

    // New order flash duration (milliseconds)
    NEW_ORDER_FLASH_DURATION: 5000,

    // Auto-hide completed orders delay (milliseconds)
    COMPLETED_ORDER_HIDE_DELAY: 5000,
};

/**
 * Notification sound URLs (deprecated - use KITCHEN_CONFIG.SOUND_URLS)
 */
export const SOUND_URLS = {
    NEW_ORDER: "/sounds/kitchen/new-order.mp3",
    ORDER_READY: "/sounds/kitchen/order-ready.mp3",
};
