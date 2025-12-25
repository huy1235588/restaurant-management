import { Module } from '@nestjs/common';
import { RestaurantSettingsController } from './restaurant-settings.controller';
import { RestaurantSettingsService } from './restaurant-settings.service';
import { RestaurantSettingsRepository } from './restaurant-settings.repository';
import { StorageModule } from '@/modules/storage/storage.module';

@Module({
    imports: [StorageModule],
    controllers: [RestaurantSettingsController],
    providers: [RestaurantSettingsService, RestaurantSettingsRepository],
    exports: [RestaurantSettingsService],
})
export class RestaurantSettingsModule {}
