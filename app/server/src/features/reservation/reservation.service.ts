import { ReservationStatus } from '@prisma/client';
import reservationRepository from '@/features/reservation/reservation.repository';
import tableRepository from '@/features/table/table.repository';
import { NotFoundError, BadRequestError } from '@/shared/utils/errors';
import { BaseFindOptions, BaseFilter } from '@/shared/base';

interface ReservationFilters extends BaseFilter {
    status?: ReservationStatus;
    date?: Date;
    tableId?: number;
}

interface CreateReservationData {
    customerName: string;
    phoneNumber: string;
    email?: string;
    tableId: number;
    reservationDate: Date;
    reservationTime: string;
    duration?: number;
    headCount: number;
    specialRequest?: string;
    depositAmount?: number;
    status?: ReservationStatus;
    notes?: string;
}

interface UpdateReservationData {
    customerName?: string;
    phoneNumber?: string;
    email?: string;
    tableId?: number;
    reservationDate?: Date;
    reservationTime?: string;
    duration?: number;
    headCount?: number;
    specialRequest?: string;
    depositAmount?: number;
    status?: ReservationStatus;
    notes?: string;
}

export class ReservationService {
    /**
     * Get all reservations
     */
    async getAllReservations(options?: BaseFindOptions<ReservationFilters>) {
        return reservationRepository.findAllPaginated(options);
    }

    /**
     * Get reservation by ID
     */
    async getReservationById(reservationId: number) {
        const reservation = await reservationRepository.findById(reservationId);

        if (!reservation) {
            throw new NotFoundError('Reservation not found');
        }

        return reservation;
    }

    /**
     * Get reservation by code
     */
    async getReservationByCode(code: string) {
        const reservation = await reservationRepository.findByCode(code);

        if (!reservation) {
            throw new NotFoundError('Reservation not found');
        }

        return reservation;
    }

    /**
     * Create new reservation
     */
    async createReservation(data: CreateReservationData) {
        // Check if table exists
        const table = await tableRepository.findById(data.tableId);

        if (!table) {
            throw new NotFoundError('Table not found');
        }

        // Check table capacity
        if (data.headCount > table.capacity) {
            throw new BadRequestError(`Table capacity is ${table.capacity}, but ${data.headCount} people requested`);
        }

        if (data.headCount < table.minCapacity) {
            throw new BadRequestError(`Table requires minimum ${table.minCapacity} people`);
        }

        // Check if table is available for the time slot
        const isAvailable = await this.checkTableAvailability(
            data.tableId,
            data.reservationDate,
            data.reservationTime,
            data.duration || 120
        );

        if (!isAvailable) {
            throw new BadRequestError('Table is not available for the selected time slot');
        }

        // Transform data to match Prisma input
        const createData: Omit<CreateReservationData, 'tableId'> & { table: { connect: { tableId: number } } } = {
            ...data,
            table: {
                connect: { tableId: data.tableId }
            }
        };
        delete (createData as any).tableId;

        return reservationRepository.create(createData as any);
    }

    /**
     * Update reservation
     */
    async updateReservation(reservationId: number, data: UpdateReservationData) {
        const reservation = await this.getReservationById(reservationId);

        // Check if table is being changed
        if (data.tableId && data.tableId !== reservation.tableId) {
            const table = await tableRepository.findById(data.tableId);

            if (!table) {
                throw new NotFoundError('Table not found');
            }

            const headCount = data.headCount || reservation.headCount;

            if (headCount > table.capacity || headCount < table.minCapacity) {
                throw new BadRequestError('Table capacity does not match the number of guests');
            }
        }

        return reservationRepository.update(reservationId, data);
    }

    /**
     * Cancel reservation
     */
    async cancelReservation(reservationId: number, reason?: string) {
        const reservation = await this.getReservationById(reservationId);

        if (reservation.status === 'cancelled') {
            throw new BadRequestError('Reservation is already cancelled');
        }

        if (reservation.status === 'completed') {
            throw new BadRequestError('Cannot cancel completed reservation');
        }

        return reservationRepository.update(reservationId, {
            status: 'cancelled',
            notes: reason ? `Cancelled: ${reason}` : 'Cancelled'
        });
    }

    /**
     * Confirm reservation
     */
    async confirmReservation(reservationId: number) {
        const reservation = await this.getReservationById(reservationId);

        if (reservation.status !== 'pending') {
            throw new BadRequestError('Only pending reservations can be confirmed');
        }

        return reservationRepository.update(reservationId, {
            status: 'confirmed'
        });
    }

    /**
     * Mark reservation as seated
     */
    async markReservationSeated(reservationId: number) {
        const reservation = await this.getReservationById(reservationId);

        if (reservation.status !== 'confirmed') {
            throw new BadRequestError('Only confirmed reservations can be marked as seated');
        }

        return reservationRepository.update(reservationId, {
            status: 'seated'
        });
    }

    /**
     * Check table availability for reservation
     */
    async checkTableAvailability(
        tableId: number,
        date: Date,
        time: string,
        duration: number
    ): Promise<boolean> {
        // Get all reservations for this table on this date
        const reservations = await reservationRepository.findAll({
            filters: {
                tableId,
                reservationDate: date,
            },
        });

        // Parse the requested time
        const timeParts = time.split(':').map(Number);
        const hours = timeParts[0] ?? 0;
        const minutes = timeParts[1] ?? 0;
        const requestedStart = new Date(date);
        requestedStart.setHours(hours, minutes, 0, 0);
        const requestedEnd = new Date(requestedStart.getTime() + duration * 60000);

        // Check for conflicts
        for (const reservation of reservations) {
            if (reservation.status === 'cancelled' || reservation.status === 'no_show') {
                continue;
            }

            const resTimeParts = reservation.reservationTime.toString().split(':').map(Number);
            const resHours = resTimeParts[0] ?? 0;
            const resMinutes = resTimeParts[1] ?? 0;
            const reservationStart = new Date(reservation.reservationDate);
            reservationStart.setHours(resHours, resMinutes, 0, 0);
            const reservationEnd = new Date(reservationStart.getTime() + reservation.duration * 60000);

            // Check for overlap
            if (
                (requestedStart >= reservationStart && requestedStart < reservationEnd) ||
                (requestedEnd > reservationStart && requestedEnd <= reservationEnd) ||
                (requestedStart <= reservationStart && requestedEnd >= reservationEnd)
            ) {
                return false;
            }
        }

        return true;
    }

    /**
     * Get reservations by phone number
     */
    async getReservationsByPhone(phoneNumber: string) {
        return reservationRepository.findByPhone(phoneNumber);
    }
}

export const reservationService = new ReservationService();
