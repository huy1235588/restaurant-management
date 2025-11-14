'use client';

import { Table } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useTranslation } from 'react-i18next';
import { Edit2, LogOut } from 'lucide-react';
import { TableStatusBadge } from '../TableStatusBadge';

interface PropertiesPanelProps {
    table?: Table;
    onEdit: (table: Table) => void;
    onChangeStatus: (table: Table) => void;
}

export function PropertiesPanel({ table, onEdit, onChangeStatus }: PropertiesPanelProps) {
    const { t } = useTranslation();

    if (!table) return null;

    return (
        <Card className="w-72 h-fit sticky top-4">
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
