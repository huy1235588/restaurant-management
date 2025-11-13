import { Table as TableType } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { TableStatusBadge } from './TableStatusBadge';
import { Users } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface FloorPlanViewProps {
    tables: TableType[];
    loading: boolean;
    floorFilter: string;
    onEdit: (table: TableType) => void;
    onChangeStatus: (table: TableType) => void;
    onViewQR: (table: TableType) => void;
}

export function FloorPlanView({
    tables,
    loading,
    floorFilter,
    onEdit,
    onChangeStatus,
    onViewQR,
}: FloorPlanViewProps) {
    const { t } = useTranslation();

    if (loading) {
        return (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {[...Array(12)].map((_, index) => (
                    <Skeleton key={index} className="h-32 w-full" />
                ))}
            </div>
        );
    }

    if (tables.length === 0) {
        return (
            <div className="text-center py-12">
                <p className="text-muted-foreground">
                    {t('tables.noTablesFound', 'No tables found')}
                </p>
            </div>
        );
    }

    // Group tables by floor
    const groupedTables = tables.reduce((acc, table) => {
        const floor = table.floor || 0;
        if (!acc[floor]) {
            acc[floor] = [];
        }
        acc[floor].push(table);
        return acc;
    }, {} as Record<number, TableType[]>);

    const floorsToDisplay = floorFilter === 'all'
        ? Object.keys(groupedTables).sort()
        : [floorFilter];

    return (
        <div className="space-y-8">
            {floorsToDisplay.map((floor) => {
                const floorTables = groupedTables[parseInt(floor)] || [];
                if (floorTables.length === 0) return null;

                return (
                    <div key={floor}>
                        <h3 className="text-lg font-semibold mb-4">
                            {t('tables.floor', 'Floor')} {floor}
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                            {floorTables.map((table) => (
                                <Card
                                    key={table.tableId}
                                    className="cursor-pointer hover:shadow-lg transition-shadow"
                                    onClick={() => onEdit(table)}
                                >
                                    <CardContent className="p-4 space-y-2">
                                        <div className="flex items-center justify-between">
                                            <span className="text-2xl font-bold">
                                                {table.tableNumber}
                                            </span>
                                            <TableStatusBadge status={table.status} />
                                        </div>
                                        {table.tableName && (
                                            <p className="text-sm text-muted-foreground truncate">
                                                {table.tableName}
                                            </p>
                                        )}
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <Users className="h-4 w-4" />
                                            <span>
                                                {table.minCapacity && table.minCapacity !== table.capacity
                                                    ? `${table.minCapacity}-${table.capacity}`
                                                    : table.capacity}
                                            </span>
                                        </div>
                                        {table.section && (
                                            <p className="text-xs text-muted-foreground">
                                                {table.section}
                                            </p>
                                        )}
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
