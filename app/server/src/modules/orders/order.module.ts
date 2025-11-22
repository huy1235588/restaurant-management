import { Module, forwardRef } from '@nestjs/common';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import { OrderRepository } from './order.repository';
import { OrderItemRepository } from './order-item.repository';
import { KitchenModule } from '@/modules/kitchen/kitchen.module';

@Module({
    imports: [forwardRef(() => KitchenModule)],
    controllers: [OrderController],
    providers: [OrderService, OrderRepository, OrderItemRepository],
    exports: [OrderService, OrderRepository],
})
export class OrderModule {}
