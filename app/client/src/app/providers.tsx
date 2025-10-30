'use client';

import { ThemeProvider } from 'next-themes';
import { Toaster } from 'sonner';
import { SocketProvider } from '@/contexts/SocketContext';
import { AuthProvider } from '@/components/providers/AuthProvider';
import '@/lib/i18n';

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
        >
            <AuthProvider>
                <SocketProvider>
                    {children}
                    <Toaster position="top-right" richColors />
                </SocketProvider>
            </AuthProvider>
        </ThemeProvider>
    );
}
