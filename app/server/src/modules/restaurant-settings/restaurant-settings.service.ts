import { Injectable, Logger } from '@nestjs/common';
import { RestaurantSettingsRepository } from './restaurant-settings.repository';
import { UpdateRestaurantSettingsDto } from './dto';
import { Prisma } from '@/lib/prisma';

@Injectable()
export class RestaurantSettingsService {
    private readonly logger = new Logger(RestaurantSettingsService.name);

    constructor(
        private readonly settingsRepository: RestaurantSettingsRepository,
    ) {}

    /**
     * Get restaurant settings
     * Returns null if no settings exist
     */
    async getSettings() {
        const settings = await this.settingsRepository.getSettings();
        return settings;
    }

    /**
     * Update restaurant settings
     * Creates settings if they don't exist
     */
    async updateSettings(dto: UpdateRestaurantSettingsDto) {
        const settings = await this.settingsRepository.upsertSettings({
            name: dto.name,
            tagline: dto.tagline,
            description: dto.description,
            aboutTitle: dto.aboutTitle,
            aboutContent: dto.aboutContent,
            address: dto.address,
            phone: dto.phone,
            email: dto.email,
            mapEmbedUrl: dto.mapEmbedUrl,
            heroImage: dto.heroImage,
            aboutImage: dto.aboutImage,
            logoUrl: dto.logoUrl,
            operatingHours:
                dto.operatingHours as unknown as Prisma.InputJsonValue,
            socialLinks: dto.socialLinks as unknown as Prisma.InputJsonValue,
            highlights: dto.highlights as unknown as Prisma.InputJsonValue,
            bankConfig: dto.bankConfig as unknown as Prisma.InputJsonValue,
        });

        this.logger.log('Restaurant settings updated successfully');
        return settings;
    }
}
