'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
    baseSocketService, 
    orderSocketService, 
    kitchenSocketService, 
    tableSocketService 
} from '@/lib/socket';
import { useAuthStore } from '@/stores/authStore';

interface SocketContextType {
    isConnected: boolean;
    socket: typeof baseSocketService;
    orderSocket: typeof orderSocketService;
    kitchenSocket: typeof kitchenSocketService;
    tableSocket: typeof tableSocketService;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export function SocketProvider({ children }: { children: React.ReactNode }) {
    const [isConnected, setIsConnected] = useState(false);
    const { isAuthenticated, accessToken } = useAuthStore();

    useEffect(() => {
        if (isAuthenticated && accessToken) {
            // Connect all socket services when user is authenticated
            baseSocketService.connect(accessToken);
            orderSocketService.connect(accessToken);
            kitchenSocketService.connect(accessToken);
            tableSocketService.connect(accessToken);
            setIsConnected(true);

            // Check connection status periodically
            const interval = setInterval(() => {
                setIsConnected(baseSocketService.isConnected());
            }, 5000);

            return () => {
                clearInterval(interval);
            };
        } else {
            // Disconnect all socket services when user is not authenticated
            baseSocketService.disconnect();
            orderSocketService.disconnect();
            kitchenSocketService.disconnect();
            tableSocketService.disconnect();
            setIsConnected(false);
        }
    }, [isAuthenticated, accessToken]);

    return (
        <SocketContext.Provider 
            value={{ 
                isConnected, 
                socket: baseSocketService,
                orderSocket: orderSocketService,
                kitchenSocket: kitchenSocketService,
                tableSocket: tableSocketService,
            }}
        >
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
