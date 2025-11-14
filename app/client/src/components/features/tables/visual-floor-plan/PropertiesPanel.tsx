'use client';

import { Table } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useTranslation } from 'react-i18next';
import { Edit2, LogOut, Square, Circle } from 'lucide-react';
import { TableStatusBadge } from '../TableStatusBadge';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface PropertiesPanelProps {
    table?: Table;
    onEdit: (table: Table) => void;
    onChangeStatus: (table: Table) => void;
    onUpdateDimensions?: (tableId: number, width: number, height: number, rotation: number, shape: string) => void;
}

export function PropertiesPanel({ table, onEdit, onChangeStatus, onUpdateDimensions }: PropertiesPanelProps) {
    const { t } = useTranslation();
    
    // Local state for dimensions (preview before save)
    const [width, setWidth] = useState(table?.width || 80);
    const [height, setHeight] = useState(table?.height || 80);
    const [rotation, setRotation] = useState(table?.rotation || 0);
    const [shape, setShape] = useState<'rectangle' | 'circle' | 'square' | 'oval'>(
        (table?.shape as 'rectangle' | 'circle' | 'square' | 'oval') || 'rectangle'
    );

    // Update local state when table changes
    useEffect(() => {
        if (table) {
            setWidth(table.width || 80);
            setHeight(table.height || 80);
            setRotation(table.rotation || 0);
            setShape((table.shape as 'rectangle' | 'circle' | 'square' | 'oval') || 'rectangle');
        }
    }, [table]);

    const handleApplyDimensions = () => {
        if (table && onUpdateDimensions) {
            onUpdateDimensions(table.tableId, width, height, rotation, shape);
        }
    };

    if (!table) return null;

    const shapes = [
        { value: 'rectangle', label: 'Rectangle', icon: Square },
        { value: 'circle', label: 'Circle', icon: Circle },
        { value: 'square', label: 'Square', icon: Square },
        { value: 'oval', label: 'Oval', icon: Circle },
    ];

    return (
        <Card className="w-72 h-fit sticky top-4 overflow-auto max-h-[calc(100vh-8rem)]">
            <CardHeader className="pb-3">
                <CardTitle className="text-lg">
                    {t('tables.properties', 'Properties')}
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Table Number and Name */}
                <div>
                    <label className="text-xs font-semibold text-muted-foreground">
                        {t('tables.tableNumber', 'Table Number')}
                    </label>
                    <p className="text-lg font-bold mt-1">{table.tableNumber}</p>
                </div>

                {table.tableName && (
                    <div>
                        <label className="text-xs font-semibold text-muted-foreground">
                            {t('tables.tableName', 'Table Name')}
                        </label>
                        <p className="text-sm mt-1">{table.tableName}</p>
                    </div>
                )}

                <Separator />

                {/* Status */}
                <div>
                    <label className="text-xs font-semibold text-muted-foreground">
                        {t('tables.status', 'Status')}
                    </label>
                    <div className="mt-2">
                        <TableStatusBadge status={table.status} />
                    </div>
                </div>

                {/* Capacity */}
                <div>
                    <label className="text-xs font-semibold text-muted-foreground">
                        {t('tables.capacity', 'Capacity')}
                    </label>
                    <p className="text-sm mt-1">
                        {table.minCapacity ? `${table.minCapacity}-${table.capacity}` : table.capacity} {t('tables.seats', 'seats')}
                    </p>
                </div>

                {/* Floor and Section */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="text-xs font-semibold text-muted-foreground">
                            {t('tables.floor', 'Floor')}
                        </label>
                        <p className="text-sm mt-1">{table.floor}</p>
                    </div>
                    {table.section && (
                        <div>
                            <label className="text-xs font-semibold text-muted-foreground">
                                {t('tables.section', 'Section')}
                            </label>
                            <p className="text-sm mt-1">{table.section}</p>
                        </div>
                    )}
                </div>

                <Separator />

                {/* Visual Properties */}
                <div className="space-y-3">
                    <Label className="text-xs font-semibold text-muted-foreground">
                        {t('tables.visualProperties', 'Visual Properties')}
                    </Label>

                    {/* Shape Selector */}
                    <div>
                        <Label className="text-xs">{t('tables.shape', 'Shape')}</Label>
                        <div className="grid grid-cols-4 gap-2 mt-2">
                            {shapes.map(({ value, label, icon: Icon }) => (
                                <button
                                    key={value}
                                    onClick={() => setShape(value as 'rectangle' | 'circle' | 'square' | 'oval')}
                                    className={cn(
                                        'flex flex-col items-center justify-center p-2 border-2 rounded transition-all',
                                        shape === value
                                            ? 'border-blue-500 bg-blue-50'
                                            : 'border-gray-200 hover:border-gray-300'
                                    )}
                                    title={label}
                                >
                                    <Icon className="w-4 h-4" />
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Dimensions */}
                    <div className="grid grid-cols-2 gap-2">
                        <div>
                            <Label htmlFor="width" className="text-xs">{t('tables.width', 'Width')}</Label>
                            <Input
                                id="width"
                                type="number"
                                min="60"
                                max="300"
                                value={width}
                                onChange={(e) => setWidth(Number(e.target.value))}
                                className="mt-1"
                            />
                        </div>
                        <div>
                            <Label htmlFor="height" className="text-xs">{t('tables.height', 'Height')}</Label>
                            <Input
                                id="height"
                                type="number"
                                min="60"
                                max="300"
                                value={height}
                                onChange={(e) => setHeight(Number(e.target.value))}
                                className="mt-1"
                            />
                        </div>
                    </div>

                    {/* Rotation */}
                    <div>
                        <Label htmlFor="rotation" className="text-xs">{t('tables.rotation', 'Rotation')} ({rotation}°)</Label>
                        <Input
                            id="rotation"
                            type="range"
                            min="0"
                            max="360"
                            step="15"
                            value={rotation}
                            onChange={(e) => setRotation(Number(e.target.value))}
                            className="mt-1"
                        />
                    </div>

                    {/* Apply Button */}
                    <Button
                        onClick={handleApplyDimensions}
                        variant="secondary"
                        size="sm"
                        className="w-full"
                    >
                        {t('tables.applyChanges', 'Apply Changes')}
                    </Button>
                </div>

                <Separator />

                {/* Action Buttons */}
                <div className="space-y-2">
                    <Button
                        className="w-full gap-2"
                        variant="outline"
                        size="sm"
                        onClick={() => onEdit(table)}
                    >
                        <Edit2 className="w-4 h-4" />
                        {t('common.edit', 'Edit')}
                    </Button>
                    <Button
                        className="w-full gap-2"
                        variant="outline"
                        size="sm"
                        onClick={() => onChangeStatus(table)}
                    >
                        <LogOut className="w-4 h-4" />
                        {t('tables.changeStatus', 'Change Status')}
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
