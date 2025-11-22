import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/database/prisma.service';
import { Prisma, Reservation, ReservationStatus } from '@prisma/generated/client';

export interface ReservationFilters {
    status?: ReservationStatus;
    tableId?: number;
    date?: string;
    phoneNumber?: string;
    customerName?: string;
}

export interface FindOptions {
    filters?: ReservationFilters;
    skip?: number;
    take?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

@Injectable()
export class ReservationRepository {
    constructor(private readonly prisma: PrismaService) {}

    private buildWhereClause(
        filters?: ReservationFilters,
    ): Prisma.ReservationWhereInput {
        if (!filters) return {};

        const where: Prisma.ReservationWhereInput = {};

        if (filters.status !== undefined) {
            where.status = filters.status;
        }

        if (filters.tableId !== undefined) {
            where.tableId = filters.tableId;
        }

        if (filters.date) {
            where.reservationDate = new Date(filters.date);
        }

        if (filters.phoneNumber) {
            where.phoneNumber = {
                contains: filters.phoneNumber,
                mode: 'insensitive',
            };
        }

        if (filters.customerName) {
            where.customerName = {
                contains: filters.customerName,
                mode: 'insensitive',
            };
        }

        return where;
    }

    async findAll(options?: FindOptions): Promise<Reservation[]> {
        const {
            filters,
            skip = 0,
            take = 20,
            sortBy = 'reservationDate',
            sortOrder = 'desc',
        } = options || {};

        return this.prisma.reservation.findMany({
            where: this.buildWhereClause(filters),
            include: {
                table: true,
                creator: {
                    select: {
                        staffId: true,
                        fullName: true,
                        role: true,
                    },
                },
                customer: true,
            },
            skip,
            take,
            orderBy: { [sortBy]: sortOrder },
        });
    }

    async findAllPaginated(options?: FindOptions) {
        const items = await this.findAll(options);
        const total = await this.count(options?.filters);
        const limit = options?.take || 20;
        const page = options?.skip ? Math.floor(options.skip / limit) + 1 : 1;
        const totalPages = Math.ceil(total / limit);

        return {
            items,
            pagination: {
                total,
                page,
                limit,
                totalPages,
            },
        };
    }

    async count(filters?: ReservationFilters): Promise<number> {
        return this.prisma.reservation.count({
            where: this.buildWhereClause(filters),
        });
    }

    async findById(reservationId: number): Promise<Reservation | null> {
        return this.prisma.reservation.findUnique({
            where: { reservationId },
            include: {
                table: true,
                creator: {
                    select: {
                        staffId: true,
                        fullName: true,
                        role: true,
                    },
                },
                customer: true,
                audits: {
                    include: {
                        user: {
                            select: {
                                staffId: true,
                                fullName: true,
                                role: true,
                            },
                        },
                    },
                    orderBy: {
                        createdAt: 'desc',
                    },
                },
            },
        });
    }

    async findByCode(reservationCode: string): Promise<Reservation | null> {
        return this.prisma.reservation.findUnique({
            where: { reservationCode },
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
    }

    async findOverlapping(
        tableId: number,
        startTime: Date,
        endTime: Date,
        excludeId?: number,
    ): Promise<Reservation[]> {
        const where: Prisma.ReservationWhereInput = {
            tableId,
            status: {
                in: [ReservationStatus.pending, ReservationStatus.confirmed],
            },
            OR: [
                {
                    AND: [
                        { reservationDate: { lte: endTime } },
                        { reservationDate: { gte: startTime } },
                    ],
                },
            ],
        };

        if (excludeId) {
            where.reservationId = { not: excludeId };
        }

        return this.prisma.reservation.findMany({
            where,
        });
    }

    async create(data: Prisma.ReservationCreateInput): Promise<Reservation> {
        return this.prisma.reservation.create({
            data,
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
    }

    async update(
        reservationId: number,
        data: Prisma.ReservationUpdateInput,
    ): Promise<Reservation> {
        return this.prisma.reservation.update({
            where: { reservationId },
            data,
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
    }

    async delete(reservationId: number): Promise<Reservation> {
        return this.prisma.reservation.delete({
            where: { reservationId },
        });
    }

    async createAudit(
        reservationId: number,
        action: string,
        userId?: number,
        changes?: any,
    ) {
        return this.prisma.reservationAudit.create({
            data: {
                reservationId,
                action,
                userId,
                changes,
            },
        });
    }
}
