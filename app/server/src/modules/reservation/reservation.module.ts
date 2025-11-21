import { Module } from '@nestjs/common';
import { ReservationController } from './reservation.controller';
import { ReservationService } from './reservation.service';
import { ReservationRepository } from './reservation.repository';
import { PrismaService } from '@/database/prisma.service';
import { ReservationAuditModule } from '../reservation-audit';
import { TableModule } from '../table/table.module';

@Module({
    imports: [ReservationAuditModule, TableModule],
    controllers: [ReservationController],
    providers: [ReservationService, ReservationRepository, PrismaService],
    exports: [ReservationService, ReservationRepository],
})
export class ReservationModule {}
