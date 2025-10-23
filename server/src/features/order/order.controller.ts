import { Response, NextFunction } from 'express';
import orderService from '@/features/order/order.service';
import ResponseHandler from '@/shared/utils/response';
import { AuthRequest } from '@/shared/middlewares/auth';

export class OrderController {
    /**
     * POST /api/orders
     */
    async createOrder(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const staffId = req.user?.staffId;
            const result = await orderService.createOrder(req.body, staffId);
            ResponseHandler.created(res, 'Order created successfully', result);
        } catch (error) {
            next(error);
        }
    }

    /**
     * GET /api/orders/:id
     */
    async getOrder(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const orderId = parseInt(req.params['id'] || '0', 10);
            const result = await orderService.getOrderById(orderId);
            ResponseHandler.success(res, 'Order retrieved successfully', result);
        } catch (error) {
            next(error);
        }
    }

    /**
     * GET /api/orders
     */
    async getAllOrders(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const { tableId, status, startDate, endDate, page, limit } = req.query;
            const result = await orderService.getAllOrders({
                tableId: tableId ? parseInt(tableId as string, 10) : undefined,
                status: status as any,
                startDate: startDate as string,
                endDate: endDate as string,
                page: page ? parseInt(page as string, 10) : undefined,
                limit: limit ? parseInt(limit as string, 10) : undefined,
            });
            ResponseHandler.success(res, 'Orders retrieved successfully', result);
        } catch (error) {
            next(error);
        }
    }

    /**
     * PATCH /api/orders/:id/status
     */
    async updateOrderStatus(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const orderId = parseInt(req.params['id'] || '0', 10);
            const { status } = req.body;
            const result = await orderService.updateOrderStatus(orderId, status);
            ResponseHandler.success(res, 'Order status updated successfully', result);
        } catch (error) {
            next(error);
        }
    }

    /**
     * PUT /api/orders/:id
     */
    async updateOrder(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const orderId = parseInt(req.params['id'] || '0', 10);
            const result = await orderService.updateOrder(orderId, req.body);
            ResponseHandler.success(res, 'Order updated successfully', result);
        } catch (error) {
            next(error);
        }
    }

    /**
     * POST /api/orders/:id/items
     */
    async addOrderItems(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const orderId = parseInt(req.params['id'] || '0', 10);
            const { items } = req.body;
            const result = await orderService.addOrderItems(orderId, items);
            ResponseHandler.success(res, 'Items added to order successfully', result);
        } catch (error) {
            next(error);
        }
    }

    /**
     * DELETE /api/orders/:id/cancel
     */
    async cancelOrder(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const orderId = parseInt(req.params['id'] || '0', 10);
            const result = await orderService.cancelOrder(orderId);
            ResponseHandler.success(res, 'Order cancelled successfully', result);
        } catch (error) {
            next(error);
        }
    }

    /**
     * DELETE /api/orders/:id
     */
    async deleteOrder(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const orderId = parseInt(req.params['id'] || '0', 10);
            await orderService.deleteOrder(orderId);
            ResponseHandler.noContent(res);
        } catch (error) {
            next(error);
        }
    }
}

export default new OrderController();
