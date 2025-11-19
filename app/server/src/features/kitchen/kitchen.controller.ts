import { Response, NextFunction } from 'express';
import { kitchenService } from '@/features/kitchen/kitchen.service';
import ResponseHandler from '@/shared/utils/response';
import { AuthRequest } from '@/shared/middlewares/auth';
type Request = AuthRequest;

export class KitchenController {
    /**
     * GET /api/kitchen/orders
     * Get all kitchen orders with filters
     */
    async getAll(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const { status, stationId, page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

            const kitchenOrders = await kitchenService.getAllKitchenOrders({
                filters: {
                    status: status as any,
                    stationId: stationId ? parseInt(stationId as string) : undefined,
                },
                skip: (parseInt(page as string) - 1) * parseInt(limit as string),
                take: parseInt(limit as string),
                sortBy: sortBy as string,
                sortOrder: (sortOrder as string).toLowerCase() as 'asc' | 'desc',
            });

            ResponseHandler.success(res, 'Kitchen orders retrieved successfully', kitchenOrders);
        } catch (error) {
            next(error);
        }
    }

    /**
     * GET /api/kitchen/orders/:id
     * Get kitchen order details
     */
    async getById(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const kitchenOrderId = parseInt(req.params['id'] || '0');
            const kitchenOrder = await kitchenService.getKitchenOrderById(kitchenOrderId);
            ResponseHandler.success(res, 'Kitchen order retrieved successfully', kitchenOrder);
        } catch (error) {
            next(error);
        }
    }

    /**
     * Create new kitchen order
     */
    async create(req: Request, res: Response, next: NextFunction) {
        try {
            const kitchenOrder = await kitchenService.createKitchenOrder(req.body);

            ResponseHandler.created(res, 'Kitchen order created successfully', kitchenOrder);
        } catch (error) {
            next(error);
        }
    }

    /**
     * Update kitchen order
     */
    async update(req: Request, res: Response, next: NextFunction) {
        try {
            const kitchenOrderId = parseInt(req.params['id'] || '0');

            const kitchenOrder = await kitchenService.updateKitchenOrder(kitchenOrderId, req.body);

            ResponseHandler.success(res, 'Kitchen order updated successfully', kitchenOrder);
        } catch (error) {
            next(error);
        }
    }

    /**
     * Start preparing kitchen order
     */
    async startPreparing(req: Request, res: Response, next: NextFunction) {
        try {
            const kitchenOrderId = parseInt(req.params['id'] || '0');
            const staffId = req.body.staffId || (req as any).user?.staffId;

            const kitchenOrder = await kitchenService.startPreparingOrder(kitchenOrderId, staffId);

            ResponseHandler.success(res, 'Kitchen order preparation started successfully', kitchenOrder);
        } catch (error) {
            next(error);
        }
    }

    /**
     * Complete kitchen order
     */
    async complete(req: Request, res: Response, next: NextFunction) {
        try {
            const kitchenOrderId = parseInt(req.params['id'] || '0');

            const kitchenOrder = await kitchenService.completeKitchenOrder(kitchenOrderId);

            ResponseHandler.success(res, 'Kitchen order completed successfully', kitchenOrder);
        } catch (error) {
            next(error);
        }
    }

    /**
     * Update kitchen order priority
     */
    async updatePriority(req: Request, res: Response, next: NextFunction) {
        try {
            const kitchenOrderId = parseInt(req.params['id'] || '0');
            const { priority } = req.body;

            const kitchenOrder = await kitchenService.updateOrderPriority(kitchenOrderId, priority);

            ResponseHandler.success(res, 'Kitchen order priority updated successfully', kitchenOrder);
        } catch (error) {
            next(error);
        }
    }

    /**
     * Assign chef to kitchen order
     */
    async assignChef(req: Request, res: Response, next: NextFunction) {
        try {
            const kitchenOrderId = parseInt(req.params['id'] || '0');
            const { staffId } = req.body;

            const kitchenOrder = await kitchenService.assignChef(kitchenOrderId, staffId);

            ResponseHandler.success(res, 'Chef assigned successfully', kitchenOrder);
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get pending kitchen orders
     */
    async getPending(_req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const kitchenOrders = await kitchenService.getPendingOrders();

            ResponseHandler.success(res, 'Pending kitchen orders retrieved successfully', kitchenOrders);
        } catch (error) {
            next(error);
        }
    }

    /**
     * GET /api/kitchen/orders/chef/:staffId
     * Get kitchen orders by chef
     */
    async getByChef(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const staffId = parseInt(req.params['staffId'] || '0');
            const kitchenOrders = await kitchenService.getOrdersByChef(staffId);
            ResponseHandler.success(res, 'Chef kitchen orders retrieved successfully', kitchenOrders);
        } catch (error) {
            next(error);
        }
    }

    /**
     * POST /api/kitchen/orders/:id/cancel
     * Handle order cancellation (accept/reject)
     */
    async handleCancellation(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const kitchenOrderId = parseInt(req.params['id'] || '0');
            const { accepted, reason } = req.body;
            const result = await kitchenService.handleCancellation(kitchenOrderId, accepted, reason);
            ResponseHandler.success(res, `Cancellation ${accepted ? 'accepted' : 'rejected'}`, result);
        } catch (error) {
            next(error);
        }
    }

    /**
     * GET /api/kitchen/stats
     * Get kitchen statistics
     */
    async getStats(_req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const result = await kitchenService.getKitchenStats();
            ResponseHandler.success(res, 'Kitchen stats retrieved successfully', result);
        } catch (error) {
            next(error);
        }
    }

    /**
     * GET /api/kitchen/stations
     * Get all kitchen stations
     */
    async getStations(_req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const result = await kitchenService.getKitchenStations();
            ResponseHandler.success(res, 'Kitchen stations retrieved successfully', result);
        } catch (error) {
            next(error);
        }
    }

    /**
     * PATCH /api/kitchen/orders/:id/assign
     * Assign to station
     */
    async assignStation(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const kitchenOrderId = parseInt(req.params['id'] || '0');
            const { stationId } = req.body;
            const result = await kitchenService.assignStation(kitchenOrderId, stationId);
            ResponseHandler.success(res, 'Station assigned successfully', result);
        } catch (error) {
            next(error);
        }
    }

    /**
     * PATCH /api/kitchen/orders/:id/status
     * Update kitchen order status
     */
    async updateStatus(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const kitchenOrderId = parseInt(req.params['id'] || '0');
            const { status } = req.body;
            const chefId = req.user?.staffId;
            const result = await kitchenService.updateStatus(kitchenOrderId, status, chefId);
            ResponseHandler.success(res, 'Kitchen order status updated', result);
        } catch (error) {
            next(error);
        }
    }
}

export const kitchenController = new KitchenController();
export default kitchenController;
