import {
    Injectable,
    NotFoundException,
    BadRequestException,
    Logger,
    ConflictException,
} from '@nestjs/common';
import { ReservationRepository, FindOptions } from './reservation.repository';
import { PrismaService } from '@/database/prisma.service';
import {
    CreateReservationDto,
    UpdateReservationDto,
    AvailableTablesQueryDto,
} from './dto';
import {
    ReservationStatus,
    RestaurantTable,
    TableStatus,
} from '@prisma/generated/client';

@Injectable()
export class ReservationService {
    private readonly logger = new Logger(ReservationService.name);

    constructor(
        private readonly reservationRepository: ReservationRepository,
        private readonly prisma: PrismaService,
    ) {}

    /**
     * Get all reservations with pagination and filters
     */
    async getAllReservations(options?: FindOptions) {
        return this.reservationRepository.findAllPaginated(options);
    }

    /**
     * Get reservation by ID
     */
    async getReservationById(reservationId: number) {
        const reservation =
            await this.reservationRepository.findById(reservationId);

        if (!reservation) {
            throw new NotFoundException('Reservation not found');
        }

        return reservation;
    }

    /**
     * Get reservation by code
     */
    async getReservationByCode(code: string) {
        const reservation = await this.reservationRepository.findByCode(code);

        if (!reservation) {
            throw new NotFoundException('Reservation not found');
        }

        return reservation;
    }

    /**
     * Get available tables for given criteria
     */
    async getAvailableTables(query: AvailableTablesQueryDto) {
        const { date, time, partySize, duration = 120 } = query;

        // Parse date and time
        const reservationDate = new Date(date);
        const [hours, minutes] = time.split(':').map(Number);
        const startTime = new Date(reservationDate);
        startTime.setHours(hours, minutes, 0, 0);

        const endTime = new Date(startTime);
        endTime.setMinutes(endTime.getMinutes() + duration);

        // Get all tables that can accommodate party size
        const allTables = await this.prisma.restaurantTable.findMany({
            where: {
                capacity: { gte: partySize },
                isActive: true,
                status: { not: TableStatus.maintenance },
            },
            orderBy: [{ capacity: 'asc' }, { tableNumber: 'asc' }],
        });

        // Filter out tables with overlapping reservations
        const availableTables: RestaurantTable[] = [];

        for (const table of allTables) {
            const overlapping =
                await this.reservationRepository.findOverlapping(
                    table.tableId,
                    startTime,
                    endTime,
                );

            if (overlapping.length === 0) {
                availableTables.push(table);
            }
        }

        return availableTables;
    }

    /**
     * Create new reservation
     */
    async createReservation(data: CreateReservationDto, createdBy?: number) {
        // Parse date and time
        const reservationDate = new Date(data.reservationDate);
        const [hours, minutes, seconds = 0] = data.reservationTime
            .split(':')
            .map(Number);
        const startTime = new Date(reservationDate);
        startTime.setHours(hours, minutes, seconds, 0);

        const duration = data.duration || 120;
        const endTime = new Date(startTime);
        endTime.setMinutes(endTime.getMinutes() + duration);

        // Validate table exists
        const table = await this.prisma.restaurantTable.findUnique({
            where: { tableId: data.tableId },
        });

        if (!table) {
            throw new NotFoundException('Table not found');
        }

        if (!table.isActive) {
            throw new BadRequestException('Table is not active');
        }

        if (table.status === TableStatus.maintenance) {
            throw new BadRequestException('Table is under maintenance');
        }

        // Validate capacity
        if (table.capacity < data.partySize) {
            throw new BadRequestException(
                `Table capacity (${table.capacity}) is less than party size (${data.partySize})`,
            );
        }

        // Check for double booking
        const overlapping = await this.reservationRepository.findOverlapping(
            data.tableId,
            startTime,
            endTime,
        );

        if (overlapping.length > 0) {
            throw new ConflictException(
                'Table is already reserved for this time slot',
            );
        }

        // Create reservation in transaction
        const reservation = await this.prisma.$transaction(async (tx) => {
            // Find or create customer if email provided
            let customerId: number | null = null;
            if (data.email) {
                const customer = await tx.customer.upsert({
                    where: { email: data.email },
                    update: {
                        name: data.customerName,
                        phoneNumber: data.phoneNumber,
                    },
                    create: {
                        name: data.customerName,
                        phoneNumber: data.phoneNumber,
                        email: data.email,
                    },
                });
                customerId = customer.customerId;
            }

            // Create reservation
            const newReservation = await tx.reservation.create({
                data: {
                    customerName: data.customerName,
                    phoneNumber: data.phoneNumber,
                    email: data.email,
                    customerId,
                    tableId: data.tableId,
                    reservationDate,
                    reservationTime: data.reservationTime,
                    duration,
                    partySize: data.partySize,
                    specialRequest: data.specialRequest,
                    depositAmount: data.depositAmount,
                    notes: data.notes,
                    status: ReservationStatus.pending,
                    createdBy,
                },
                include: {
                    table: true,
                    creator: {
                        select: {
                            staffId: true,
                            fullName: true,
                            role: true,
                        },
                    },
                },
            });

            // Create audit log
            await tx.reservationAudit.create({
                data: {
                    reservationId: newReservation.reservationId,
                    action: 'created',
                    userId: createdBy,
                    changes: { status: ReservationStatus.pending },
                },
            });

            // Update table status to reserved
            await tx.restaurantTable.update({
                where: { tableId: data.tableId },
                data: { status: TableStatus.reserved },
            });

            return newReservation;
        });

        this.logger.log(
            `Reservation created: ${reservation.reservationCode} for ${data.customerName}`,
        );

        // TODO: Send confirmation email
        // await this.sendConfirmationEmail(reservation);

        return reservation;
    }

    /**
     * Update reservation
     */
    async updateReservation(
        reservationId: number,
        data: UpdateReservationDto,
        updatedBy?: number,
    ) {
        const reservation = await this.getReservationById(reservationId);

        if (
            reservation.status === ReservationStatus.completed ||
            reservation.status === ReservationStatus.cancelled ||
            reservation.status === ReservationStatus.no_show
        ) {
            throw new BadRequestException(
                'Cannot update completed, cancelled, or no-show reservations',
            );
        }

        // If changing date/time/table/party size, revalidate
        if (
            data.reservationDate ||
            data.reservationTime ||
            data.tableId ||
            data.partySize
        ) {
            const newDate = data.reservationDate
                ? new Date(data.reservationDate)
                : reservation.reservationDate;
            const newTime = data.reservationTime || reservation.reservationTime;
            const newTableId = data.tableId || reservation.tableId;
            const newPartySize = data.partySize || reservation.partySize;
            const duration = data.duration || reservation.duration;

            const [hours, minutes, seconds = 0] = newTime
                .toString()
                .split(':')
                .map(Number);
            const startTime = new Date(newDate);
            startTime.setHours(hours, minutes, seconds, 0);

            const endTime = new Date(startTime);
            endTime.setMinutes(endTime.getMinutes() + duration);

            // Check table capacity
            const table = await this.prisma.restaurantTable.findUnique({
                where: { tableId: newTableId },
            });

            if (!table) {
                throw new NotFoundException('Table not found');
            }

            if (table.capacity < newPartySize) {
                throw new BadRequestException(
                    `Table capacity (${table.capacity}) is less than party size (${newPartySize})`,
                );
            }

            // Check for double booking
            const overlapping =
                await this.reservationRepository.findOverlapping(
                    newTableId,
                    startTime,
                    endTime,
                    reservationId,
                );

            if (overlapping.length > 0) {
                throw new ConflictException(
                    'Table is already reserved for this time slot',
                );
            }
        }

        // Update in transaction
        const updated = await this.prisma.$transaction(async (tx) => {
            const updateData: UpdateReservationDto = { ...data };

            if (data.reservationDate) {
                updateData.reservationDate = data.reservationDate;
            }

            const updatedReservation = await tx.reservation.update({
                where: { reservationId },
                data: updateData,
                include: {
                    table: true,
                    creator: {
                        select: {
                            staffId: true,
                            fullName: true,
                            role: true,
                        },
                    },
                },
            });

            // Create audit log (use a typed shallow clone to avoid unsafe any)
            const changes: Partial<UpdateReservationDto> = { ...data };

            await tx.reservationAudit.create({
                data: {
                    reservationId,
                    action: 'updated',
                    userId: updatedBy,
                    changes,
                },
            });

            // If table changed, update old and new table statuses
            if (data.tableId && data.tableId !== reservation.tableId) {
                await tx.restaurantTable.update({
                    where: { tableId: reservation.tableId },
                    data: { status: TableStatus.available },
                });

                await tx.restaurantTable.update({
                    where: { tableId: data.tableId },
                    data: { status: TableStatus.reserved },
                });
            }

            return updatedReservation;
        });

        this.logger.log(`Reservation updated: ${reservation.reservationCode}`);

        return updated;
    }

    /**
     * Confirm reservation
     */
    async confirmReservation(reservationId: number, userId?: number) {
        const reservation = await this.getReservationById(reservationId);

        if (reservation.status !== ReservationStatus.pending) {
            throw new BadRequestException(
                'Can only confirm pending reservations',
            );
        }

        const confirmed = await this.prisma.$transaction(async (tx) => {
            const updated = await tx.reservation.update({
                where: { reservationId },
                data: {
                    status: ReservationStatus.confirmed,
                    confirmedAt: new Date(),
                },
                include: {
                    table: true,
                },
            });

            await tx.reservationAudit.create({
                data: {
                    reservationId,
                    action: 'confirmed',
                    userId,
                    changes: { status: ReservationStatus.confirmed },
                },
            });

            return updated;
        });

        this.logger.log(
            `Reservation confirmed: ${reservation.reservationCode}`,
        );

        return confirmed;
    }

    /**
     * Seat customer
     */
    async seatCustomer(reservationId: number, userId?: number) {
        const reservation = await this.getReservationById(reservationId);

        if (reservation.status !== ReservationStatus.confirmed) {
            throw new BadRequestException(
                'Can only seat confirmed reservations',
            );
        }

        const seated = await this.prisma.$transaction(async (tx) => {
            const updated = await tx.reservation.update({
                where: { reservationId },
                data: {
                    status: ReservationStatus.seated,
                    seatedAt: new Date(),
                },
                include: {
                    table: true,
                },
            });

            await tx.reservationAudit.create({
                data: {
                    reservationId,
                    action: 'seated',
                    userId,
                    changes: { status: ReservationStatus.seated },
                },
            });

            // Update table status to occupied
            await tx.restaurantTable.update({
                where: { tableId: reservation.tableId },
                data: { status: TableStatus.occupied },
            });

            return updated;
        });

        this.logger.log(`Customer seated: ${reservation.reservationCode}`);

        return seated;
    }

    /**
     * Mark as no-show
     */
    async markNoShow(reservationId: number, userId?: number) {
        const reservation = await this.getReservationById(reservationId);

        if (
            reservation.status !== ReservationStatus.pending &&
            reservation.status !== ReservationStatus.confirmed
        ) {
            throw new BadRequestException(
                'Can only mark pending or confirmed reservations as no-show',
            );
        }

        const noShow = await this.prisma.$transaction(async (tx) => {
            const updated = await tx.reservation.update({
                where: { reservationId },
                data: {
                    status: ReservationStatus.no_show,
                    cancelledAt: new Date(),
                },
                include: {
                    table: true,
                },
            });

            await tx.reservationAudit.create({
                data: {
                    reservationId,
                    action: 'no_show',
                    userId,
                    changes: { status: ReservationStatus.no_show },
                },
            });

            // Free up table
            await tx.restaurantTable.update({
                where: { tableId: reservation.tableId },
                data: { status: TableStatus.available },
            });

            return updated;
        });

        this.logger.log(
            `Reservation marked as no-show: ${reservation.reservationCode}`,
        );

        return noShow;
    }

    /**
     * Complete reservation
     */
    async completeReservation(reservationId: number, userId?: number) {
        const reservation = await this.getReservationById(reservationId);

        if (reservation.status !== ReservationStatus.seated) {
            throw new BadRequestException(
                'Can only complete seated reservations',
            );
        }

        const completed = await this.prisma.$transaction(async (tx) => {
            const updated = await tx.reservation.update({
                where: { reservationId },
                data: {
                    status: ReservationStatus.completed,
                    completedAt: new Date(),
                },
                include: {
                    table: true,
                },
            });

            await tx.reservationAudit.create({
                data: {
                    reservationId,
                    action: 'completed',
                    userId,
                    changes: { status: ReservationStatus.completed },
                },
            });

            return updated;
        });

        this.logger.log(
            `Reservation completed: ${reservation.reservationCode}`,
        );

        return completed;
    }

    /**
     * Cancel reservation
     */
    async cancelReservation(
        reservationId: number,
        reason: string,
        userId?: number,
    ) {
        const reservation = await this.getReservationById(reservationId);

        if (
            reservation.status === ReservationStatus.completed ||
            reservation.status === ReservationStatus.cancelled ||
            reservation.status === ReservationStatus.no_show
        ) {
            throw new BadRequestException(
                'Cannot cancel completed, already cancelled, or no-show reservations',
            );
        }

        const cancelled = await this.prisma.$transaction(async (tx) => {
            const updated = await tx.reservation.update({
                where: { reservationId },
                data: {
                    status: ReservationStatus.cancelled,
                    cancelledAt: new Date(),
                    cancellationReason: reason,
                },
                include: {
                    table: true,
                },
            });

            await tx.reservationAudit.create({
                data: {
                    reservationId,
                    action: 'cancelled',
                    userId,
                    changes: { status: ReservationStatus.cancelled, reason },
                },
            });

            // Free up table
            await tx.restaurantTable.update({
                where: { tableId: reservation.tableId },
                data: { status: TableStatus.available },
            });

            return updated;
        });

        this.logger.log(
            `Reservation cancelled: ${reservation.reservationCode} - ${reason}`,
        );

        return cancelled;
    }
}
