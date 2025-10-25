import stockRepository from './stock.repository';
import ingredientRepository from '../ingredient/ingredient.repository';
import { prisma } from '@/config/database';
import { NotFoundError, BadRequestError } from '@/shared/utils/errors';
import { Prisma } from '@prisma/client';
import {
    CreateStockTransactionDto,
    StockAdjustmentDto,
    StockTransactionQueryDto,
    StockAlertQueryDto,
    ResolveStockAlertDto,
} from '@/features/stock/dtos/stock.dto';

export class StockService {
    // ============================================
    // STOCK TRANSACTION MANAGEMENT
    // ============================================

    /**
     * Get all stock transactions with filters
     */
    async getAllTransactions(query: StockTransactionQueryDto) {
        const { filters, skip = 0, take = 20, sortBy = 'createdAt', sortOrder = 'desc' } = query;
        return stockRepository.findAll({ 
            filters, 
            skip, 
            take, 
            sortBy,
            sortOrder
        });
    }

    /**
     * Create stock transaction (manual)
     */
    async createTransaction(data: CreateStockTransactionDto, staffId: number) {
        // Verify ingredient exists
        const ingredient = await ingredientRepository.findById(data.ingredientId);
        if (!ingredient) {
            throw new NotFoundError('Ingredient not found');
        }

        return stockRepository.createTransaction({
            ingredient: { connect: { ingredientId: data.ingredientId } },
            transactionType: data.transactionType,
            quantity: data.quantity,
            unit: data.unit,
            referenceType: data.referenceType,
            referenceId: data.referenceId,
            staff: { connect: { staffId } },
            notes: data.notes,
        });
    }

    /**
     * Stock adjustment (kiểm kê)
     */
    async adjustStock(data: StockAdjustmentDto, staffId: number) {
        const ingredient = await ingredientRepository.findById(data.ingredientId);
        if (!ingredient) {
            throw new NotFoundError('Ingredient not found');
        }

        const currentStock = Number(ingredient.currentStock);
        const newQuantity = data.newQuantity;
        const difference = newQuantity - currentStock;

        if (difference === 0) {
            throw new BadRequestError('No adjustment needed - quantities are equal');
        }

        return prisma.$transaction(async (tx) => {
            // Update ingredient stock
            await tx.ingredient.update({
                where: { ingredientId: data.ingredientId },
                data: {
                    currentStock: newQuantity,
                },
            });

            // Create transaction record
            const transaction = await tx.stockTransaction.create({
                data: {
                    ingredient: { connect: { ingredientId: data.ingredientId } },
                    transactionType: 'adjustment',
                    quantity: Math.abs(difference),
                    unit: ingredient.unit,
                    staff: { connect: { staffId } },
                    notes: data.notes
                        ? `${data.notes} (Adjustment: ${difference > 0 ? '+' : ''}${difference})`
                        : `Stock adjustment: ${difference > 0 ? '+' : ''}${difference}`,
                },
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

            // Check for low stock alerts
            if (newQuantity <= Number(ingredient.minimumStock)) {
                await this.createLowStockAlert(data.ingredientId, tx);
            } else {
                // Resolve low stock alerts if stock is now sufficient
                await tx.stockAlert.updateMany({
                    where: {
                        ingredientId: data.ingredientId,
                        alertType: 'low_stock',
                        isResolved: false,
                    },
                    data: {
                        isResolved: true,
                        resolvedAt: new Date(),
                        resolvedBy: staffId,
                    },
                });
            }

            return transaction;
        });
    }

    /**
     * Deduct stock for order (FIFO)
     */
    async deductStockForOrder(
        ingredientId: number,
        quantity: number,
        orderId: number,
        staffId: number
    ) {
        const ingredient = await ingredientRepository.findById(ingredientId);
        if (!ingredient) {
            throw new NotFoundError('Ingredient not found');
        }

        if (Number(ingredient.currentStock) < quantity) {
            throw new BadRequestError(
                `Insufficient stock for ${ingredient.ingredientName}. Available: ${ingredient.currentStock}, Required: ${quantity}`
            );
        }

        return prisma.$transaction(async (tx) => {
            // Get batches FIFO
            const batches = await tx.ingredientBatch.findMany({
                where: {
                    ingredientId,
                    remainingQuantity: { gt: 0 },
                },
                orderBy: { receivedDate: 'asc' },
            });

            let remainingToDeduct = quantity;

            for (const batch of batches) {
                if (remainingToDeduct <= 0) break;

                const batchRemaining = Number(batch.remainingQuantity);
                const deductFromBatch = Math.min(batchRemaining, remainingToDeduct);

                await tx.ingredientBatch.update({
                    where: { batchId: batch.batchId },
                    data: {
                        remainingQuantity: batchRemaining - deductFromBatch,
                    },
                });

                remainingToDeduct -= deductFromBatch;
            }

            // Update ingredient stock
            await tx.ingredient.update({
                where: { ingredientId },
                data: {
                    currentStock: { decrement: quantity },
                },
            });

            // Create transaction
            const transaction = await tx.stockTransaction.create({
                data: {
                    ingredient: { connect: { ingredientId } },
                    transactionType: 'out',
                    quantity,
                    unit: ingredient.unit,
                    referenceType: 'order',
                    referenceId: orderId,
                    staff: { connect: { staffId } },
                    notes: `Deducted for order #${orderId}`,
                },
                include: {
                    ingredient: true,
                },
            });

            // Check for low stock
            const updatedIngredient = await tx.ingredient.findUnique({
                where: { ingredientId },
            });

            if (
                updatedIngredient &&
                Number(updatedIngredient.currentStock) <= Number(updatedIngredient.minimumStock)
            ) {
                await this.createLowStockAlert(ingredientId, tx);
            }

            return transaction;
        });
    }

    // ============================================
    // BATCH MANAGEMENT
    // ============================================

    /**
     * Get all batches
     */
    async getAllBatches(ingredientId?: number) {
        return stockRepository.findAllBatches(ingredientId);
    }

    /**
     * Get expiring batches
     */
    async getExpiringBatches(days: number = 7) {
        const batches = await stockRepository.findExpiringBatches(days);

        // Create alerts for expiring batches
        for (const batch of batches) {
            await this.createExpiringAlert(batch.ingredientId, batch.batchId, batch.expiryDate);
        }

        return batches;
    }

    /**
     * Get expired batches
     */
    async getExpiredBatches() {
        const batches = await stockRepository.findExpiredBatches();

        // Create alerts for expired batches
        for (const batch of batches) {
            await this.createExpiredAlert(batch.ingredientId, batch.batchId);
        }

        return batches;
    }

    // ============================================
    // ALERT MANAGEMENT
    // ============================================

    /**
     * Get all stock alerts
     */
    async getAllAlerts(query: StockAlertQueryDto) {
        const { page = 1, limit = 20, alertType, isResolved } = query;
        return stockRepository.findAllAlerts(alertType, isResolved, page, limit);
    }

    /**
     * Resolve stock alert
     */
    async resolveAlert(alertId: number, _data: ResolveStockAlertDto, staffId: number) {
        return stockRepository.resolveAlert(alertId, staffId);
    }

    /**
     * Check and create alerts
     */
    async checkAndCreateAlerts() {
        // Check low stock
        const lowStockIngredients = await prisma.ingredient.findMany({
            where: {
                currentStock: {
                    lte: prisma.ingredient.fields.minimumStock,
                },
                isActive: true,
            },
        });

        for (const ingredient of lowStockIngredients) {
            await this.createLowStockAlert(ingredient.ingredientId);
        }

        // Check expiring batches
        await this.getExpiringBatches(7);

        // Check expired batches
        await this.getExpiredBatches();

        return {
            lowStock: lowStockIngredients.length,
            message: 'Stock alerts checked and created',
        };
    }

    // ============================================
    // PRIVATE HELPER METHODS
    // ============================================

    private async createLowStockAlert(ingredientId: number, tx?: Prisma.TransactionClient) {
        const prismaClient = tx || prisma;

        // Check if alert already exists
        const existingAlert = await prismaClient.stockAlert.findFirst({
            where: {
                ingredientId,
                alertType: 'low_stock',
                isResolved: false,
            },
        });

        if (existingAlert) return;

        const ingredient = await prismaClient.ingredient.findUnique({
            where: { ingredientId },
        });

        if (!ingredient) return;

        await prismaClient.stockAlert.create({
            data: {
                ingredient: { connect: { ingredientId } },
                alertType: 'low_stock',
                message: `Low stock for ${ingredient.ingredientName}. Current: ${ingredient.currentStock} ${ingredient.unit}, Minimum: ${ingredient.minimumStock} ${ingredient.unit}`,
            },
        });
    }

    private async createExpiringAlert(
        ingredientId: number,
        batchId: number,
        expiryDate: Date | null
    ) {
        if (!expiryDate) return;

        // Check if alert already exists
        const existingAlert = await prisma.stockAlert.findFirst({
            where: {
                ingredientId,
                alertType: 'expiring_soon',
                isResolved: false,
                message: { contains: `Batch #${batchId}` },
            },
        });

        if (existingAlert) return;

        const ingredient = await prisma.ingredient.findUnique({
            where: { ingredientId },
        });

        if (!ingredient) return;

        const daysUntilExpiry = Math.ceil(
            (expiryDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
        );

        await prisma.stockAlert.create({
            data: {
                ingredient: { connect: { ingredientId } },
                alertType: 'expiring_soon',
                message: `Batch #${batchId} of ${ingredient.ingredientName} expires in ${daysUntilExpiry} days (${expiryDate.toLocaleDateString()})`,
            },
        });
    }

    private async createExpiredAlert(ingredientId: number, batchId: number) {
        // Check if alert already exists
        const existingAlert = await prisma.stockAlert.findFirst({
            where: {
                ingredientId,
                alertType: 'expired',
                isResolved: false,
                message: { contains: `Batch #${batchId}` },
            },
        });

        if (existingAlert) return;

        const ingredient = await prisma.ingredient.findUnique({
            where: { ingredientId },
        });

        if (!ingredient) return;

        await prisma.stockAlert.create({
            data: {
                ingredient: { connect: { ingredientId } },
                alertType: 'expired',
                message: `Batch #${batchId} of ${ingredient.ingredientName} has expired!`,
            },
        });
    }
}

export default new StockService();
