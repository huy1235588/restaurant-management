import { Prisma } from '@prisma/generated/client';

/**
 * Common Prisma query includes for Kitchen module
 * Prevents N+1 queries and standardizes data fetching
 */
export class KitchenQueryHelper {
    /**
     * Standard includes for kitchen order queries
     */
    static readonly STANDARD_INCLUDES: Prisma.KitchenOrderInclude = {
        order: {
            include: {
                table: {
                    select: {
                        tableId: true,
                        tableNumber: true,
                        tableName: true,
                        status: true,
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
                            },
                        },
                    },
                    where: {
                        status: { not: 'cancelled' as const },
                    },
                    orderBy: {
                        createdAt: 'asc' as const,
                    },
                },
            },
        },
        chef: {
            select: {
                staffId: true,
                fullName: true,
                role: true,
            },
        },
    };

    /**
     * Minimal includes for kitchen list view
     */
    static readonly LIST_INCLUDES: Prisma.KitchenOrderInclude = {
        order: {
            select: {
                orderId: true,
                orderNumber: true,
                table: {
                    select: {
                        tableNumber: true,
                        tableName: true,
                    },
                },
                orderItems: {
                    select: {
                        quantity: true,
                        menuItem: {
                            select: {
                                itemName: true,
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
            },
        },
        chef: {
            select: {
                staffId: true,
                fullName: true,
            },
        },
    };

    /**
     * Select for kitchen order status checks
     */
    static readonly STATUS_SELECT: Prisma.KitchenOrderSelect = {
        kitchenOrderId: true,
        orderId: true,
        status: true,
        staffId: true,
    };
}
