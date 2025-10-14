import { Request, Response, NextFunction } from 'express';
import { paymentService } from '@/services';
import { ApiResponse } from '@/utils/response';

export class PaymentController {
    /**
     * Get all payments
     */
    async getAll(req: Request, res: Response, next: NextFunction) {
        try {
            const { billId, status, paymentMethod } = req.query;

            const payments = await paymentService.getAllPayments({
                billId: billId ? parseInt(billId as string) : undefined,
                status: status as any,
                paymentMethod: paymentMethod as any,
            });

            res.json(ApiResponse.success(payments, 'Payments retrieved successfully'));
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get payment by ID
     */
    async getById(req: Request, res: Response, next: NextFunction) {
        try {
            const paymentId = parseInt(req.params['id'] || '0');

            const payment = await paymentService.getPaymentById(paymentId);

            res.json(ApiResponse.success(payment, 'Payment retrieved successfully'));
        } catch (error) {
            next(error);
        }
    }

    /**
     * Create new payment
     */
    async create(req: Request, res: Response, next: NextFunction) {
        try {
            const payment = await paymentService.createPayment(req.body);

            res.status(201).json(ApiResponse.success(payment, 'Payment created successfully'));
        } catch (error) {
            next(error);
        }
    }

    /**
     * Process payment
     */
    async process(req: Request, res: Response, next: NextFunction) {
        try {
            const { billId, paymentMethod, amount, transactionId, cardNumber, cardHolderName } = req.body;

            const payment = await paymentService.processPayment({
                billId,
                paymentMethod,
                amount,
                transactionId,
                cardNumber,
                cardHolderName,
            });

            res.json(ApiResponse.success(payment, 'Payment processed successfully'));
        } catch (error) {
            next(error);
        }
    }

    /**
     * Refund payment
     */
    async refund(req: Request, res: Response, next: NextFunction) {
        try {
            const paymentId = parseInt(req.params['id'] || '0');
            const { reason } = req.body;

            const payment = await paymentService.refundPayment(paymentId, reason);

            res.json(ApiResponse.success(payment, 'Payment refunded successfully'));
        } catch (error) {
            next(error);
        }
    }

    /**
     * Cancel payment
     */
    async cancel(req: Request, res: Response, next: NextFunction) {
        try {
            const paymentId = parseInt(req.params['id'] || '0');
            const { reason } = req.body;

            const payment = await paymentService.cancelPayment(paymentId, reason);

            res.json(ApiResponse.success(payment, 'Payment cancelled successfully'));
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get payments by bill
     */
    async getByBill(req: Request, res: Response, next: NextFunction) {
        try {
            const billId = parseInt(req.params['billId'] || '0');

            const payments = await paymentService.getPaymentsByBill(billId);

            res.json(ApiResponse.success(payments, 'Payments retrieved successfully'));
        } catch (error) {
            next(error);
        }
    }

    /**
     * Verify payment transaction
     */
    async verifyTransaction(req: Request, res: Response, next: NextFunction) {
        try {
            const transactionId = req.params['transactionId'] || '';

            const payment = await paymentService.verifyTransaction(transactionId);

            res.json(ApiResponse.success(payment, 'Payment transaction verified successfully'));
        } catch (error) {
            next(error);
        }
    }
}

export const paymentController = new PaymentController();
