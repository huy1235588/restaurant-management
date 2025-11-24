import { Injectable, Logger } from '@nestjs/common';
import type { Cache } from 'cache-manager';
import { Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

/**
 * Order Cache Service
 * Provides caching capabilities for order module
 * Implements cache invalidation strategies
 */
@Injectable()
export class OrderCacheService {
    private readonly logger = new Logger(OrderCacheService.name);
    private readonly DEFAULT_TTL = 60; // 60 seconds
    private readonly LIST_TTL = 30; // 30 seconds for lists
    private readonly DETAIL_TTL = 120; // 2 minutes for single orders

    constructor(@Inject(CACHE_MANAGER) private readonly cacheManager: Cache) {}

    /**
     * Cache keys generators
     */
    private getOrderKey(orderId: number): string {
        return `order:${orderId}`;
    }

    private getOrderNumberKey(orderNumber: string): string {
        return `order:number:${orderNumber}`;
    }

    private getTableOrderKey(tableId: number): string {
        return `order:table:${tableId}`;
    }

    private getOrderListKey(filters: Record<string, any>): string {
        const filterStr = JSON.stringify(filters || {});
        return `order:list:${Buffer.from(filterStr).toString('base64')}`;
    }

    /**
     * Get cached order by ID
     */
    async getOrder(orderId: number): Promise<any> {
        try {
            return await this.cacheManager.get(this.getOrderKey(orderId));
        } catch (error) {
            this.logger.error(`Cache get error for order ${orderId}:`, error);
            return null;
        }
    }

    /**
     * Set cached order
     */
    async setOrder(orderId: number, order: any, ttl?: number): Promise<void> {
        try {
            await this.cacheManager.set(
                this.getOrderKey(orderId),
                order,
                ttl || this.DETAIL_TTL,
            );
        } catch (error) {
            this.logger.error(`Cache set error for order ${orderId}:`, error);
        }
    }

    /**
     * Get cached order by number
     */
    async getOrderByNumber(orderNumber: string): Promise<any> {
        try {
            return await this.cacheManager.get(
                this.getOrderNumberKey(orderNumber),
            );
        } catch (error) {
            this.logger.error(
                `Cache get error for order number ${orderNumber}:`,
                error,
            );
            return null;
        }
    }

    /**
     * Set cached order by number
     */
    async setOrderByNumber(
        orderNumber: string,
        order: any,
        ttl?: number,
    ): Promise<void> {
        try {
            await this.cacheManager.set(
                this.getOrderNumberKey(orderNumber),
                order,
                ttl || this.DETAIL_TTL,
            );
        } catch (error) {
            this.logger.error(
                `Cache set error for order number ${orderNumber}:`,
                error,
            );
        }
    }

    /**
     * Get cached active order for table
     */
    async getTableOrder(tableId: number): Promise<any> {
        try {
            return await this.cacheManager.get(this.getTableOrderKey(tableId));
        } catch (error) {
            this.logger.error(
                `Cache get error for table order ${tableId}:`,
                error,
            );
            return null;
        }
    }

    /**
     * Set cached active order for table
     */
    async setTableOrder(
        tableId: number,
        order: any,
        ttl?: number,
    ): Promise<void> {
        try {
            await this.cacheManager.set(
                this.getTableOrderKey(tableId),
                order,
                ttl || this.DETAIL_TTL,
            );
        } catch (error) {
            this.logger.error(
                `Cache set error for table order ${tableId}:`,
                error,
            );
        }
    }

    /**
     * Get cached order list
     */
    async getOrderList(filters: Record<string, any>): Promise<any> {
        try {
            return await this.cacheManager.get(this.getOrderListKey(filters));
        } catch (error) {
            this.logger.error('Cache get error for order list:', error);
            return null;
        }
    }

    /**
     * Set cached order list
     */
    async setOrderList(
        filters: Record<string, any>,
        orders: any,
        ttl?: number,
    ): Promise<void> {
        try {
            await this.cacheManager.set(
                this.getOrderListKey(filters),
                orders,
                ttl || this.LIST_TTL,
            );
        } catch (error) {
            this.logger.error('Cache set error for order list:', error);
        }
    }

    /**
     * Invalidate order cache (when order is updated)
     */
    async invalidateOrder(
        orderId: number,
        orderNumber?: string,
    ): Promise<void> {
        try {
            await this.cacheManager.del(this.getOrderKey(orderId));
            if (orderNumber) {
                await this.cacheManager.del(
                    this.getOrderNumberKey(orderNumber),
                );
            }
            this.logger.debug(`Cache invalidated for order ${orderId}`);
        } catch (error) {
            this.logger.error(
                `Cache invalidation error for order ${orderId}:`,
                error,
            );
        }
    }

    /**
     * Invalidate table order cache
     */
    async invalidateTableOrder(tableId: number): Promise<void> {
        try {
            await this.cacheManager.del(this.getTableOrderKey(tableId));
            this.logger.debug(`Cache invalidated for table ${tableId}`);
        } catch (error) {
            this.logger.error(
                `Cache invalidation error for table ${tableId}:`,
                error,
            );
        }
    }

    /**
     * Invalidate all order lists
     */
    async invalidateOrderLists(): Promise<void> {
        try {
            // In a real implementation, you'd track list keys
            // For now, we'll rely on TTL expiration
            this.logger.debug('Order list caches will expire naturally');
        } catch (error) {
            this.logger.error(
                'Cache invalidation error for order lists:',
                error,
            );
        }
    }

    /**
     * Clear all order caches
     */
    async clearAll(): Promise<void> {
        // Note: cache-manager v7 doesn't have reset() method
        // Manual key tracking would be needed for full cache clear
        // or upgrade to cache-manager v8+
        this.logger.warn('clearAll() not supported in cache-manager v7');
    }
}
