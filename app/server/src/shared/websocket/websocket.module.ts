import { Module } from '@nestjs/common';
import { SocketEmitterService } from './socket-emitter.service';

@Module({
    providers: [SocketEmitterService],
    exports: [SocketEmitterService],
})
export class WebSocketModule {}
