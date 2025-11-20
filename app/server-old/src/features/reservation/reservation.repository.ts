import { prisma } from '@/config/database';
import { Prisma, Reservation, ReservationAudit } from '@prisma/client';
import { ReservationStatus } from '@/shared/types';
import { BaseRepository, BaseFindOptions, BaseFilter } from '@/shared/base';
import { ReservationDateUtils } from '@/features/reservation/utils/reservation-settings';

interface ReservationFilter extends BaseFilter {
    status?: ReservationStatus;
    statuses?: ReservationStatus[];
    tableId?: number;
    tableIds?: number[];
    reservationDate?: Date;
    startDate?: Date;
    endDate?: Date;
    phoneNumber?: string;
    customerId?: number;
    floor?: number;
    search?: string;
}

export class ReservationRepository extends BaseRepository<Reservation, ReservationFilter> {
    protected buildWhereClause(filters?: ReservationFilter): Prisma.ReservationWhereInput {
        if (!filters) {
            return {};
        }

        const { status, statuses, tableId, tableIds, reservationDate, startDate, endDate, phoneNumber, search, customerId, floor } = filters;

        const where: Prisma.ReservationWhereInput = {};

        if (statuses?.length) {
            where.status = { in: statuses };
        } else if (status) {
            where.status = status;
        }

        if (tableIds?.length) {
            where.tableId = { in: tableIds };
        } else if (tableId) {
            where.tableId = tableId;
        }

        const dateFilter: Prisma.DateTimeFilter = {};
        if (reservationDate) {
            dateFilter.gte = ReservationDateUtils.startOfDay(reservationDate);
            dateFilter.lt = ReservationDateUtils.endOfDay(reservationDate);
        }
        if (startDate) {
            dateFilter.gte = ReservationDateUtils.startOfDay(startDate);
        }
        if (endDate) {
            dateFilter.lte = ReservationDateUtils.endOfDay(endDate);
        }
        if (Object.keys(dateFilter).length > 0) {
            where.reservationDate = dateFilter;
        }

        if (phoneNumber) {
            where.phoneNumber = { contains: phoneNumber, mode: 'insensitive' };
        }

        if (customerId) {
            where.customerId = customerId;
        }

        if (typeof floor === 'number') {
            where.table = { floor };
        }

        if (search) {
            where.OR = [
                { customerName: { contains: search, mode: 'insensitive' } },
                { phoneNumber: { contains: search, mode: 'insensitive' } },
                { reservationCode: { contains: search, mode: 'insensitive' } },
            ];
        }

        return where;
    }

    async findAll(options?: BaseFindOptions<ReservationFilter>): Promise<Reservation[]> {
        const { filters, skip = 0, take = 10, sortBy = 'reservationDate', sortOrder = 'asc' } = options || {};

        return prisma.reservation.findMany({
            where: this.buildWhereClause(filters),
            include: {
                table: true,
                customer: true,
            },
            skip,
            take,
            orderBy: this.buildOrderBy(sortBy, sortOrder) as Prisma.ReservationOrderByWithRelationInput,
        });
    }

    async count(filters?: ReservationFilter): Promise<number> {
        return prisma.reservation.count({
            where: this.buildWhereClause(filters),
        });
    }

    async create(data: Prisma.ReservationCreateInput): Promise<Reservation> {
        return prisma.reservation.create({
            data,
            include: {
                table: true,
                customer: true,
            },
        });
    }

    async findById(reservationId: number): Promise<Reservation | null> {
        return prisma.reservation.findUnique({
            where: { reservationId },
            include: {
                table: true,
                customer: true,
                audits: {
                    orderBy: { createdAt: 'desc' },
                    take: 20,
                },
                orders: true,
            },
        });
    }

    async findByCode(reservationCode: string): Promise<Reservation | null> {
        return prisma.reservation.findUnique({
            where: { reservationCode },
            include: {
                table: true,
            },
        });
    }

    async findByPhone(phoneNumber: string): Promise<Reservation[]> {
        return prisma.reservation.findMany({
            where: { phoneNumber },
            include: {
                table: true,
                customer: true,
            },
            orderBy: [{ reservationDate: 'desc' }, { reservationTime: 'desc' }],
        });
    }

    async findUpcoming(limit?: number): Promise<Reservation[]> {
        const now = new Date();
        return prisma.reservation.findMany({
            where: {
                status: { in: ['pending', 'confirmed'] },
                reservationDate: { gte: now },
            },
            include: {
                table: true,
            },
            take: limit || 10,
            orderBy: [{ reservationDate: 'asc' }, { reservationTime: 'asc' }],
        });
    }

    async update(reservationId: number, data: Prisma.ReservationUpdateInput): Promise<Reservation> {
        return prisma.reservation.update({
            where: { reservationId },
            data,
            include: {
                table: true,
                customer: true,
            },
        });
    }

    async updateStatus(reservationId: number, status: ReservationStatus): Promise<Reservation> {
        return this.update(reservationId, { status });
    }

    async delete(reservationId: number): Promise<Reservation> {
        return prisma.reservation.delete({ where: { reservationId } });
    }

    async findActiveByDate(
        reservationDate: Date,
        options?: { tableIds?: number[]; excludeReservationId?: number }
    ): Promise<Reservation[]> {
        const where: Prisma.ReservationWhereInput = {
            reservationDate: {
                gte: ReservationDateUtils.startOfDay(reservationDate),
                lt: ReservationDateUtils.endOfDay(reservationDate),
            },
            status: { in: ['pending', 'confirmed', 'seated'] },
        };

        if (options?.tableIds?.length) {
            where.tableId = { in: options.tableIds };
        }

        if (options?.excludeReservationId) {
            where.reservationId = { not: options.excludeReservationId };
        }

        return prisma.reservation.findMany({
            where,
            include: { table: true, customer: true },
        });
    }

    async createAuditEntry(data: Prisma.ReservationAuditCreateInput): Promise<ReservationAudit> {
        return prisma.reservationAudit.create({ data });
    }

    async getAuditTrail(reservationId: number): Promise<ReservationAudit[]> {
        return prisma.reservationAudit.findMany({
            where: { reservationId },
            orderBy: { createdAt: 'desc' },
        });
    }
}

export default new ReservationRepository();
