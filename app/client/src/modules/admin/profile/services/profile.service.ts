import axiosInstance from '@/lib/axios';
import type { ProfileData, UpdateProfileData, ChangePasswordData } from '../types';

export const profileApi = {
    // Get current user profile
    getProfile: async (): Promise<ProfileData> => {
        const response = await axiosInstance.get('/auth/me');
        return response.data.data;
    },

    // Update profile
    updateProfile: async (data: UpdateProfileData): Promise<ProfileData> => {
        const response = await axiosInstance.put('/auth/profile', data);
        return response.data.data;
    },

    // Change password
    changePassword: async (data: ChangePasswordData): Promise<void> => {
        await axiosInstance.put('/auth/change-password', data);
    },
};
