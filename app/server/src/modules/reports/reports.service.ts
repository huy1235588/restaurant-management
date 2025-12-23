import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@/database/prisma.service';
import { DateTimeService } from '@/shared/utils';
import {
    ReportQueryDto,
    RevenueQueryDto,
    TopItemsQueryDto,
    OrdersQueryDto,
    GroupBy,
    DashboardQueryDto,
} from './dto';
import {
    OverviewReport,
    RevenueReport,
    RevenueDataPoint,
    TopItemsReport,
    PaymentMethodsReport,
    OrdersReport,
    DateRange,
} from './types';
import { DashboardReport } from './reports-cache.service';
import {
    PaymentStatus,
    OrderStatus,
    ReservationStatus,
    PaymentMethod,
} from '@/lib/prisma';
import {
    subDays,
    format,
    startOfWeek,
    startOfMonth,
    eachDayOfInterval,
    eachWeekOfInterval,
    eachMonthOfInterval,
} from 'date-fns';

@Injectable()
export class ReportsService {
    private readonly logger = new Logger(ReportsService.name);

    constructor(
        private readonly prisma: PrismaService,
        private readonly dateTimeService: DateTimeService,
    ) {}

    /**
     * Get date range from query params or use default (today)
     * Uses DateTimeService for timezone-aware date handling
     */
    private getDateRange(query: ReportQueryDto): DateRange {
        const now = new Date();
        const startDate = query.startDate
            ? this.dateTimeService.startOfDay(new Date(query.startDate))
            : this.dateTimeService.startOfDay(now);
        const endDate = query.endDate
            ? this.dateTimeService.endOfDay(new Date(query.endDate))
            : this.dateTimeService.endOfDay(now);

        return { startDate, endDate };
    }

    /**
     * Get previous period for comparison
     */
    private getPreviousPeriod(dateRange: DateRange): DateRange {
        const diff =
            dateRange.endDate.getTime() - dateRange.startDate.getTime();
        const days = Math.ceil(diff / (1000 * 60 * 60 * 24));

        return {
            startDate: subDays(dateRange.startDate, days),
            endDate: subDays(dateRange.endDate, days),
        };
    }

    /**
     * Calculate percentage change between two values
     */
    private calculateChange(current: number, previous: number): number {
        if (previous === 0) {
            return current > 0 ? 100 : 0;
        }
        return Math.round(((current - previous) / previous) * 100);
    }

    /**
     * Get overview report with KPIs
     */
    async getOverview(query: ReportQueryDto): Promise<OverviewReport> {
        const dateRange = this.getDateRange(query);
        const previousPeriod = this.getPreviousPeriod(dateRange);

        // Current period metrics
        const [currentRevenue, currentOrders, currentReservations] =
            await Promise.all([
                this.getTotalRevenue(dateRange),
                this.getTotalOrders(dateRange),
                this.getTotalReservations(dateRange),
            ]);

        // Previous period metrics for comparison
        const [previousRevenue, previousOrders, previousReservations] =
            await Promise.all([
                this.getTotalRevenue(previousPeriod),
                this.getTotalOrders(previousPeriod),
                this.getTotalReservations(previousPeriod),
            ]);

        const currentAvgOrderValue =
            currentOrders > 0 ? currentRevenue / currentOrders : 0;
        const previousAvgOrderValue =
            previousOrders > 0 ? previousRevenue / previousOrders : 0;

        return {
            revenue: currentRevenue,
            orders: currentOrders,
            reservations: currentReservations,
            avgOrderValue: Math.round(currentAvgOrderValue),
            comparison: {
                revenue: this.calculateChange(currentRevenue, previousRevenue),
                orders: this.calculateChange(currentOrders, previousOrders),
                reservations: this.calculateChange(
                    currentReservations,
                    previousReservations,
                ),
                avgOrderValue: this.calculateChange(
                    currentAvgOrderValue,
                    previousAvgOrderValue,
                ),
            },
        };
    }

    /**
     * Get total revenue for a date range
     */
    private async getTotalRevenue(dateRange: DateRange): Promise<number> {
        const result = await this.prisma.bill.aggregate({
            where: {
                paymentStatus: PaymentStatus.paid,
                paidAt: {
                    gte: dateRange.startDate,
                    lte: dateRange.endDate,
                },
            },
            _sum: {
                totalAmount: true,
            },
        });

        return Number(result._sum.totalAmount || 0);
    }

    /**
     * Get total orders for a date range
     */
    private async getTotalOrders(dateRange: DateRange): Promise<number> {
        return this.prisma.order.count({
            where: {
                status: {
                    in: [OrderStatus.confirmed, OrderStatus.completed],
                },
                createdAt: {
                    gte: dateRange.startDate,
                    lte: dateRange.endDate,
                },
            },
        });
    }

    /**
     * Get total reservations for a date range
     */
    private async getTotalReservations(dateRange: DateRange): Promise<number> {
        return this.prisma.reservation.count({
            where: {
                status: {
                    in: [
                        ReservationStatus.confirmed,
                        ReservationStatus.seated,
                        ReservationStatus.completed,
                    ],
                },
                reservationDate: {
                    gte: dateRange.startDate,
                    lte: dateRange.endDate,
                },
            },
        });
    }

    /**
     * Get revenue report with optimized SQL query using DATE_TRUNC
     * This is more efficient than fetching all bills and grouping in memory
     */
    async getRevenueReport(query: RevenueQueryDto): Promise<RevenueReport> {
        const dateRange = this.getDateRange(query);
        const previousPeriod = this.getPreviousPeriod(dateRange);
        const groupBy = query.groupBy || GroupBy.DAY;

        // Determine the truncation interval for SQL
        let truncInterval: string;
        let formatStr: string;

        switch (groupBy) {
            case GroupBy.WEEK:
                truncInterval = 'week';
                formatStr = 'yyyy-MM-dd';
                break;
            case GroupBy.MONTH:
                truncInterval = 'month';
                formatStr = 'yyyy-MM';
                break;
            default:
                truncInterval = 'day';
                formatStr = 'yyyy-MM-dd';
        }

        // Use raw SQL for better aggregation performance
        // Note: We use Prisma.sql to safely construct the query with dynamic interval
        const aggregatedData = await this.prisma.$queryRaw<
            Array<{ date: Date; revenue: bigint; orders: bigint }>
        >`
            SELECT 
                DATE_TRUNC(${truncInterval}, "paidAt") as date,
                COALESCE(SUM("totalAmount"), 0) as revenue,
                COUNT(*) as orders
            FROM bills
            WHERE "paymentStatus" = 'paid'
                AND ("paidAt") >= ${dateRange.startDate}
                AND ("paidAt") <= ${dateRange.endDate}
            GROUP BY date
            ORDER BY date
        `;

        // Generate all dates in range for complete series
        let dates: Date[];
        switch (groupBy) {
            case GroupBy.WEEK:
                dates = eachWeekOfInterval({
                    start: dateRange.startDate,
                    end: dateRange.endDate,
                });
                break;
            case GroupBy.MONTH:
                dates = eachMonthOfInterval({
                    start: dateRange.startDate,
                    end: dateRange.endDate,
                });
                break;
            default:
                dates = eachDayOfInterval({
                    start: dateRange.startDate,
                    end: dateRange.endDate,
                });
        }

        // Create a map from aggregated data
        const dataMap = new Map<string, { revenue: number; orders: number }>();
        aggregatedData.forEach((row) => {
            const key = format(row.date, formatStr);
            dataMap.set(key, {
                revenue: Number(row.revenue),
                orders: Number(row.orders),
            });
        });

        // Build complete data series with zeros for missing dates
        const data: RevenueDataPoint[] = dates.map((date) => {
            const key = format(date, formatStr);
            const values = dataMap.get(key) || { revenue: 0, orders: 0 };
            return {
                date: key,
                revenue: Math.round(values.revenue),
                orders: values.orders,
            };
        });

        const total = data.reduce((sum, point) => sum + point.revenue, 0);

        // Get previous period total for growth calculation
        const previousTotal = await this.getTotalRevenue(previousPeriod);
        const growth = this.calculateChange(total, previousTotal);

        return { data, total, growth };
    }

    /**
     * Group revenue data by time interval (DEPRECATED - Use SQL aggregation in getRevenueReport instead)
     * @deprecated This method is kept for backward compatibility but is no longer used
     */
    private groupRevenueData(
        bills: { paidAt: Date | null; totalAmount: unknown }[],
        dateRange: DateRange,
        groupBy: GroupBy,
    ): RevenueDataPoint[] {
        // Generate all dates in the range
        let dates: Date[];
        let formatStr: string;

        switch (groupBy) {
            case GroupBy.WEEK:
                dates = eachWeekOfInterval({
                    start: dateRange.startDate,
                    end: dateRange.endDate,
                });
                formatStr = 'yyyy-MM-dd';
                break;
            case GroupBy.MONTH:
                dates = eachMonthOfInterval({
                    start: dateRange.startDate,
                    end: dateRange.endDate,
                });
                formatStr = 'yyyy-MM';
                break;
            default: // DAY
                dates = eachDayOfInterval({
                    start: dateRange.startDate,
                    end: dateRange.endDate,
                });
                formatStr = 'yyyy-MM-dd';
        }

        // Initialize data points
        const dataMap = new Map<string, { revenue: number; orders: number }>();
        dates.forEach((date) => {
            dataMap.set(format(date, formatStr), { revenue: 0, orders: 0 });
        });

        // Aggregate bills into data points
        bills.forEach((bill) => {
            if (!bill.paidAt) return;

            // Convert to UTC to avoid timezone issues
            const paidAtUTC = new Date(bill.paidAt.toISOString());

            let key: string;
            switch (groupBy) {
                case GroupBy.WEEK:
                    key = format(startOfWeek(paidAtUTC), formatStr);
                    break;
                case GroupBy.MONTH:
                    key = format(startOfMonth(paidAtUTC), formatStr);
                    break;
                default:
                    key = format(paidAtUTC, formatStr);
            }

            const existing = dataMap.get(key);
            if (existing) {
                existing.revenue += Number(bill.totalAmount);
                existing.orders += 1;
            }
        });

        // Convert to array
        return Array.from(dataMap.entries()).map(([date, values]) => ({
            date,
            revenue: Math.round(values.revenue),
            orders: values.orders,
        }));
    }

    /**
     * Get top selling items report
     */
    async getTopItems(query: TopItemsQueryDto): Promise<TopItemsReport> {
        const dateRange = this.getDateRange(query);
        const limit = query.limit || 10;

        // Get bill items from paid bills in the date range
        const billItems = await this.prisma.billItem.groupBy({
            by: ['itemId'],
            where: {
                bill: {
                    paymentStatus: PaymentStatus.paid,
                    paidAt: {
                        gte: dateRange.startDate,
                        lte: dateRange.endDate,
                    },
                },
            },
            _sum: {
                quantity: true,
                total: true,
            },
            orderBy: {
                _sum: {
                    quantity: 'desc',
                },
            },
            take: limit,
        });

        // Get menu item details
        const itemIds = billItems.map((item) => item.itemId);
        const menuItems = await this.prisma.menuItem.findMany({
            where: {
                itemId: {
                    in: itemIds,
                },
            },
            include: {
                category: true,
            },
        });

        const menuItemMap = new Map(
            menuItems.map((item) => [item.itemId, item]),
        );

        const items = billItems.map((item) => {
            const menuItem = menuItemMap.get(item.itemId);
            return {
                itemId: item.itemId,
                itemCode: menuItem?.itemCode || '',
                name: menuItem?.itemName || 'Unknown',
                categoryName: menuItem?.category?.categoryName || 'Unknown',
                quantity: item._sum.quantity || 0,
                revenue: Math.round(Number(item._sum.total || 0)),
            };
        });

        const totalQuantity = items.reduce(
            (sum, item) => sum + item.quantity,
            0,
        );
        const totalRevenue = items.reduce((sum, item) => sum + item.revenue, 0);

        return { items, totalQuantity, totalRevenue };
    }

    /**
     * Get payment methods distribution report
     */
    async getPaymentMethodsReport(
        query: ReportQueryDto,
    ): Promise<PaymentMethodsReport> {
        const dateRange = this.getDateRange(query);

        // Get payment method distribution
        const payments = await this.prisma.bill.groupBy({
            by: ['paymentMethod'],
            where: {
                paymentStatus: PaymentStatus.paid,
                paidAt: {
                    gte: dateRange.startDate,
                    lte: dateRange.endDate,
                },
                paymentMethod: {
                    not: null,
                },
            },
            _count: true,
            _sum: {
                totalAmount: true,
            },
        });

        const totalAmount = payments.reduce(
            (sum, p) => sum + Number(p._sum.totalAmount || 0),
            0,
        );
        const totalCount = payments.reduce((sum, p) => sum + p._count, 0);

        const methods = payments.map((payment) => ({
            method: payment.paymentMethod as PaymentMethod,
            count: payment._count,
            amount: Math.round(Number(payment._sum.totalAmount || 0)),
            percentage:
                totalAmount > 0
                    ? Math.round(
                          (Number(payment._sum.totalAmount || 0) /
                              totalAmount) *
                              100,
                      )
                    : 0,
        }));

        return { methods, totalAmount: Math.round(totalAmount), totalCount };
    }

    /**
     * Get orders analysis report
     */
    async getOrdersReport(query: OrdersQueryDto): Promise<OrdersReport> {
        const dateRange = this.getDateRange(query);
        const groupBy = query.groupBy || GroupBy.HOUR;

        const orders = await this.prisma.order.findMany({
            where: {
                status: {
                    in: [OrderStatus.confirmed, OrderStatus.completed],
                },
                createdAt: {
                    gte: dateRange.startDate,
                    lte: dateRange.endDate,
                },
            },
            select: {
                orderId: true,
                status: true,
                finalAmount: true,
                createdAt: true,
                completedAt: true,
            },
        });

        let data: { label: string; count: number; amount: number }[];

        if (groupBy === GroupBy.STATUS) {
            // Group by status
            const statusGroups = new Map<
                string,
                { count: number; amount: number }
            >();

            orders.forEach((order) => {
                const existing = statusGroups.get(order.status) || {
                    count: 0,
                    amount: 0,
                };
                existing.count += 1;
                existing.amount += Number(order.finalAmount);
                statusGroups.set(order.status, existing);
            });

            data = Array.from(statusGroups.entries()).map(
                ([status, values]) => ({
                    label: status,
                    count: values.count,
                    amount: Math.round(values.amount),
                }),
            );
        } else {
            // Group by hour (default)
            const hourGroups = new Map<
                number,
                { count: number; amount: number }
            >();

            // Initialize all 24 hours
            for (let i = 0; i < 24; i++) {
                hourGroups.set(i, { count: 0, amount: 0 });
            }

            orders.forEach((order) => {
                const hour = order.createdAt.getHours();
                const existing = hourGroups.get(hour)!;
                existing.count += 1;
                existing.amount += Number(order.finalAmount);
            });

            data = Array.from(hourGroups.entries()).map(([hour, values]) => ({
                label: `${hour.toString().padStart(2, '0')}:00`,
                count: values.count,
                amount: Math.round(values.amount),
            }));
        }

        // Calculate summary
        const totalOrders = orders.length;
        const totalAmount = orders.reduce(
            (sum, order) => sum + Number(order.finalAmount),
            0,
        );
        const avgOrderValue =
            totalOrders > 0 ? Math.round(totalAmount / totalOrders) : 0;

        // Calculate average prep time for completed orders
        const completedOrders = orders.filter(
            (o) => o.status === OrderStatus.completed && o.completedAt,
        );
        let avgPrepTime: number | undefined;

        if (completedOrders.length > 0) {
            const totalPrepTime = completedOrders.reduce((sum, order) => {
                const prepTime =
                    (order.completedAt!.getTime() - order.createdAt.getTime()) /
                    (1000 * 60);
                return sum + prepTime;
            }, 0);
            avgPrepTime = Math.round(totalPrepTime / completedOrders.length);
        }

        return {
            data,
            summary: {
                totalOrders,
                totalAmount: Math.round(totalAmount),
                avgOrderValue,
                avgPrepTime,
            },
        };
    }

    /**
     * Get all dashboard reports in a single call
     * Fetches all reports in parallel for better performance
     */
    async getDashboard(query: DashboardQueryDto): Promise<DashboardReport> {
        const startTime = Date.now();

        // Fetch all reports in parallel
        const [overview, revenue, topItems, paymentMethods, orders] =
            await Promise.all([
                this.getOverview(query),
                this.getRevenueReport({ ...query, groupBy: GroupBy.DAY }),
                this.getTopItems({ ...query, limit: 10 }),
                this.getPaymentMethodsReport(query),
                this.getOrdersReport({ ...query, groupBy: GroupBy.HOUR }),
            ]);

        const duration = Date.now() - startTime;
        this.logger.debug(`Dashboard fetched in ${duration}ms`);

        return {
            overview,
            revenue,
            topItems,
            paymentMethods,
            orders,
        };
    }
}
