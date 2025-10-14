import { Request, Response, NextFunction } from 'express';
import { kitchenService } from '@/services';
import { ApiResponse } from '@/utils/response';

export class KitchenController {
    /**
     * Get all kitchen orders
     */
    async getAll(req: Request, res: Response, next: NextFunction) {
        try {
            const { status, priority } = req.query;

            const kitchenOrders = await kitchenService.getAllKitchenOrders({
                status: status as any,
                priority: priority ? parseInt(priority as string) : undefined,
            });

            res.json(ApiResponse.success(kitchenOrders, 'Kitchen orders retrieved successfully'));
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get kitchen order by ID
     */
    async getById(req: Request, res: Response, next: NextFunction) {
        try {
            const kitchenOrderId = parseInt(req.params['id'] || '0');

            const kitchenOrder = await kitchenService.getKitchenOrderById(kitchenOrderId);

            res.json(ApiResponse.success(kitchenOrder, 'Kitchen order retrieved successfully'));
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

            res.status(201).json(ApiResponse.success(kitchenOrder, 'Kitchen order created successfully'));
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

            res.json(ApiResponse.success(kitchenOrder, 'Kitchen order updated successfully'));
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

            res.json(ApiResponse.success(kitchenOrder, 'Kitchen order started successfully'));
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

            res.json(ApiResponse.success(kitchenOrder, 'Kitchen order completed successfully'));
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

            res.json(ApiResponse.success(kitchenOrder, 'Kitchen order priority updated successfully'));
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

            res.json(ApiResponse.success(kitchenOrder, 'Chef assigned successfully'));
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get pending kitchen orders
     */
    async getPending(_req: Request, res: Response, next: NextFunction) {
        try {
            const kitchenOrders = await kitchenService.getPendingOrders();

            res.json(ApiResponse.success(kitchenOrders, 'Pending kitchen orders retrieved successfully'));
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get kitchen orders by chef
     */
    async getByChef(req: Request, res: Response, next: NextFunction) {
        try {
            const staffId = parseInt(req.params['staffId'] || '0');

            const kitchenOrders = await kitchenService.getOrdersByChef(staffId);

            res.json(ApiResponse.success(kitchenOrders, 'Chef kitchen orders retrieved successfully'));
        } catch (error) {
            next(error);
        }
    }
}

export const kitchenController = new KitchenController();
