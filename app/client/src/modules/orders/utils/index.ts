import { OrderStatus } from "../types";
import { UserRole } from "@/types";

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
    [OrderStatus.PENDING]: "Pending",
    [OrderStatus.CONFIRMED]: "Confirmed",
    [OrderStatus.READY]: "Ready",
    [OrderStatus.SERVING]: "Serving",
    [OrderStatus.COMPLETED]: "Completed",
    [OrderStatus.CANCELLED]: "Cancelled",
};

export const ORDER_STATUS_COLORS: Record<
    OrderStatus,
    "default" | "secondary" | "success" | "warning" | "destructive"
> = {
    [OrderStatus.PENDING]: "warning",
    [OrderStatus.CONFIRMED]: "default",
    [OrderStatus.READY]: "secondary",
    [OrderStatus.SERVING]: "default",
    [OrderStatus.COMPLETED]: "success",
    [OrderStatus.CANCELLED]: "destructive",
};

export function formatCurrency(amount: number): string {
    return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
    }).format(amount);
}

export function formatDateTime(dateString: string): string {
    return new Intl.DateTimeFormat("vi-VN", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
    }).format(new Date(dateString));
}

export function canModifyOrder(status: OrderStatus): boolean {
    return status === OrderStatus.PENDING;
}

export function canConfirmOrder(status: OrderStatus): boolean {
    return status === OrderStatus.PENDING;
}

export function canCancelOrder(status: OrderStatus): boolean {
    return status === OrderStatus.PENDING || status === OrderStatus.CONFIRMED;
}

// Permission checks
export function canCreateOrder(role?: UserRole): boolean {
    if (!role) return false;
    return ['admin', 'manager', 'waiter'].includes(role);
}

export function canViewOrders(role?: UserRole): boolean {
    if (!role) return false;
    // All roles can view orders
    return true;
}

export function canModifyOrderItems(role?: UserRole): boolean {
    if (!role) return false;
    return ['admin', 'manager', 'waiter'].includes(role);
}

export function canConfirmOrderPermission(role?: UserRole): boolean {
    if (!role) return false;
    return ['admin', 'manager', 'waiter'].includes(role);
}

export function canCancelOrderPermission(role?: UserRole, status?: OrderStatus): boolean {
    if (!role) return false;
    
    // Admins can cancel any order
    if (role === 'admin') return true;
    
    // Managers and waiters can only cancel pending or confirmed orders
    if (['manager', 'waiter'].includes(role)) {
        if (!status) return false;
        return status === OrderStatus.PENDING || status === OrderStatus.CONFIRMED;
    }
    
    return false;
}
