'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';

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
            <LoadingSpinner size="lg" message="Loading..." />
        </div>
    );
}
