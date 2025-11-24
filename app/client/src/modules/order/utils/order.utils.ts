import { OrderStatus, OrderItemStatus, Order, OrderItem } from "../types";

/**
 * Parse string decimal to number
 * Used for financial fields that come as string from backend (Prisma Decimal)
 */
export const parseDecimal = (value: string | number): number => {
    if (typeof value === "number") return value;
    const parsed = parseFloat(value);
    return isNaN(parsed) ? 0 : parsed;
};

/**
 * Format order number for display
 */
export const formatOrderNumber = (orderNumber: string): string => {
    // If UUID, show shortened version
    if (orderNumber.includes("-")) {
        return `ORD-${orderNumber.slice(0, 8).toUpperCase()}`;
    }
    return orderNumber;
};

/**
 * Calculate order total from items
 */
export const calculateOrderTotal = (items: OrderItem[]): number => {
    return items.reduce((sum, item) => {
        if (item.status !== "cancelled") {
            return sum + Number(item.totalPrice);
        }
        return sum;
    }, 0);
};

/**
 * Calculate subtotal, tax, service charge, and final total
 */
export const calculateOrderFinancials = (
    items: OrderItem[],
    taxRate: number = 0.1,
    serviceChargeRate: number = 0.05
): {
    subtotal: number;
    serviceCharge: number;
    tax: number;
    total: number;
    discount: number;
} => {
    const subtotal = calculateOrderTotal(items);
    const serviceCharge = subtotal * serviceChargeRate;
    const tax = subtotal * taxRate;
    const total = subtotal + serviceCharge + tax;

    return {
        subtotal,
        serviceCharge,
        tax,
        total,
        discount: 0,
    };
};

/**
 * Get color for order status badge
 */
export const getOrderStatusColor = (status: OrderStatus): string => {
    switch (status) {
        case "pending":
            return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
        case "confirmed":
            return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
        case "completed":
            return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
        case "cancelled":
            return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
        default:
            return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
    }
};

/**
 * Get color for order item status badge
 */
export const getOrderItemStatusColor = (status: OrderItemStatus): string => {
    switch (status) {
        case "pending":
            return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
        case "ready":
            return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
        case "cancelled":
            return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
        default:
            return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
    }
};

/**
 * Get human-readable status label
 */
export const getOrderStatusLabel = (status: OrderStatus): string => {
    switch (status) {
        case "pending":
            return "Chờ xác nhận";
        case "confirmed":
            return "Đã xác nhận";
        case "completed":
            return "Hoàn thành";
        case "cancelled":
            return "Đã hủy";
        default:
            return status;
    }
};

/**
 * Get human-readable item status label
 */
export const getOrderItemStatusLabel = (status: OrderItemStatus): string => {
    switch (status) {
        case "pending":
            return "Đang chờ";
        case "ready":
            return "Sẵn sàng";
        case "cancelled":
            return "Đã hủy";
        default:
            return status;
    }
};

/**
 * Check if order can be cancelled
 */
export const canCancelOrder = (order: Order): boolean => {
    return !["completed", "cancelled"].includes(order.status);
};

/**
 * Check if items can be added to order
 */
export const canAddItems = (order: Order): boolean => {
    return !["completed", "cancelled"].includes(order.status);
};

/**
 * Check if an order item can be cancelled
 */
export const canCancelOrderItem = (item: OrderItem): boolean => {
    return item.status !== "cancelled";
};

/**
 * Check if an order item can be marked as served
 */
export const canMarkItemServed = (item: OrderItem): boolean => {
    return item.status === "ready";
};

/**
 * Format currency (VND)
 */
export const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
    }).format(amount);
};

/**
 * Format date and time
 */
export const formatDateTime = (dateString: string): string => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("vi-VN", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
    }).format(date);
};

/**
 * Format time only
 */
export const formatTime = (dateString: string): string => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
    }).format(date);
};

/**
 * Format date only
 */
export const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("vi-VN", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    }).format(date);
};

/**
 * Get relative time (e.g., "5 minutes ago")
 */
export const getRelativeTime = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60)
        return `${diffMins} minute${diffMins > 1 ? "s" : ""} ago`;

    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24)
        return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;

    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
};

/**
 * Check if order is recent (within last 2 hours)
 */
export const isRecentOrder = (orderTime: string): boolean => {
    const date = new Date(orderTime);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);
    return diffHours < 2;
};
