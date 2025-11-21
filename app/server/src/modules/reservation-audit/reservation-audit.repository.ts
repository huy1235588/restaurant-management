import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/database/prisma.service';
import { Prisma, ReservationAudit } from '@prisma/generated/client';

@Injectable()
export class ReservationAuditRepository {
    constructor(private readonly prisma: PrismaService) {}

    async create(
        data: Prisma.ReservationAuditCreateInput,
    ): Promise<ReservationAudit> {
        return this.prisma.reservationAudit.create({ data });
    }

    async findById(auditId: number): Promise<ReservationAudit | null> {
        return this.prisma.reservationAudit.findUnique({
            where: { auditId },
            include: {
                user: {
                    select: {
                        staffId: true,
                        fullName: true,
                    },
                },
                reservation: true,
            },
        });
    }

    async findByReservationId(
        reservationId: number,
    ): Promise<ReservationAudit[]> {
        return this.prisma.reservationAudit.findMany({
            where: { reservationId },
            include: {
                user: {
                    select: {
                        staffId: true,
                        fullName: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    async findAll(options?: {
        where?: Prisma.ReservationAuditWhereInput;
        skip?: number;
        take?: number;
        orderBy?: Prisma.ReservationAuditOrderByWithRelationInput;
    }): Promise<ReservationAudit[]> {
        return this.prisma.reservationAudit.findMany({
            where: options?.where,
            include: {
                user: {
                    select: {
                        staffId: true,
                        fullName: true,
                    },
                },
                reservation: {
                    select: {
                        reservationId: true,
                        reservationCode: true,
                        customerName: true,
                        phoneNumber: true,
                    },
                },
            },
            orderBy: options?.orderBy || { createdAt: 'desc' },
            skip: options?.skip,
            take: options?.take,
        });
    }

    async count(where?: Prisma.ReservationAuditWhereInput): Promise<number> {
        return this.prisma.reservationAudit.count({ where });
    }

    async delete(auditId: number): Promise<ReservationAudit> {
        return this.prisma.reservationAudit.delete({
            where: { auditId },
        });
    }

    async deleteByReservationId(reservationId: number): Promise<number> {
        const result = await this.prisma.reservationAudit.deleteMany({
            where: { reservationId },
        });
        return result.count;
    }
}
