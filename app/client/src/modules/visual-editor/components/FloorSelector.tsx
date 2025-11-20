'use client';

import React, { useState, useCallback } from 'react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useEditorStore, useLayoutStore } from '../stores';
import { UnsavedChangesDialog } from './UnsavedChangesDialog';
import { toast } from 'sonner';
import { floorPlanApi } from '@/services/floor-plan.service';

interface FloorSelectorProps {
    maxFloors?: number;
}

export function FloorSelector({ maxFloors = 5 }: FloorSelectorProps) {
    const { currentFloor, setCurrentFloor } = useEditorStore();
    const { unsavedChanges, tables, setUnsavedChanges, loadFloorData } = useLayoutStore();
    const [pendingFloor, setPendingFloor] = useState<number | null>(null);
    const [showDialog, setShowDialog] = useState(false);
    
    const handleFloorChange = (value: string) => {
        const newFloor = parseInt(value);
        
        if (unsavedChanges) {
            setPendingFloor(newFloor);
            setShowDialog(true);
        } else {
            switchFloor(newFloor);
        }
    };
    
    const switchFloor = useCallback((floor: number) => {
        setCurrentFloor(floor);
        loadFloorData(floor);
        toast.success(`Switched to Floor ${floor}`);
    }, [setCurrentFloor, loadFloorData]);
    
    const handleSaveAndSwitch = useCallback(async () => {
        if (pendingFloor === null) return;
        
        try {
            const positions = tables.map((table) => ({
                tableId: table.tableId,
                x: table.x,
                y: table.y,
                width: table.width,
                height: table.height,
                rotation: table.rotation,
                shape: table.shape,
            }));
            
            await floorPlanApi.updateTablePositions(positions);
            setUnsavedChanges(false);
            toast.success('Layout saved successfully');
            switchFloor(pendingFloor);
        } catch (error) {
            toast.error('Failed to save layout');
        } finally {
            setShowDialog(false);
            setPendingFloor(null);
        }
    }, [pendingFloor, tables, setUnsavedChanges, switchFloor]);
    
    const handleDiscardAndSwitch = useCallback(() => {
        if (pendingFloor === null) return;
        
        setUnsavedChanges(false);
        switchFloor(pendingFloor);
        setShowDialog(false);
        setPendingFloor(null);
        toast.info('Changes discarded');
    }, [pendingFloor, setUnsavedChanges, switchFloor]);
    
    const floors = Array.from({ length: maxFloors }, (_, i) => i + 1);
    
    return (
        <>
            <div className="flex items-center gap-2">
                <Select value={currentFloor.toString()} onValueChange={handleFloorChange}>
                    <SelectTrigger className="w-32">
                        <SelectValue placeholder="Select floor" />
                    </SelectTrigger>
                    <SelectContent>
                        {floors.map((floor) => (
                            <SelectItem key={floor} value={floor.toString()}>
                                Floor {floor}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                {unsavedChanges && (
                    <span className="text-xs text-yellow-600 dark:text-yellow-400">*</span>
                )}
            </div>
            
            <UnsavedChangesDialog
                open={showDialog}
                onOpenChange={setShowDialog}
                onSaveAndSwitch={handleSaveAndSwitch}
                onDiscardAndSwitch={handleDiscardAndSwitch}
            />
        </>
    );
}
