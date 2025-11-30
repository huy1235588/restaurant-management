import { useState, useEffect, useCallback } from 'react';
import { settingsApi } from '../services';
import { RestaurantSettings, UpdateRestaurantSettingsDto } from '../types';

/**
 * Hook to fetch and manage restaurant settings
 */
export function useSettings() {
    const [settings, setSettings] = useState<RestaurantSettings | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchSettings = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await settingsApi.getSettings();
            setSettings(data);
        } catch (err: unknown) {
            const errorMessage = err instanceof Error 
                ? err.message 
                : 'Failed to fetch settings';
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchSettings();
    }, [fetchSettings]);

    return { settings, loading, error, refetch: fetchSettings };
}

/**
 * Hook to update restaurant settings
 */
export function useUpdateSettings() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const updateSettings = async (
        data: UpdateRestaurantSettingsDto
    ): Promise<RestaurantSettings | null> => {
        try {
            setLoading(true);
            setError(null);
            const result = await settingsApi.updateSettings(data);
            return result;
        } catch (err: unknown) {
            const errorMessage = err instanceof Error
                ? err.message
                : 'Failed to update settings';
            setError(errorMessage);
            throw new Error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return { updateSettings, loading, error };
}
