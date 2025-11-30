import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/database/prisma.service';
import { Prisma, RestaurantSettings } from '@/lib/prisma';

@Injectable()
export class RestaurantSettingsRepository {
    constructor(private readonly prisma: PrismaService) {}

    /**
     * Get the restaurant settings (single row, id = 1)
     */
    async getSettings(): Promise<RestaurantSettings | null> {
        return this.prisma.restaurantSettings.findUnique({
            where: { id: 1 },
        });
    }

    /**
     * Upsert settings - create if not exists, update if exists
     */
    async upsertSettings(
        data: Prisma.RestaurantSettingsUpdateInput,
    ): Promise<RestaurantSettings> {
        return this.prisma.restaurantSettings.upsert({
            where: { id: 1 },
            update: data,
            create: {
                id: 1,
                name: (data.name as string) || 'Restaurant Name',
                tagline: data.tagline as string | undefined,
                description: data.description as string | undefined,
                aboutTitle: data.aboutTitle as string | undefined,
                aboutContent: data.aboutContent as string | undefined,
                address: data.address as string | undefined,
                phone: data.phone as string | undefined,
                email: data.email as string | undefined,
                mapEmbedUrl: data.mapEmbedUrl as string | undefined,
                heroImage: data.heroImage as string | undefined,
                aboutImage: data.aboutImage as string | undefined,
                logoUrl: data.logoUrl as string | undefined,
                operatingHours: data.operatingHours as Prisma.InputJsonValue,
                socialLinks: data.socialLinks as Prisma.InputJsonValue,
                highlights: data.highlights as Prisma.InputJsonValue,
            },
        });
    }
}
