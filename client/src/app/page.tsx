'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';

export default function HomePage() {
    const router = useRouter();
    const { user, isAuthenticated, isLoading } = useAuthStore();

    useEffect(() => {
        // Don't redirect while loading - wait for session verification
        if (isLoading) {
            return;
        }

        if (isAuthenticated && user) {
            // Redirect based on role
            const roleRedirects: Record<string, string> = {
                admin: '/dashboard',
                manager: '/dashboard',
                waiter: '/orders',
                chef: '/kitchen',
                bartender: '/bar',
                cashier: '/bills',
            };

            const redirectPath = roleRedirects[user.role] || '/dashboard';
            router.replace(redirectPath);
        } else {
            router.replace('/login');
        }
    }, [isAuthenticated, user, isLoading, router]);

    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 dark:border-gray-100 mx-auto"></div>
                <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
            </div>
        </div>
    );
}
