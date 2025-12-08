'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { authApi } from '@/services/auth.service';
import { UserRole, LoginCredentials } from '@/types';
import { AxiosError } from 'axios';

export function useAuth(requiredRole?: UserRole | UserRole[]) {
    const router = useRouter();
    const {
        user,
        isAuthenticated,
        isLoading,
        setAuth,
        setUser,
        clearAuth,
        logout: logoutStore,
        setLoading,
    } = useAuthStore();

    // Check role-based access after auth is verified
    useEffect(() => {
        // Wait for auth to be loaded
        if (isLoading) {
            return;
        }

        // Check if authenticated
        if (!isAuthenticated) {
            return; // AuthProvider will handle redirect
        }

        // Check role-based access
        if (requiredRole && user) {
            const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];

            if (!roles.includes(user.role)) {
                // User doesn't have required role, redirect to admin dashboard
                router.push('/admin/dashboard');
            }
        }
    }, [requiredRole, user, isAuthenticated, isLoading, router]);

    // Login function
    const login = async (credentials: LoginCredentials) => {
        try {
            setLoading(true);
            const response = await authApi.login(credentials);

            if (response.user && response.accessToken) {
                // Save user and access token to memory
                // Refresh token is in HttpOnly cookie
                setAuth(response.user, response.accessToken);
                return { success: true, user: response.user };
            }

            throw new Error('Invalid response from server');
        } catch (error: unknown) {
            console.error('Login error:', error);
            let errorMessage = 'Login failed';
            if (error instanceof Error) {
                errorMessage = error.message;
            }
            if (error && typeof error === 'object' && 'response' in error) {
                const axiosError = error as AxiosError<{ message?: string | string[] }>;

                // Normalize error message: prefer string, fallback to first entry if array
                const responseMessage = axiosError.response?.data?.message;
                if (Array.isArray(responseMessage)) {
                    errorMessage = responseMessage[0] || errorMessage;
                } else if (typeof responseMessage === 'string') {
                    errorMessage = responseMessage;
                }

                // Explicitly map 401 invalid credentials to a consistent message key
                if (axiosError.response?.status === 401 && errorMessage === 'Invalid username or password') {
                    errorMessage = 'Invalid username or password';
                }
            }
            return {
                success: false,
                error: errorMessage
            };
        } finally {
            setLoading(false);
        }
    };

    // Logout function
    const logout = async () => {
        try {
            await authApi.logout();
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            // Clear store once (avoid duplicate clears)
            logoutStore();
            // Use replace to avoid leaving login in history
            router.replace('/login');
        }
    };

    // Logout from all devices
    const logoutAll = async () => {
        try {
            await authApi.logoutAll();
        } catch (error) {
            console.error('Logout all error:', error);
        } finally {
            // Clear store once (avoid duplicate clears)
            logoutStore();
            router.replace('/login');
        }
    };

    // Refresh user info
    const refreshUser = async () => {
        try {
            const userData = await authApi.me();
            setUser(userData);
            return userData;
        } catch (error) {
            console.error('Refresh user error:', error);
            return null;
        }
    };

    // Check if user has role
    const hasRole = (...roles: UserRole[]) => {
        if (!user) return false;
        return roles.includes(user.role);
    };

    // Check if user has permission for route (admin section only)
    const canAccessRoute = (route: string) => {
        if (!user) return false;

        // Role-based access for admin routes
        const roleRoutes: Record<string, string[]> = {
            admin: ['*'],
            manager: ['/admin/dashboard', '/admin/orders', '/admin/menu', '/admin/tables', '/admin/reservations', '/admin/bills', '/admin/staff', '/admin/reports', '/admin/kitchen', '/admin/categories'],
            waiter: ['/admin/dashboard', '/admin/orders', '/admin/menu', '/admin/tables', '/admin/reservations'],
            chef: ['/admin/kitchen', '/admin/orders', '/admin/menu'],
            cashier: ['/admin/dashboard', '/admin/orders', '/admin/bills'],
        };

        const allowedRoutes = roleRoutes[user.role] || [];

        if (allowedRoutes.includes('*')) return true;

        return allowedRoutes.some(allowedRoute => route.startsWith(allowedRoute));
    };

    return {
        user,
        isAuthenticated,
        isLoading,
        login,
        logout,
        logoutAll,
        refreshUser,
        hasRole,
        canAccessRoute,
    };
}

export function useAuthActions() {
    const { setAuth, logout: logoutStore } = useAuthStore();
    const router = useRouter();

    const login = async (username: string, password: string) => {
        try {
            const response = await authApi.login({ username, password });
            // Only pass user and accessToken, refreshToken is in HttpOnly cookie
            setAuth(response.user, response.accessToken);
            return response;
        } catch (error) {
            throw error;
        }
    };

    const logout = async () => {
        try {
            await authApi.logout();
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            logoutStore();
            router.replace('/login');
        }
    };

    return {
        login,
        logout,
    };
}
