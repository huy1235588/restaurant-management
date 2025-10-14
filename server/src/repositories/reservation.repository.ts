import { prisma } from '@/config/database';
import { Prisma, Reservation } from '@prisma/client';
import { ReservationStatus } from '@/types';

export class ReservationRepository {
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

    async findAll(params?: {
        status?: ReservationStatus;
        tableId?: number;
        reservationDate?: Date;
        phoneNumber?: string;
        skip?: number;
        take?: number;
    }): Promise<Reservation[]> {
        const { status, tableId, reservationDate, phoneNumber, skip, take } = params || {};
        return prisma.reservation.findMany({
            where: {
                ...(status && { status }),
                ...(tableId && { tableId }),
                ...(reservationDate && {
                    reservationDate: {
                        gte: new Date(reservationDate.setHours(0, 0, 0, 0)),
                        lt: new Date(reservationDate.setHours(23, 59, 59, 999)),
                    },
                }),
                ...(phoneNumber && { phoneNumber: { contains: phoneNumber } }),
            },
            include: {
                table: true,
            },
            skip,
            take,
            orderBy: [{ reservationDate: 'asc' }, { reservationTime: 'asc' }],
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

    async count(params?: {
        status?: ReservationStatus;
        tableId?: number;
        reservationDate?: Date;
    }): Promise<number> {
        const { status, tableId, reservationDate } = params || {};
        return prisma.reservation.count({
            where: {
                ...(status && { status }),
                ...(tableId && { tableId }),
                ...(reservationDate && {
                    reservationDate: {
                        gte: new Date(reservationDate.setHours(0, 0, 0, 0)),
                        lt: new Date(reservationDate.setHours(23, 59, 59, 999)),
                    },
                }),
            },
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
