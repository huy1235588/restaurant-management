import { useQuery } from '@tanstack/react-query';
import { tableApi } from '../services/table.service';
import { TableQueryOptions } from '@/types';

/**
 * Hook to fetch all tables with pagination and filters
 */
export const useTables = (options?: TableQueryOptions) => {
    return useQuery({
        queryKey: ['tables', options],
        queryFn: () => tableApi.getAll(options?.filters),
        staleTime: 30000, // 30 seconds
    });
};

/**
 * Hook to fetch available tables
 */
export const useAvailableTables = (capacity?: number) => {
    return useQuery({
        queryKey: ['tables', 'available', capacity],
        queryFn: () => tableApi.getAvailable(capacity),
        staleTime: 10000, // 10 seconds
    });
};

/**
 * Hook to fetch tables by floor
 */
export const useTablesByFloor = (floor: number) => {
    return useQuery({
        queryKey: ['tables', 'floor', floor],
        queryFn: () => tableApi.getByFloor(floor),
        enabled: floor > 0,
    });
};

/**
 * Hook to fetch tables by section
 */
export const useTablesBySection = (section: string) => {
    return useQuery({
        queryKey: ['tables', 'section', section],
        queryFn: () => tableApi.getBySection(section),
        enabled: !!section,
    });
};

/**
 * Hook to fetch table statistics
 */
export const useTableStats = () => {
    return useQuery({
        queryKey: ['tables', 'stats'],
        queryFn: () => tableApi.getStats(),
        staleTime: 60000, // 1 minute
    });
};
