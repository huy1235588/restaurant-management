'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { AxiosError } from 'axios';
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
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { changePasswordSchema, type ChangePasswordFormValues } from '../utils/validation';
import { useChangePassword } from '../hooks/useProfile';

interface ChangePasswordDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function ChangePasswordDialog({
    open,
    onOpenChange,
}: ChangePasswordDialogProps) {
    const { t } = useTranslation();
    const { changePassword, loading } = useChangePassword();
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const form = useForm<ChangePasswordFormValues>({
        resolver: zodResolver(changePasswordSchema),
        defaultValues: {
            currentPassword: '',
            newPassword: '',
            confirmPassword: '',
        },
    });

    // Reset form when dialog opens
    useEffect(() => {
        if (open) {
            form.reset({
                currentPassword: '',
                newPassword: '',
                confirmPassword: '',
            });
            setShowCurrentPassword(false);
            setShowNewPassword(false);
            setShowConfirmPassword(false);
        }
    }, [open, form]);

    const onSubmit = async (data: ChangePasswordFormValues) => {
        try {
            await changePassword({
                currentPassword: data.currentPassword,
                newPassword: data.newPassword,
            });
            toast.success(t('profile.passwordChanged'));
            onOpenChange(false);
        } catch (err) {
            // Handle error and show toast
            if (err instanceof AxiosError && err.response?.data) {
                const message = err.response.data.message;
                const errorMessage = Array.isArray(message) ? message[0] : message;
                toast.error(errorMessage || t('profile.passwordChangeFailed'));
            } else {
                toast.error(t('profile.passwordChangeFailed'));
            }
        }
    };

    const PasswordToggle = ({
        show,
        onToggle,
    }: {
        show: boolean;
        onToggle: () => void;
    }) => (
        <Button
            type="button"
            variant="ghost"
            size="sm"
            tabIndex={-1}
            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
            onClick={onToggle}
        >
            {show ? (
                <EyeOff className="h-4 w-4 text-muted-foreground" />
            ) : (
                <Eye className="h-4 w-4 text-muted-foreground" />
            )}
        </Button>
    );

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{t('profile.changePassword')}</DialogTitle>
                    <DialogDescription>
                        {t('profile.changePasswordDescription')}
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="currentPassword"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t('profile.currentPassword')} *</FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <Input
                                                {...field}
                                                type={showCurrentPassword ? 'text' : 'password'}
                                                placeholder="••••••••"
                                                className="pr-10"
                                            />
                                            <PasswordToggle
                                                show={showCurrentPassword}
                                                onToggle={() => setShowCurrentPassword(!showCurrentPassword)}
                                            />
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="newPassword"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t('profile.newPassword')} *</FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <Input
                                                {...field}
                                                type={showNewPassword ? 'text' : 'password'}
                                                placeholder="••••••••"
                                                className="pr-10"
                                            />
                                            <PasswordToggle
                                                show={showNewPassword}
                                                onToggle={() => setShowNewPassword(!showNewPassword)}
                                            />
                                        </div>
                                    </FormControl>
                                    <FormDescription>
                                        {t('profile.passwordHint')}
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="confirmPassword"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t('profile.confirmPassword')} *</FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <Input
                                                {...field}
                                                type={showConfirmPassword ? 'text' : 'password'}
                                                placeholder="••••••••"
                                                className="pr-10"
                                            />
                                            <PasswordToggle
                                                show={showConfirmPassword}
                                                onToggle={() => setShowConfirmPassword(!showConfirmPassword)}
                                            />
                                        </div>
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
                                {t('profile.changePassword')}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
