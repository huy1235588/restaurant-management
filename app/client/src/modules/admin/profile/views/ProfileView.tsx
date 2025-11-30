'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Edit, KeyRound, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ProfileInfoCard } from '../components/ProfileInfoCard';
import { EditProfileDialog } from '../components/EditProfileDialog';
import { ChangePasswordDialog } from '../components/ChangePasswordDialog';
import { useProfile } from '../hooks/useProfile';
import { useAuthStore } from '@/stores/authStore';
import type { ProfileData } from '../types';

export function ProfileView() {
    const { t } = useTranslation();
    const { profile, loading, error, refetch } = useProfile();
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [changePasswordDialogOpen, setChangePasswordDialogOpen] = useState(false);
    const setUser = useAuthStore((state) => state.setUser);

    const handleProfileUpdate = (updatedProfile: ProfileData) => {
        // Update auth store with new profile data
        setUser({
            accountId: updatedProfile.accountId,
            username: updatedProfile.username,
            email: updatedProfile.email,
            fullName: updatedProfile.fullName,
            phoneNumber: updatedProfile.phoneNumber,
            role: updatedProfile.role as 'admin' | 'manager' | 'waiter' | 'chef' | 'cashier',
            isActive: updatedProfile.isActive,
            createdAt: '',
            updatedAt: '',
        });
        // Refetch profile to get latest data
        refetch();
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (error || !profile) {
        return (
            <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                    {error || t('profile.loadError')}
                </AlertDescription>
            </Alert>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">{t('profile.title')}</h1>
                    <p className="text-muted-foreground">{t('profile.pageDescription')}</p>
                </div>
            </div>

            {/* Profile Card */}
            <ProfileInfoCard profile={profile} />

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
                <Button
                    onClick={() => setEditDialogOpen(true)}
                    className="flex items-center gap-2"
                >
                    <Edit className="h-4 w-4" />
                    {t('profile.editProfile')}
                </Button>
                <Button
                    variant="outline"
                    onClick={() => setChangePasswordDialogOpen(true)}
                    className="flex items-center gap-2"
                >
                    <KeyRound className="h-4 w-4" />
                    {t('profile.changePassword')}
                </Button>
            </div>

            {/* Dialogs */}
            <EditProfileDialog
                open={editDialogOpen}
                onOpenChange={setEditDialogOpen}
                profile={profile}
                onSuccess={handleProfileUpdate}
            />

            <ChangePasswordDialog
                open={changePasswordDialogOpen}
                onOpenChange={setChangePasswordDialogOpen}
            />
        </div>
    );
}
