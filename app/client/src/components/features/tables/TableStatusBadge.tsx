import { Badge } from '@/components/ui/badge';
import { TableStatus } from '@/types';
import { Circle, CircleCheck, CircleAlert, Wrench } from 'lucide-react';

interface TableStatusBadgeProps {
    status: TableStatus;
    className?: string;
}

const statusConfig = {
    available: {
        label: 'Available',
        variant: 'default' as const,
        icon: CircleCheck,
        className: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200 hover:bg-green-100 dark:hover:bg-green-900',
    },
    occupied: {
        label: 'Occupied',
        variant: 'destructive' as const,
        icon: Circle,
        className: 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-200 hover:bg-orange-100 dark:hover:bg-orange-900',
    },
    reserved: {
        label: 'Reserved',
        variant: 'secondary' as const,
        icon: CircleAlert,
        className: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-200 hover:bg-yellow-100 dark:hover:bg-yellow-900',
    },
    maintenance: {
        label: 'Maintenance',
        variant: 'outline' as const,
        icon: Wrench,
        className: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200 hover:bg-blue-100 dark:hover:bg-blue-900',
    },
};

export function TableStatusBadge({ status, className }: TableStatusBadgeProps) {
    const config = statusConfig[status];
    const Icon = config.icon;

    return (
        <Badge variant={config.variant} className={`${config.className} ${className || ''}`}>
            <Icon className="w-3 h-3 mr-1" />
            {config.label}
        </Badge>
    );
}
