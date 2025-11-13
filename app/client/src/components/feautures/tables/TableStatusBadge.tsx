import { useTranslation } from 'react-i18next';
import { Badge } from '@/components/ui/badge';
import { TableStatus } from '@/types';
import { cn } from '@/lib/utils';

const STATUS_STYLES: Record<TableStatus, string> = {
    available: 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-400/40 dark:bg-emerald-400/10 dark:text-emerald-300',
    occupied: 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-400/40 dark:bg-rose-400/10 dark:text-rose-300',
    reserved: 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-400/40 dark:bg-amber-400/10 dark:text-amber-300',
    maintenance: 'border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-400/40 dark:bg-sky-400/10 dark:text-sky-300',
};

const STATUS_LABELS: Record<TableStatus, string> = {
    available: 'tables.status.available',
    occupied: 'tables.status.occupied',
    reserved: 'tables.status.reserved',
    maintenance: 'tables.status.maintenance',
};

interface TableStatusBadgeProps {
    status: TableStatus;
    className?: string;
}

export function TableStatusBadge({ status, className }: TableStatusBadgeProps) {
    const { t } = useTranslation();

    return (
        <Badge
            variant="outline"
            className={cn('gap-1 border', STATUS_STYLES[status], className)}
        >
            <span className="h-2.5 w-2.5 rounded-full bg-current opacity-70" />
            {t(STATUS_LABELS[status], status.charAt(0).toUpperCase() + status.slice(1))}
        </Badge>
    );
}
