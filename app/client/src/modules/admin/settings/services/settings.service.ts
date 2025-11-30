import axiosInstance from '@/lib/axios';
import { ApiResponse } from '@/types';
import { RestaurantSettings, UpdateRestaurantSettingsDto } from '../types';

export const settingsApi = {
    /**
     * Get restaurant settings (public)
     */
    getSettings: async (): Promise<RestaurantSettings | null> => {
        const response = await axiosInstance.get<ApiResponse<RestaurantSettings>>(
            '/restaurant-settings'
        );
        return response.data.data;
    },

    /**
     * Update restaurant settings (admin/manager only)
     */
    updateSettings: async (data: UpdateRestaurantSettingsDto): Promise<RestaurantSettings> => {
        const response = await axiosInstance.put<ApiResponse<RestaurantSettings>>(
            '/restaurant-settings',
            data
        );
        return response.data.data;
    },
};
