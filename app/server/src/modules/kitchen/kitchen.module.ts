import { Module } from '@nestjs/common';
import { KitchenController } from './kitchen.controller';
import { KitchenService } from './kitchen.service';
import { KitchenRepository } from './kitchen.repository';
import { KitchenGateway } from './kitchen.gateway';
import { WebSocketModule } from '@/shared/websocket';

@Module({
    imports: [WebSocketModule],
    controllers: [KitchenController],
    providers: [KitchenService, KitchenRepository, KitchenGateway],
    exports: [KitchenService, KitchenRepository, KitchenGateway],
})
export class KitchenModule {}
