import { Table } from '@/types';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useTranslation } from 'react-i18next';
import {
    MoreHorizontal,
    Pencil,
    QrCode,
    Trash2,
    Workflow,
    ArrowRightLeft,
} from 'lucide-react';

interface TableRowActionsProps {
    table: Table;
    onEdit?: (table: Table) => void;
    onChangeStatus?: (table: Table) => void;
    onViewQr?: (table: Table) => void;
    onAssignOrder?: (table: Table) => void;
    onDelete?: (table: Table) => void;
    disableEdit?: boolean;
    disableDelete?: boolean;
    disableStatusChange?: boolean;
    disableAssign?: boolean;
    disableQr?: boolean;
}

export function TableRowActions({
    table,
    onEdit,
    onChangeStatus,
    onViewQr,
    onAssignOrder,
    onDelete,
    disableEdit,
    disableDelete,
    disableStatusChange,
    disableAssign,
    disableQr,
}: TableRowActionsProps) {
    const { t } = useTranslation();

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8" aria-label={t('tables.actions.open', 'Open table actions')}>
                    <MoreHorizontal className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem
                    onClick={() => onEdit?.(table)}
                    disabled={!onEdit || disableEdit}
                >
                    <Pencil className="mr-2 h-4 w-4" />
                    {t('tables.actions.edit', 'Edit Table')}
                </DropdownMenuItem>
                <DropdownMenuItem
                    onClick={() => onChangeStatus?.(table)}
                    disabled={!onChangeStatus || disableStatusChange}
                >
                    <Workflow className="mr-2 h-4 w-4" />
                    {t('tables.actions.changeStatus', 'Change Status')}
                </DropdownMenuItem>
                <DropdownMenuItem
                    onClick={() => onAssignOrder?.(table)}
                    disabled={!onAssignOrder || disableAssign}
                >
                    <ArrowRightLeft className="mr-2 h-4 w-4" />
                    {t('tables.actions.assignOrder', 'Assign to Order')}
                </DropdownMenuItem>
                <DropdownMenuItem
                    onClick={() => onViewQr?.(table)}
                    disabled={!onViewQr || disableQr}
                >
                    <QrCode className="mr-2 h-4 w-4" />
                    {t('tables.actions.viewQr', 'View QR Code')}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                    onClick={() => onDelete?.(table)}
                    className="text-destructive focus:text-destructive"
                    disabled={!onDelete || disableDelete}
                >
                    <Trash2 className="mr-2 h-4 w-4" />
                    {t('tables.actions.delete', 'Delete Table')}
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
