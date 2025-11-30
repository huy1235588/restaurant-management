import { Injectable, Logger, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import {
    OverviewReport,
    RevenueReport,
    TopItemsReport,
    PaymentMethodsReport,
    OrdersReport,
} from './types';

/**
 * Dashboard report data structure
 */
export interface DashboardReport {
    overview: OverviewReport;
    revenue: RevenueReport;
    topItems: TopItemsReport;
    paymentMethods: PaymentMethodsReport;
    orders: OrdersReport;
}

/**
 * Cached dashboard response with metadata
 */
export interface CachedDashboardResponse {
    data: DashboardReport;
    cachedAt: string;
}

/**
 * Reports Cache Service
 * Provides caching layer for reports module using Redis
 */
@Injectable()
export class ReportsCacheService {
    private readonly logger = new Logger(ReportsCacheService.name);

    // Cache TTL settings (in seconds)
    private readonly DASHBOARD_TTL = 300; // 5 minutes
    private readonly OVERVIEW_TTL = 300; // 5 minutes
    private readonly REVENUE_TTL = 600; // 10 minutes
    private readonly TOP_ITEMS_TTL = 900; // 15 minutes
    private readonly PAYMENT_METHODS_TTL = 900; // 15 minutes
    private readonly ORDERS_TTL = 600; // 10 minutes

    // Cache key prefix
    private readonly PREFIX = 'reports';

    constructor(@Inject(CACHE_MANAGER) private readonly cacheManager: Cache) {}

    /**
     * Generate cache key for dashboard
     */
    private getDashboardKey(startDate: string, endDate: string): string {
        return `${this.PREFIX}:dashboard:${startDate}:${endDate}`;
    }

    /**
     * Generate cache key for overview report
     */
    private getOverviewKey(startDate: string, endDate: string): string {
        return `${this.PREFIX}:overview:${startDate}:${endDate}`;
    }

    /**
     * Generate cache key for revenue report
     */
    private getRevenueKey(
        startDate: string,
        endDate: string,
        groupBy: string,
    ): string {
        return `${this.PREFIX}:revenue:${startDate}:${endDate}:${groupBy}`;
    }

    /**
     * Generate cache key for top items report
     */
    private getTopItemsKey(
        startDate: string,
        endDate: string,
        limit: number,
    ): string {
        return `${this.PREFIX}:top-items:${startDate}:${endDate}:${limit}`;
    }

    /**
     * Generate cache key for payment methods report
     */
    private getPaymentMethodsKey(startDate: string, endDate: string): string {
        return `${this.PREFIX}:payment-methods:${startDate}:${endDate}`;
    }

    /**
     * Generate cache key for orders report
     */
    private getOrdersKey(
        startDate: string,
        endDate: string,
        groupBy: string,
    ): string {
        return `${this.PREFIX}:orders:${startDate}:${endDate}:${groupBy}`;
    }

    /**
     * Get cached dashboard report
     */
    async getCachedDashboard(
        startDate: string,
        endDate: string,
    ): Promise<CachedDashboardResponse | null> {
        try {
            const key = this.getDashboardKey(startDate, endDate);
            const cached =
                await this.cacheManager.get<CachedDashboardResponse>(key);

            if (cached) {
                this.logger.debug(
                    `Cache hit for dashboard ${startDate} - ${endDate}`,
                );
            }

            return cached || null;
        } catch (error) {
            this.logger.error('Error getting cached dashboard:', error);
            return null;
        }
    }

    /**
     * Set cached dashboard report
     */
    async setCachedDashboard(
        startDate: string,
        endDate: string,
        data: DashboardReport,
    ): Promise<void> {
        try {
            const key = this.getDashboardKey(startDate, endDate);
            const cachedResponse: CachedDashboardResponse = {
                data,
                cachedAt: new Date().toISOString(),
            };

            await this.cacheManager.set(
                key,
                cachedResponse,
                this.DASHBOARD_TTL * 1000,
            );
            this.logger.debug(`Cached dashboard ${startDate} - ${endDate}`);
        } catch (error) {
            this.logger.error('Error setting cached dashboard:', error);
        }
    }

    /**
     * Get cached overview report
     */
    async getCachedOverview(
        startDate: string,
        endDate: string,
    ): Promise<OverviewReport | null> {
        try {
            const key = this.getOverviewKey(startDate, endDate);
            return (await this.cacheManager.get<OverviewReport>(key)) || null;
        } catch (error) {
            this.logger.error('Error getting cached overview:', error);
            return null;
        }
    }

    /**
     * Set cached overview report
     */
    async setCachedOverview(
        startDate: string,
        endDate: string,
        data: OverviewReport,
    ): Promise<void> {
        try {
            const key = this.getOverviewKey(startDate, endDate);
            await this.cacheManager.set(key, data, this.OVERVIEW_TTL * 1000);
        } catch (error) {
            this.logger.error('Error setting cached overview:', error);
        }
    }

    /**
     * Get cached revenue report
     */
    async getCachedRevenue(
        startDate: string,
        endDate: string,
        groupBy: string,
    ): Promise<RevenueReport | null> {
        try {
            const key = this.getRevenueKey(startDate, endDate, groupBy);
            return (await this.cacheManager.get<RevenueReport>(key)) || null;
        } catch (error) {
            this.logger.error('Error getting cached revenue:', error);
            return null;
        }
    }

    /**
     * Set cached revenue report
     */
    async setCachedRevenue(
        startDate: string,
        endDate: string,
        groupBy: string,
        data: RevenueReport,
    ): Promise<void> {
        try {
            const key = this.getRevenueKey(startDate, endDate, groupBy);
            await this.cacheManager.set(key, data, this.REVENUE_TTL * 1000);
        } catch (error) {
            this.logger.error('Error setting cached revenue:', error);
        }
    }

    /**
     * Get cached top items report
     */
    async getCachedTopItems(
        startDate: string,
        endDate: string,
        limit: number,
    ): Promise<TopItemsReport | null> {
        try {
            const key = this.getTopItemsKey(startDate, endDate, limit);
            return (await this.cacheManager.get<TopItemsReport>(key)) || null;
        } catch (error) {
            this.logger.error('Error getting cached top items:', error);
            return null;
        }
    }

    /**
     * Set cached top items report
     */
    async setCachedTopItems(
        startDate: string,
        endDate: string,
        limit: number,
        data: TopItemsReport,
    ): Promise<void> {
        try {
            const key = this.getTopItemsKey(startDate, endDate, limit);
            await this.cacheManager.set(key, data, this.TOP_ITEMS_TTL * 1000);
        } catch (error) {
            this.logger.error('Error setting cached top items:', error);
        }
    }

    /**
     * Get cached payment methods report
     */
    async getCachedPaymentMethods(
        startDate: string,
        endDate: string,
    ): Promise<PaymentMethodsReport | null> {
        try {
            const key = this.getPaymentMethodsKey(startDate, endDate);
            return (
                (await this.cacheManager.get<PaymentMethodsReport>(key)) || null
            );
        } catch (error) {
            this.logger.error('Error getting cached payment methods:', error);
            return null;
        }
    }

    /**
     * Set cached payment methods report
     */
    async setCachedPaymentMethods(
        startDate: string,
        endDate: string,
        data: PaymentMethodsReport,
    ): Promise<void> {
        try {
            const key = this.getPaymentMethodsKey(startDate, endDate);
            await this.cacheManager.set(
                key,
                data,
                this.PAYMENT_METHODS_TTL * 1000,
            );
        } catch (error) {
            this.logger.error('Error setting cached payment methods:', error);
        }
    }

    /**
     * Get cached orders report
     */
    async getCachedOrders(
        startDate: string,
        endDate: string,
        groupBy: string,
    ): Promise<OrdersReport | null> {
        try {
            const key = this.getOrdersKey(startDate, endDate, groupBy);
            return (await this.cacheManager.get<OrdersReport>(key)) || null;
        } catch (error) {
            this.logger.error('Error getting cached orders:', error);
            return null;
        }
    }

    /**
     * Set cached orders report
     */
    async setCachedOrders(
        startDate: string,
        endDate: string,
        groupBy: string,
        data: OrdersReport,
    ): Promise<void> {
        try {
            const key = this.getOrdersKey(startDate, endDate, groupBy);
            await this.cacheManager.set(key, data, this.ORDERS_TTL * 1000);
        } catch (error) {
            this.logger.error('Error setting cached orders:', error);
        }
    }

    /**
     * Invalidate all report caches
     * Called when new bills are paid or data changes
     */
    invalidateAllReportCaches(): void {
        try {
            // Note: cache-manager doesn't support pattern deletion out of the box
            // We rely on TTL expiration for most cases
            // For critical updates, we would need to track keys or use Redis directly
            this.logger.log('Report caches will expire naturally via TTL');

            // In a production environment with Redis, you could use:
            // await this.redisClient.keys('reports:*').then(keys => ...)
        } catch (error) {
            this.logger.error('Error invalidating report caches:', error);
        }
    }

    /**
     * Invalidate specific dashboard cache
     */
    async invalidateDashboardCache(
        startDate: string,
        endDate: string,
    ): Promise<void> {
        try {
            const key = this.getDashboardKey(startDate, endDate);
            await this.cacheManager.del(key);
            this.logger.debug(
                `Invalidated dashboard cache ${startDate} - ${endDate}`,
            );
        } catch (error) {
            this.logger.error('Error invalidating dashboard cache:', error);
        }
    }
}
