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
        className: 'bg-green-100 text-green-700 hover:bg-green-100',
    },
    occupied: {
        label: 'Occupied',
        variant: 'destructive' as const,
        icon: Circle,
        className: 'bg-red-100 text-red-700 hover:bg-red-100',
    },
    reserved: {
        label: 'Reserved',
        variant: 'secondary' as const,
        icon: CircleAlert,
        className: 'bg-yellow-100 text-yellow-700 hover:bg-yellow-100',
    },
    maintenance: {
        label: 'Maintenance',
        variant: 'outline' as const,
        icon: Wrench,
        className: 'bg-blue-100 text-blue-700 hover:bg-blue-100',
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
