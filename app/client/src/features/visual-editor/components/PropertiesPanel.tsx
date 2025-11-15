'use client';

import React, { useCallback } from 'react';
import { useEditorStore, useLayoutStore, useHistoryStore } from '../stores';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Trash2, Copy } from 'lucide-react';
import { toast } from 'sonner';
import type { TablePosition } from '../types';

interface PropertiesPanelProps {
    onDelete?: (tableId: number) => void;
}

export function PropertiesPanel({ onDelete }: PropertiesPanelProps) {
    const { selectedTableIds, showPropertiesPanel, clearSelection, selectTable } = useEditorStore();
    const { tables, updateTablePosition, addTable, removeTable, updateTableProperties } = useLayoutStore();
    const { push: pushHistory } = useHistoryStore();
    const [editingTableNumber, setEditingTableNumber] = React.useState<string>('');
    const [editingCapacity, setEditingCapacity] = React.useState<string>('');
    
    if (!showPropertiesPanel) return null;
    
    if (selectedTableIds.length === 0) {
        return (
            <div className="w-80 border-l border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 p-4">
                <Card>
                    <CardHeader>
                        <CardTitle>Properties</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Select a table to view and edit its properties.
                        </p>
                    </CardContent>
                </Card>
            </div>
        );
    }
    
    if (selectedTableIds.length > 1) {
        return (
            <div className="w-80 border-l border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 p-4">
                <Card>
                    <CardHeader>
                        <CardTitle>Multiple Selection</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            {selectedTableIds.length} tables selected
                        </p>
                    </CardContent>
                </Card>
            </div>
        );
    }
    
    const selectedTable = tables.find(
        (table) => table.tableId === selectedTableIds[0]
    );
    
    if (!selectedTable) return null;

    // Initialize editing states when table changes
    React.useEffect(() => {
        setEditingTableNumber(selectedTable.tableNumber);
        setEditingCapacity(String(selectedTable.capacity));
    }, [selectedTable.tableId]);

    const handleTableNumberChange = useCallback((value: string) => {
        setEditingTableNumber(value);
    }, []);

    const handleTableNumberBlur = useCallback(() => {
        const trimmed = editingTableNumber.trim();
        if (trimmed && trimmed !== selectedTable.tableNumber) {
            updateTableProperties(selectedTable.tableId, { tableNumber: trimmed });
            toast.success('Table number updated');
        } else {
            setEditingTableNumber(selectedTable.tableNumber);
        }
    }, [editingTableNumber, selectedTable.tableId, selectedTable.tableNumber, updateTableProperties]);

    const handleCapacityChange = useCallback((value: string) => {
        setEditingCapacity(value);
    }, []);

    const handleCapacityBlur = useCallback(() => {
        const capacity = parseInt(editingCapacity);
        if (!isNaN(capacity) && capacity > 0 && capacity !== selectedTable.capacity) {
            updateTableProperties(selectedTable.tableId, { capacity });
            toast.success('Capacity updated');
        } else {
            setEditingCapacity(String(selectedTable.capacity));
        }
    }, [editingCapacity, selectedTable.tableId, selectedTable.capacity, updateTableProperties]);
    
    const handleDuplicate = useCallback(() => {
        // Create a copy with offset position
        const duplicatedTable: TablePosition = {
            ...selectedTable,
            tableId: Date.now(), // Temporary ID
            tableNumber: `${selectedTable.tableNumber}-Copy`,
            x: selectedTable.x + 20,
            y: selectedTable.y + 20,
        };
        
        addTable(duplicatedTable);
        
        pushHistory({
            type: 'create',
            table: duplicatedTable,
            timestamp: Date.now(),
        });
        
        // Select the new table
        clearSelection();
        selectTable(duplicatedTable.tableId, false);
        
        toast.success('Table duplicated');
    }, [selectedTable, addTable, pushHistory, clearSelection, selectTable]);
    
    const handleDelete = useCallback(() => {
        if (onDelete) {
            onDelete(selectedTable.tableId);
        }
    }, [selectedTable.tableId, onDelete]);
    
    return (
        <div className="w-80 border-l border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 p-4 overflow-y-auto">
            <Card>
                <CardHeader>
                    <CardTitle>Table Properties</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Table Number */}
                    <div className="space-y-2">
                        <Label>Table Number</Label>
                        <Input 
                            value={editingTableNumber} 
                            onChange={(e) => handleTableNumberChange(e.target.value)}
                            onBlur={handleTableNumberBlur}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    e.currentTarget.blur();
                                }
                            }}
                            placeholder="Enter table number"
                        />
                    </div>
                    
                    {/* Status */}
                    <div className="space-y-2">
                        <Label>Status</Label>
                        <div className="text-sm capitalize">{selectedTable.status}</div>
                    </div>
                    
                    {/* Capacity */}
                    <div className="space-y-2">
                        <Label>Capacity (people)</Label>
                        <Input 
                            type="number"
                            min="1"
                            value={editingCapacity} 
                            onChange={(e) => handleCapacityChange(e.target.value)}
                            onBlur={handleCapacityBlur}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    e.currentTarget.blur();
                                }
                            }}
                            placeholder="Enter capacity"
                        />
                    </div>
                    
                    {/* Position */}
                    <div className="space-y-2">
                        <Label>Position</Label>
                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <Label className="text-xs">X</Label>
                                <Input
                                    type="number"
                                    value={Math.round(selectedTable.x)}
                                    onChange={(e) =>
                                        updateTablePosition(selectedTable.tableId, {
                                            x: parseInt(e.target.value),
                                            y: selectedTable.y,
                                        })
                                    }
                                />
                            </div>
                            <div>
                                <Label className="text-xs">Y</Label>
                                <Input
                                    type="number"
                                    value={Math.round(selectedTable.y)}
                                    onChange={(e) =>
                                        updateTablePosition(selectedTable.tableId, {
                                            x: selectedTable.x,
                                            y: parseInt(e.target.value),
                                        })
                                    }
                                />
                            </div>
                        </div>
                    </div>
                    
                    {/* Dimensions */}
                    <div className="space-y-2">
                        <Label>Dimensions</Label>
                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <Label className="text-xs">Width</Label>
                                <Input
                                    type="number"
                                    value={Math.round(selectedTable.width)}
                                    readOnly
                                />
                            </div>
                            <div>
                                <Label className="text-xs">Height</Label>
                                <Input
                                    type="number"
                                    value={Math.round(selectedTable.height)}
                                    readOnly
                                />
                            </div>
                        </div>
                    </div>
                    
                    {/* Shape */}
                    <div className="space-y-2">
                        <Label>Shape</Label>
                        <div className="text-sm capitalize">{selectedTable.shape}</div>
                    </div>
                    
                    {/* Rotation */}
                    <div className="space-y-2">
                        <Label>Rotation</Label>
                        <Input value={`${selectedTable.rotation}°`} readOnly />
                    </div>
                    
                    {/* Actions */}
                    <div className="space-y-2 pt-4 border-t">
                        <Button 
                            variant="outline" 
                            className="w-full gap-2"
                            onClick={handleDuplicate}
                        >
                            <Copy className="h-4 w-4" />
                            Duplicate
                        </Button>
                        <Button 
                            variant="destructive" 
                            className="w-full gap-2"
                            onClick={handleDelete}
                        >
                            <Trash2 className="h-4 w-4" />
                            Delete
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
