import { useMemo } from 'react';
import { useSidebar } from '@/components/ui/sidebar';

export interface ResponsiveGridConfig {
    gridCols: string;
    gap: string;
    cardSize: 'sm' | 'md' | 'lg';
    padding: string;
}

export function useSidebarResponsive(): ResponsiveGridConfig {
    const { state } = useSidebar();

    return useMemo(() => {
        if (state === 'collapsed') {
            // Sidebar collapsed (icon mode) - maximize available space
            return {
                // More columns when sidebar is narrow
                gridCols: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-6',
                gap: 'gap-3',
                cardSize: 'md',
                padding: 'px-4 py-3',
            };
        } else {
            // Sidebar expanded - standard layout
            return {
                // Standard columns with expanded sidebar
                gridCols: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
                gap: 'gap-4',
                cardSize: 'lg',
                padding: 'px-4 py-4',
            };
        }
    }, [state]);
}

export function useContainerPadding() {
    const { state } = useSidebar();

    return useMemo(() => {
        if (state === 'collapsed') {
            return 'p-3 sm:p-4 md:p-5 lg:p-6';
        } else {
            return 'p-4 sm:p-6 md:p-6 lg:p-8';
        }
    }, [state]);
}
