import { Badge } from '@/components/ui/badge';
import { TableStatus } from '@/types';
import { Circle, CircleCheck, CircleAlert, Wrench } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface TableStatusBadgeProps {
    status: TableStatus;
    className?: string;
}

export function TableStatusBadge({ status, className }: TableStatusBadgeProps) {
    const { t } = useTranslation();

    const statusConfig = {
        available: {
            label: t('tables.available', 'Available'),
            variant: 'default' as const,
            icon: CircleCheck,
            className: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200 hover:bg-green-100 dark:hover:bg-green-900',
        },
        occupied: {
            label: t('tables.occupied', 'Occupied'),
            variant: 'destructive' as const,
            icon: Circle,
            className: 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-200 hover:bg-orange-100 dark:hover:bg-orange-900',
        },
        reserved: {
            label: t('tables.reserved', 'Reserved'),
            variant: 'secondary' as const,
            icon: CircleAlert,
            className: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-200 hover:bg-yellow-100 dark:hover:bg-yellow-900',
        },
        maintenance: {
            label: t('tables.maintenance', 'Maintenance'),
            variant: 'outline' as const,
            icon: Wrench,
            className: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200 hover:bg-blue-100 dark:hover:bg-blue-900',
        },
    };

    const config = statusConfig[status];
    const Icon = config.icon;

    return (
        <Badge 
            variant={config.variant} 
            className={`${config.className} ${className || ''} transition-all duration-300 ease-in-out`}
        >
            <Icon className="w-3 h-3 mr-1 transition-transform duration-200 group-hover:scale-110" />
            {config.label}
        </Badge>
    );
}
