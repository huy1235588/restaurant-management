import { useState } from 'react';
import { Table as TableType } from '@/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Checkbox } from '@/components/ui/checkbox';
import { TableStatusBadge } from './TableStatusBadge';
import { MoreHorizontal, Edit, Trash2, QrCode, ArrowUpDown, CircleDot } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface TableListViewProps {
    tables: TableType[];
    loading: boolean;
    sortField: string;
    sortOrder: 'asc' | 'desc';
    selectedTableIds?: number[];
    onSort: (field: any) => void;
    onEdit: (table: TableType) => void;
    onChangeStatus: (table: TableType) => void;
    onDelete: (table: TableType) => void;
    onViewQR: (table: TableType) => void;
    onSelectionChange?: (selectedIds: number[]) => void;
}

export function TableListView({
    tables,
    loading,
    sortField,
    sortOrder,
    selectedTableIds = [],
    onSort,
    onEdit,
    onChangeStatus,
    onDelete,
    onViewQR,
    onSelectionChange,
}: TableListViewProps) {
    const { t } = useTranslation();
    const [localSelectedIds, setLocalSelectedIds] = useState<number[]>(selectedTableIds);

    const handleSelectAll = (checked: boolean) => {
        const newSelection = checked ? tables.map(t => t.tableId) : [];
        setLocalSelectedIds(newSelection);
        onSelectionChange?.(newSelection);
    };

    const handleSelectRow = (tableId: number, checked: boolean) => {
        const newSelection = checked
            ? [...localSelectedIds, tableId]
            : localSelectedIds.filter(id => id !== tableId);
        setLocalSelectedIds(newSelection);
        onSelectionChange?.(newSelection);
    };

    const allSelected = tables.length > 0 && localSelectedIds.length === tables.length;
    const someSelected = localSelectedIds.length > 0 && localSelectedIds.length < tables.length;

    if (loading) {
        return (
            <div className="space-y-3">
                {[...Array(5)].map((_, index) => (
                    <Skeleton key={index} className="h-16 w-full" />
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

    const SortIcon = ({ field }: { field: string }) => (
        <ArrowUpDown
            className={`ml-2 h-4 w-4 inline ${sortField === field ? 'text-primary' : 'text-muted-foreground'}`}
        />
    );

    return (
        <div className="border rounded-md">
            <Table>
                <TableHeader>
                    <TableRow>
                        {onSelectionChange && (
                            <TableHead className="w-12">
                                <Checkbox
                                    checked={allSelected}
                                    onCheckedChange={handleSelectAll}
                                    aria-checked={someSelected ? 'mixed' : undefined}
                                    aria-label={t('common.selectAll', 'Select all')}
                                />
                            </TableHead>
                        )}
                        <TableHead 
                            className="cursor-pointer hover:bg-muted/50"
                            onClick={() => onSort('tableNumber')}
                        >
                            {t('tables.tableNumber', 'Table Number')}
                            <SortIcon field="tableNumber" />
                        </TableHead>
                        <TableHead>
                            {t('tables.tableName', 'Name')}
                        </TableHead>
                        <TableHead 
                            className="cursor-pointer hover:bg-muted/50"
                            onClick={() => onSort('capacity')}
                        >
                            {t('tables.capacity', 'Capacity')}
                            <SortIcon field="capacity" />
                        </TableHead>
                        <TableHead 
                            className="cursor-pointer hover:bg-muted/50"
                            onClick={() => onSort('floor')}
                        >
                            {t('tables.floor', 'Floor')}
                            <SortIcon field="floor" />
                        </TableHead>
                        <TableHead>
                            {t('tables.section', 'Section')}
                        </TableHead>
                        <TableHead 
                            className="cursor-pointer hover:bg-muted/50"
                            onClick={() => onSort('status')}
                        >
                            {t('tables.status', 'Status')}
                            <SortIcon field="status" />
                        </TableHead>
                        <TableHead>
                            {t('tables.qrCode', 'QR Code')}
                        </TableHead>
                        <TableHead className="text-right">
                            {t('common.actions', 'Actions')}
                        </TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {tables.map((table) => (
                        <TableRow key={table.tableId}>
                            {onSelectionChange && (
                                <TableCell>
                                    <Checkbox
                                        checked={localSelectedIds.includes(table.tableId)}
                                        onCheckedChange={(checked) => handleSelectRow(table.tableId, checked as boolean)}
                                        aria-label={t('common.selectRow', 'Select row')}
                                    />
                                </TableCell>
                            )}
                            <TableCell className="font-medium">{table.tableNumber}</TableCell>
                            <TableCell>{table.tableName || '-'}</TableCell>
                            <TableCell>
                                {table.minCapacity && table.minCapacity !== table.capacity
                                    ? `${table.minCapacity}-${table.capacity}`
                                    : table.capacity}
                            </TableCell>
                            <TableCell>
                                {table.floor ? `${t('tables.floor', 'Floor')} ${table.floor}` : '-'}
                            </TableCell>
                            <TableCell>
                                {table.section ? (
                                    <Badge variant="outline">{table.section}</Badge>
                                ) : (
                                    '-'
                                )}
                            </TableCell>
                            <TableCell>
                                <TableStatusBadge status={table.status} />
                            </TableCell>
                            <TableCell>
                                {table.qrCode ? (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => onViewQR(table)}
                                    >
                                        <QrCode className="h-4 w-4" />
                                    </Button>
                                ) : (
                                    '-'
                                )}
                            </TableCell>
                            <TableCell className="text-right">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon">
                                            <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem onClick={() => onEdit(table)}>
                                            <Edit className="mr-2 h-4 w-4" />
                                            {t('common.edit', 'Edit')}
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => onChangeStatus(table)}>
                                            <CircleDot className="mr-2 h-4 w-4" />
                                            {t('tables.changeStatus', 'Change Status')}
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => onViewQR(table)}>
                                            <QrCode className="mr-2 h-4 w-4" />
                                            {t('tables.viewQR', 'View QR Code')}
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                            onClick={() => onDelete(table)}
                                            className="text-destructive"
                                        >
                                            <Trash2 className="mr-2 h-4 w-4" />
                                            {t('common.delete', 'Delete')}
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
