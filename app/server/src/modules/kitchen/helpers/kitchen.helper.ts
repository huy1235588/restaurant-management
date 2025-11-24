import { KITCHEN_STATUS_FLOW } from '../constants/kitchen.constants';
import { KitchenOrderStatus } from '@/lib/prisma';

/**
 * Kitchen Helper Functions
 * Reusable utility functions for kitchen operations
 */
export class KitchenHelper {
    /**
     * Calculate preparation time in minutes
     */
    static calculatePrepTime(startedAt: Date, completedAt: Date): number {
        const diffMs = completedAt.getTime() - startedAt.getTime();
        return Math.floor(diffMs / 60000); // Convert to minutes
    }

    /**
     * Check if preparation is slow
     * @deprecated - SLOW_PREP_TIME_THRESHOLD constant removed
     */
    // static isSlowPreparation(prepTimeMinutes: number): boolean {
    //     return prepTimeMinutes > KITCHEN_CONSTANTS.SLOW_PREP_TIME_THRESHOLD;
    // }

    /**
     * Check if preparation is fast
     * @deprecated - FAST_PREP_TIME_THRESHOLD constant removed
     */
    // static isFastPreparation(prepTimeMinutes: number): boolean {
    //     return prepTimeMinutes < KITCHEN_CONSTANTS.FAST_PREP_TIME_THRESHOLD;
    // }

    /**
     * Get estimated completion time
     * @deprecated - DEFAULT_PREP_TIME constant removed
     */
    // static getEstimatedCompletionTime(
    //     startedAt: Date,
    //     estimatedPrepTime: number = KITCHEN_CONSTANTS.DEFAULT_PREP_TIME,
    // ): Date {
    //     const completionTime = new Date(startedAt);
    //     completionTime.setMinutes(
    //         completionTime.getMinutes() + estimatedPrepTime,
    //     );
    //     return completionTime;
    // }

    /**
     * Calculate elapsed time since order was created
     */
    static getElapsedTime(createdAt: Date): number {
        const now = new Date();
        const diffMs = now.getTime() - createdAt.getTime();
        return Math.floor(diffMs / 60000); // Minutes
    }

    /**
     * Check if order is waiting too long (not started)
     * @deprecated - AUTO_CANCEL_TIMEOUT_MINUTES constant removed
     */
    // static isWaitingTooLong(createdAt: Date, startedAt: Date | null): boolean {
    //     if (startedAt) return false;
    //     const elapsedMinutes = this.getElapsedTime(createdAt);
    //     return elapsedMinutes > KITCHEN_CONSTANTS.AUTO_CANCEL_TIMEOUT_MINUTES;
    // }

    /**
     * Validate status transition
     */
    static isValidStatusTransition(
        currentStatus: KitchenOrderStatus,
        newStatus: KitchenOrderStatus,
    ): boolean {
        const allowedTransitions = KITCHEN_STATUS_FLOW[currentStatus] as
            | readonly KitchenOrderStatus[]
            | undefined;
        return allowedTransitions?.includes(newStatus) ?? false;
    }

    /**
     * Check if order can be modified
     */
    static canModifyOrder(status: KitchenOrderStatus): boolean {
        return status !== KitchenOrderStatus.completed;
    }

    /**
     * Check if order can be cancelled
     */
    static canCancelOrder(status: KitchenOrderStatus): boolean {
        return status !== KitchenOrderStatus.completed;
    }

    /**
     * Check if order is active
     */
    static isActiveOrder(status: KitchenOrderStatus): boolean {
        return (
            status === KitchenOrderStatus.pending ||
            status === KitchenOrderStatus.preparing
        );
    }

    /**
     * Check if order is in final state
     */
    static isFinalState(status: KitchenOrderStatus): boolean {
        return status === KitchenOrderStatus.completed;
    }

    /**
     * Get status display name
     */
    static getStatusDisplayName(status: KitchenOrderStatus): string {
        const displayNames: Record<KitchenOrderStatus, string> = {
            [KitchenOrderStatus.pending]: 'Chờ xử lý',
            [KitchenOrderStatus.preparing]: 'Đang chuẩn bị',
            [KitchenOrderStatus.ready]: 'Sẵn sàng',
            [KitchenOrderStatus.completed]: 'Hoàn thành',
        };
        return displayNames[status] || status;
    }

    /**
     * Format preparation time for display
     */
    static formatPrepTime(minutes: number): string {
        if (minutes < 60) {
            return `${minutes} phút`;
        }
        const hours = Math.floor(minutes / 60);
        const remainingMinutes = minutes % 60;
        return remainingMinutes > 0
            ? `${hours} giờ ${remainingMinutes} phút`
            : `${hours} giờ`;
    }

    /**
     * Calculate average preparation time
     * @deprecated - DEFAULT_PREP_TIME constant removed
     */
    // static calculateAveragePrepTime(prepTimes: number[]): number {
    //     if (prepTimes.length === 0) return KITCHEN_CONSTANTS.DEFAULT_PREP_TIME;
    //     const sum = prepTimes.reduce((acc, time) => acc + time, 0);
    //     return Math.round(sum / prepTimes.length);
    // }

    /**
     * Get prep time performance indicator
     * @deprecated - No longer needed in simplified flow
     */
    // static getPrepTimePerformance(
    //     actualTime: number,
    //     estimatedTime: number,
    // ): 'fast' | 'on-time' | 'slow' {
    //     if (actualTime <= estimatedTime * 0.8) return 'fast';
    //     if (actualTime <= estimatedTime * 1.2) return 'on-time';
    //     return 'slow';
    // }

    /**
     * Check if queue is near capacity
     * @deprecated - MAX_CONCURRENT_ORDERS constant removed
     */
    // static isQueueNearCapacity(currentCount: number): boolean {
    //     return currentCount >= KITCHEN_CONSTANTS.MAX_CONCURRENT_ORDERS * 0.8;
    // }

    /**
     * Check if queue is full
     * @deprecated - MAX_CONCURRENT_ORDERS constant removed
     */
    // static isQueueFull(currentCount: number): boolean {
    //     return currentCount >= KITCHEN_CONSTANTS.MAX_CONCURRENT_ORDERS;
    // }

    /**
     * Sort orders by creation time (earlier orders first)
     */
    static sortOrdersByTime<T extends { createdAt: Date }>(orders: T[]): T[] {
        return [...orders].sort(
            (a, b) => a.createdAt.getTime() - b.createdAt.getTime(),
        );
    }

    /**
     * Filter active orders
     */
    static filterActiveOrders<T extends { status: KitchenOrderStatus }>(
        orders: T[],
    ): T[] {
        return orders.filter((order) => this.isActiveOrder(order.status));
    }

    /**
     * Group orders by status
     */
    static groupOrdersByStatus<T extends { status: KitchenOrderStatus }>(
        orders: T[],
    ): Record<KitchenOrderStatus, T[]> {
        return orders.reduce(
            (acc, order) => {
                if (!acc[order.status]) {
                    acc[order.status] = [];
                }
                acc[order.status].push(order);
                return acc;
            },
            {} as Record<KitchenOrderStatus, T[]>,
        );
    }
}
