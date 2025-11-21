import { useQuery } from '@tanstack/react-query';
import { tableApi } from '../services/table.service';

/**
 * Hook to fetch a single table by ID
 */
export const useTable = (tableId: number | undefined) => {
    return useQuery({
        queryKey: ['table', tableId],
        queryFn: () => tableApi.getById(tableId!),
        enabled: !!tableId && tableId > 0,
        staleTime: 30000, // 30 seconds
    });
};

/**
 * Hook to fetch a table by table number
 */
export const useTableByNumber = (tableNumber: string | undefined) => {
    return useQuery({
        queryKey: ['table', 'number', tableNumber],
        queryFn: () => tableApi.getByNumber(tableNumber!),
        enabled: !!tableNumber,
        staleTime: 30000, // 30 seconds
    });
};
