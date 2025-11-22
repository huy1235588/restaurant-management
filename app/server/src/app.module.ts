import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { ScheduleModule } from '@nestjs/schedule';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from '@/app.controller';
import { AppService } from '@/app.service';
import { DatabaseModule } from '@/database/database.module';
import { AuthModule } from '@/modules/auth/auth.module';
import { StaffModule } from '@/modules/staff/staff.module';
import { CategoryModule } from '@/modules/category/category.module';
import { MenuModule } from '@/modules/menu/menu.module';
import { StorageModule } from '@/modules/storage/storage.module';
import { TableModule } from '@/modules/table/table.module';
import { ReservationModule } from '@/modules/reservation/reservation.module';
import { ReservationAuditModule } from '@/modules/reservation-audit';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import configuration from '@/config/configuration';
import { OrderModule } from '@/modules/order/order.module';
import { ReportModule } from '@/modules/report/report.module';

@Module({
    imports: [
        // Global configuration
        ConfigModule.forRoot({
            isGlobal: true,
            load: [configuration],
            envFilePath: '.env',
        }),
        // Rate limiting
        ThrottlerModule.forRoot([
            {
                ttl: 900000, // 15 minutes
                limit: 100,
            },
        ]),
        // Scheduled tasks
        ScheduleModule.forRoot(),
        // Database
        DatabaseModule,
        // Auth
        AuthModule,
        // Staff
        StaffModule,
        // Category
        CategoryModule,
        // Menu
        MenuModule,
        // Storage
        StorageModule,
        // Table
        TableModule,
        // Reservation
        ReservationModule,
        // Reservation Audit
        ReservationAuditModule,
        // Order
        OrderModule,
        // Report
        ReportModule,
    ],
    controllers: [AppController],
    providers: [
        AppService,
        // Global JWT auth guard
        {
            provide: APP_GUARD,
            useClass: JwtAuthGuard,
        },
    ],
})
export class AppModule {}
