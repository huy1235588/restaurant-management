'use client';

import React from 'react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useEditorStore, useLayoutStore } from '../stores';
import { Building2 } from 'lucide-react';

interface FloorSelectorProps {
    maxFloors?: number;
}

export function FloorSelector({ maxFloors = 5 }: FloorSelectorProps) {
    const { currentFloor, setCurrentFloor } = useEditorStore();
    const { unsavedChanges } = useLayoutStore();
    
    const handleFloorChange = (value: string) => {
        const newFloor = parseInt(value);
        
        if (unsavedChanges) {
            // TODO: Show confirmation dialog
            if (!confirm('You have unsaved changes. Do you want to switch floors and discard changes?')) {
                return;
            }
        }
        
        setCurrentFloor(newFloor);
    };
    
    const floors = Array.from({ length: maxFloors }, (_, i) => i + 1);
    
    return (
        <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-gray-600 dark:text-gray-400" />
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
                <span className="text-xs text-yellow-600 dark:text-yellow-400">Unsaved changes</span>
            )}
        </div>
    );
}
