'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { AxiosError } from 'axios';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuthStore } from '@/stores/authStore';
import { authApi } from '@/services/auth.service';

const loginSchema = z.object({
    username: z.string().min(3, 'Username must be at least 3 characters'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
    const { t } = useTranslation();
    const router = useRouter();
    const { setUser } = useAuthStore();
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            username: '',
            password: '',
        },
    });

    const onSubmit = async (data: LoginFormData) => {
        setIsLoading(true);
        try {
            const response = await authApi.login(data);

            // Save to store
            setUser(response.user);

            toast.success(t('auth.loginSuccess') || 'Login successful!');

            // Redirect based on role
            const roleRedirects: Record<string, string> = {
                admin: '/dashboard',
                manager: '/dashboard',
                waiter: '/orders',
                chef: '/kitchen',
                cashier: '/bills',
            };

            const redirectPath = roleRedirects[response.user.role] || '/dashboard';
            router.push(redirectPath);

        } catch (error: unknown) {
            console.error('Login error:', error);
            let errorMessage = 'Login failed';
            if (error instanceof Error) {
                errorMessage = error.message;
            }
            if (error && typeof error === 'object' && 'response' in error) {
                const axiosError = error as AxiosError<{ message?: string }>;
                errorMessage = axiosError.response?.data?.message || errorMessage;
            }
            toast.error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4">
            <Card className="w-full max-w-md shadow-xl">
                <CardHeader className="space-y-1 text-center">
                    <CardTitle className="text-3xl font-bold tracking-tight">
                        {t('common.appName') || 'Restaurant Management'}
                    </CardTitle>
                    <CardDescription className="text-base">
                        {t('auth.loginSubtitle') || 'Enter your credentials to access your account'}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        {/* Username Field */}
                        <div className="space-y-2">
                            <Label htmlFor="username">
                                {t('auth.username') || 'Username'}
                            </Label>
                            <Input
                                id="username"
                                type="text"
                                placeholder={t('auth.usernamePlaceholder') || 'Enter your username'}
                                autoComplete="username"
                                disabled={isLoading}
                                {...register('username')}
                                className={errors.username ? 'border-red-500' : ''}
                            />
                            {errors.username && (
                                <p className="text-sm text-red-500">{errors.username.message}</p>
                            )}
                        </div>

                        {/* Password Field */}
                        <div className="space-y-2">
                            <Label htmlFor="password">
                                {t('auth.password') || 'Password'}
                            </Label>
                            <div className="relative">
                                <Input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder={t('auth.passwordPlaceholder') || 'Enter your password'}
                                    autoComplete="current-password"
                                    disabled={isLoading}
                                    {...register('password')}
                                    className={errors.password ? 'border-red-500 pr-10' : 'pr-10'}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                                    disabled={isLoading}
                                >
                                    {showPassword ? (
                                        <EyeOff className="h-4 w-4" />
                                    ) : (
                                        <Eye className="h-4 w-4" />
                                    )}
                                </button>
                            </div>
                            {errors.password && (
                                <p className="text-sm text-red-500">{errors.password.message}</p>
                            )}
                        </div>

                        {/* Submit Button */}
                        <Button
                            type="submit"
                            className="w-full"
                            size="lg"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    {t('auth.loggingIn') || 'Logging in...'}
                                </>
                            ) : (
                                t('auth.login') || 'Login'
                            )}
                        </Button>
                    </form>

                    {/* Demo Accounts Info */}
                    <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                        <p className="text-xs text-center text-gray-500 mb-3">Demo Accounts:</p>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                            <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded">
                                <p className="font-semibold">Admin</p>
                                <p className="text-gray-600 dark:text-gray-400">admin / admin123</p>
                            </div>
                            <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded">
                                <p className="font-semibold">Manager</p>
                                <p className="text-gray-600 dark:text-gray-400">manager / manager123</p>
                            </div>
                            <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded">
                                <p className="font-semibold">Waiter</p>
                                <p className="text-gray-600 dark:text-gray-400">waiter / waiter123</p>
                            </div>
                            <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded">
                                <p className="font-semibold">Chef</p>
                                <p className="text-gray-600 dark:text-gray-400">chef / chef123</p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
