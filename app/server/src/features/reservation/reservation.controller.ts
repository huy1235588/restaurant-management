import { Request, Response, NextFunction } from 'express';
import { reservationService } from '@/features/reservation/reservation.service';
import { ApiResponse } from '@/shared/utils/response';
import { AuthRequest } from '@/shared/middlewares/auth';

export class ReservationController {
    /**
     * Get all reservations
     */
    async getAll(req: Request, res: Response, next: NextFunction) {
        try {
            const {
                status,
                statuses,
                date,
                startDate,
                endDate,
                tableId,
                customerId,
                floor,
                search,
                page = 1,
                limit = 10,
                sortBy = 'reservationDate',
                sortOrder = 'asc',
            } = req.query;

            const filters = {
                status: status as any,
                statuses: typeof statuses === 'string' ? (statuses.split(',') as any) : undefined,
                date: date ? new Date(date as string) : undefined,
                startDate: startDate ? new Date(startDate as string) : undefined,
                endDate: endDate ? new Date(endDate as string) : undefined,
                tableId: tableId ? parseInt(tableId as string, 10) : undefined,
                customerId: customerId ? parseInt(customerId as string, 10) : undefined,
                floor: floor ? parseInt(floor as string, 10) : undefined,
                search: search as string,
            };

            const reservations = await reservationService.getAllReservations({
                filters: {
                    ...filters,
                },
                skip: (parseInt(page as string) - 1) * parseInt(limit as string),
                take: parseInt(limit as string),
                sortBy: sortBy as string,
                sortOrder: (sortOrder as string).toLowerCase() as 'asc' | 'desc',
            });

            res.json(ApiResponse.success(reservations, 'Reservations retrieved successfully'));
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get reservation by ID
     */
    async getById(req: Request, res: Response, next: NextFunction) {
        try {
            const reservationId = parseInt(req.params['id'] || '0');

            const reservation = await reservationService.getReservationById(reservationId);

            res.json(ApiResponse.success(reservation, 'Reservation retrieved successfully'));
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get reservation by code
     */
    async getByCode(req: Request, res: Response, next: NextFunction) {
        try {
            const code = req.params['code'] || '';

            const reservation = await reservationService.getReservationByCode(code);

            res.json(ApiResponse.success(reservation, 'Reservation retrieved successfully'));
        } catch (error) {
            next(error);
        }
    }

    /**
     * Create new reservation
     */
    async create(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const reservation = await reservationService.createReservation(
                {
                    ...req.body,
                    reservationDate: new Date(req.body.reservationDate),
                },
                req.user?.staffId
            );

            res.status(201).json(ApiResponse.success(reservation, 'Reservation created successfully'));
        } catch (error) {
            next(error);
        }
    }

    /**
     * Update reservation
     */
    async update(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const reservationId = parseInt(req.params['id'] || '0');

            const reservation = await reservationService.updateReservation(
                reservationId,
                {
                    ...req.body,
                    reservationDate: req.body.reservationDate ? new Date(req.body.reservationDate) : undefined,
                },
                req.user?.staffId
            );

            res.json(ApiResponse.success(reservation, 'Reservation updated successfully'));
        } catch (error) {
            next(error);
        }
    }

    /**
     * Cancel reservation
     */
    async cancel(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const reservationId = parseInt(req.params['id'] || '0');
            const { reason } = req.body;

            const reservation = await reservationService.cancelReservation(reservationId, reason, req.user?.staffId);

            res.json(ApiResponse.success(reservation, 'Reservation cancelled successfully'));
        } catch (error) {
            next(error);
        }
    }

    /**
     * Confirm reservation
     */
    async confirm(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const reservationId = parseInt(req.params['id'] || '0');

            const reservation = await reservationService.confirmReservation(reservationId, req.user?.staffId);

            res.json(ApiResponse.success(reservation, 'Reservation confirmed successfully'));
        } catch (error) {
            next(error);
        }
    }

    /**
     * Mark reservation as seated
     */
    async markSeated(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const reservationId = parseInt(req.params['id'] || '0');

            const reservation = await reservationService.markReservationSeated(reservationId, req.user?.staffId);

            res.json(ApiResponse.success(reservation, 'Reservation marked as seated successfully'));
        } catch (error) {
            next(error);
        }
    }

    async updateStatus(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const reservationId = parseInt(req.params['id'] || '0');
            const { status } = req.body;
            const reservation = await reservationService.changeStatus(reservationId, status, req.user?.staffId);
            res.json(ApiResponse.success(reservation, 'Reservation status updated successfully'));
        } catch (error) {
            next(error);
        }
    }

    /**
     * Check table availability for reservation
     */
    async checkAvailability(req: Request, res: Response, next: NextFunction) {
        try {
            const { tableId, date, time, duration } = req.query;

            const availability = await reservationService.checkAvailability({
                tableId: parseInt(tableId as string, 10),
                reservationDate: new Date(date as string),
                reservationTime: time as string,
                duration: parseInt(duration as string, 10),
            });

            res.json(ApiResponse.success(availability, 'Availability checked successfully'));
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get reservations by phone number
     */
    async getByPhone(req: Request, res: Response, next: NextFunction) {
        try {
            const phone = req.params['phone'] || '';

            const reservations = await reservationService.getReservationsByPhone(phone);

            res.json(ApiResponse.success(reservations, 'Reservations retrieved successfully'));
        } catch (error) {
            next(error);
        }
    }
}

export const reservationController = new ReservationController();
