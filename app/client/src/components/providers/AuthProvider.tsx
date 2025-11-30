'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { authApi } from '@/services/auth.service';

interface AuthProviderProps {
    children: React.ReactNode;
}

// Public paths that don't require authentication (customer-facing pages)
const publicPaths = [
    '/login',
    '/register',
    '/menu',
    '/reservation',
    '/about',
    '/contact',
    '/health',
];

// Check if pathname is a public route
function isPublicRoute(pathname: string): boolean {
    // Root path is always public
    if (pathname === '/') return true;
    
    // Check if pathname matches any public path
    return publicPaths.some(path => 
        pathname === path || pathname.startsWith(path + '/')
    );
}

// Check if pathname is an admin route (requires authentication)
function isAdminRoute(pathname: string): boolean {
    return pathname.startsWith('/admin');
}

export function AuthProvider({ children }: AuthProviderProps) {
    const pathname = usePathname();
    const router = useRouter();
    const { isAuthenticated, isLoading, setAuth, clearAuth, setLoading } = useAuthStore();
    const hasCheckedAuth = useRef(false);

    useEffect(() => {
        const isPublic = isPublicRoute(pathname);
        const isAdmin = isAdminRoute(pathname);

        // For public routes, don't do anything - just render children
        if (isPublic && !isAdmin) {
            // Optionally check auth silently in background (only once)
            if (!hasCheckedAuth.current) {
                hasCheckedAuth.current = true;
                authApi.me()
                    .then(user => setAuth(user, ''))
                    .catch(() => clearAuth());
            }
            return;
        }

        // For admin routes, check authentication
        if (isAdmin) {
            // If already checked and authenticated, skip
            if (hasCheckedAuth.current && isAuthenticated) {
                return;
            }

            const checkAuth = async () => {
                try {
                    setLoading(true);
                    const user = await authApi.me();
                    setAuth(user, '');
                    hasCheckedAuth.current = true;
                } catch {
                    clearAuth();
                    hasCheckedAuth.current = true;
                    router.push('/login');
                } finally {
                    setLoading(false);
                }
            };

            checkAuth();
        }
    }, [pathname, isAuthenticated, router, setAuth, clearAuth, setLoading]);

    // Only show loading state for admin routes
    if (isLoading && isAdminRoute(pathname)) {
        return (
            <div className="flex h-screen items-center justify-center">
                <div className="text-center">
                    <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Loading...</p>
                </div>
            </div>
        );
    }

    return <>{children}</>;
}
