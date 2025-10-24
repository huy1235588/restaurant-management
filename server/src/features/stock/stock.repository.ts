import { prisma } from '@/config/database';
import { Prisma } from '@prisma/client';

export interface StockTransactionFilters {
    ingredientId?: number;
    transactionType?: 'in' | 'out' | 'adjustment' | 'waste';
    fromDate?: string;
    toDate?: string;
}

class StockRepository {
    /**
     * Find all stock transactions with filters and pagination
     */
    async findAllTransactions(
        filters: StockTransactionFilters = {},
        page: number = 1,
        limit: number = 20
    ) {
        const where: Prisma.StockTransactionWhereInput = {};

        if (filters.ingredientId) {
            where.ingredientId = filters.ingredientId;
        }

        if (filters.transactionType) {
            where.transactionType = filters.transactionType;
        }

        if (filters.fromDate || filters.toDate) {
            where.transactionDate = {};
            if (filters.fromDate) {
                where.transactionDate.gte = new Date(filters.fromDate);
            }
            if (filters.toDate) {
                where.transactionDate.lte = new Date(filters.toDate);
            }
        }

        const [transactions, total] = await Promise.all([
            prisma.stockTransaction.findMany({
                where,
                include: {
                    ingredient: true,
                    staff: {
                        select: {
                            staffId: true,
                            fullName: true,
                        },
                    },
                },
                skip: (page - 1) * limit,
                take: limit,
                orderBy: { transactionDate: 'desc' },
            }),
            prisma.stockTransaction.count({ where }),
        ]);

        return {
            data: transactions,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    /**
     * Create stock transaction
     */
    async createTransaction(data: Prisma.StockTransactionCreateInput) {
        return prisma.stockTransaction.create({
            data,
            include: {
                ingredient: true,
                staff: {
                    select: {
                        staffId: true,
                        fullName: true,
                    },
                },
            },
        });
    }

    /**
     * Get all ingredient batches
     */
    async findAllBatches(ingredientId?: number) {
        const where: Prisma.IngredientBatchWhereInput = {};

        if (ingredientId) {
            where.ingredientId = ingredientId;
        }

        // Only get batches with remaining quantity
        where.remainingQuantity = { gt: 0 };

        return prisma.ingredientBatch.findMany({
            where,
            include: {
                ingredient: true,
                purchaseOrder: true,
            },
            orderBy: { receivedDate: 'asc' }, // FIFO
        });
    }

    /**
     * Get expiring batches
     */
    async findExpiringBatches(days: number = 7) {
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + days);

        return prisma.ingredientBatch.findMany({
            where: {
                remainingQuantity: { gt: 0 },
                expiryDate: {
                    lte: futureDate,
                    gte: new Date(),
                },
            },
            include: {
                ingredient: true,
            },
            orderBy: { expiryDate: 'asc' },
        });
    }

    /**
     * Get expired batches
     */
    async findExpiredBatches() {
        return prisma.ingredientBatch.findMany({
            where: {
                remainingQuantity: { gt: 0 },
                expiryDate: {
                    lt: new Date(),
                },
            },
            include: {
                ingredient: true,
            },
            orderBy: { expiryDate: 'asc' },
        });
    }

    /**
     * Update batch remaining quantity
     */
    async updateBatchQuantity(batchId: number, quantity: number) {
        return prisma.ingredientBatch.update({
            where: { batchId },
            data: {
                remainingQuantity: quantity,
            },
        });
    }

    /**
     * Get all stock alerts
     */
    async findAllAlerts(
        alertType?: 'low_stock' | 'expiring_soon' | 'expired',
        isResolved?: boolean,
        page: number = 1,
        limit: number = 20
    ) {
        const where: Prisma.StockAlertWhereInput = {};

        if (alertType) {
            where.alertType = alertType;
        }

        if (isResolved !== undefined) {
            where.isResolved = isResolved;
        }

        const [alerts, total] = await Promise.all([
            prisma.stockAlert.findMany({
                where,
                include: {
                    ingredient: true,
                    resolver: {
                        select: {
                            staffId: true,
                            fullName: true,
                        },
                    },
                },
                skip: (page - 1) * limit,
                take: limit,
                orderBy: { createdAt: 'desc' },
            }),
            prisma.stockAlert.count({ where }),
        ]);

        return {
            data: alerts,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    /**
     * Create stock alert
     */
    async createAlert(data: Prisma.StockAlertCreateInput) {
        return prisma.stockAlert.create({
            data,
            include: {
                ingredient: true,
            },
        });
    }

    /**
     * Resolve stock alert
     */
    async resolveAlert(alertId: number, staffId: number) {
        return prisma.stockAlert.update({
            where: { alertId },
            data: {
                isResolved: true,
                resolvedAt: new Date(),
                resolvedBy: staffId,
            },
            include: {
                ingredient: true,
                resolver: {
                    select: {
                        staffId: true,
                        fullName: true,
                    },
                },
            },
        });
    }
}

export default new StockRepository();
