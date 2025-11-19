import { Response, NextFunction } from 'express';
import orderService from '@/features/order/order.service';
import ResponseHandler from '@/shared/utils/response';
import { AuthRequest } from '@/shared/middlewares/auth';
import { ForbiddenError } from '@/shared/utils/errors';

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
            const { tableId, status, startDate, endDate, page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
            const result = await orderService.getAllOrders({
                tableId: tableId ? parseInt(tableId as string, 10) : undefined,
                status: status as any,
                startDate: startDate as string,
                endDate: endDate as string,
                page: page ? parseInt(page as string, 10) : 1,
                limit: limit ? parseInt(limit as string, 10) : 20,
                sortBy: sortBy as string,
                sortOrder: (sortOrder as string).toLowerCase() as 'asc' | 'desc',
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
            const order = await orderService.getOrderById(orderId);

            // Waiter can only edit their own orders (unless admin/manager)
            const userRole = req.user?.role;
            const isWaiter = userRole === 'waiter';
            const isOwnOrder = order.staffId === req.user?.staffId;

            if (isWaiter && !isOwnOrder) {
                throw new ForbiddenError('Waiters can only edit their own orders');
            }

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
     * POST /api/orders/:id/cancel
     */
    async cancelOrder(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const orderId = parseInt(req.params['id'] || '0', 10);
            const { reason } = req.body;
            const result = await orderService.cancelOrder(orderId, reason || 'No reason provided');
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

    /**
     * PATCH /api/orders/:orderId/items/:itemId/status
     */
    async updateOrderItemStatus(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const orderId = parseInt(req.params['orderId'] || '0', 10);
            const itemId = parseInt(req.params['itemId'] || '0', 10);
            const { status } = req.body;
            const result = await orderService.updateOrderItemStatus(orderId, itemId, status);
            ResponseHandler.success(res, 'Order item status updated successfully', result);
        } catch (error) {
            next(error);
        }
    }

    /**
     * GET /api/orders/reports/by-table
     */
    async getReportByTable(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const { startDate, endDate } = req.query;
            const result = await orderService.getReportByTable({
                startDate: startDate as string,
                endDate: endDate as string,
            });
            ResponseHandler.success(res, 'Report retrieved successfully', result);
        } catch (error) {
            next(error);
        }
    }

    /**
     * GET /api/orders/reports/popular-items
     */
    async getReportPopularItems(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const { startDate, endDate, limit } = req.query;
            const result = await orderService.getReportPopularItems({
                startDate: startDate as string,
                endDate: endDate as string,
                limit: limit ? parseInt(limit as string, 10) : 10,
            });
            ResponseHandler.success(res, 'Report retrieved successfully', result);
        } catch (error) {
            next(error);
        }
    }

    /**
     * GET /api/orders/reports/by-waiter
     */
    async getReportByWaiter(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const { startDate, endDate, staffId } = req.query;
            const result = await orderService.getReportByWaiter({
                startDate: startDate as string,
                endDate: endDate as string,
                staffId: staffId ? parseInt(staffId as string, 10) : undefined,
            });
            ResponseHandler.success(res, 'Report retrieved successfully', result);
        } catch (error) {
            next(error);
        }
    }

    /**
     * GET /api/orders/reports/customer-history/:phone
     */
    async getReportCustomerHistory(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const customerPhone = req.params['phone'] || '';
            const result = await orderService.getReportCustomerHistory(customerPhone);
            ResponseHandler.success(res, 'Report retrieved successfully', result);
        } catch (error) {
            next(error);
        }
    }
}

export default new OrderController();
