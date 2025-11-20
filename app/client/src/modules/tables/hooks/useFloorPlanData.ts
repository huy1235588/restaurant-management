'use client';

import { useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { useEditorStore, useLayoutStore } from '../stores';
import { floorPlanApi } from '@/services/floor-plan.service';
import { tableApi } from '@/services/table.service';
import type { TablePosition } from '../types';

/**
 * Hook to load floor plan data
 */
export function useFloorPlanData() {
    const { currentFloor } = useEditorStore();
    const {
        setTables,
        setSavedLayouts,
        setLoading,
        setError,
        unsavedChanges,
    } = useLayoutStore();
    
    const loadFloorData = useCallback(async (floor: number) => {
        setLoading(true);
        setError(null);
        
        try {
            // Load table positions from tables API using service
            const response = await tableApi.getAll({
                floor,
                limit: 1000, // Get all tables for the floor
            });
            
            const positions = response.items;
            
            // Transform to TablePosition format
            const tables: TablePosition[] = positions.map((pos) => ({
                tableId: pos.tableId,
                tableNumber: pos.tableNumber,
                x: pos.positionX || 0,
                y: pos.positionY || 0,
                width: pos.width || 80,
                height: pos.height || 80,
                rotation: pos.rotation || 0,
                shape: (pos.shape || 'rectangle') as any,
                capacity: pos.capacity,
                status: pos.status,
            }));
            
            setTables(tables);
            
            // Load saved layouts
            const layouts = await floorPlanApi.getLayouts(floor);
            setSavedLayouts(layouts);
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to load floor data';
            setError(message);
            toast.error(message);
        } finally {
            setLoading(false);
        }
    }, [setTables, setSavedLayouts, setLoading, setError]);
    
    // Load data on mount and when floor changes
    useEffect(() => {
        if (unsavedChanges) {
            // TODO: Show confirmation dialog before switching
            return;
        }
        
        loadFloorData(currentFloor);
    }, [currentFloor, loadFloorData, unsavedChanges]);
    
    return {
        loadFloorData,
    };
}
