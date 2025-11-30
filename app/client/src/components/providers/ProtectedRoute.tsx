'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { UserRole } from '@/types';

interface ProtectedRouteProps {
    children: React.ReactNode;
    allowedRoles?: UserRole[];
    fallbackPath?: string;
}

export function ProtectedRoute({ 
    children, 
    allowedRoles, 
    fallbackPath = '/admin/dashboard' 
}: ProtectedRouteProps) {
    const router = useRouter();
    const { user, isAuthenticated, isLoading } = useAuthStore();

    useEffect(() => {
        if (!isLoading) {
            // Not authenticated
            if (!isAuthenticated) {
                router.push('/login');
                return;
            }

            // Check role-based access
            if (allowedRoles && user) {
                if (!allowedRoles.includes(user.role)) {
                    router.push(fallbackPath);
                }
            }
        }
    }, [isAuthenticated, isLoading, user, allowedRoles, fallbackPath, router]);

    // Show loading state
    if (isLoading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <div className="text-center">
                    <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Verifying access...</p>
                </div>
            </div>
        );
    }

    // Not authenticated
    if (!isAuthenticated) {
        return null;
    }

    // Check role access
    if (allowedRoles && user && !allowedRoles.includes(user.role)) {
        return null;
    }

    return <>{children}</>;
}
