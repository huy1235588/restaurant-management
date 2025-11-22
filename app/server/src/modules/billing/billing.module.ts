import { Module } from '@nestjs/common';
import { BillingController } from './billing.controller';
import { BillingService } from './billing.service';
import { BillRepository } from './bill.repository';
import { PaymentRepository } from './payment.repository';

@Module({
    imports: [],
    controllers: [BillingController],
    providers: [BillingService, BillRepository, PaymentRepository],
    exports: [BillingService, BillRepository],
})
export class BillingModule {}
