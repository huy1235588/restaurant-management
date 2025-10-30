import { prisma } from '@/config/database';
import { Prisma, Reservation } from '@prisma/client';
import { ReservationStatus } from '@/shared/types';
import { BaseRepository, BaseFindOptions, BaseFilter } from '@/shared/base';

interface ReservationFilter extends BaseFilter {
    status?: ReservationStatus;
    tableId?: number;
    reservationDate?: Date;
    phoneNumber?: string;
    search?: string;
}

export class ReservationRepository extends BaseRepository<Reservation, ReservationFilter> {
    protected buildWhereClause(filters?: ReservationFilter): Prisma.ReservationWhereInput {
        if (!filters) {
            return {};
        }

        const { status, tableId, reservationDate, phoneNumber, search } = filters;

        const where: Prisma.ReservationWhereInput = {};

        if (status) {
            where.status = status;
        }
        if (tableId) {
            where.tableId = tableId;
        }
        if (reservationDate) {
            where.reservationDate = {
                gte: new Date(reservationDate.setHours(0, 0, 0, 0)),
                lt: new Date(reservationDate.setHours(23, 59, 59, 999)),
            };
        }
        if (phoneNumber) {
            where.phoneNumber = { contains: phoneNumber };
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
            },
        });
    }

    async findById(reservationId: number): Promise<Reservation | null> {
        return prisma.reservation.findUnique({
            where: { reservationId },
            include: {
                table: true,
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
            },
        });
    }

    async updateStatus(reservationId: number, status: ReservationStatus): Promise<Reservation> {
        return this.update(reservationId, { status });
    }

    async delete(reservationId: number): Promise<Reservation> {
        return prisma.reservation.delete({ where: { reservationId } });
    }
}

export default new ReservationRepository();
