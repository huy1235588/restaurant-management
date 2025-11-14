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
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { floorPlanApi } from '@/services/floor-plan.service';
import { useLayoutStore, useEditorStore } from '../stores';
import { Check, Trash2 } from 'lucide-react';
import type { FloorPlanLayout } from '../types';

interface LoadLayoutDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function LoadLayoutDialog({ open, onOpenChange }: LoadLayoutDialogProps) {
    const { savedLayouts, setSavedLayouts, setTables, setUnsavedChanges } = useLayoutStore();
    const { setZoom, setGrid, currentFloor } = useEditorStore();
    const [selectedLayout, setSelectedLayout] = useState<number | null>(null);
    
    const handleLoad = async (layout: FloorPlanLayout) => {
        try {
            // Load layout data
            const data = layout.data as any;
            
            // Update canvas settings
            if (data.canvasSettings) {
                if (data.canvasSettings.zoom) {
                    setZoom(data.canvasSettings.zoom);
                }
                if (data.canvasSettings.gridSize) {
                    setGrid({ size: data.canvasSettings.gridSize });
                }
            }
            
            // Update table positions
            if (data.tables && Array.isArray(data.tables)) {
                setTables(data.tables);
            }
            
            setUnsavedChanges(false);
            toast.success(`Loaded layout: ${layout.name}`);
            onOpenChange(false);
        } catch (error) {
            toast.error('Failed to load layout');
            console.error(error);
        }
    };
    
    const handleDelete = async (layoutId: number, e: React.MouseEvent) => {
        e.stopPropagation();
        
        if (!confirm('Are you sure you want to delete this layout?')) {
            return;
        }
        
        try {
            await floorPlanApi.deleteLayout(layoutId);
            
            // Refresh layouts list
            const layouts = await floorPlanApi.getLayouts(currentFloor);
            setSavedLayouts(layouts);
            
            toast.success('Layout deleted successfully');
        } catch (error) {
            toast.error('Failed to delete layout');
            console.error(error);
        }
    };
    
    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };
    
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Load Layout</DialogTitle>
                    <DialogDescription>
                        Choose a saved layout to load
                    </DialogDescription>
                </DialogHeader>
                
                <ScrollArea className="h-96 pr-4">
                    {savedLayouts.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-gray-500">
                            <p>No saved layouts found</p>
                            <p className="text-sm">Save your current layout to get started</p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {savedLayouts.map((layout) => {
                                const data = layout.data as any;
                                const tableCount = data?.tables?.length || 0;
                                
                                return (
                                    <Card
                                        key={layout.layoutId}
                                        className={`cursor-pointer transition-colors hover:bg-gray-50 ${
                                            selectedLayout === layout.layoutId
                                                ? 'ring-2 ring-primary'
                                                : ''
                                        }`}
                                        onClick={() => setSelectedLayout(layout.layoutId)}
                                    >
                                        <CardContent className="p-4">
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2">
                                                        <h3 className="font-semibold">
                                                            {layout.name}
                                                        </h3>
                                                        {layout.isActive && (
                                                            <Badge variant="default">
                                                                <Check className="h-3 w-3 mr-1" />
                                                                Active
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    
                                                    {layout.description && (
                                                        <p className="text-sm text-gray-600 mt-1">
                                                            {layout.description}
                                                        </p>
                                                    )}
                                                    
                                                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                                                        <span>{tableCount} tables</span>
                                                        <span>•</span>
                                                        <span>{formatDate(layout.updatedAt)}</span>
                                                    </div>
                                                </div>
                                                
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={(e) => handleDelete(layout.layoutId, e)}
                                                    className="ml-2"
                                                >
                                                    <Trash2 className="h-4 w-4 text-red-500" />
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </div>
                    )}
                </ScrollArea>
                
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button
                        onClick={() => {
                            const layout = savedLayouts.find(
                                (l) => l.layoutId === selectedLayout
                            );
                            if (layout) handleLoad(layout);
                        }}
                        disabled={!selectedLayout}
                    >
                        Load Selected
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
