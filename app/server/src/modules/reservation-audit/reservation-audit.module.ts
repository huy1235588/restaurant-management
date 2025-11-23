import { Module } from '@nestjs/common';
import { ReservationAuditController } from './reservation-audit.controller';
import { ReservationAuditService } from './reservation-audit.service';
import { ReservationAuditRepository } from './reservation-audit.repository';
import { PrismaService } from '@/database/prisma.service';

@Module({
    controllers: [ReservationAuditController],
    providers: [
        ReservationAuditService,
        ReservationAuditRepository,
        PrismaService,
    ],
    exports: [ReservationAuditService, ReservationAuditRepository],
})
export class ReservationAuditModule {}
