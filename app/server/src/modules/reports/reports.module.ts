import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';
import { ReportsCacheService } from './reports-cache.service';
import { ReportsExportService } from './reports-export.service';

@Module({
    imports: [
        // Register cache module for reports
        // Uses in-memory cache by default, can be configured for Redis
        CacheModule.register({
            ttl: 300000, // 5 minutes default TTL (in milliseconds)
            max: 100, // Maximum number of items in cache
        }),
    ],
    controllers: [ReportsController],
    providers: [ReportsService, ReportsCacheService, ReportsExportService],
    exports: [ReportsService, ReportsCacheService],
})
export class ReportsModule {}
