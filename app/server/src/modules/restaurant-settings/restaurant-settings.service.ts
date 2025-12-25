import { Injectable, Logger } from '@nestjs/common';
import { RestaurantSettingsRepository } from './restaurant-settings.repository';
import { UpdateRestaurantSettingsDto } from './dto';
import { StorageService } from '@/modules/storage/storage.service';
import { Prisma } from '@/lib/prisma';

@Injectable()
export class RestaurantSettingsService {
    private readonly logger = new Logger(RestaurantSettingsService.name);

    constructor(
        private readonly settingsRepository: RestaurantSettingsRepository,
        private readonly storageService: StorageService,
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
     * Deletes old images from storage when images are updated
     */
    async updateSettings(dto: UpdateRestaurantSettingsDto) {
        // Delete old images if they changed and new ones are different
        if (dto.oldLogoUrl && dto.logoUrl !== dto.oldLogoUrl) {
            this.deleteOldImage(dto.oldLogoUrl);
        }
        if (dto.oldHeroImage && dto.heroImage !== dto.oldHeroImage) {
            this.deleteOldImage(dto.oldHeroImage);
        }
        if (dto.oldAboutImage && dto.aboutImage !== dto.oldAboutImage) {
            this.deleteOldImage(dto.oldAboutImage);
        }

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

    /**
     * Delete old image from storage (background task)
     * Logs errors but doesn't throw to avoid blocking updates
     */
    private deleteOldImage(imagePath: string) {
        this.storageService.deleteFile(imagePath)
            .catch((err) => {
                this.logger.warn(
                    `Failed to delete old image "${imagePath}":`,
                    err.message
                );
                // Don't throw - file might already be deleted or be external
            });
    }
}
