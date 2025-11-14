'use client';

import React from 'react';
import { useEditorStore, useLayoutStore } from '../stores';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Trash2, Copy } from 'lucide-react';

export function PropertiesPanel() {
    const { selectedTableIds, showPropertiesPanel } = useEditorStore();
    const { tables, updateTablePosition } = useLayoutStore();
    
    if (!showPropertiesPanel) return null;
    
    if (selectedTableIds.length === 0) {
        return (
            <div className="w-80 border-l bg-white p-4">
                <Card>
                    <CardHeader>
                        <CardTitle>Properties</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-gray-500">
                            Select a table to view and edit its properties.
                        </p>
                    </CardContent>
                </Card>
            </div>
        );
    }
    
    if (selectedTableIds.length > 1) {
        return (
            <div className="w-80 border-l bg-white p-4">
                <Card>
                    <CardHeader>
                        <CardTitle>Multiple Selection</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-gray-500">
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
    
    return (
        <div className="w-80 border-l bg-white p-4 overflow-y-auto">
            <Card>
                <CardHeader>
                    <CardTitle>Table Properties</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Table Number */}
                    <div className="space-y-2">
                        <Label>Table Number</Label>
                        <Input value={selectedTable.tableNumber} readOnly />
                    </div>
                    
                    {/* Status */}
                    <div className="space-y-2">
                        <Label>Status</Label>
                        <div className="text-sm capitalize">{selectedTable.status}</div>
                    </div>
                    
                    {/* Capacity */}
                    <div className="space-y-2">
                        <Label>Capacity</Label>
                        <Input value={selectedTable.capacity} readOnly />
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
                        <Button variant="outline" className="w-full gap-2">
                            <Copy className="h-4 w-4" />
                            Duplicate
                        </Button>
                        <Button variant="destructive" className="w-full gap-2">
                            <Trash2 className="h-4 w-4" />
                            Delete
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
