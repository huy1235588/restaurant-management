import { OrderStatus, OrderItemStatus } from '@/lib/prisma';

/**
 * Order Module Helper Functions
 * Contains reusable business logic and utility functions
 */

export class OrderHelper {
    /**
     * Check if order status can be modified
     */
    static canModifyOrder(status: OrderStatus): boolean {
        return (
            status !== OrderStatus.completed && status !== OrderStatus.cancelled
        );
    }

    /**
     * Check if order can be cancelled
     */
    static canCancelOrder(status: OrderStatus): boolean {
        return status !== OrderStatus.completed;
    }

    /**
     * Calculate total amount from order items
     */
    static calculateTotalAmount(
        items: Array<{ totalPrice: number | string }>,
    ): number {
        return items.reduce((sum, item) => sum + Number(item.totalPrice), 0);
    }

    /**
     * Calculate total for active items only (excluding cancelled)
     */
    static calculateActiveItemsTotal(
        items: Array<{
            totalPrice: number | string;
            status: OrderItemStatus;
        }>,
    ): number {
        return items
            .filter((item) => item.status !== OrderItemStatus.cancelled)
            .reduce((sum, item) => sum + Number(item.totalPrice), 0);
    }

    /**
     * Check if all items are ready
     */
    static areAllItemsReady(
        items: Array<{ status: OrderItemStatus }>,
    ): boolean {
        const activeItems = items.filter(
            (item) => item.status !== OrderItemStatus.cancelled,
        );
        return (
            activeItems.length > 0 &&
            activeItems.every((item) => item.status === OrderItemStatus.ready)
        );
    }

    /**
     * Validate status transition
     */
    static isValidStatusTransition(
        currentStatus: OrderStatus,
        newStatus: OrderStatus,
    ): boolean {
        // Define allowed transitions based on simplified enum
        // OrderStatus: pending -> confirmed -> completed
        const transitions: Record<OrderStatus, OrderStatus[]> = {
            [OrderStatus.pending]: [
                OrderStatus.confirmed,
                OrderStatus.cancelled,
            ],
            [OrderStatus.confirmed]: [
                OrderStatus.completed,
                OrderStatus.cancelled,
            ],
            [OrderStatus.completed]: [
                OrderStatus.confirmed, // Allow reopening when adding items
            ],
            [OrderStatus.cancelled]: [], // Cannot transition from cancelled
        };

        return transitions[currentStatus]?.includes(newStatus) ?? false;
    }

    /**
     * Calculate item total price
     */
    static calculateItemTotal(unitPrice: number, quantity: number): number {
        return unitPrice * quantity;
    }

    /**
     * Format order number for display
     */
    static formatOrderNumber(orderNumber: string): string {
        return orderNumber.toUpperCase();
    }

    /**
     * Check if order is active (not completed or cancelled)
     */
    static isActiveOrder(status: OrderStatus): boolean {
        return (
            status !== OrderStatus.completed && status !== OrderStatus.cancelled
        );
    }

    /**
     * Get order status priority for sorting
     * Based on simplified enum: pending -> confirmed -> completed -> cancelled
     */
    static getStatusPriority(status: OrderStatus): number {
        const priorities: Record<OrderStatus, number> = {
            [OrderStatus.pending]: 1,
            [OrderStatus.confirmed]: 2,
            [OrderStatus.completed]: 3,
            [OrderStatus.cancelled]: 4,
        };
        return priorities[status] ?? 99;
    }
}
