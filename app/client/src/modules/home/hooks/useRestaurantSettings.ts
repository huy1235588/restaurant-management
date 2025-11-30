'use client';

import { useState, useEffect, useMemo } from 'react';
import { homeApi } from '../services/home.service';
import { restaurantConfig, RestaurantInfo } from '../config/restaurant.config';
import { getImageUrl } from '@/lib/utils';
import type { RestaurantSettingsApiResponse } from '../types';

interface UseRestaurantSettingsReturn {
    settings: RestaurantInfo;
    loading: boolean;
    error: string | null;
}

/**
 * Hook to fetch restaurant settings from API
 * Falls back to static config if API fails or returns no data
 */
export function useRestaurantSettings(): UseRestaurantSettingsReturn {
    const [apiSettings, setApiSettings] = useState<RestaurantSettingsApiResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let mounted = true;

        const fetchSettings = async () => {
            try {
                setLoading(true);
                setError(null);
                const data = await homeApi.getRestaurantSettings();
                if (mounted) {
                    setApiSettings(data);
                }
            } catch (err) {
                if (mounted) {
                    setError('Failed to fetch restaurant settings');
                    console.error('Error fetching restaurant settings:', err);
                }
            } finally {
                if (mounted) {
                    setLoading(false);
                }
            }
        };

        fetchSettings();

        return () => {
            mounted = false;
        };
    }, []);

    // Merge API settings with static config, with API taking precedence
    const settings = useMemo<RestaurantInfo>(() => {
        if (!apiSettings) {
            return restaurantConfig;
        }

        return {
            name: apiSettings.name || restaurantConfig.name,
            tagline: apiSettings.tagline || restaurantConfig.tagline,
            description: apiSettings.description || restaurantConfig.description,
            about: {
                title: apiSettings.aboutTitle || restaurantConfig.about.title,
                paragraphs: apiSettings.aboutContent
                    ? apiSettings.aboutContent.split('\n\n').filter(p => p.trim())
                    : restaurantConfig.about.paragraphs,
                highlights: apiSettings.highlights.length > 0
                    ? apiSettings.highlights
                    : restaurantConfig.about.highlights,
            },
            contact: {
                address: apiSettings.address || restaurantConfig.contact.address,
                phone: apiSettings.phone || restaurantConfig.contact.phone,
                email: apiSettings.email || restaurantConfig.contact.email,
                mapEmbedUrl: apiSettings.mapEmbedUrl || restaurantConfig.contact.mapEmbedUrl,
            },
            operatingHours: apiSettings.operatingHours.length > 0
                ? apiSettings.operatingHours
                : restaurantConfig.operatingHours,
            socialLinks: apiSettings.socialLinks.length > 0
                ? apiSettings.socialLinks
                : restaurantConfig.socialLinks,
            heroImage: getImageUrl(apiSettings.heroImage) || restaurantConfig.heroImage,
            aboutImage: getImageUrl(apiSettings.aboutImage) || restaurantConfig.aboutImage,
            logoUrl: getImageUrl(apiSettings.logoUrl),
        };
    }, [apiSettings]);

    return { settings, loading, error };
}
