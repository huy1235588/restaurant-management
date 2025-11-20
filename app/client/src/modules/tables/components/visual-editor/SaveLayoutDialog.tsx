'use client';

import React, { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { floorPlanApi } from '@/services/floor-plan.service';
import { useEditorStore, useLayoutStore } from '../../stores';

interface SaveLayoutDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function SaveLayoutDialog({ open, onOpenChange }: SaveLayoutDialogProps) {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    
    const { currentFloor, zoom, grid } = useEditorStore();
    const { tables, setSavedLayouts } = useLayoutStore();
    
    const handleSave = async () => {
        if (!name.trim()) {
            toast.error('Layout name is required');
            return;
        }
        
        setIsLoading(true);
        try {
            const layoutData = {
                version: '1.0',
                floor: currentFloor,
                canvasSettings: {
                    gridSize: grid.size,
                    zoom,
                },
                tables: tables.map((table) => ({
                    tableId: table.tableId,
                    x: table.x,
                    y: table.y,
                    width: table.width,
                    height: table.height,
                    rotation: table.rotation,
                    shape: table.shape,
                })),
            };
            
            const newLayout = await floorPlanApi.createLayout(
                currentFloor,
                name,
                description || null,
                layoutData
            );
            
            // Refresh layouts list
            const layouts = await floorPlanApi.getLayouts(currentFloor);
            setSavedLayouts(layouts);
            
            toast.success('Layout saved successfully');
            setName('');
            setDescription('');
            onOpenChange(false);
        } catch (error) {
            toast.error('Failed to save layout');
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Save Layout</DialogTitle>
                    <DialogDescription>
                        Save the current table arrangement as a named layout
                    </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="layout-name">Layout Name *</Label>
                        <Input
                            id="layout-name"
                            placeholder="e.g., Weekend Layout"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>
                    
                    <div className="space-y-2">
                        <Label htmlFor="layout-description">Description</Label>
                        <Textarea
                            id="layout-description"
                            placeholder="Optional description for this layout"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={3}
                        />
                    </div>
                    
                    <div className="text-sm text-gray-500">
                        <p>This layout will save:</p>
                        <ul className="list-disc list-inside mt-1">
                            <li>{tables.length} table positions</li>
                            <li>Current grid settings</li>
                            <li>Zoom level</li>
                        </ul>
                    </div>
                </div>
                
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button onClick={handleSave} disabled={isLoading}>
                        {isLoading ? 'Saving...' : 'Save Layout'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
