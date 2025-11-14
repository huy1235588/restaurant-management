import { memo, useMemo, useCallback } from 'react';
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

interface InfoRowProps {
    label: string;
    icon?: React.ReactNode;
    value: React.ReactNode;
}

const InfoRow = memo(({ label, icon, value }: InfoRowProps) => (
    <div className="flex items-start gap-3">
        {icon && <span className="mt-0.5 text-muted-foreground">{icon}</span>}
        <div className="flex-1">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">{label}</p>
            <div className="mt-1">{value}</div>
        </div>
    </div>
));

InfoRow.displayName = 'InfoRow';

const TableHeader = memo(({ table, onClose, t }: any) => (
    <CardHeader className="border-b flex flex-row items-center justify-between py-3 px-4">
        <CardTitle className="text-lg font-semibold">
            {t('tables.tableDetails', 'Table Details')}
        </CardTitle>
        <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 hover:bg-muted"
            onClick={onClose}
        >
            <X className="h-4 w-4" />
        </Button>
    </CardHeader>
));

TableHeader.displayName = 'TableHeader';

const ActionButtons = memo(({ table, onEdit, onChangeStatus, onViewHistory, onClose, t }: any) => (
    <>
        <div className="flex gap-2 pt-3 border-t">
            {onEdit && (
                <Button
                    size="sm"
                    variant="outline"
                    className="flex-1"
                    onClick={() => {
                        onEdit(table);
                    }}
                >
                    <Edit className="h-4 w-4 mr-1.5" />
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
                    }}
                >
                    <Zap className="h-4 w-4 mr-1.5" />
                    {t('tables.changeStatus', 'Change')}
                </Button>
            )}
        </div>

        {onViewHistory && (
            <Button
                size="sm"
                variant="ghost"
                className="w-full justify-start text-muted-foreground hover:text-foreground mt-2"
                onClick={() => onViewHistory(table)}
            >
                <Clock className="h-4 w-4 mr-2" />
                {t('tables.viewHistory', 'View History')}
            </Button>
        )}
    </>
));

ActionButtons.displayName = 'ActionButtons';

export const QuickViewPanel = memo(function QuickViewPanel({
    table,
    onClose,
    onEdit,
    onChangeStatus,
    onViewHistory,
}: QuickViewPanelProps) {
    const { t } = useTranslation();

    if (!table) return null;

    const capacityDisplay = useMemo(() => {
        if (table.minCapacity && table.minCapacity !== table.capacity) {
            return `${table.minCapacity}-${table.capacity}`;
        }
        return table.capacity;
    }, [table.capacity, table.minCapacity]);

    const formattedDates = useMemo(() => ({
        created: new Date(table.createdAt).toLocaleDateString(),
        updated: new Date(table.updatedAt).toLocaleDateString(),
    }), [table.createdAt, table.updatedAt]);

    return (
        <Card className="fixed right-0 top-16 bottom-0 w-full sm:w-80 rounded-none shadow-lg border-l z-40 flex flex-col overflow-hidden">
            <TableHeader table={table} onClose={onClose} t={t} />

            <CardContent className="flex-1 overflow-y-auto space-y-4 py-4 px-4">
                {/* Table Number & Name */}
                <div className="space-y-2">
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">
                        {t('tables.tableNumber', 'Table Number')}
                    </p>
                    <h3 className="text-3xl font-bold text-foreground">{table.tableNumber}</h3>
                    {table.tableName && (
                        <p className="text-sm text-muted-foreground font-medium">{table.tableName}</p>
                    )}
                </div>

                {/* Divider */}
                <div className="pt-2 border-t" />

                {/* Status */}
                <div className="space-y-2">
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">
                        {t('tables.status', 'Status')}
                    </p>
                    <TableStatusBadge status={table.status} />
                </div>

                {/* Info Grid */}
                <div className="space-y-3">
                    <InfoRow
                        label={t('tables.capacity', 'Capacity')}
                        icon={<Users className="h-4 w-4" />}
                        value={<p className="font-semibold">{capacityDisplay}</p>}
                    />
                    <InfoRow
                        label={t('tables.floor', 'Floor')}
                        icon={<Home className="h-4 w-4" />}
                        value={<p className="font-semibold">{table.floor || '-'}</p>}
                    />
                    {table.section && (
                        <InfoRow
                            label={t('tables.section', 'Section')}
                            icon={<MapPin className="h-4 w-4" />}
                            value={<Badge variant="outline" className="w-fit">{table.section}</Badge>}
                        />
                    )}
                </div>

                {/* Active Status */}
                <div className="pt-2 border-t space-y-2">
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">
                        {t('tables.activeStatus', 'Active Status')}
                    </p>
                    <Badge variant={table.isActive ? 'default' : 'secondary'} className="w-fit">
                        {table.isActive ? t('tables.active', 'Active') : t('tables.inactive', 'Inactive')}
                    </Badge>
                </div>

                {/* Metadata */}
                <div className="text-xs text-muted-foreground space-y-1.5 pt-3 border-t">
                    <p>
                        <span className="font-medium">{t('tables.createdAt', 'Created')}:</span>{' '}
                        {formattedDates.created}
                    </p>
                    <p>
                        <span className="font-medium">{t('tables.updatedAt', 'Updated')}:</span>{' '}
                        {formattedDates.updated}
                    </p>
                </div>
            </CardContent>

            {/* Action Buttons */}
            <div className="border-t bg-card px-4 py-3">
                <ActionButtons
                    table={table}
                    onEdit={onEdit}
                    onChangeStatus={onChangeStatus}
                    onViewHistory={onViewHistory}
                    onClose={onClose}
                    t={t}
                />
            </div>
        </Card>
    );
});
