/**
 * useTimelineData Hook
 * Transforms reservations and tables data for timeline display
 */

import { useState, useEffect, useMemo } from 'react';
import { Reservation } from '../../types';
import { Table } from '@/types';
import { tableApi } from '@/modules/admin/tables';
import { groupReservationsByTable } from './timeline.utils';

export interface TimelineTableData {
    table: Table;
    reservations: Reservation[];
}

export interface UseTimelineDataResult {
    tableData: TimelineTableData[];
    loading: boolean;
    error: string | null;
    floors: number[];
    selectedFloor: number | null;
    setSelectedFloor: (floor: number | null) => void;
}

/**
 * Hook to prepare data for timeline display
 * @param reservations - List of reservations for the selected date
 */
export function useTimelineData(reservations: Reservation[]): UseTimelineDataResult {
    const [tables, setTables] = useState<Table[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedFloor, setSelectedFloor] = useState<number | null>(null);

    // Fetch all active tables
    useEffect(() => {
        const fetchTables = async () => {
            try {
                setLoading(true);
                setError(null);
                const response = await tableApi.getAll({
                    limit: 100, // Get all tables
                    filters: {
                        // Only get active tables
                    },
                });
                // Filter only active tables
                const activeTables = response.items.filter(t => t.isActive);
                setTables(activeTables);
            } catch (err: any) {
                setError(err.response?.data?.message || 'Failed to fetch tables');
            } finally {
                setLoading(false);
            }
        };

        fetchTables();
    }, []);

    // Get unique floors
    const floors = useMemo(() => {
        const floorSet = new Set(tables.map(t => t.floor));
        return Array.from(floorSet).sort((a, b) => a - b);
    }, [tables]);

    // Group reservations by table and combine with table data
    const tableData = useMemo(() => {
        const reservationsByTable = groupReservationsByTable(reservations);
        
        // Filter tables by selected floor
        let filteredTables = tables;
        if (selectedFloor !== null) {
            filteredTables = tables.filter(t => t.floor === selectedFloor);
        }

        // Sort tables by floor, then by table number
        const sortedTables = [...filteredTables].sort((a, b) => {
            if (a.floor !== b.floor) return a.floor - b.floor;
            return a.tableNumber.localeCompare(b.tableNumber, undefined, { numeric: true });
        });

        return sortedTables.map(table => ({
            table,
            reservations: reservationsByTable.get(table.tableId) || [],
        }));
    }, [tables, reservations, selectedFloor]);

    return {
        tableData,
        loading,
        error,
        floors,
        selectedFloor,
        setSelectedFloor,
    };
}
