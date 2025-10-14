'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { authApi } from '@/services/auth.service';

interface AuthProviderProps {
    children: React.ReactNode;
}

const publicPaths = ['/login', '/register', '/'];

export function AuthProvider({ children }: AuthProviderProps) {
    const pathname = usePathname();
    const router = useRouter();
    const { isAuthenticated, isLoading, setAuth, clearAuth, setLoading } = useAuthStore();

    useEffect(() => {
        let mounted = true;

        const checkAuth = async () => {
            const isPublicPath = publicPaths.some(path => pathname === path || pathname.startsWith(path + '/'));

            try {
                setLoading(true);
                
                // Always verify session with server (using HttpOnly cookie)
                const user = await authApi.me();
                
                if (mounted) {
                    // User has valid session, update store
                    setAuth(user, ''); // Access token is in cookie
                    setLoading(false);
                }
            } catch (error) {
                // Session invalid or no session
                if (mounted) {
                    clearAuth();
                    setLoading(false);
                    
                    // Redirect to login if not on public path
                    if (!isPublicPath) {
                        router.push('/login');
                    }
                }
            }
        };

        checkAuth();

        return () => {
            mounted = false;
        };
    }, []); // Run once on mount

    // Show loading state
    if (isLoading && !publicPaths.some(path => pathname === path)) {
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
