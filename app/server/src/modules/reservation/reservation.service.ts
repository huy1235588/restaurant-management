import {
    Injectable,
    NotFoundException,
    BadRequestException,
    ConflictException,
    Logger,
} from '@nestjs/common';
import { ReservationRepository } from './reservation.repository';
import { PrismaService } from '@/database/prisma.service';
import { ReservationAuditService } from '../reservation-audit';
import { OrderService } from '../order/order.service';
import {
    CreateReservationDto,
    UpdateReservationDto,
    QueryReservationDto,
    CancelReservationDto,
    CheckAvailabilityDto,
} from './dto';
import {
    Reservation,
    ReservationStatus,
    RestaurantTable,
    TableStatus,
    OrderStatus,
} from '@prisma/generated/client';

@Injectable()
export class ReservationService {
    private readonly logger = new Logger(ReservationService.name);

    constructor(
        private readonly reservationRepository: ReservationRepository,
        private readonly prisma: PrismaService,
        private readonly auditService: ReservationAuditService,
        private readonly orderService: OrderService,
    ) {}

    async findAll(query: QueryReservationDto) {
        const page = query.page || 1;
        const limit = query.limit || 10;
        const skip = (page - 1) * limit;

        const filters = {
            status: query.status,
            date: query.date,
            startDate: query.startDate,
            endDate: query.endDate,
            tableId: query.tableId,
            search: query.search,
        };

        const { data, total } = await this.reservationRepository.findAll({
            filters,
            skip,
            take: limit,
            sortBy: query.sortBy,
            sortOrder: query.sortOrder,
        });

        return {
            items: data,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    async findById(id: number): Promise<Reservation> {
        const reservation = await this.reservationRepository.findById(id);
        if (!reservation) {
            throw new NotFoundException('Reservation not found');
        }
        return reservation;
    }

    async findByCode(code: string): Promise<Reservation> {
        const reservation = await this.reservationRepository.findByCode(code);
        if (!reservation) {
            throw new NotFoundException('Reservation not found');
        }
        return reservation;
    }

    async findByPhone(phone: string): Promise<Reservation[]> {
        return this.reservationRepository.findByPhone(phone);
    }

    async create(
        dto: CreateReservationDto,
        userId?: number,
    ): Promise<Reservation> {
        // Validate reservation date is not in the past
        const reservationDateTime = this.combineDateTime(
            dto.reservationDate,
            dto.reservationTime,
        );
        if (reservationDateTime < new Date()) {
            throw new BadRequestException(
                'Reservation date must be in the future',
            );
        }

        // Find or create customer
        const customer = await this.findOrCreateCustomer(
            dto.customerName,
            dto.phoneNumber,
            dto.email,
        );

        // Determine table
        let tableId = dto.tableId;
        if (!tableId) {
            // Auto-assign table
            const availableTables = await this.checkAvailability({
                date: reservationDateTime.toISOString(),
                partySize: dto.partySize,
                duration: dto.duration || 120,
                floor: dto.floor,
            });

            if (availableTables.length === 0) {
                throw new ConflictException(
                    'No tables available for selected time',
                );
            }

            // Prefer preferred table if available
            if (dto.preferredTableId) {
                const preferredTable = availableTables.find(
                    (t) => t.tableId === dto.preferredTableId,
                );
                if (preferredTable) {
                    tableId = preferredTable.tableId;
                }
            }

            // Otherwise, pick the table with capacity closest to partySize
            if (!tableId) {
                availableTables.sort((a, b) => {
                    const diffA = Math.abs(a.capacity - dto.partySize);
                    const diffB = Math.abs(b.capacity - dto.partySize);
                    return diffA - diffB;
                });
                tableId = availableTables[0].tableId;
            }
        } else {
            // Validate specified table
            const table = await this.prisma.restaurantTable.findUnique({
                where: { tableId },
            });

            if (!table) {
                throw new NotFoundException('Table not found');
            }

            if (!table.isActive) {
                throw new BadRequestException('Table is not active');
            }

            if (table.capacity < dto.partySize) {
                throw new BadRequestException(
                    'Table capacity insufficient for party size',
                );
            }

            // Check availability
            const duration = dto.duration || 120;
            const endTime = new Date(
                reservationDateTime.getTime() + duration * 60000,
            );
            const overlapping =
                await this.reservationRepository.findOverlapping(
                    tableId,
                    reservationDateTime,
                    endTime,
                );

            if (overlapping.length > 0) {
                throw new ConflictException(
                    'Table not available for selected time',
                );
            }
        }

        // Create reservation
        const reservation = await this.reservationRepository.create({
            customerName: dto.customerName,
            phoneNumber: dto.phoneNumber,
            email: dto.email,
            customer: { connect: { customerId: customer.customerId } },
            table: { connect: { tableId } },
            reservationDate: new Date(dto.reservationDate),
            reservationTime: this.parseTime(dto.reservationTime),
            duration: dto.duration || 120,
            partySize: dto.partySize,
            specialRequest: dto.specialRequest,
            depositAmount: dto.depositAmount,
            notes: dto.notes,
            tags: dto.tags || [],
            status: ReservationStatus.pending,
            ...(userId && { creator: { connect: { staffId: userId } } }),
        });

        // Create audit log
        await this.auditService.create(
            reservation.reservationId,
            'create',
            userId,
            {
                status: 'pending',
            },
        );

        return reservation;
    }

    async update(
        id: number,
        dto: UpdateReservationDto,
        userId?: number,
    ): Promise<Reservation> {
        const existing = await this.findById(id);

        // Cannot update completed or cancelled reservations
        if (
            existing.status === ReservationStatus.completed ||
            existing.status === ReservationStatus.cancelled
        ) {
            throw new BadRequestException(
                'Cannot update completed or cancelled reservation',
            );
        }

        const changes: Record<string, unknown> = {};

        // If date/time changed, re-check availability
        if (dto.reservationDate || dto.reservationTime) {
            const newDate =
                dto.reservationDate ||
                existing.reservationDate.toISOString().split('T')[0];
            const newTime =
                dto.reservationTime ||
                this.formatTime(existing.reservationTime);
            const reservationDateTime = this.combineDateTime(newDate, newTime);

            if (reservationDateTime < new Date()) {
                throw new BadRequestException(
                    'Reservation date must be in the future',
                );
            }

            const duration = dto.duration || existing.duration;
            const endTime = new Date(
                reservationDateTime.getTime() + duration * 60000,
            );
            const tableId = dto.tableId || existing.tableId;

            const overlapping =
                await this.reservationRepository.findOverlapping(
                    tableId,
                    reservationDateTime,
                    endTime,
                    id,
                );

            if (overlapping.length > 0) {
                throw new ConflictException('Table not available for new time');
            }

            if (dto.reservationDate) {
                changes.reservationDate = new Date(dto.reservationDate);
            }
            if (dto.reservationTime) {
                changes.reservationTime = this.parseTime(dto.reservationTime);
            }
        }

        // If table changed, validate new table
        if (dto.tableId && dto.tableId !== existing.tableId) {
            const table = await this.prisma.restaurantTable.findUnique({
                where: { tableId: dto.tableId },
            });

            if (!table) {
                throw new NotFoundException('Table not found');
            }

            // Access partySize safely from the existing reservation
            const existingPartySize = existing.partySize as number;
            const partySize = dto.partySize ?? existingPartySize;
            if (table.capacity < partySize) {
                throw new BadRequestException(
                    'New table capacity insufficient',
                );
            }

            changes.tableId = dto.tableId;
        }

        // Update other fields
        if (dto.customerName) changes.customerName = dto.customerName;
        if (dto.phoneNumber) changes.phoneNumber = dto.phoneNumber;
        if (dto.email !== undefined) changes.email = dto.email;
        if (dto.partySize) changes.partySize = dto.partySize;
        if (dto.duration) changes.duration = dto.duration;
        if (dto.specialRequest !== undefined)
            changes.specialRequest = dto.specialRequest;
        if (dto.depositAmount !== undefined)
            changes.depositAmount = dto.depositAmount;
        if (dto.notes !== undefined) changes.notes = dto.notes;
        if (dto.tags !== undefined) changes.tags = dto.tags;

        const updated = await this.reservationRepository.update(id, changes);

        // Create audit log
        await this.auditService.create(id, 'update', userId, changes);

        // Update customer if phone changed
        if (dto.phoneNumber && dto.phoneNumber !== existing.phoneNumber) {
            await this.findOrCreateCustomer(
                dto.customerName || existing.customerName,
                dto.phoneNumber,
                dto.email ?? existing.email ?? undefined,
            );
        }

        return updated;
    }

    async confirm(id: number, userId?: number): Promise<Reservation> {
        const reservation = await this.findById(id);

        if (reservation.status !== ReservationStatus.pending) {
            throw new BadRequestException(
                'Only pending reservations can be confirmed',
            );
        }

        const updated = await this.reservationRepository.update(id, {
            status: ReservationStatus.confirmed,
            confirmedAt: new Date(),
        });

        await this.auditService.create(id, 'confirm', userId, {
            oldStatus: ReservationStatus.pending,
            newStatus: ReservationStatus.confirmed,
        });

        return updated;
    }

    async seat(
        id: number,
        userId?: number,
    ): Promise<{ reservation: Reservation; order: any }> {
        const reservation = await this.findById(id);

        if (
            reservation.status !== ReservationStatus.confirmed &&
            reservation.status !== ReservationStatus.pending
        ) {
            throw new BadRequestException(
                'Only confirmed or pending reservations can be seated',
            );
        }

        // Use Prisma transaction to atomically:
        // 1. Update table status to occupied
        // 2. Update reservation status to seated
        // 3. Create order linked to reservation
        const result = await this.prisma.$transaction(async (tx) => {
            // 1. Update table status
            await tx.restaurantTable.update({
                where: { tableId: reservation.tableId },
                data: { status: TableStatus.occupied },
            });

            // 2. Update reservation status
            const updatedReservation = await tx.reservation.update({
                where: { reservationId: id },
                data: {
                    status: ReservationStatus.seated,
                    seatedAt: new Date(),
                },
                include: {
                    table: true,
                    customer: true,
                },
            });

            // 3. Create order linked to reservation
            const order = await tx.order.create({
                data: {
                    tableId: reservation.tableId,
                    staffId: userId || null,
                    reservationId: id,
                    customerName: reservation.customerName,
                    customerPhone: reservation.phoneNumber,
                    partySize: reservation.partySize,
                    notes: reservation.specialRequest,
                    status: OrderStatus.pending,
                    totalAmount: 0,
                    finalAmount: 0,
                },
                include: {
                    table: true,
                    staff: true,
                    orderItems: {
                        include: {
                            menuItem: true,
                        },
                    },
                },
            });

            return { reservation: updatedReservation, order };
        });

        // Create audit log
        await this.auditService.create(id, 'seat', userId, {
            oldStatus: reservation.status,
            newStatus: ReservationStatus.seated,
            orderId: result.order.orderId,
            orderNumber: result.order.orderNumber,
        });

        this.logger.log(
            `Reservation ${reservation.reservationCode} seated. Order ${result.order.orderNumber} auto-created.`,
        );

        return result;
    }

    async complete(id: number, userId?: number): Promise<Reservation> {
        const reservation = await this.findById(id);

        if (reservation.status !== ReservationStatus.seated) {
            throw new BadRequestException(
                'Only seated reservations can be completed',
            );
        }

        // Check if there's a linked order
        const order = await this.orderService.getOrderByReservation(id);
        if (order && order.status !== OrderStatus.completed) {
            throw new BadRequestException(
                'Cannot complete reservation while order is still active. Please complete or cancel the order first.',
            );
        }

        // Update table status to available
        await this.prisma.restaurantTable.update({
            where: { tableId: reservation.tableId },
            data: { status: TableStatus.available },
        });

        const updated = await this.reservationRepository.update(id, {
            status: ReservationStatus.completed,
            completedAt: new Date(),
        });

        await this.auditService.create(id, 'complete', userId, {
            oldStatus: ReservationStatus.seated,
            newStatus: ReservationStatus.completed,
        });

        return updated;
    }

    async cancel(
        id: number,
        dto: CancelReservationDto,
        userId?: number,
    ): Promise<Reservation> {
        const reservation = await this.findById(id);

        if (reservation.status === ReservationStatus.completed) {
            throw new BadRequestException(
                'Cannot cancel completed reservation',
            );
        }

        // Check if there's a linked order
        const order = await this.orderService.getOrderByReservation(id);
        if (
            order &&
            order.status !== OrderStatus.cancelled &&
            order.status !== OrderStatus.completed
        ) {
            throw new BadRequestException(
                'Cannot cancel reservation while order is still active. Please cancel the order first.',
            );
        }

        // Release table if it was occupied
        if (reservation.status === ReservationStatus.seated) {
            await this.prisma.restaurantTable.update({
                where: { tableId: reservation.tableId },
                data: { status: TableStatus.available },
            });
        }

        const updated = await this.reservationRepository.update(id, {
            status: ReservationStatus.cancelled,
            cancelledAt: new Date(),
            cancellationReason: dto.reason,
        });

        await this.auditService.create(id, 'cancel', userId, {
            oldStatus: reservation.status,
            newStatus: ReservationStatus.cancelled,
            reason: dto.reason,
        });

        return updated;
    }

    async markNoShow(id: number, userId?: number): Promise<Reservation> {
        const reservation = await this.findById(id);

        if (
            reservation.status !== ReservationStatus.pending &&
            reservation.status !== ReservationStatus.confirmed
        ) {
            throw new BadRequestException(
                'Only pending or confirmed reservations can be marked as no-show',
            );
        }

        // Release table immediately
        await this.prisma.restaurantTable.update({
            where: { tableId: reservation.tableId },
            data: { status: TableStatus.available },
        });

        const updated = await this.reservationRepository.update(id, {
            status: ReservationStatus.no_show,
            cancelledAt: new Date(),
        });

        await this.auditService.create(id, 'no_show', userId, {
            oldStatus: reservation.status,
            newStatus: ReservationStatus.no_show,
        });

        return updated;
    }

    async checkAvailability(dto: CheckAvailabilityDto) {
        const reservationDateTime = new Date(dto.date);
        const duration = dto.duration || 120;
        const endTime = new Date(
            reservationDateTime.getTime() + duration * 60000,
        );

        // Get all active tables that can accommodate the party size
        // Build where clause with proper types
        const whereClause: {
            isActive: boolean;
            capacity: { gte: number };
            floor?: number;
            section?: string;
        } = {
            isActive: true,
            capacity: { gte: dto.partySize },
        };

        if (dto.floor !== undefined) {
            whereClause.floor = dto.floor;
        }

        if (dto.section) {
            whereClause.section = dto.section;
        }

        // Get all tables matching basic criteria
        const allTables = await this.prisma.restaurantTable.findMany({
            where: whereClause,
        });

        // Filter by minCapacity in memory (to avoid complex Prisma OR with null)
        const suitableTables = allTables.filter(
            (table) =>
                table.minCapacity === null ||
                table.minCapacity <= dto.partySize,
        );

        // Check each suitable table for availability (no overlapping reservations)
        const availableTables: RestaurantTable[] = [];
        for (const table of suitableTables) {
            const overlapping =
                await this.reservationRepository.findOverlapping(
                    table.tableId,
                    reservationDateTime,
                    endTime,
                );

            if (overlapping.length === 0) {
                availableTables.push(table);
            }
        }

        return availableTables;
    }

    // Helper methods
    private async findOrCreateCustomer(
        name: string,
        phoneNumber: string,
        email?: string,
    ) {
        let customer = await this.prisma.customer.findUnique({
            where: { phoneNumber },
        });

        if (customer) {
            // Update name if different
            if (customer.name !== name) {
                customer = await this.prisma.customer.update({
                    where: { customerId: customer.customerId },
                    data: { name, email },
                });
            }
        } else {
            // Create new customer
            customer = await this.prisma.customer.create({
                data: { name, phoneNumber, email },
            });
        }

        return customer;
    }

    private combineDateTime(date: string, time: string): Date {
        const [hours, minutes] = time.split(':').map(Number);
        const dateTime = new Date(date);
        dateTime.setHours(hours, minutes, 0, 0);
        return dateTime;
    }

    private parseTime(timeString: string): Date {
        const [hours, minutes] = timeString.split(':').map(Number);
        const date = new Date();
        date.setHours(hours, minutes, 0, 0);
        return date;
    }

    private formatTime(date: Date): string {
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        return `${hours}:${minutes}`;
    }
}
