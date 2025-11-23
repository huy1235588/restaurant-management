import { Module, forwardRef } from '@nestjs/common';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import { OrderRepository } from './order.repository';
import { OrderGateway } from './order.gateway';
import { WebSocketModule } from '@/shared/websocket';
import { KitchenModule } from '@/modules/kitchen/kitchen.module';

/**
 * Order Module
 * Manages order-related functionality
 */
@Module({
    imports: [WebSocketModule, forwardRef(() => KitchenModule)],
    controllers: [OrderController],
    providers: [OrderService, OrderRepository, OrderGateway],
    exports: [OrderService, OrderRepository],
})
export class OrderModule {}
