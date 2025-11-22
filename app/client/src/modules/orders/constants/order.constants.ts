/**
 * Order Module Constants
 * Centralized constants for order management
 */

import { OrderStatus, OrderItemStatus, KitchenOrderStatus, OrderPriority } from '../types';

/**
 * Order status labels (Vietnamese)
 */
export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
    [OrderStatus.PENDING]: 'Chờ xác nhận',
    [OrderStatus.CONFIRMED]: 'Đã xác nhận',
    [OrderStatus.READY]: 'Sẵn sàng',
    [OrderStatus.SERVING]: 'Đang phục vụ',
    [OrderStatus.COMPLETED]: 'Hoàn thành',
    [OrderStatus.CANCELLED]: 'Đã hủy',
};

/**
 * Order item status labels (Vietnamese)
 */
export const ORDER_ITEM_STATUS_LABELS: Record<OrderItemStatus, string> = {
    [OrderItemStatus.PENDING]: 'Chờ xử lý',
    [OrderItemStatus.READY]: 'Sẵn sàng',
    [OrderItemStatus.SERVED]: 'Đã phục vụ',
    [OrderItemStatus.CANCELLED]: 'Đã hủy',
};

/**
 * Kitchen order status labels (Vietnamese)
 */
export const KITCHEN_ORDER_STATUS_LABELS: Record<KitchenOrderStatus, string> = {
    [KitchenOrderStatus.PENDING]: 'Chờ làm',
    [KitchenOrderStatus.READY]: 'Sẵn sàng',
    [KitchenOrderStatus.COMPLETED]: 'Hoàn thành',
    [KitchenOrderStatus.CANCELLED]: 'Đã hủy',
};

/**
 * Order priority labels (Vietnamese)
 */
export const ORDER_PRIORITY_LABELS: Record<OrderPriority, string> = {
    [OrderPriority.NORMAL]: 'Bình thường',
    [OrderPriority.EXPRESS]: 'Gấp',
    [OrderPriority.VIP]: 'VIP',
};

/**
 * Status colors for badges
 */
export const ORDER_STATUS_COLORS: Record<OrderStatus, string> = {
    [OrderStatus.PENDING]: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    [OrderStatus.CONFIRMED]: 'bg-blue-100 text-blue-800 border-blue-300',
    [OrderStatus.READY]: 'bg-green-100 text-green-800 border-green-300',
    [OrderStatus.SERVING]: 'bg-purple-100 text-purple-800 border-purple-300',
    [OrderStatus.COMPLETED]: 'bg-gray-100 text-gray-800 border-gray-300',
    [OrderStatus.CANCELLED]: 'bg-red-100 text-red-800 border-red-300',
};

export const ORDER_ITEM_STATUS_COLORS: Record<OrderItemStatus, string> = {
    [OrderItemStatus.PENDING]: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    [OrderItemStatus.READY]: 'bg-green-100 text-green-800 border-green-300',
    [OrderItemStatus.SERVED]: 'bg-purple-100 text-purple-800 border-purple-300',
    [OrderItemStatus.CANCELLED]: 'bg-red-100 text-red-800 border-red-300',
};

export const KITCHEN_ORDER_STATUS_COLORS: Record<KitchenOrderStatus, string> = {
    [KitchenOrderStatus.PENDING]: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    [KitchenOrderStatus.READY]: 'bg-green-100 text-green-800 border-green-300',
    [KitchenOrderStatus.COMPLETED]: 'bg-gray-100 text-gray-800 border-gray-300',
    [KitchenOrderStatus.CANCELLED]: 'bg-red-100 text-red-800 border-red-300',
};

/**
 * Waiting time alert thresholds (in minutes)
 */
export const WAITING_TIME_THRESHOLDS = {
    NORMAL: 15, // Less than 15 minutes is normal
    WARNING: 30, // 15-30 minutes is warning
    // Above 30 minutes is critical
} as const;

/**
 * Waiting time alert colors
 */
export const WAITING_TIME_COLORS = {
    NORMAL: 'text-green-600',
    WARNING: 'text-yellow-600',
    CRITICAL: 'text-red-600',
} as const;

/**
 * Validation rules
 */
export const ORDER_VALIDATION = {
    MIN_PARTY_SIZE: 1,
    MAX_PARTY_SIZE: 20,
    MIN_QUANTITY: 1,
    MAX_QUANTITY: 99,
    MAX_SPECIAL_REQUEST_LENGTH: 500,
    MAX_NOTES_LENGTH: 1000,
    MAX_CANCELLATION_REASON_LENGTH: 500,
    MIN_CANCELLATION_REASON_LENGTH: 10,
} as const;

/**
 * Pagination defaults
 */
export const ORDER_PAGINATION = {
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 10,
    MAX_LIMIT: 100,
} as const;

/**
 * API messages
 */
export const ORDER_MESSAGES = {
    SUCCESS: {
        CREATED: 'Tạo đơn hàng thành công',
        UPDATED: 'Cập nhật đơn hàng thành công',
        CANCELLED: 'Hủy đơn hàng thành công',
        ITEM_ADDED: 'Thêm món thành công',
        ITEM_CANCELLED: 'Hủy món thành công',
        ITEM_SERVED: 'Đánh dấu đã phục vụ thành công',
        STATUS_UPDATED: 'Cập nhật trạng thái thành công',
        KITCHEN_READY: 'Đánh dấu món đã hoàn thành',
    },
    ERROR: {
        CREATE_FAILED: 'Không thể tạo đơn hàng',
        UPDATE_FAILED: 'Không thể cập nhật đơn hàng',
        CANCEL_FAILED: 'Không thể hủy đơn hàng',
        ITEM_ADD_FAILED: 'Không thể thêm món',
        ITEM_CANCEL_FAILED: 'Không thể hủy món',
        ITEM_SERVE_FAILED: 'Không thể đánh dấu đã phục vụ',
        STATUS_UPDATE_FAILED: 'Không thể cập nhật trạng thái',
        FETCH_FAILED: 'Không thể tải danh sách đơn hàng',
        NOT_FOUND: 'Không tìm thấy đơn hàng',
        INVALID_STATUS: 'Trạng thái không hợp lệ',
        INVALID_QUANTITY: 'Số lượng không hợp lệ',
        EMPTY_ITEMS: 'Vui lòng chọn ít nhất một món',
        CANCELLATION_REASON_REQUIRED: 'Vui lòng nhập lý do hủy',
        CANCELLATION_REASON_TOO_SHORT: `Lý do hủy phải có ít nhất ${ORDER_VALIDATION.MIN_CANCELLATION_REASON_LENGTH} ký tự`,
    },
    CONFIRMATION: {
        CANCEL_ORDER: 'Bạn có chắc chắn muốn hủy đơn hàng này?',
        CANCEL_ITEM: 'Bạn có chắc chắn muốn hủy món này?',
        DELETE_ORDER: 'Bạn có chắc chắn muốn xóa đơn hàng này?',
    },
} as const;

/**
 * Status descriptions (for tooltips/help text)
 */
export const ORDER_STATUS_DESCRIPTIONS: Record<OrderStatus, string> = {
    [OrderStatus.PENDING]: 'Đơn hàng mới tạo, chờ xác nhận',
    [OrderStatus.CONFIRMED]: 'Đơn hàng đã được xác nhận, gửi vào bếp',
    [OrderStatus.READY]: 'Món ăn đã sẵn sàng, chờ phục vụ',
    [OrderStatus.SERVING]: 'Đang phục vụ món ăn cho khách',
    [OrderStatus.COMPLETED]: 'Khách đã dùng xong, đơn hàng hoàn thành',
    [OrderStatus.CANCELLED]: 'Đơn hàng đã bị hủy',
};

/**
 * Editable status list (statuses that allow modifications)
 */
export const EDITABLE_ORDER_STATUSES = [
    OrderStatus.PENDING,
    OrderStatus.CONFIRMED,
] as const;

/**
 * Cancellable status list (statuses that can be cancelled)
 */
export const CANCELLABLE_ORDER_STATUSES = [
    OrderStatus.PENDING,
    OrderStatus.CONFIRMED,
] as const;

/**
 * Cancellable item status list
 */
export const CANCELLABLE_ITEM_STATUSES = [
    OrderItemStatus.PENDING,
] as const;

/**
 * Servable item status list (statuses that can be marked as served)
 */
export const SERVABLE_ITEM_STATUSES = [
    OrderItemStatus.READY,
] as const;

/**
 * Sort options for order list
 */
export const ORDER_SORT_OPTIONS = [
    { value: 'createdAt', label: 'Thời gian tạo' },
    { value: 'orderNumber', label: 'Số đơn' },
    { value: 'totalAmount', label: 'Tổng tiền' },
    { value: 'tableNumber', label: 'Số bàn' },
] as const;

/**
 * Filter options for order list
 */
export const ORDER_FILTER_OPTIONS = {
    statuses: [
        { value: OrderStatus.PENDING, label: ORDER_STATUS_LABELS[OrderStatus.PENDING] },
        { value: OrderStatus.CONFIRMED, label: ORDER_STATUS_LABELS[OrderStatus.CONFIRMED] },
        { value: OrderStatus.READY, label: ORDER_STATUS_LABELS[OrderStatus.READY] },
        { value: OrderStatus.SERVING, label: ORDER_STATUS_LABELS[OrderStatus.SERVING] },
        { value: OrderStatus.COMPLETED, label: ORDER_STATUS_LABELS[OrderStatus.COMPLETED] },
        { value: OrderStatus.CANCELLED, label: ORDER_STATUS_LABELS[OrderStatus.CANCELLED] },
    ],
} as const;

/**
 * WebSocket events
 */
export const ORDER_SOCKET_EVENTS = {
    ORDER_CREATED: 'order:created',
    ORDER_UPDATED: 'order:updated',
    ORDER_CANCELLED: 'order:cancelled',
    ITEM_UPDATED: 'orderItem:updated',
    KITCHEN_UPDATED: 'kitchen:updated',
} as const;

/**
 * Local storage keys
 */
export const ORDER_STORAGE_KEYS = {
    FILTER_PREFERENCES: 'order_filter_preferences',
    VIEW_MODE: 'order_view_mode',
} as const;
