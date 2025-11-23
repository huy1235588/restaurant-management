import {
    KITCHEN_CONSTANTS,
    KitchenPriority,
    KITCHEN_STATUS_FLOW,
} from '../constants/kitchen.constants';
import { KitchenOrderStatus } from '@prisma/generated/client';

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
     */
    static isSlowPreparation(prepTimeMinutes: number): boolean {
        return prepTimeMinutes > KITCHEN_CONSTANTS.SLOW_PREP_TIME_THRESHOLD;
    }

    /**
     * Check if preparation is fast
     */
    static isFastPreparation(prepTimeMinutes: number): boolean {
        return prepTimeMinutes < KITCHEN_CONSTANTS.FAST_PREP_TIME_THRESHOLD;
    }

    /**
     * Get estimated completion time
     */
    static getEstimatedCompletionTime(
        startedAt: Date,
        estimatedPrepTime: number = KITCHEN_CONSTANTS.DEFAULT_PREP_TIME,
    ): Date {
        const completionTime = new Date(startedAt);
        completionTime.setMinutes(completionTime.getMinutes() + estimatedPrepTime);
        return completionTime;
    }

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
     */
    static isWaitingTooLong(createdAt: Date, startedAt: Date | null): boolean {
        if (startedAt) return false;
        const elapsedMinutes = this.getElapsedTime(createdAt);
        return elapsedMinutes > KITCHEN_CONSTANTS.AUTO_CANCEL_TIMEOUT_MINUTES;
    }

    /**
     * Validate priority level
     */
    static isValidPriority(priority: string): priority is KitchenPriority {
        return KITCHEN_CONSTANTS.PRIORITIES.includes(priority as KitchenPriority);
    }

    /**
     * Get priority weight for sorting (higher = more urgent)
     */
    static getPriorityWeight(priority: KitchenPriority): number {
        const weights: Record<KitchenPriority, number> = {
            urgent: 4,
            high: 3,
            normal: 2,
            low: 1,
        };
        return weights[priority] || 2;
    }

    /**
     * Compare orders by priority and creation time
     */
    static compareOrderPriority(
        a: { priority: KitchenPriority; createdAt: Date },
        b: { priority: KitchenPriority; createdAt: Date },
    ): number {
        const priorityDiff = this.getPriorityWeight(b.priority) - this.getPriorityWeight(a.priority);
        if (priorityDiff !== 0) return priorityDiff;

        // Same priority, earlier orders first
        return a.createdAt.getTime() - b.createdAt.getTime();
    }

    /**
     * Validate status transition
     */
    static isValidStatusTransition(
        currentStatus: KitchenOrderStatus,
        newStatus: KitchenOrderStatus,
    ): boolean {
        const allowedTransitions = KITCHEN_STATUS_FLOW[currentStatus] as readonly KitchenOrderStatus[] | undefined;
        return allowedTransitions?.includes(newStatus) ?? false;
    }

    /**
     * Check if order can be modified
     */
    static canModifyOrder(status: KitchenOrderStatus): boolean {
        return status !== KitchenOrderStatus.completed && status !== KitchenOrderStatus.cancelled;
    }

    /**
     * Check if order can be cancelled
     */
    static canCancelOrder(status: KitchenOrderStatus): boolean {
        return status !== KitchenOrderStatus.completed && status !== KitchenOrderStatus.cancelled;
    }

    /**
     * Check if order is active
     */
    static isActiveOrder(status: KitchenOrderStatus): boolean {
        return status === KitchenOrderStatus.pending || status === KitchenOrderStatus.ready;
    }

    /**
     * Check if order is in final state
     */
    static isFinalState(status: KitchenOrderStatus): boolean {
        return status === KitchenOrderStatus.completed || status === KitchenOrderStatus.cancelled;
    }

    /**
     * Get status display name
     */
    static getStatusDisplayName(status: KitchenOrderStatus): string {
        const displayNames: Record<KitchenOrderStatus, string> = {
            [KitchenOrderStatus.pending]: 'Chờ xử lý',
            [KitchenOrderStatus.ready]: 'Sẵn sàng',
            [KitchenOrderStatus.completed]: 'Hoàn thành',
            [KitchenOrderStatus.cancelled]: 'Đã hủy',
        };
        return displayNames[status] || status;
    }

    /**
     * Get priority display name
     */
    static getPriorityDisplayName(priority: KitchenPriority): string {
        const displayNames: Record<KitchenPriority, string> = {
            urgent: 'Khẩn cấp',
            high: 'Cao',
            normal: 'Thường',
            low: 'Thấp',
        };
        return displayNames[priority] || priority;
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
     */
    static calculateAveragePrepTime(prepTimes: number[]): number {
        if (prepTimes.length === 0) return KITCHEN_CONSTANTS.DEFAULT_PREP_TIME;
        const sum = prepTimes.reduce((acc, time) => acc + time, 0);
        return Math.round(sum / prepTimes.length);
    }

    /**
     * Get prep time performance indicator
     */
    static getPrepTimePerformance(actualTime: number, estimatedTime: number): 'fast' | 'on-time' | 'slow' {
        if (actualTime <= estimatedTime * 0.8) return 'fast';
        if (actualTime <= estimatedTime * 1.2) return 'on-time';
        return 'slow';
    }

    /**
     * Check if queue is near capacity
     */
    static isQueueNearCapacity(currentCount: number): boolean {
        return currentCount >= KITCHEN_CONSTANTS.MAX_CONCURRENT_ORDERS * 0.8;
    }

    /**
     * Check if queue is full
     */
    static isQueueFull(currentCount: number): boolean {
        return currentCount >= KITCHEN_CONSTANTS.MAX_CONCURRENT_ORDERS;
    }

    /**
     * Sort orders by priority and time
     */
    static sortOrdersByPriority<
        T extends { priority: KitchenPriority; createdAt: Date },
    >(orders: T[]): T[] {
        return [...orders].sort((a, b) => KitchenHelper.compareOrderPriority(a, b));
    }

    /**
     * Filter active orders
     */
    static filterActiveOrders<T extends { status: KitchenOrderStatus }>(orders: T[]): T[] {
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
