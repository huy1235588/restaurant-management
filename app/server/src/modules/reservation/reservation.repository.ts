import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/database/prisma.service';
import {
    Prisma,
    Reservation,
    ReservationStatus,
} from '@/lib/prisma';

export interface ReservationFilters {
    status?: ReservationStatus;
    date?: string;
    startDate?: string;
    endDate?: string;
    tableId?: number;
    customerId?: number;
    search?: string;
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

        if (filters.status) {
            where.status = filters.status;
        }

        if (filters.date) {
            where.reservationDate = new Date(filters.date);
        }

        if (filters.startDate || filters.endDate) {
            where.reservationDate = {};
            if (filters.startDate) {
                where.reservationDate.gte = new Date(filters.startDate);
            }
            if (filters.endDate) {
                where.reservationDate.lte = new Date(filters.endDate);
            }
        }

        if (filters.tableId) {
            where.tableId = filters.tableId;
        }

        if (filters.customerId) {
            where.customerId = filters.customerId;
        }

        if (filters.search) {
            where.OR = [
                {
                    customerName: {
                        contains: filters.search,
                        mode: 'insensitive',
                    },
                },
                {
                    phoneNumber: {
                        contains: filters.search,
                        mode: 'insensitive',
                    },
                },
                {
                    reservationCode: {
                        contains: filters.search,
                        mode: 'insensitive',
                    },
                },
                { email: { contains: filters.search, mode: 'insensitive' } },
            ];
        }

        return where;
    }

    async findAll(
        options?: FindOptions,
    ): Promise<{ data: Reservation[]; total: number }> {
        const where = this.buildWhereClause(options?.filters);

        const sortBy = options?.sortBy || 'reservationDate';
        const sortOrder = options?.sortOrder || 'asc';

        const orderBy: Prisma.ReservationOrderByWithRelationInput = {};
        if (
            sortBy === 'reservationDate' ||
            sortBy === 'reservationTime' ||
            sortBy === 'createdAt' ||
            sortBy === 'status'
        ) {
            orderBy[sortBy] = sortOrder;
        }

        const [data, total] = await Promise.all([
            this.prisma.reservation.findMany({
                where,
                skip: options?.skip,
                take: options?.take,
                orderBy,
                include: {
                    table: {
                        select: {
                            tableId: true,
                            tableNumber: true,
                            tableName: true,
                            capacity: true,
                            floor: true,
                            section: true,
                        },
                    },
                    customer: {
                        select: {
                            customerId: true,
                            name: true,
                            phoneNumber: true,
                            email: true,
                            isVip: true,
                        },
                    },
                },
            }),
            this.prisma.reservation.count({ where }),
        ]);

        return { data, total };
    }

    async findById(id: number): Promise<Reservation | null> {
        return this.prisma.reservation.findUnique({
            where: { reservationId: id },
            include: {
                table: {
                    select: {
                        tableId: true,
                        tableNumber: true,
                        tableName: true,
                        capacity: true,
                        minCapacity: true,
                        floor: true,
                        section: true,
                    },
                },
                customer: {
                    select: {
                        customerId: true,
                        name: true,
                        phoneNumber: true,
                        email: true,
                        isVip: true,
                    },
                },
                audits: {
                    orderBy: { createdAt: 'desc' },
                    include: {
                        user: {
                            select: {
                                staffId: true,
                                fullName: true,
                            },
                        },
                    },
                },
                orders: true,
            },
        });
    }

    async findByCode(code: string): Promise<Reservation | null> {
        return this.prisma.reservation.findUnique({
            where: { reservationCode: code },
            include: {
                table: true,
                customer: true,
                audits: {
                    orderBy: { createdAt: 'desc' },
                    include: {
                        user: {
                            select: {
                                staffId: true,
                                fullName: true,
                            },
                        },
                    },
                },
            },
        });
    }

    async findByPhone(phoneNumber: string): Promise<Reservation[]> {
        return this.prisma.reservation.findMany({
            where: { phoneNumber },
            orderBy: { reservationDate: 'desc' },
            include: {
                table: {
                    select: {
                        tableId: true,
                        tableNumber: true,
                        tableName: true,
                        capacity: true,
                        floor: true,
                    },
                },
            },
        });
    }

    async create(data: Prisma.ReservationCreateInput): Promise<Reservation> {
        return this.prisma.reservation.create({
            data,
            include: {
                table: true,
                customer: true,
            },
        });
    }

    async update(
        id: number,
        data: Prisma.ReservationUpdateInput,
    ): Promise<Reservation> {
        return this.prisma.reservation.update({
            where: { reservationId: id },
            data,
            include: {
                table: true,
                customer: true,
            },
        });
    }

    async delete(id: number): Promise<Reservation> {
        return this.prisma.reservation.delete({
            where: { reservationId: id },
        });
    }

    // Find overlapping reservations for a table in a time range
    async findOverlapping(
        tableId: number,
        startTime: Date,
        endTime: Date,
        excludeReservationId?: number,
    ): Promise<Reservation[]> {
        const where: Prisma.ReservationWhereInput = {
            tableId,
            status: {
                in: ['pending', 'confirmed', 'seated'],
            },
            AND: [
                {
                    reservationDate: {
                        gte: new Date(startTime.toDateString()),
                        lte: new Date(endTime.toDateString()),
                    },
                },
            ],
        };

        if (excludeReservationId) {
            where.NOT = { reservationId: excludeReservationId };
        }

        return this.prisma.reservation.findMany({
            where,
            include: {
                table: true,
            },
        });
    }
}
