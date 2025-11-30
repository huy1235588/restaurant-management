'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { updateProfileSchema, type UpdateProfileFormValues } from '../utils/validation';
import { useUpdateProfile } from '../hooks/useProfile';
import type { ProfileData, UpdateProfileData } from '../types';

interface EditProfileDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    profile: ProfileData;
    onSuccess: (data: ProfileData) => void;
}

export function EditProfileDialog({
    open,
    onOpenChange,
    profile,
    onSuccess,
}: EditProfileDialogProps) {
    const { t } = useTranslation();
    const { updateProfile, loading } = useUpdateProfile();

    const form = useForm<UpdateProfileFormValues>({
        resolver: zodResolver(updateProfileSchema),
        defaultValues: {
            email: profile.email,
            phoneNumber: profile.phoneNumber,
            fullName: profile.fullName,
            address: profile.address || '',
        },
    });

    // Reset form when dialog opens
    useEffect(() => {
        if (open) {
            form.reset({
                email: profile.email,
                phoneNumber: profile.phoneNumber,
                fullName: profile.fullName,
                address: profile.address || '',
            });
        }
    }, [open, profile, form]);

    const onSubmit = async (data: UpdateProfileFormValues) => {
        try {
            // Filter out empty values
            const updateData: UpdateProfileData = {};
            if (data.email && data.email !== profile.email) {
                updateData.email = data.email;
            }
            if (data.phoneNumber && data.phoneNumber !== profile.phoneNumber) {
                updateData.phoneNumber = data.phoneNumber;
            }
            if (data.fullName && data.fullName !== profile.fullName) {
                updateData.fullName = data.fullName;
            }
            if (data.address !== undefined && data.address !== (profile.address || '')) {
                updateData.address = data.address;
            }

            // Check if there are any changes
            if (Object.keys(updateData).length === 0) {
                toast.info(t('profile.noChanges'));
                onOpenChange(false);
                return;
            }

            const result = await updateProfile(updateData);
            if (result) {
                toast.success(t('profile.profileUpdated'));
                onSuccess(result);
                onOpenChange(false);
            }
        } catch {
            // Error is handled by the hook and axios interceptor
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{t('profile.editProfile')}</DialogTitle>
                    <DialogDescription>
                        {t('profile.editProfileDescription')}
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t('staff.email')}</FormLabel>
                                    <FormControl>
                                        <Input
                                            {...field}
                                            type="email"
                                            placeholder={t('staff.emailPlaceholder')}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="phoneNumber"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t('staff.phoneNumber')}</FormLabel>
                                    <FormControl>
                                        <Input
                                            {...field}
                                            placeholder={t('staff.phoneNumberPlaceholder')}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="fullName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t('staff.fullName')}</FormLabel>
                                    <FormControl>
                                        <Input
                                            {...field}
                                            placeholder={t('staff.fullNamePlaceholder')}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="address"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t('staff.address')}</FormLabel>
                                    <FormControl>
                                        <Input
                                            {...field}
                                            placeholder={t('staff.addressPlaceholder')}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => onOpenChange(false)}
                                disabled={loading}
                            >
                                {t('common.cancel')}
                            </Button>
                            <Button type="submit" disabled={loading}>
                                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {t('common.save')}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
