import { Request, Response, NextFunction } from 'express';
import { reservationService } from '@/features/reservation/reservation.service';
import { ApiResponse } from '@/shared/utils/response';

export class ReservationController {
    /**
     * Get all reservations
     */
    async getAll(req: Request, res: Response, next: NextFunction) {
        try {
            const { status, date, tableId } = req.query;

            const reservations = await reservationService.getAllReservations({
                status: status as any,
                date: date ? new Date(date as string) : undefined,
                tableId: tableId ? parseInt(tableId as string) : undefined,
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
    async create(req: Request, res: Response, next: NextFunction) {
        try {
            const reservation = await reservationService.createReservation(req.body);

            res.status(201).json(ApiResponse.success(reservation, 'Reservation created successfully'));
        } catch (error) {
            next(error);
        }
    }

    /**
     * Update reservation
     */
    async update(req: Request, res: Response, next: NextFunction) {
        try {
            const reservationId = parseInt(req.params['id'] || '0');

            const reservation = await reservationService.updateReservation(reservationId, req.body);

            res.json(ApiResponse.success(reservation, 'Reservation updated successfully'));
        } catch (error) {
            next(error);
        }
    }

    /**
     * Cancel reservation
     */
    async cancel(req: Request, res: Response, next: NextFunction) {
        try {
            const reservationId = parseInt(req.params['id'] || '0');
            const { reason } = req.body;

            const reservation = await reservationService.cancelReservation(reservationId, reason);

            res.json(ApiResponse.success(reservation, 'Reservation cancelled successfully'));
        } catch (error) {
            next(error);
        }
    }

    /**
     * Confirm reservation
     */
    async confirm(req: Request, res: Response, next: NextFunction) {
        try {
            const reservationId = parseInt(req.params['id'] || '0');

            const reservation = await reservationService.confirmReservation(reservationId);

            res.json(ApiResponse.success(reservation, 'Reservation confirmed successfully'));
        } catch (error) {
            next(error);
        }
    }

    /**
     * Mark reservation as seated
     */
    async markSeated(req: Request, res: Response, next: NextFunction) {
        try {
            const reservationId = parseInt(req.params['id'] || '0');

            const reservation = await reservationService.markReservationSeated(reservationId);

            res.json(ApiResponse.success(reservation, 'Reservation marked as seated successfully'));
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

            const isAvailable = await reservationService.checkTableAvailability(
                parseInt(tableId as string),
                new Date(date as string),
                time as string,
                parseInt(duration as string)
            );

            res.json(ApiResponse.success({ isAvailable }, 'Availability checked successfully'));
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
