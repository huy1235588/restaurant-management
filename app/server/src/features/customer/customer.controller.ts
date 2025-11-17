import { Request, Response, NextFunction } from 'express';
import { customerService } from '@/features/customer/customer.service';
import { ApiResponse } from '@/shared/utils/response';

const parseNumberFromQuery = (value: unknown, fallback: number) => {
    if (typeof value === 'string') {
        const parsed = Number(value);
        return Number.isNaN(parsed) ? fallback : parsed;
    }
    return fallback;
};

export class CustomerController {
    async list(req: Request, res: Response, next: NextFunction) {
        try {
            const { page, limit, search, isVip, phoneNumber, email } = req.query;
            const pageNumber = parseNumberFromQuery(page, 1);
            const limitNumber = parseNumberFromQuery(limit, 10);
            const result = await customerService.listCustomers({
                filters: {
                    search: typeof search === 'string' ? search : undefined,
                    phoneNumber: typeof phoneNumber === 'string' ? phoneNumber : undefined,
                    email: typeof email === 'string' ? email : undefined,
                    isVip: typeof isVip === 'string' ? isVip === 'true' : undefined,
                },
                skip: (pageNumber - 1) * limitNumber,
                take: limitNumber,
                sortBy: 'createdAt',
                sortOrder: 'desc',
            });

            res.json(ApiResponse.success(result, 'Customers retrieved successfully'));
        } catch (error) {
            next(error);
        }
    }

    async getById(req: Request, res: Response, next: NextFunction) {
        try {
            const customerId = Number(req.params['id']);
            const customer = await customerService.getCustomerById(customerId);
            res.json(ApiResponse.success(customer, 'Customer retrieved successfully'));
        } catch (error) {
            next(error);
        }
    }

    async create(req: Request, res: Response, next: NextFunction) {
        try {
            const payload = {
                ...req.body,
                birthday: req.body.birthday ? new Date(req.body.birthday) : undefined,
            };
            const customer = await customerService.createCustomer(payload);
            res.status(201).json(ApiResponse.success(customer, 'Customer created successfully'));
        } catch (error) {
            next(error);
        }
    }

    async update(req: Request, res: Response, next: NextFunction) {
        try {
            const customerId = Number(req.params['id']);
            const payload = {
                ...req.body,
                birthday: req.body.birthday ? new Date(req.body.birthday) : undefined,
            };
            const customer = await customerService.updateCustomer(customerId, payload);
            res.json(ApiResponse.success(customer, 'Customer updated successfully'));
        } catch (error) {
            next(error);
        }
    }

    async history(req: Request, res: Response, next: NextFunction) {
        try {
            const customerId = Number(req.params['id']);
            const historyLimit = parseNumberFromQuery(req.query['limit'], 50);
            const history = await customerService.getReservationHistory(customerId, historyLimit);
            res.json(ApiResponse.success(history, 'Reservation history retrieved successfully'));
        } catch (error) {
            next(error);
        }
    }

    async autocomplete(req: Request, res: Response, next: NextFunction) {
        try {
            const { term, limit } = req.query;
            const results = await customerService.searchCustomers(
                term as string,
                parseNumberFromQuery(limit, 10)
            );
            res.json(ApiResponse.success(results, 'Customer search results'));
        } catch (error) {
            next(error);
        }
    }

    async merge(req: Request, res: Response, next: NextFunction) {
        try {
            const primaryCustomerId = Number(req.params['id']);
            const { duplicateCustomerId } = req.body;
            const customer = await customerService.mergeCustomers(primaryCustomerId, duplicateCustomerId);
            res.json(ApiResponse.success(customer, 'Customers merged successfully'));
        } catch (error) {
            next(error);
        }
    }
}

export const customerController = new CustomerController();
