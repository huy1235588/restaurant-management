import { useState } from 'react';
import { Table as TableType } from '@/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Checkbox } from '@/components/ui/checkbox';
import { TableStatusBadge } from '../components/TableStatusBadge';
import { MoreHorizontal, Edit, Trash2, ArrowUpDown, CircleDot, ArrowRightLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface TableListViewProps {
    tables: TableType[];
    loading: boolean;
    sortField: string;
    sortOrder: 'asc' | 'desc';
    selectedTableIds?: number[];
    onSort: (field: any) => void;
    onEdit?: (table: TableType) => void;
    onChangeStatus?: (table: TableType) => void;
    onDelete?: (table: TableType) => void;
    onAssignOrder?: (table: TableType) => void;
    onSelectionChange?: (selectedIds: number[]) => void;
    onRowClick?: (table: TableType) => void;
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
    onAssignOrder,
    onSelectionChange,
    onRowClick,
}: TableListViewProps) {
    const { t } = useTranslation();
    const [localSelectedIds, setLocalSelectedIds] = useState<number[]>(selectedTableIds);

    const getStatusLabel = (status: string) => {
        const statusMap: Record<string, string> = {
            available: t('tables.tableStatus.available'),
            occupied: t('tables.tableStatus.occupied', 'Occupied'),
            reserved: t('tables.tableStatus.reserved', 'Reserved'),
            maintenance: t('tables.tableStatus.maintenance', 'Maintenance'),
        };
        return statusMap[status] || status;
    };

    const getSectionLabel = (section: string) => {
        const sectionMap: Record<string, string> = {
            main: t('tables.sections.main', 'Main'),
            patio: t('tables.sections.patio', 'Patio'),
            vip: t('tables.sections.vip', 'VIP'),
            bar: t('tables.sections.bar', 'Bar'),
        };
        return sectionMap[section] || section;
    };

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
            <div className="border rounded-md">
                <Table>
                    <TableHeader>
                        <TableRow>
                            {onSelectionChange && <TableHead className="w-12"><Skeleton className="h-4 w-4" /></TableHead>}
                            <TableHead><Skeleton className="h-4 w-20" /></TableHead>
                            <TableHead><Skeleton className="h-4 w-24" /></TableHead>
                            <TableHead><Skeleton className="h-4 w-16" /></TableHead>
                            <TableHead><Skeleton className="h-4 w-16" /></TableHead>
                            <TableHead><Skeleton className="h-4 w-20" /></TableHead>
                            <TableHead><Skeleton className="h-4 w-16" /></TableHead>
                            <TableHead><Skeleton className="h-4 w-16" /></TableHead>
                            <TableHead className="text-right"><Skeleton className="h-4 w-16 ml-auto" /></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {[...Array(5)].map((_, index) => (
                            <TableRow key={index} className="animate-pulse">
                                {onSelectionChange && <TableCell><Skeleton className="h-4 w-4" /></TableCell>}
                                <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                                <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                                <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                                <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                                <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                                <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                                <TableCell><Skeleton className="h-8 w-8 rounded" /></TableCell>
                                <TableCell className="text-right"><Skeleton className="h-8 w-8 ml-auto rounded" /></TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
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
        <div className="border rounded-md overflow-x-auto">
            <Table role="grid" aria-label={t('tables.tablesList', 'List of restaurant tables')} className="min-w-[800px]">
                <TableHeader>
                    <TableRow role="row">
                        {onSelectionChange && (
                            <TableHead className="w-12" role="columnheader" aria-label={t('common.select', 'Select')}>
                                <Checkbox
                                    checked={allSelected}
                                    onCheckedChange={handleSelectAll}
                                    aria-checked={someSelected ? 'mixed' : undefined}
                                    aria-label={t('common.selectAll', 'Select all tables')}
                                />
                            </TableHead>
                        )}
                        <TableHead 
                            className="cursor-pointer hover:bg-muted/50"
                            onClick={() => onSort('tableNumber')}
                            role="columnheader"
                            aria-sort={sortField === 'tableNumber' ? (sortOrder === 'asc' ? 'ascending' : 'descending') : 'none'}
                        >
                            {t('tables.tableNumber', 'Table Number')}
                            <SortIcon field="tableNumber" />
                        </TableHead>
                        <TableHead role="columnheader">
                            {t('tables.tableName', 'Name')}
                        </TableHead>
                        <TableHead 
                            className="cursor-pointer hover:bg-muted/50"
                            onClick={() => onSort('capacity')}
                            role="columnheader"
                            aria-sort={sortField === 'capacity' ? (sortOrder === 'asc' ? 'ascending' : 'descending') : 'none'}
                        >
                            {t('tables.capacity', 'Capacity')}
                            <SortIcon field="capacity" />
                        </TableHead>
                        <TableHead 
                            className="cursor-pointer hover:bg-muted/50"
                            onClick={() => onSort('floor')}
                            role="columnheader"
                            aria-sort={sortField === 'floor' ? (sortOrder === 'asc' ? 'ascending' : 'descending') : 'none'}
                        >
                            {t('tables.floor', 'Floor')}
                            <SortIcon field="floor" />
                        </TableHead>
                        <TableHead role="columnheader">
                            {t('tables.section', 'Section')}
                        </TableHead>
                        <TableHead 
                            className="cursor-pointer hover:bg-muted/50"
                            onClick={() => onSort('status')}
                            role="columnheader"
                            aria-sort={sortField === 'status' ? (sortOrder === 'asc' ? 'ascending' : 'descending') : 'none'}
                        >
                            {t('tables.status', 'Status')}
                            <SortIcon field="status" />
                        </TableHead>
                        <TableHead className="text-right" role="columnheader">
                            {t('common.actions', 'Actions')}
                        </TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {tables.map((table) => (
                        <TableRow 
                            key={table.tableId}
                            onClick={() => onRowClick?.(table)}
                            className="cursor-pointer hover:bg-muted/50 transition-colors duration-200"
                            role="row"
                            aria-label={t('tables.tableRow', 'Table {{number}}: {{status}}', { 
                                number: table.tableNumber,
                                status: getStatusLabel(table.status)
                            })}
                        >
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
                                    <Badge variant="outline">{getSectionLabel(table.section)}</Badge>
                                ) : (
                                    '-'
                                )}
                            </TableCell>
                            <TableCell>
                                <TableStatusBadge status={(table.status)} />
                            </TableCell>
                            <TableCell className="text-right">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon">
                                            <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        {onEdit && (
                                            <DropdownMenuItem onClick={() => onEdit(table)}>
                                                <Edit className="mr-2 h-4 w-4" />
                                                {t('common.edit', 'Edit')}
                                            </DropdownMenuItem>
                                        )}
                                        {onChangeStatus && (
                                            <DropdownMenuItem onClick={() => onChangeStatus(table)}>
                                                <CircleDot className="mr-2 h-4 w-4" />
                                                {t('tables.changeStatus', 'Change Status')}
                                            </DropdownMenuItem>
                                        )}
                                        {onAssignOrder && (
                                            <DropdownMenuItem onClick={() => onAssignOrder(table)}>
                                                <ArrowRightLeft className="mr-2 h-4 w-4" />
                                                {t('tables.assignOrder', 'Assign to Order')}
                                            </DropdownMenuItem>
                                        )}
                                        {onDelete && (
                                            <DropdownMenuItem
                                                onClick={() => onDelete(table)}
                                                className="text-destructive"
                                            >
                                                <Trash2 className="mr-2 h-4 w-4" />
                                                {t('common.delete', 'Delete')}
                                            </DropdownMenuItem>
                                        )}
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
