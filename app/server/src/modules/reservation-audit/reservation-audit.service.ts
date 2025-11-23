import { Injectable } from '@nestjs/common';
import { Prisma, ReservationAudit } from '@prisma/generated/client';
import { ReservationAuditRepository } from './reservation-audit.repository';

@Injectable()
export class ReservationAuditService {
    constructor(private readonly repository: ReservationAuditRepository) {}

    async create(
        reservationId: number,
        action: string,
        userId?: number,
        changes?: Record<string, unknown>,
    ): Promise<ReservationAudit> {
        const auditData: Prisma.ReservationAuditCreateInput = {
            reservation: { connect: { reservationId } },
            action,
            changes: (changes || {}) as Prisma.InputJsonValue,
            ...(userId && { user: { connect: { staffId: userId } } }),
        };

        return this.repository.create(auditData);
    }

    async findByReservationId(
        reservationId: number,
    ): Promise<ReservationAudit[]> {
        return this.repository.findByReservationId(reservationId);
    }

    async findById(auditId: number): Promise<ReservationAudit | null> {
        return this.repository.findById(auditId);
    }

    async findAll(options?: {
        skip?: number;
        take?: number;
        userId?: number;
        startDate?: Date;
        endDate?: Date;
    }): Promise<{ data: ReservationAudit[]; total: number }> {
        const where: Prisma.ReservationAuditWhereInput = {};

        if (options?.userId) {
            where.userId = options.userId;
        }

        if (options?.startDate || options?.endDate) {
            where.createdAt = {};
            if (options.startDate) {
                where.createdAt.gte = options.startDate;
            }
            if (options.endDate) {
                where.createdAt.lte = options.endDate;
            }
        }

        const [data, total] = await Promise.all([
            this.repository.findAll({
                where,
                skip: options?.skip,
                take: options?.take,
            }),
            this.repository.count(where),
        ]);

        return { data, total };
    }
}
