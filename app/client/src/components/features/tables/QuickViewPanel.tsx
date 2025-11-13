import { Table } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useTranslation } from 'react-i18next';
import { X, Users, Home, MapPin, Edit, Zap, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TableStatusBadge } from './TableStatusBadge';

interface QuickViewPanelProps {
    table: Table | null;
    onClose: () => void;
    onEdit?: (table: Table) => void;
    onChangeStatus?: (table: Table) => void;
    onViewHistory?: (table: Table) => void;
}

export function QuickViewPanel({ table, onClose, onEdit, onChangeStatus, onViewHistory }: QuickViewPanelProps) {
    const { t } = useTranslation();

    if (!table) return null;

    return (
        <Card className="fixed right-0 top-20 bottom-0 w-80 rounded-none shadow-lg border-l z-40">
            <CardHeader className="border-b flex flex-row items-center justify-between py-3">
                <CardTitle className="text-lg">
                    {t('tables.tableDetails', 'Table Details')}
                </CardTitle>
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={onClose}
                >
                    <X className="h-4 w-4" />
                </Button>
            </CardHeader>

            <CardContent className="space-y-4 pt-4">
                {/* Table Number & Name */}
                <div>
                    <p className="text-sm text-muted-foreground mb-1">
                        {t('tables.tableNumber', 'Table Number')}
                    </p>
                    <h3 className="text-2xl font-bold">{table.tableNumber}</h3>
                    {table.tableName && (
                        <p className="text-sm text-muted-foreground">{table.tableName}</p>
                    )}
                </div>

                {/* Status */}
                <div>
                    <p className="text-sm text-muted-foreground mb-2">
                        {t('tables.status', 'Status')}
                    </p>
                    <TableStatusBadge status={table.status} />
                </div>

                {/* Capacity */}
                <div className="flex items-center gap-3">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <div>
                        <p className="text-sm text-muted-foreground">
                            {t('tables.capacity', 'Capacity')}
                        </p>
                        <p className="font-medium">
                            {table.minCapacity && table.minCapacity !== table.capacity
                                ? `${table.minCapacity}-${table.capacity}`
                                : table.capacity}
                        </p>
                    </div>
                </div>

                {/* Floor */}
                <div className="flex items-center gap-3">
                    <Home className="h-4 w-4 text-muted-foreground" />
                    <div>
                        <p className="text-sm text-muted-foreground">
                            {t('tables.floor', 'Floor')}
                        </p>
                        <p className="font-medium">{table.floor || '-'}</p>
                    </div>
                </div>

                {/* Section */}
                {table.section && (
                    <div className="flex items-center gap-3">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <div>
                            <p className="text-sm text-muted-foreground">
                                {t('tables.section', 'Section')}
                            </p>
                            <Badge variant="outline">{table.section}</Badge>
                        </div>
                    </div>
                )}

                {/* Active Status */}
                <div>
                    <p className="text-sm text-muted-foreground mb-2">
                        {t('tables.activeStatus', 'Status')}
                    </p>
                    <Badge variant={table.isActive ? 'default' : 'secondary'}>
                        {table.isActive ? t('tables.active', 'Active') : t('tables.inactive', 'Inactive')}
                    </Badge>
                </div>

                {/* Metadata */}
                <div className="text-xs text-muted-foreground space-y-1 pt-4 border-t">
                    <p>
                        {t('tables.createdAt', 'Created')}:{' '}
                        {new Date(table.createdAt).toLocaleDateString()}
                    </p>
                    <p>
                        {t('tables.updatedAt', 'Updated')}:{' '}
                        {new Date(table.updatedAt).toLocaleDateString()}
                    </p>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 pt-4 border-t">
                    {onEdit && (
                        <Button
                            size="sm"
                            variant="outline"
                            className="flex-1"
                            onClick={() => {
                                onEdit(table);
                                onClose();
                            }}
                        >
                            <Edit className="h-4 w-4 mr-2" />
                            {t('common.edit', 'Edit')}
                        </Button>
                    )}
                    {onChangeStatus && (
                        <Button
                            size="sm"
                            variant="outline"
                            className="flex-1"
                            onClick={() => {
                                onChangeStatus(table);
                                onClose();
                            }}
                        >
                            <Zap className="h-4 w-4 mr-2" />
                            {t('tables.changeStatus', 'Change Status')}
                        </Button>
                    )}
                </div>

                {/* History Button */}
                {onViewHistory && (
                    <Button
                        size="sm"
                        variant="ghost"
                        className="w-full mt-2"
                        onClick={() => {
                            onViewHistory(table);
                        }}
                    >
                        <Clock className="h-4 w-4 mr-2" />
                        {t('tables.viewHistory', 'View History')}
                    </Button>
                )}
            </CardContent>
        </Card>
    );
}
