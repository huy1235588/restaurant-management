import { Module } from '@nestjs/common';
import { RestaurantSettingsController } from './restaurant-settings.controller';
import { RestaurantSettingsService } from './restaurant-settings.service';
import { RestaurantSettingsRepository } from './restaurant-settings.repository';

@Module({
    controllers: [RestaurantSettingsController],
    providers: [RestaurantSettingsService, RestaurantSettingsRepository],
    exports: [RestaurantSettingsService],
})
export class RestaurantSettingsModule {}
