import { Response, NextFunction } from 'express';
import billService from '@/features/bill/bill.service';
import ResponseHandler from '@/shared/utils/response';
import { AuthRequest } from '@/shared/middlewares/auth';

export class BillController {
    /**
     * POST /api/bills
     */
    async createBill(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const staffId = req.user?.staffId;
            const result = await billService.createBill(req.body, staffId);
            ResponseHandler.created(res, 'Bill created successfully', result);
        } catch (error) {
            next(error);
        }
    }

    /**
     * GET /api/bills/:id
     */
    async getBill(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const billId = parseInt(req.params['id'] || '0', 10);
            const result = await billService.getBillById(billId);
            ResponseHandler.success(res, 'Bill retrieved successfully', result);
        } catch (error) {
            next(error);
        }
    }

    /**
     * POST /api/bills/:id/payment
     */
    async processPayment(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const billId = parseInt(req.params['id'] || '0', 10);
            const result = await billService.processPayment(billId, req.body);
            ResponseHandler.success(res, 'Payment processed successfully', result);
        } catch (error) {
            next(error);
        }
    }

    /**
     * GET /api/bills/revenue
     */
    async getRevenue(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const { startDate, endDate } = req.query;
            const result = await billService.getRevenue(startDate as string, endDate as string);
            ResponseHandler.success(res, 'Revenue retrieved successfully', result);
        } catch (error) {
            next(error);
        }
    }
}

export default new BillController();
