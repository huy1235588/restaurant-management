import { useTranslation } from 'react-i18next';
import { ArrowDown, ArrowUp, ArrowUpDown, Loader2 } from 'lucide-react';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Table as UITable,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Table } from '@/types';
import { TableStatusBadge } from './TableStatusBadge';
import { TableRowActions } from './TableRowActions';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TablesViewMode, TableSortField, TableSortOrder } from './TablesFilters';

interface SortHeaderProps {
    label: string;
    field: TableSortField;
    currentField: TableSortField;
    sortOrder: TableSortOrder;
    onSort: (field: TableSortField) => void;
}

const SortHeader = ({ label, field, currentField, sortOrder, onSort }: SortHeaderProps) => {
    const isActive = field === currentField;

    return (
        <TableHead
            role="columnheader"
            className={`font-semibold cursor-pointer select-none hover:bg-muted/50 ${isActive ? 'bg-muted/40' : ''}`}
            onClick={() => onSort(field)}
        >
            <div className="flex items-center gap-1">
                {label}
                {isActive ? (
                    sortOrder === 'asc' ? (
                        <ArrowUp className="h-4 w-4 text-primary" />
                    ) : (
                        <ArrowDown className="h-4 w-4 text-primary" />
                    )
                ) : (
                    <ArrowUpDown className="h-4 w-4 text-muted-foreground opacity-60" />
                )}
            </div>
        </TableHead>
    );
};

interface TablesDataTableProps {
    tables: Table[];
    loading: boolean;
    totalItems: number;
    sortField: TableSortField;
    sortOrder: TableSortOrder;
    onSort: (field: TableSortField) => void;
    onEdit: (table: Table) => void;
    onChangeStatus: (table: Table) => void;
    onViewQr: (table: Table) => void;
    onDelete: (table: Table) => void;
    onAssignOrder: (table: Table) => void;
    viewMode: TablesViewMode;
}

export function TablesDataTable({
    tables,
    loading,
    totalItems,
    sortField,
    sortOrder,
    onSort,
    onEdit,
    onChangeStatus,
    onViewQr,
    onDelete,
    onAssignOrder,
    viewMode,
}: TablesDataTableProps) {
    const { t } = useTranslation();

    if (viewMode === 'floor') {
        return null;
    }

    return (
        <Card className="shadow-sm">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    {t('tables.list.title', 'Tables')}
                    <span className="text-sm font-normal text-muted-foreground">({totalItems})</span>
                </CardTitle>
                <CardDescription>
                    {t('tables.list.subtitle', 'Overview of all tables, their status, and availability.')}
                </CardDescription>
            </CardHeader>
            <CardContent>
                {loading ? (
                    <div className="flex justify-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" aria-label={t('tables.loading', 'Loading tables')} />
                    </div>
                ) : tables.length === 0 ? (
                    <div className="py-12 text-center">
                        <p className="text-lg font-medium text-muted-foreground">
                            {t('tables.list.empty', 'No tables found')}
                        </p>
                        <p className="mt-2 text-sm text-muted-foreground">
                            {t('tables.list.emptyHelper', 'Try adjusting your filters or create a new table.')}
                        </p>
                    </div>
                ) : (
                    <div className="overflow-hidden rounded-lg border">
                        <UITable>
                            <TableHeader>
                                <TableRow className="bg-muted/50 hover:bg-muted/50">
                                    <SortHeader
                                        label={t('tables.columns.number', 'Table number')}
                                        field="tableNumber"
                                        currentField={sortField}
                                        sortOrder={sortOrder}
                                        onSort={onSort}
                                    />
                                    <TableHead className="font-semibold">
                                        {t('tables.columns.name', 'Name')}
                                    </TableHead>
                                    <SortHeader
                                        label={t('tables.columns.capacity', 'Capacity')}
                                        field="capacity"
                                        currentField={sortField}
                                        sortOrder={sortOrder}
                                        onSort={onSort}
                                    />
                                    <SortHeader
                                        label={t('tables.columns.floor', 'Floor')}
                                        field="floor"
                                        currentField={sortField}
                                        sortOrder={sortOrder}
                                        onSort={onSort}
                                    />
                                    <TableHead className="font-semibold">
                                        {t('tables.columns.section', 'Section')}
                                    </TableHead>
                                    <SortHeader
                                        label={t('tables.columns.status', 'Status')}
                                        field="status"
                                        currentField={sortField}
                                        sortOrder={sortOrder}
                                        onSort={onSort}
                                    />
                                    <TableHead className="font-semibold">
                                        {t('tables.columns.qr', 'QR Code')}
                                    </TableHead>
                                    <TableHead className="font-semibold">
                                        {t('tables.columns.active', 'Active')}
                                    </TableHead>
                                    <TableHead className="text-right font-semibold">
                                        {t('tables.columns.actions', 'Actions')}
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {tables.map((table) => (
                                    <TableRow key={table.tableId} className="hover:bg-muted/30">
                                        <TableCell className="font-medium">
                                            <div className="flex flex-col">
                                                <span>{table.tableNumber}</span>
                                                {table.updatedAt && (
                                                    <span className="text-xs text-muted-foreground">
                                                        {t('tables.columns.updatedAtShort', 'Updated {{date}}', {
                                                            date: new Date(table.updatedAt).toLocaleString(),
                                                        })}
                                                    </span>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="max-w-[200px] truncate">
                                                {table.tableName || (
                                                    <span className="text-muted-foreground">
                                                        {t('tables.list.noName', '—')}
                                                    </span>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <span className="font-medium">{table.capacity}</span>
                                            {table.minCapacity && table.minCapacity !== table.capacity && (
                                                <span className="ml-2 text-xs text-muted-foreground">
                                                    {t('tables.list.minCapacity', 'Min {{count}}', {
                                                        count: table.minCapacity,
                                                    })}
                                                </span>
                                            )}
                                        </TableCell>
                                        <TableCell>{table.floor ?? t('tables.list.noData', '—')}</TableCell>
                                        <TableCell>
                                            {table.section ? table.section : t('tables.list.noData', '—')}
                                        </TableCell>
                                        <TableCell>
                                            <TableStatusBadge status={table.status} />
                                        </TableCell>
                                        <TableCell>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => onViewQr(table)}
                                                disabled={!table.qrCode}
                                            >
                                                {table.qrCode
                                                    ? t('tables.actions.viewQr', 'View QR Code')
                                                    : t('tables.actions.generateQr', 'Generate QR')}
                                            </Button>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={table.isActive ? 'outline' : 'destructive'}>
                                                {table.isActive
                                                    ? t('tables.list.active', 'Active')
                                                    : t('tables.list.inactive', 'Inactive')}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <TableRowActions
                                                table={table}
                                                onEdit={onEdit}
                                                onChangeStatus={onChangeStatus}
                                                onViewQr={onViewQr}
                                                onDelete={onDelete}
                                                onAssignOrder={onAssignOrder}
                                                disableQr={!table.qrCode}
                                            />
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </UITable>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
