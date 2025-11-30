import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DateTimeService } from './utils/datetime.service';

/**
 * Shared Module
 * Provides shared services and utilities across the application
 */
@Global()
@Module({
    imports: [ConfigModule],
    providers: [DateTimeService],
    exports: [DateTimeService],
})
export class SharedModule {}
