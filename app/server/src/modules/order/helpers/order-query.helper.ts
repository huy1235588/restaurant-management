import { Prisma } from '@/lib/prisma';

/**
 * Common Prisma query includes for Order module
 * Prevents N+1 queries and standardizes data fetching
 */
export class OrderQueryHelper {
    /**
     * Standard includes for order queries with relations
     * Optimized to prevent N+1 queries
     */
    static readonly STANDARD_INCLUDES: Prisma.OrderInclude = {
        table: {
            select: {
                tableId: true,
                tableNumber: true,
                tableName: true,
                capacity: true,
                status: true,
            },
        },
        staff: {
            select: {
                staffId: true,
                fullName: true,
                role: true,
            },
        },
        orderItems: {
            include: {
                menuItem: {
                    select: {
                        itemId: true,
                        itemName: true,
                        itemCode: true,
                        price: true,
                        imageUrl: true,
                        categoryId: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'asc' as const,
            },
        },
        reservation: {
            select: {
                reservationId: true,
                reservationCode: true,
                customerName: true,
                phoneNumber: true,
                partySize: true,
            },
        },
        kitchenOrders: {
            select: {
                kitchenOrderId: true,
                status: true,
                startedAt: true,
                completedAt: true,
                prepTimeActual: true,
                staffId: true,
                chef: {
                    select: {
                        staffId: true,
                        fullName: true,
                        role: true,
                    },
                },
            },
            take: 1, // Usually only one kitchen order per main order
            orderBy: {
                createdAt: 'desc' as const,
            },
        },
    };

    /**
     * Minimal includes for list views (lighter payload)
     */
    static readonly LIST_INCLUDES: Prisma.OrderInclude = {
        table: {
            select: {
                tableId: true,
                tableNumber: true,
                tableName: true,
                status: true,
            },
        },
        staff: {
            select: {
                staffId: true,
                fullName: true,
            },
        },
        orderItems: {
            select: {
                orderItemId: true,
                quantity: true,
                status: true,
                menuItem: {
                    select: {
                        itemName: true,
                        price: true,
                    },
                },
            },
            where: {
                status: { not: 'cancelled' as const },
            },
        },
        _count: {
            select: {
                orderItems: true,
            },
        },
    };

    /**
     * Select fields for order number lookups (ultra minimal)
     */
    static readonly ORDER_NUMBER_SELECT: Prisma.OrderSelect = {
        orderId: true,
        orderNumber: true,
        status: true,
        tableId: true,
    };
}
