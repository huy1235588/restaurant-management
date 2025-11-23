import {
    KitchenOrder,
    KitchenOrderStatus,
    KitchenPriority,
} from "../types/kitchen.types";
import {
    PRIORITY_WEIGHTS,
    KITCHEN_CONFIG,
} from "../constants/kitchen.constants";

/**
 * Kitchen helper utility functions
 */
export class KitchenHelpers {
    /**
     * Calculate elapsed time from creation to now (in seconds)
     */
    static calculateElapsedTime(createdAt: string): number {
        const now = new Date();
        const created = new Date(createdAt);
        return Math.floor((now.getTime() - created.getTime()) / 1000);
    }

    /**
     * Format elapsed time as MM:SS or "Xh Ym"
     */
    static formatElapsedTime(seconds: number): string {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;

        if (hours > 0) {
            return `${hours}h ${minutes}m`;
        }
        return `${minutes.toString().padStart(2, "0")}:${secs
            .toString()
            .padStart(2, "0")}`;
    }

    /**
     * Get color class for prep time indicator
     */
    static getPrepTimeColor(elapsedMinutes: number): string {
        if (elapsedMinutes < KITCHEN_CONFIG.PREP_TIME_FAST) {
            return "text-green-600 dark:text-green-400"; // Fast
        }
        if (elapsedMinutes < KITCHEN_CONFIG.PREP_TIME_SLOW) {
            return "text-yellow-600 dark:text-yellow-400"; // On-time
        }
        return "text-red-600 dark:text-red-400"; // Slow
    }

    /**
     * Get priority weight for sorting
     */
    static getPriorityWeight(priority: KitchenPriority): number {
        return PRIORITY_WEIGHTS[priority];
    }

    /**
     * Sort orders by priority (DESC) then by creation time (ASC)
     */
    static sortOrdersByPriority(orders: KitchenOrder[]): KitchenOrder[] {
        return [...orders].sort((a, b) => {
            // First by priority (higher weight first)
            const priorityDiff =
                this.getPriorityWeight(b.priority) -
                this.getPriorityWeight(a.priority);

            if (priorityDiff !== 0) return priorityDiff;

            // Then by creation time (oldest first)
            return (
                new Date(a.createdAt).getTime() -
                new Date(b.createdAt).getTime()
            );
        });
    }

    /**
     * Filter orders by status
     */
    static filterOrdersByStatus(
        orders: KitchenOrder[],
        status: KitchenOrderStatus | "all"
    ): KitchenOrder[] {
        if (status === "all") return orders;
        return orders.filter((order) => order.status === status);
    }

    /**
     * Filter orders by priority
     */
    static filterOrdersByPriority(
        orders: KitchenOrder[],
        priority: KitchenPriority | "all"
    ): KitchenOrder[] {
        if (priority === "all") return orders;
        return orders.filter((order) => order.priority === priority);
    }

    /**
     * Check if order can be started
     */
    static canStartOrder(status: KitchenOrderStatus): boolean {
        return status === KitchenOrderStatus.PENDING;
    }

    /**
     * Check if order can be marked ready
     */
    static canMarkReady(status: KitchenOrderStatus): boolean {
        return status === KitchenOrderStatus.READY;
    }

    /**
     * Check if order can be completed
     */
    static canComplete(status: KitchenOrderStatus): boolean {
        return status === KitchenOrderStatus.READY;
    }

    /**
     * Calculate average prep time from completed orders
     */
    static calculateAvgPrepTime(orders: KitchenOrder[] | undefined): number {
        if (!orders || orders.length === 0) return 0;

        const completedOrders = orders.filter(
            (o) => o.prepTimeActual !== null && o.prepTimeActual !== undefined
        );

        if (completedOrders.length === 0) return 0;

        const total = completedOrders.reduce(
            (sum, order) => sum + (order.prepTimeActual || 0),
            0
        );

        return Math.round(total / completedOrders.length);
    }

    /**
     * Get count of in-progress orders (started but not completed)
     */
    static getInProgressCount(orders: KitchenOrder[] | undefined): number {
        if (!orders) return 0;
        return orders.filter((o) => o.startedAt && !o.completedAt).length;
    }
}
