import { KitchenOrder, KitchenOrderStatus } from "../types/kitchen.types";
import { KITCHEN_CONFIG } from "../constants/kitchen.constants";

/**
 * Kitchen helper utility functions
 */
export class KitchenHelpers {
    /**
     * Calculate elapsed time from creation to now (in seconds)
     * If endTime is provided, calculate from createdAt to endTime
     */
    static calculateElapsedTime(createdAt: string, endTime?: string): number {
        const end = endTime ? new Date(endTime) : new Date();
        const created = new Date(createdAt);
        return Math.floor((end.getTime() - created.getTime()) / 1000);
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
     * Format order number for display
     */
    formatOrderNumber = (orderNumber: string): string => {
        // If UUID, show shortened version
        if (orderNumber.includes("-")) {
            return `ORD-${orderNumber.slice(0, 8).toUpperCase()}`;
        }
        return orderNumber;
    };

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
     * Sort orders by creation time (ASC - oldest first)
     */
    static sortOrdersByTime(orders: KitchenOrder[]): KitchenOrder[] {
        return [...orders].sort(
            (a, b) =>
                new Date(a.createdAt).getTime() -
                new Date(b.createdAt).getTime()
        );
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
     * Check if order can be started
     */
    static canStartOrder(status: KitchenOrderStatus): boolean {
        return status === KitchenOrderStatus.PENDING;
    }

    /**
     * Check if order can be completed
     */
    static canComplete(status: KitchenOrderStatus): boolean {
        return status === KitchenOrderStatus.PREPARING;
    }

    /**
     * Get display name for table with fallback chain
     * Priority: name → code → tableNumber → "Table #{id}"
     */
    static getTableDisplayName(table: {
        tableId: number;
        name?: string | null;
        code?: string | null;
        tableNumber?: number | null;
    }): string {
        if (table.name) return table.name;
        if (table.code) return table.code;
        if (table.tableNumber) return `Table ${table.tableNumber}`;
        return `Table #${table.tableId}`;
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
