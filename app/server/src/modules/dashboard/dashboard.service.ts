import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@/database/prisma.service';
import {
    DashboardStatusDto,
    RecentActivityResponseDto,
    RecentActivityQueryDto,
    ActivityItemDto,
} from './dto';
import {
    TableStatus,
    KitchenOrderStatus,
    OrderStatus,
    ReservationStatus,
    PaymentStatus,
} from '@/lib/prisma';

@Injectable()
export class DashboardService {
    private readonly logger = new Logger(DashboardService.name);

    constructor(private readonly prisma: PrismaService) {}

    /**
     * Get current operational status: table summary and kitchen queue
     */
    async getStatus(): Promise<DashboardStatusDto> {
        const [tableSummary, kitchenQueue] = await Promise.all([
            this.getTableSummary(),
            this.getKitchenQueue(),
        ]);

        return {
            tables: tableSummary,
            kitchen: kitchenQueue,
        };
    }

    /**
     * Get table status summary
     */
    private async getTableSummary() {
        const tables = await this.prisma.restaurantTable.groupBy({
            by: ['status'],
            where: {
                isActive: true,
            },
            _count: true,
        });

        const statusCounts = {
            total: 0,
            available: 0,
            occupied: 0,
            reserved: 0,
            maintenance: 0,
        };

        tables.forEach((group) => {
            const count = group._count;
            statusCounts.total += count;

            switch (group.status) {
                case TableStatus.available:
                    statusCounts.available = count;
                    break;
                case TableStatus.occupied:
                    statusCounts.occupied = count;
                    break;
                case TableStatus.reserved:
                    statusCounts.reserved = count;
                    break;
                case TableStatus.maintenance:
                    statusCounts.maintenance = count;
                    break;
            }
        });

        return statusCounts;
    }

    /**
     * Get kitchen queue summary
     */
    private async getKitchenQueue() {
        const kitchenOrders = await this.prisma.kitchenOrder.groupBy({
            by: ['status'],
            where: {
                status: {
                    in: [
                        KitchenOrderStatus.pending,
                        KitchenOrderStatus.preparing,
                        KitchenOrderStatus.ready,
                    ],
                },
            },
            _count: true,
        });

        const queue = {
            pending: 0,
            preparing: 0,
            ready: 0,
        };

        kitchenOrders.forEach((group) => {
            switch (group.status) {
                case KitchenOrderStatus.pending:
                    queue.pending = group._count;
                    break;
                case KitchenOrderStatus.preparing:
                    queue.preparing = group._count;
                    break;
                case KitchenOrderStatus.ready:
                    queue.ready = group._count;
                    break;
            }
        });

        return queue;
    }

    /**
     * Get recent activity from orders, reservations, and payments
     */
    async getRecentActivity(
        query: RecentActivityQueryDto,
    ): Promise<RecentActivityResponseDto> {
        const limit = query.limit || 10;

        // Fetch recent activities from different sources in parallel
        const [recentOrders, recentReservations, recentPayments] =
            await Promise.all([
                this.getRecentOrders(limit),
                this.getRecentReservations(limit),
                this.getRecentPayments(limit),
            ]);

        // Combine and sort by timestamp
        const allActivities: ActivityItemDto[] = [
            ...recentOrders,
            ...recentReservations,
            ...recentPayments,
        ];

        // Sort by timestamp descending and take the limit
        allActivities.sort(
            (a, b) =>
                new Date(b.timestamp).getTime() -
                new Date(a.timestamp).getTime(),
        );

        return {
            activities: allActivities.slice(0, limit),
        };
    }

    /**
     * Get recent orders as activities
     */
    private async getRecentOrders(limit: number): Promise<ActivityItemDto[]> {
        const orders = await this.prisma.order.findMany({
            take: limit,
            orderBy: {
                createdAt: 'desc',
            },
            include: {
                table: {
                    select: {
                        tableName: true,
                    },
                },
            },
        });

        return orders.map((order) => {
            let action: string;
            let description: string;

            switch (order.status) {
                case OrderStatus.pending:
                    action = 'created';
                    description = `New order created for ${order.table.tableName}`;
                    break;
                case OrderStatus.confirmed:
                    action = 'confirmed';
                    description = `Order confirmed for ${order.table.tableName}`;
                    break;
                case OrderStatus.completed:
                    action = 'completed';
                    description = `Order completed for ${order.table.tableName}`;
                    break;
                case OrderStatus.cancelled:
                    action = 'cancelled';
                    description = `Order cancelled for ${order.table.tableName}`;
                    break;
                default:
                    action = 'updated';
                    description = `Order updated for ${order.table.tableName}`;
            }

            return {
                id: `order-${order.orderId}`,
                type: 'order' as const,
                action,
                description,
                timestamp: order.updatedAt.toISOString(),
                metadata: {
                    entityId: order.orderId,
                    amount: Number(order.finalAmount),
                    status: order.status,
                    tableName: order.table.tableName ?? undefined,
                },
            };
        });
    }

    /**
     * Get recent reservations as activities
     */
    private async getRecentReservations(
        limit: number,
    ): Promise<ActivityItemDto[]> {
        const reservations = await this.prisma.reservation.findMany({
            take: limit,
            orderBy: {
                createdAt: 'desc',
            },
            include: {
                table: {
                    select: {
                        tableName: true,
                    },
                },
            },
        });

        return reservations.map((reservation) => {
            let action: string;
            let description: string;

            switch (reservation.status) {
                case ReservationStatus.pending:
                    action = 'created';
                    description = `New reservation for ${reservation.customerName} (${reservation.partySize} guests)`;
                    break;
                case ReservationStatus.confirmed:
                    action = 'confirmed';
                    description = `Reservation confirmed for ${reservation.customerName}`;
                    break;
                case ReservationStatus.seated:
                    action = 'seated';
                    description = `${reservation.customerName} seated at ${reservation.table.tableName}`;
                    break;
                case ReservationStatus.completed:
                    action = 'completed';
                    description = `Reservation completed for ${reservation.customerName}`;
                    break;
                case ReservationStatus.cancelled:
                    action = 'cancelled';
                    description = `Reservation cancelled for ${reservation.customerName}`;
                    break;
                case ReservationStatus.no_show:
                    action = 'no_show';
                    description = `${reservation.customerName} did not show up`;
                    break;
                default:
                    action = 'updated';
                    description = `Reservation updated for ${reservation.customerName}`;
            }

            return {
                id: `reservation-${reservation.reservationId}`,
                type: 'reservation' as const,
                action,
                description,
                timestamp: reservation.updatedAt.toISOString(),
                metadata: {
                    entityId: reservation.reservationId,
                    status: reservation.status,
                    tableName: reservation.table.tableName ?? undefined,
                },
            };
        });
    }

    /**
     * Get recent payments as activities
     */
    private async getRecentPayments(limit: number): Promise<ActivityItemDto[]> {
        const bills = await this.prisma.bill.findMany({
            take: limit,
            where: {
                paymentStatus: PaymentStatus.paid,
            },
            orderBy: {
                paidAt: 'desc',
            },
            include: {
                table: {
                    select: {
                        tableName: true,
                    },
                },
            },
        });

        return bills.map((bill) => ({
            id: `payment-${bill.billId}`,
            type: 'payment' as const,
            action: 'completed',
            description: `Payment received for ${bill.table.tableName}`,
            timestamp: (bill.paidAt || bill.updatedAt).toISOString(),
            metadata: {
                entityId: bill.billId,
                amount: Number(bill.totalAmount),
                status: bill.paymentStatus,
                tableName: bill.table.tableName ?? undefined,
            },
        }));
    }
}
