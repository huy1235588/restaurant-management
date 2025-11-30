import { useState, useEffect, useCallback } from 'react';
import { profileApi } from '../services/profile.service';
import type { ProfileData, UpdateProfileData, ChangePasswordData } from '../types';

// Hook to fetch profile data
export function useProfile() {
    const [profile, setProfile] = useState<ProfileData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchProfile = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await profileApi.getProfile();
            setProfile(data);
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to fetch profile';
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchProfile();
    }, [fetchProfile]);

    return { profile, loading, error, refetch: fetchProfile };
}

// Hook for updating profile
export function useUpdateProfile() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const updateProfile = useCallback(async (data: UpdateProfileData): Promise<ProfileData | null> => {
        try {
            setLoading(true);
            setError(null);
            const result = await profileApi.updateProfile(data);
            return result;
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to update profile';
            setError(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    return { updateProfile, loading, error };
}

// Hook for changing password
export function useChangePassword() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const changePassword = useCallback(async (data: ChangePasswordData): Promise<void> => {
        try {
            setLoading(true);
            setError(null);
            await profileApi.changePassword(data);
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to change password';
            setError(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    return { changePassword, loading, error };
}
