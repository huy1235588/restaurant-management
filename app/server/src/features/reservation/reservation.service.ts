import { ReservationStatus, Reservation, Prisma } from '@prisma/client';
import reservationRepository from '@/features/reservation/reservation.repository';
import tableRepository from '@/features/table/table.repository';
import { customerService, FindOrCreateCustomerInput } from '@/features/customer/customer.service';
import { reservationAvailabilityService } from '@/features/reservation/services/availability.service';
import { RESERVATION_DEFAULTS, ReservationDateUtils, ReservationRules } from '@/features/reservation/utils/reservation-settings';
import { ConflictError, NotFoundError, BadRequestError } from '@/shared/utils/errors';
import { BaseFindOptions, BaseFilter } from '@/shared/base';
import { emailService } from '@/shared/services/email.service';

interface ReservationFilters extends BaseFilter {
    status?: ReservationStatus;
    statuses?: ReservationStatus[];
    date?: Date;
    startDate?: Date;
    endDate?: Date;
    tableId?: number;
    customerId?: number;
    floor?: number;
    search?: string;
}

interface CreateReservationData {
    customerId?: number;
    customerName: string;
    phoneNumber: string;
    email?: string;
    reservationDate: Date | string;
    reservationTime: string;
    duration?: number;
    headCount: number;
    tableId?: number;
    floor?: number;
    preferredTableId?: number;
    specialRequest?: string;
    depositAmount?: number;
    status?: ReservationStatus;
    notes?: string;
    tags?: string[];
}

interface UpdateReservationData extends Partial<CreateReservationData> {
    status?: ReservationStatus;
    cancellationReason?: string;
}

export class ReservationService {
    /**
     * Get all reservations with pagination and filtering
     * @param options - Pagination and filter options
     * @returns Paginated list of reservations
     */
    async getAllReservations(options?: BaseFindOptions<ReservationFilters>) {
        return reservationRepository.findAllPaginated(options);
    }

    /**
     * Get a single reservation by ID
     * @param reservationId - Unique reservation ID
     * @throws NotFoundError if reservation doesn't exist
     */
    async getReservationById(reservationId: number) {
        const reservation = await reservationRepository.findById(reservationId);
        if (!reservation) {
            throw new NotFoundError('Reservation not found');
        }
        return reservation;
    }

    /**
     * Get a reservation by its unique code
     * @param code - Reservation code
     * @throws NotFoundError if reservation doesn't exist
     */
    async getReservationByCode(code: string) {
        const reservation = await reservationRepository.findByCode(code);
        if (!reservation) {
            throw new NotFoundError('Reservation not found');
        }
        return reservation;
    }

    /**
     * Create a new reservation with automatic customer and table resolution
     * @param data - Reservation creation data
     * @param actorStaffId - Optional staff ID who is creating the reservation
     * @returns Created reservation with related data
     * @throws BadRequestError for validation failures
     * @throws ConflictError if table is not available
     */
    async createReservation(data: CreateReservationData, actorStaffId?: number) {
        // Validate reservation data
        const normalizedDate = ReservationDateUtils.ensureDate(data.reservationDate);
        ReservationRules.validateDateWithinWindow(normalizedDate);
        ReservationRules.validateTimeSlot(data.reservationTime);
        ReservationRules.validatePartySize(data.headCount);

        const duration = data.duration ?? RESERVATION_DEFAULTS.durationMinutes;
        ReservationRules.validateDuration(duration);

        // Resolve or create customer
        const customer = await this.resolveCustomer({
            customerId: data.customerId,
            name: data.customerName,
            phoneNumber: data.phoneNumber,
            email: data.email,
        });

        // Auto-assign or validate table availability
        const table = await this.resolveTableAssignment({
            tableId: data.tableId,
            floor: data.floor,
            preferredTableId: data.preferredTableId,
            reservationDate: normalizedDate,
            reservationTime: data.reservationTime,
            duration,
            headCount: data.headCount,
        });

        const reservationTime = ReservationDateUtils.combineDateAndTime(normalizedDate, data.reservationTime);

        // Create reservation in database
        const reservation = await reservationRepository.create({
            customer: { connect: { customerId: customer.customerId } },
            table: { connect: { tableId: table.tableId } },
            customerName: customer.name,
            phoneNumber: customer.phoneNumber,
            email: customer.email ?? data.email,
            reservationDate: normalizedDate,
            reservationTime,
            duration,
            headCount: data.headCount,
            specialRequest: data.specialRequest,
            depositAmount: data.depositAmount,
            status: data.status ?? 'pending',
            notes: data.notes,
            tags: data.tags ?? [],
            creator: actorStaffId ? { connect: { staffId: actorStaffId } } : undefined,
        });

        // Log audit trail
        await this.logAudit(reservation.reservationId, 'created', actorStaffId, {
            status: reservation.status,
            tableId: reservation.tableId,
        });

        // Send confirmation email asynchronously (don't block)
        if (reservation.email) {
            emailService.sendReservationConfirmation(reservation).catch((error) => {
                console.error('Failed to send confirmation email:', error);
            });
        }

        return reservation;
    }

    /**
     * Update an existing reservation
     * @param reservationId - Reservation ID to update
     * @param data - Updated reservation data
     * @param actorStaffId - Optional staff ID performing the update
     * @returns Updated reservation
     * @throws NotFoundError if reservation doesn't exist
     * @throws BadRequestError for validation failures
     * @throws ConflictError if new table/time is not available
     */
    async updateReservation(reservationId: number, data: UpdateReservationData, actorStaffId?: number) {
        const reservation = await this.getReservationById(reservationId);

        // Calculate updated values
        const nextDate = data.reservationDate ? ReservationDateUtils.ensureDate(data.reservationDate) : reservation.reservationDate;
        const nextTime = data.reservationTime ?? reservation.reservationTime.toISOString().substring(11, 16);
        const nextDuration = data.duration ?? reservation.duration;
        const nextHeadCount = data.headCount ?? reservation.headCount;

        // Validate updated values
        ReservationRules.validatePartySize(nextHeadCount);
        ReservationRules.validateDuration(nextDuration);

        if (data.reservationDate || data.reservationTime) {
            ReservationRules.validateDateWithinWindow(nextDate);
            ReservationRules.validateTimeSlot(nextTime);
        }

        // Revalidate table availability if critical fields changed
        let tableId = data.tableId ?? reservation.tableId;
        if (data.tableId || data.headCount || data.reservationDate || data.reservationTime || data.duration) {
            const table = await this.resolveTableAssignment({
                tableId,
                reservationDate: nextDate,
                reservationTime: nextTime,
                duration: nextDuration,
                headCount: nextHeadCount,
                floor: data.floor,
                preferredTableId: data.preferredTableId,
                excludeReservationId: reservationId,
            });
            tableId = table.tableId;
        }

        // Build update payload
        const updatePayload: Record<string, unknown> = {
            customerName: data.customerName ?? reservation.customerName,
            phoneNumber: data.phoneNumber ?? reservation.phoneNumber,
            email: data.email ?? reservation.email,
            reservationDate: nextDate,
            reservationTime: ReservationDateUtils.combineDateAndTime(nextDate, nextTime),
            duration: nextDuration,
            headCount: nextHeadCount,
            specialRequest: data.specialRequest ?? reservation.specialRequest,
            depositAmount: data.depositAmount ?? reservation.depositAmount,
            notes: data.notes ?? reservation.notes,
            tags: data.tags ?? reservation.tags,
            table: { connect: { tableId } },
        };

        // Apply status transition if status changed
        if (data.status && data.status !== reservation.status) {
            Object.assign(updatePayload, this.applyStatusTransition(reservation, data.status));
        }

        const updated = await reservationRepository.update(reservationId, updatePayload);

        // Log the update
        await this.logAudit(reservationId, 'updated', actorStaffId, {
            changedFields: Object.keys(data),
        });

        return updated;
    }

    /**
     * Cancel a reservation
     * @param reservationId - Reservation ID to cancel
     * @param reason - Optional cancellation reason
     * @param actorStaffId - Optional staff ID performing the cancellation
     * @throws BadRequestError if reservation is already completed
     */
    async cancelReservation(reservationId: number, reason?: string, actorStaffId?: number) {
        const reservation = await this.getReservationById(reservationId);

        if (reservation.status === 'completed') {
            throw new BadRequestError('Cannot cancel completed reservation');
        }

        const cancelled = await reservationRepository.update(reservationId, {
            status: 'cancelled',
            cancelledAt: new Date(),
            cancellationReason: reason,
        });

        await this.logAudit(reservationId, 'cancelled', actorStaffId, { reason });
        return cancelled;
    }

    /**
     * Confirm a pending reservation
     */
    async confirmReservation(reservationId: number, actorStaffId?: number) {
        return this.changeStatus(reservationId, 'confirmed', actorStaffId);
    }

    /**
     * Mark reservation as seated (customer arrived)
     */
    async markReservationSeated(reservationId: number, actorStaffId?: number) {
        return this.changeStatus(reservationId, 'seated', actorStaffId);
    }

    /**
     * Change reservation status with proper transition logic
     * @param reservationId - Reservation ID
     * @param status - New status to apply
     * @param actorStaffId - Optional staff ID performing the change
     */
    async changeStatus(reservationId: number, status: ReservationStatus, actorStaffId?: number) {
        const reservation = await this.getReservationById(reservationId);
        const patch = this.applyStatusTransition(reservation, status);
        const updated = await reservationRepository.update(reservationId, patch);
        await this.logAudit(reservationId, 'status_changed', actorStaffId, { from: reservation.status, to: status });
        return updated;
    }

    /**
     * Check table availability for a specific time slot
     * @returns Availability status and conflicting reservations if any
     */
    async checkAvailability(params: {
        tableId: number;
        reservationDate: Date;
        reservationTime: string;
        duration: number;
        excludeReservationId?: number;
    }) {
        return reservationAvailabilityService.checkTableAvailability(params);
    }

    /**
     * Simple boolean check for table availability
     */
    async checkTableAvailability(
        tableId: number,
        reservationDate: Date,
        reservationTime: string,
        duration: number,
        excludeReservationId?: number
    ) {
        const result = await this.checkAvailability({
            tableId,
            reservationDate,
            reservationTime,
            duration,
            excludeReservationId,
        });
        return result.available;
    }

    /**
     * Get all reservations for a specific phone number
     * @param phoneNumber - Customer phone number
     */
    async getReservationsByPhone(phoneNumber: string) {
        return reservationRepository.findByPhone(phoneNumber);
    }

    private async resolveCustomer(data: FindOrCreateCustomerInput) {
        if (!data.name) {
            throw new BadRequestError('Customer name is required');
        }
        return customerService.findOrCreateCustomer(data);
    }

    private async resolveTableAssignment(params: {
        tableId?: number;
        reservationDate: Date;
        reservationTime: string;
        duration: number;
        headCount: number;
        floor?: number;
        preferredTableId?: number;
        excludeReservationId?: number;
    }) {
        if (params.tableId) {
            const table = await tableRepository.findById(params.tableId);
            if (!table) {
                throw new NotFoundError('Table not found');
            }
            if (params.headCount > table.capacity || params.headCount < table.minCapacity) {
                throw new BadRequestError('Party size does not match table capacity');
            }
            const availability = await reservationAvailabilityService.checkTableAvailability({
                tableId: table.tableId,
                reservationDate: params.reservationDate,
                reservationTime: params.reservationTime,
                duration: params.duration,
                excludeReservationId: params.excludeReservationId,
            });
            if (!availability.available) {
                throw new ConflictError('Table is not available for the selected time');
            }
            return table;
        }

        const autoAssigned = await reservationAvailabilityService.autoAssignTable({
            reservationDate: params.reservationDate,
            reservationTime: params.reservationTime,
            duration: params.duration,
            partySize: params.headCount,
            floor: params.floor,
            preferredTableId: params.preferredTableId,
            excludeReservationId: params.excludeReservationId,
        });

        if (!autoAssigned) {
            throw new ConflictError('No available tables for the requested slot');
        }

        return autoAssigned;
    }

    private applyStatusTransition(reservation: Reservation, nextStatus: ReservationStatus) {
        const update: Partial<Reservation> = { status: nextStatus };
        const now = new Date();

        switch (nextStatus) {
            case 'confirmed':
                update.confirmedAt = reservation.confirmedAt ?? now;
                break;
            case 'seated':
                update.confirmedAt = reservation.confirmedAt ?? now;
                update.seatedAt = now;
                break;
            case 'completed':
                update.confirmedAt = reservation.confirmedAt ?? now;
                update.seatedAt = reservation.seatedAt ?? now;
                update.completedAt = now;
                break;
            case 'cancelled':
                update.cancelledAt = now;
                break;
            case 'no_show':
                update.confirmedAt = reservation.confirmedAt ?? now;
                update.notes = reservation.notes || 'Marked as no-show';
                break;
            default:
                break;
        }

        return update;
    }

    private async logAudit(
        reservationId: number,
        action: string,
        userId?: number,
        changes?: Record<string, unknown>
    ) {
        await reservationRepository.createAuditEntry({
            reservation: { connect: { reservationId } },
            action,
            user: userId ? { connect: { staffId: userId } } : undefined,
            changes: changes ? (changes as Prisma.InputJsonValue) : undefined,
        });
    }
}

export const reservationService = new ReservationService();
