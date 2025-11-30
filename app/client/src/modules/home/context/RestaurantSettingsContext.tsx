'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { useRestaurantSettings } from '../hooks/useRestaurantSettings';
import { RestaurantInfo, restaurantConfig } from '../config/restaurant.config';

interface RestaurantSettingsContextValue {
    settings: RestaurantInfo;
    loading: boolean;
    error: string | null;
}

const RestaurantSettingsContext = createContext<RestaurantSettingsContextValue>({
    settings: restaurantConfig,
    loading: false,
    error: null,
});

interface RestaurantSettingsProviderProps {
    children: ReactNode;
}

/**
 * Provider component that fetches restaurant settings from API
 * and provides them to all child components via context
 */
export function RestaurantSettingsProvider({ children }: RestaurantSettingsProviderProps) {
    const { settings, loading, error } = useRestaurantSettings();

    return (
        <RestaurantSettingsContext.Provider value={{ settings, loading, error }}>
            {children}
        </RestaurantSettingsContext.Provider>
    );
}

/**
 * Hook to access restaurant settings from context
 * Must be used within a RestaurantSettingsProvider
 */
export function useRestaurantSettingsContext(): RestaurantSettingsContextValue {
    const context = useContext(RestaurantSettingsContext);
    if (!context) {
        throw new Error(
            'useRestaurantSettingsContext must be used within a RestaurantSettingsProvider'
        );
    }
    return context;
}
