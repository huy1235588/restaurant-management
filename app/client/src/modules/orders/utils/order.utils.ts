import { OrderStatus, OrderItemStatus, KitchenOrderStatus } from '../types';

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
    const colors: Record<OrderStatus, string> = {
        pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
        confirmed: 'bg-blue-100 text-blue-800 border-blue-300',
        preparing: 'bg-orange-100 text-orange-800 border-orange-300',
        ready: 'bg-green-100 text-green-800 border-green-300',
        served: 'bg-purple-100 text-purple-800 border-purple-300',
        completed: 'bg-gray-100 text-gray-800 border-gray-300',
        cancelled: 'bg-red-100 text-red-800 border-red-300',
        paid: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
};

// Get order item status color
export const getOrderItemStatusColor = (status: OrderItemStatus): string => {
    const colors: Record<OrderItemStatus, string> = {
        pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
        preparing: 'bg-orange-100 text-orange-800 border-orange-300',
        ready: 'bg-green-100 text-green-800 border-green-300',
        served: 'bg-purple-100 text-purple-800 border-purple-300',
        cancelled: 'bg-red-100 text-red-800 border-red-300',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
};

// Get kitchen order status color
export const getKitchenOrderStatusColor = (status: KitchenOrderStatus): string => {
    const colors: Record<KitchenOrderStatus, string> = {
        pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
        preparing: 'bg-orange-100 text-orange-800 border-orange-300',
        ready: 'bg-green-100 text-green-800 border-green-300',
        cancelled: 'bg-red-100 text-red-800 border-red-300',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
};

// Get waiting time alert level (for kitchen queue)
export const getWaitingTimeAlertLevel = (
    minutes: number
): 'normal' | 'warning' | 'critical' => {
    if (minutes < 15) return 'normal';
    if (minutes < 30) return 'warning';
    return 'critical';
};

// Get alert color based on waiting time
export const getWaitingTimeColor = (minutes: number): string => {
    const level = getWaitingTimeAlertLevel(minutes);
    const colors = {
        normal: 'text-green-600',
        warning: 'text-yellow-600',
        critical: 'text-red-600',
    };
    return colors[level];
};

// Calculate order total
export const calculateOrderTotal = (items: Array<{ price: number; quantity: number }>): number => {
    return items.reduce((total, item) => total + item.price * item.quantity, 0);
};

// Group items by category
export const groupItemsByCategory = <T extends { menuItemId: number; menuItem: any }>(
    items: T[]
): Record<string, T[]> => {
    return items.reduce((groups, item) => {
        const categoryName = item.menuItem?.category?.name || 'Khác';
        if (!groups[categoryName]) {
            groups[categoryName] = [];
        }
        groups[categoryName].push(item);
        return groups;
    }, {} as Record<string, T[]>);
};

// Check if order can be cancelled
export const canCancelOrder = (status: OrderStatus): boolean => {
    return status === 'pending' || status === 'confirmed';
};

// Check if item can be cancelled
export const canCancelItem = (itemStatus: OrderItemStatus): boolean => {
    return itemStatus === 'pending';
};

// Check if item can be marked as served
export const canMarkItemAsServed = (itemStatus: OrderItemStatus): boolean => {
    return itemStatus === 'ready';
};

// Check if order is editable
export const isOrderEditable = (status: OrderStatus): boolean => {
    return status === 'pending' || status === 'confirmed';
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
