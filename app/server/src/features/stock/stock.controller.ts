import { Request, Response, NextFunction } from 'express';
import stockService from './stock.service';
import { ResponseHandler } from '@/shared/utils/response';

export class StockController {
    // ============================================
    // STOCK TRANSACTION ENDPOINTS
    // ============================================

    /**
     * GET /api/stock/transactions
     * Get all stock transactions with filters
     */
    async getAllTransactions(req: Request, res: Response, next: NextFunction) {
        try {
            const { ingredientId, transactionType, fromDate, toDate, page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

            const result = await stockService.getAllTransactions({
                filters: {
                    ingredientId: ingredientId ? parseInt(ingredientId as string) : undefined,
                    transactionType: transactionType as 'in' | 'out' | 'adjustment' | 'waste' | undefined,
                    fromDate: fromDate as string,
                    toDate: toDate as string,
                },
                skip: (parseInt(page as string) - 1) * parseInt(limit as string),
                take: parseInt(limit as string),
                sortBy: sortBy as string,
                sortOrder: (sortOrder as string).toLowerCase() as 'asc' | 'desc',
            });
            return ResponseHandler.success(res, 'Stock transactions retrieved successfully', result);
        } catch (error) {
            return next(error);
        }
    }

    /**
     * POST /api/stock/transactions
     * Create manual stock transaction
     */
    async createTransaction(req: Request, res: Response, next: NextFunction) {
        try {
            const staffId = (req as any).user?.staffId || 1;
            const transaction = await stockService.createTransaction(req.body, staffId);
            return ResponseHandler.created(res, 'Stock transaction created successfully', transaction);
        } catch (error) {
            return next(error);
        }
    }

    /**
     * POST /api/stock/adjust
     * Adjust stock (inventory count)
     */
    async adjustStock(req: Request, res: Response, next: NextFunction) {
        try {
            const staffId = (req as any).user?.staffId || 1;
            const transaction = await stockService.adjustStock(req.body, staffId);
            return ResponseHandler.success(res, 'Stock adjusted successfully', transaction);
        } catch (error) {
            return next(error);
        }
    }

    /**
     * POST /api/stock/deduct
     * Deduct stock for order
     */
    async deductStock(req: Request, res: Response, next: NextFunction) {
        try {
            const staffId = (req as any).user?.staffId || 1;
            const { ingredientId, quantity, orderId } = req.body;
            const transaction = await stockService.deductStockForOrder(
                ingredientId,
                quantity,
                orderId,
                staffId
            );
            return ResponseHandler.success(res, 'Stock deducted successfully', transaction);
        } catch (error) {
            return next(error);
        }
    }

    // ============================================
    // BATCH ENDPOINTS
    // ============================================

    /**
     * GET /api/stock/batches
     * Get all ingredient batches
     */
    async getAllBatches(req: Request, res: Response, next: NextFunction) {
        try {
            const ingredientId = req.query['ingredientId']
                ? parseInt(req.query['ingredientId'] as string)
                : undefined;
            const batches = await stockService.getAllBatches(ingredientId);
            return ResponseHandler.success(res, 'Batches retrieved successfully', batches);
        } catch (error) {
            return next(error);
        }
    }

    /**
     * GET /api/stock/batches/expiring
     * Get expiring batches
     */
    async getExpiringBatches(req: Request, res: Response, next: NextFunction) {
        try {
            const days = req.query['days'] ? parseInt(req.query['days'] as string) : 7;
            const batches = await stockService.getExpiringBatches(days);
            return ResponseHandler.success(res, 'Expiring batches retrieved successfully', batches);
        } catch (error) {
            return next(error);
        }
    }

    /**
     * GET /api/stock/batches/expired
     * Get expired batches
     */
    async getExpiredBatches(_req: Request, res: Response, next: NextFunction) {
        try {
            const batches = await stockService.getExpiredBatches();
            return ResponseHandler.success(res, 'Expired batches retrieved successfully', batches);
        } catch (error) {
            return next(error);
        }
    }

    // ============================================
    // ALERT ENDPOINTS
    // ============================================

    /**
     * GET /api/stock/alerts
     * Get all stock alerts
     */
    async getAllAlerts(req: Request, res: Response, next: NextFunction) {
        try {
            const result = await stockService.getAllAlerts(req.query as any);
            return ResponseHandler.success(res, 'Stock alerts retrieved successfully', result);
        } catch (error) {
            return next(error);
        }
    }

    /**
     * POST /api/stock/alerts/:id/resolve
     * Resolve stock alert
     */
    async resolveAlert(req: Request, res: Response, next: NextFunction) {
        try {
            const alertId = parseInt(req.params['id'] || '0');
            const staffId = (req as any).user?.staffId || 1;
            const alert = await stockService.resolveAlert(alertId, req.body, staffId);
            return ResponseHandler.success(res, 'Alert resolved successfully', alert);
        } catch (error) {
            return next(error);
        }
    }

    /**
     * POST /api/stock/alerts/check
     * Check and create alerts
     */
    async checkAlerts(_req: Request, res: Response, next: NextFunction) {
        try {
            const result = await stockService.checkAndCreateAlerts();
            return ResponseHandler.success(res, 'Alerts checked successfully', result);
        } catch (error) {
            return next(error);
        }
    }
}

export default new StockController();
