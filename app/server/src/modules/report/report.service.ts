import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@/database/prisma.service';
import { OrderStatus } from '@prisma/generated/client';

export interface RevenueData {
    date: string;
    revenue: number;
    orderCount: number;
}

export interface BestSellerItem {
    itemId: number;
    itemName: string;
    itemCode: string;
    categoryName: string;
    quantitySold: number;
    revenue: number;
}

@Injectable()
export class ReportService {
    private readonly logger = new Logger(ReportService.name);

    constructor(private readonly prisma: PrismaService) {}

    /**
     * Get daily revenue report
     */
    async getDailyRevenue(
        startDate: Date,
        endDate: Date,
    ): Promise<RevenueData[]> {
        const orders = await this.prisma.order.findMany({
            where: {
                orderTime: {
                    gte: startDate,
                    lte: endDate,
                },
                status: OrderStatus.completed,
            },
            select: {
                orderTime: true,
                finalAmount: true,
            },
        });

        // Group by date
        const revenueByDate = new Map<
            string,
            { revenue: number; count: number }
        >();

        orders.forEach((order) => {
            const dateKey = order.orderTime.toISOString().split('T')[0];
            const current = revenueByDate.get(dateKey) || {
                revenue: 0,
                count: 0,
            };

            current.revenue += Number(order.finalAmount);
            current.count += 1;

            revenueByDate.set(dateKey, current);
        });

        // Convert to array
        const result: RevenueData[] = [];
        revenueByDate.forEach((value, date) => {
            result.push({
                date,
                revenue: value.revenue,
                orderCount: value.count,
            });
        });

        return result.sort((a, b) => a.date.localeCompare(b.date));
    }

    /**
     * Get monthly revenue summary
     */
    async getMonthlyRevenue(year: number, month: number) {
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0, 23, 59, 59);

        const orders = await this.prisma.order.findMany({
            where: {
                orderTime: {
                    gte: startDate,
                    lte: endDate,
                },
                status: OrderStatus.completed,
            },
            select: {
                finalAmount: true,
                orderTime: true,
            },
        });

        const totalRevenue = orders.reduce(
            (sum, order) => sum + Number(order.finalAmount),
            0,
        );
        const orderCount = orders.length;
        const averageOrderValue =
            orderCount > 0 ? totalRevenue / orderCount : 0;

        // Find peak day
        const dailyRevenue = await this.getDailyRevenue(startDate, endDate);
        const peakDay = dailyRevenue.reduce(
            (max, day) => (day.revenue > max.revenue ? day : max),
            dailyRevenue[0] || { date: '', revenue: 0, orderCount: 0 },
        );

        return {
            year,
            month,
            totalRevenue,
            orderCount,
            averageOrderValue,
            peakDay: peakDay.date,
            peakDayRevenue: peakDay.revenue,
            dailyRevenue,
        };
    }

    /**
     * Get best-selling items
     */
    async getBestSellers(
        startDate: Date,
        endDate: Date,
        limit: number = 20,
    ): Promise<BestSellerItem[]> {
        const orderItems = await this.prisma.orderItem.findMany({
            where: {
                order: {
                    orderTime: {
                        gte: startDate,
                        lte: endDate,
                    },
                    status: OrderStatus.completed,
                },
                status: {
                    not: 'cancelled',
                },
            },
            include: {
                menuItem: {
                    include: {
                        category: {
                            select: {
                                categoryName: true,
                            },
                        },
                    },
                },
            },
        });

        // Group by item
        const itemStats = new Map<number, BestSellerItem>();

        orderItems.forEach((orderItem) => {
            const itemId = orderItem.itemId;
            const current = itemStats.get(itemId) || {
                itemId,
                itemName: orderItem.menuItem.itemName,
                itemCode: orderItem.menuItem.itemCode,
                categoryName: orderItem.menuItem.category.categoryName,
                quantitySold: 0,
                revenue: 0,
            };

            current.quantitySold += orderItem.quantity;
            current.revenue += Number(orderItem.totalPrice);

            itemStats.set(itemId, current);
        });

        // Convert to array and sort
        const result = Array.from(itemStats.values())
            .sort((a, b) => b.quantitySold - a.quantitySold)
            .slice(0, limit);

        return result;
    }

    /**
     * Export data to CSV format
     */
    async exportToCSV<T extends Record<string, any>>(
        data: T[],
        columns: { key: keyof T; header: string }[],
    ): Promise<string> {
        if (data.length === 0) {
            return '';
        }

        // CSV header
        const header = columns.map((col) => col.header).join(',');

        // CSV rows
        const rows = data.map((row) => {
            return columns
                .map((col) => {
                    const value = row[col.key];
                    // Escape commas and quotes
                    if (typeof value === 'string' && value.includes(',')) {
                        return `"${value.replace(/"/g, '""')}"`;
                    }
                    return value;
                })
                .join(',');
        });

        return [header, ...rows].join('\n');
    }
}
