'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { socketService } from '@/lib/socket';
import { useAuthStore } from '@/stores/authStore';

interface SocketContextType {
    isConnected: boolean;
    socket: typeof socketService;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export function SocketProvider({ children }: { children: React.ReactNode }) {
    const [isConnected, setIsConnected] = useState(false);
    const { isAuthenticated, accessToken } = useAuthStore();

    useEffect(() => {
        if (isAuthenticated && accessToken) {
            // Connect socket when user is authenticated
            socketService.connect(accessToken);
            setIsConnected(true);

            // Check connection status periodically
            const interval = setInterval(() => {
                setIsConnected(socketService.isConnected());
            }, 5000);

            return () => {
                clearInterval(interval);
            };
        } else {
            // Disconnect socket when user is not authenticated
            socketService.disconnect();
            setIsConnected(false);
        }
    }, [isAuthenticated, accessToken]);

    return (
        <SocketContext.Provider value={{ isConnected, socket: socketService }}>
            {children}
        </SocketContext.Provider>
    );
}

export function useSocket() {
    const context = useContext(SocketContext);
    if (context === undefined) {
        throw new Error('useSocket must be used within a SocketProvider');
    }
    return context;
}
