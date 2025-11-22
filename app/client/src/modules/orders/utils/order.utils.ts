import { MenuItem } from '@/types';
import { OrderStatus, OrderItemStatus, KitchenOrderStatus } from '../types';
import {
    ORDER_STATUS_COLORS,
    ORDER_ITEM_STATUS_COLORS,
    KITCHEN_ORDER_STATUS_COLORS,
    WAITING_TIME_THRESHOLDS,
    WAITING_TIME_COLORS,
    EDITABLE_ORDER_STATUSES,
    CANCELLABLE_ORDER_STATUSES,
    CANCELLABLE_ITEM_STATUSES,
    SERVABLE_ITEM_STATUSES,
    ORDER_STATUS_LABELS,
    ORDER_ITEM_STATUS_LABELS,
    KITCHEN_ORDER_STATUS_LABELS,
} from '../constants';

// Format currency (VND)
export const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
    }).format(amount);
};

// Calculate elapsed time in minutes
export const calculateElapsedTime = (createdAt: Date | string): number => {
    const now = new Date();
    const created = new Date(createdAt);
    return Math.floor((now.getTime() - created.getTime()) / 60000);
};

// Format elapsed time (e.g., "15 phút", "2 giờ 30 phút")
export const formatElapsedTime = (minutes: number): string => {
    if (minutes < 60) {
        return `${minutes} phút`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours} giờ ${remainingMinutes} phút` : `${hours} giờ`;
};

// Get order status color
export const getOrderStatusColor = (status: OrderStatus): string => {
    return ORDER_STATUS_COLORS[status] || 'bg-gray-100 text-gray-800';
};

// Get order item status color
export const getOrderItemStatusColor = (status: OrderItemStatus): string => {
    return ORDER_ITEM_STATUS_COLORS[status] || 'bg-gray-100 text-gray-800';
};

// Get kitchen order status color
export const getKitchenOrderStatusColor = (status: KitchenOrderStatus): string => {
    return KITCHEN_ORDER_STATUS_COLORS[status] || 'bg-gray-100 text-gray-800';
};

// Get waiting time alert level (for kitchen queue)
export const getWaitingTimeAlertLevel = (
    minutes: number
): 'normal' | 'warning' | 'critical' => {
    if (minutes < WAITING_TIME_THRESHOLDS.NORMAL) return 'normal';
    if (minutes < WAITING_TIME_THRESHOLDS.WARNING) return 'warning';
    return 'critical';
};

// Get alert color based on waiting time
export const getWaitingTimeColor = (minutes: number): string => {
    const level = getWaitingTimeAlertLevel(minutes);
    return WAITING_TIME_COLORS[level.toUpperCase() as keyof typeof WAITING_TIME_COLORS];
};

// Calculate order total
export const calculateOrderTotal = (items: Array<{ price: number; quantity: number }>): number => {
    return items.reduce((total, item) => total + item.price * item.quantity, 0);
};

// Group items by category
export const groupItemsByCategory = <T extends { menuItemId: number; menuItem: MenuItem }>(
    items: T[]
): Record<string, T[]> => {
    return items.reduce((groups, item) => {
        const categoryName = item.menuItem?.category?.categoryName || 'Khác';
        if (!groups[categoryName]) {
            groups[categoryName] = [];
        }
        groups[categoryName].push(item);
        return groups;
    }, {} as Record<string, T[]>);
};

// Check if order can be cancelled
export const canCancelOrder = (status: OrderStatus): boolean => {
    return CANCELLABLE_ORDER_STATUSES.includes(status as any);
};

// Check if item can be cancelled
export const canCancelItem = (itemStatus: OrderItemStatus): boolean => {
    return CANCELLABLE_ITEM_STATUSES.includes(itemStatus as any);
};

// Check if item can be marked as served
export const canMarkItemAsServed = (itemStatus: OrderItemStatus): boolean => {
    return SERVABLE_ITEM_STATUSES.includes(itemStatus as any);
};

// Check if order is editable
export const isOrderEditable = (status: OrderStatus): boolean => {
    return EDITABLE_ORDER_STATUSES.includes(status as any);
};

// Format date/time
export const formatDateTime = (date: Date | string): string => {
    return new Intl.DateTimeFormat('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
    }).format(new Date(date));
};

// Format date only
export const formatDate = (date: Date | string): string => {
    return new Intl.DateTimeFormat('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    }).format(new Date(date));
};

// Format time only
export const formatTime = (date: Date | string): string => {
    return new Intl.DateTimeFormat('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
    }).format(new Date(date));
};

/**
 * New utility functions
 */

// Get status label (Vietnamese)
export const getOrderStatusLabel = (status: OrderStatus): string => {
    return ORDER_STATUS_LABELS[status] || status;
};

export const getOrderItemStatusLabel = (status: OrderItemStatus): string => {
    return ORDER_ITEM_STATUS_LABELS[status] || status;
};

export const getKitchenOrderStatusLabel = (status: KitchenOrderStatus): string => {
    return KITCHEN_ORDER_STATUS_LABELS[status] || status;
};

// Check if order is in progress
export const isOrderInProgress = (status: OrderStatus): boolean => {
    return [
        OrderStatus.PENDING,
        OrderStatus.CONFIRMED,
        OrderStatus.PREPARING,
        OrderStatus.READY,
        OrderStatus.SERVED,
    ].includes(status);
};

// Check if order is finalized
export const isOrderFinalized = (status: OrderStatus): boolean => {
    return [
        OrderStatus.COMPLETED,
        OrderStatus.CANCELLED,
        OrderStatus.PAID,
    ].includes(status);
};

// Get next possible statuses for transition
export const getNextPossibleStatuses = (currentStatus: OrderStatus): OrderStatus[] => {
    const transitions: Record<OrderStatus, OrderStatus[]> = {
        [OrderStatus.PENDING]: [OrderStatus.CONFIRMED, OrderStatus.CANCELLED],
        [OrderStatus.CONFIRMED]: [OrderStatus.PREPARING, OrderStatus.CANCELLED],
        [OrderStatus.PREPARING]: [OrderStatus.READY],
        [OrderStatus.READY]: [OrderStatus.SERVED],
        [OrderStatus.SERVED]: [OrderStatus.COMPLETED],
        [OrderStatus.COMPLETED]: [OrderStatus.PAID],
        [OrderStatus.CANCELLED]: [],
        [OrderStatus.PAID]: [],
    };
    return transitions[currentStatus] || [];
};

// Calculate discount amount
export const calculateDiscount = (
    totalAmount: number,
    discountPercent?: number,
    discountAmount?: number
): number => {
    if (discountAmount) return discountAmount;
    if (discountPercent) return (totalAmount * discountPercent) / 100;
    return 0;
};

// Calculate final amount after discount
export const calculateFinalAmount = (
    totalAmount: number,
    discountPercent?: number,
    discountAmount?: number
): number => {
    const discount = calculateDiscount(totalAmount, discountPercent, discountAmount);
    return Math.max(0, totalAmount - discount);
};

// Format order number
export const formatOrderNumber = (orderNumber: string | number): string => {
    if (typeof orderNumber === 'string') return orderNumber;
    return `#${String(orderNumber).padStart(6, '0')}`;
};

// Get time range label
export const getTimeRangeLabel = (startDate?: string, endDate?: string): string => {
    if (!startDate && !endDate) return 'Tất cả';
    if (startDate && !endDate) return `Từ ${formatDate(startDate)}`;
    if (!startDate && endDate) return `Đến ${formatDate(endDate)}`;
    return `${formatDate(startDate!)} - ${formatDate(endDate!)}`;
};

// Sort orders by priority and time
export const sortOrdersByPriority = <T extends { createdAt: Date | string; status: OrderStatus }>(
    orders: T[]
): T[] => {
    return [...orders].sort((a, b) => {
        // First by status (in-progress orders first)
        const aInProgress = isOrderInProgress(a.status);
        const bInProgress = isOrderInProgress(b.status);
        if (aInProgress !== bInProgress) {
            return aInProgress ? -1 : 1;
        }
        
        // Then by creation time (oldest first for in-progress)
        const aTime = new Date(a.createdAt).getTime();
        const bTime = new Date(b.createdAt).getTime();
        return aTime - bTime;
    });
};

// Get waiting time badge variant
export const getWaitingTimeBadgeVariant = (
    minutes: number
): 'default' | 'secondary' | 'destructive' => {
    const level = getWaitingTimeAlertLevel(minutes);
    if (level === 'critical') return 'destructive';
    if (level === 'warning') return 'secondary';
    return 'default';
};

// Validate order items
export const validateOrderItems = (items: Array<{ itemId: number; quantity: number }>): {
    valid: boolean;
    errors: string[];
} => {
    const errors: string[] = [];
    
    if (!items || items.length === 0) {
        errors.push('Vui lòng chọn ít nhất một món');
    }
    
    items.forEach((item, index) => {
        if (!item.itemId) {
            errors.push(`Món thứ ${index + 1}: Thiếu thông tin món ăn`);
        }
        if (!item.quantity || item.quantity < 1) {
            errors.push(`Món thứ ${index + 1}: Số lượng không hợp lệ`);
        }
        if (item.quantity > 99) {
            errors.push(`Món thứ ${index + 1}: Số lượng tối đa là 99`);
        }
    });
    
    return {
        valid: errors.length === 0,
        errors,
    };
};
