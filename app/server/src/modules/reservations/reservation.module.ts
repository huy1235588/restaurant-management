import { Module } from '@nestjs/common';
import { ReservationController } from './reservation.controller';
import { ReservationService } from './reservation.service';
import { ReservationRepository } from './reservation.repository';

@Module({
    imports: [],
    controllers: [ReservationController],
    providers: [ReservationService, ReservationRepository],
    exports: [ReservationService, ReservationRepository],
})
export class ReservationModule {}
