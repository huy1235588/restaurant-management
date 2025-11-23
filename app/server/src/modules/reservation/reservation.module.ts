import { Module } from '@nestjs/common';
import { ReservationController } from './reservation.controller';
import { ReservationService } from './reservation.service';
import { ReservationRepository } from './reservation.repository';
import { PrismaService } from '@/database/prisma.service';
import { ReservationAuditModule } from '../reservation-audit';
import { TableModule } from '../table/table.module';
import { OrderModule } from '../order/order.module';

@Module({
    imports: [ReservationAuditModule, TableModule, OrderModule],
    controllers: [ReservationController],
    providers: [ReservationService, ReservationRepository, PrismaService],
    exports: [ReservationService, ReservationRepository],
})
export class ReservationModule {}
