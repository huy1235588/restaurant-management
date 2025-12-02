import { Module, forwardRef } from '@nestjs/common';
import { BillingController } from './billing.controller';
import { BillingService } from './billing.service';
import { BillRepository } from './bill.repository';
import { PaymentRepository } from './payment.repository';
import { ReportsModule } from '../reports/reports.module';
import { KitchenModule } from '../kitchen/kitchen.module';
import { WebSocketModule } from '@/shared/websocket';

@Module({
    imports: [
        forwardRef(() => ReportsModule),
        KitchenModule,
        WebSocketModule,
    ],
    controllers: [BillingController],
    providers: [BillingService, BillRepository, PaymentRepository],
    exports: [BillingService, BillRepository],
})
export class BillingModule {}
