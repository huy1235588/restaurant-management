import React from 'react';
import { ReservationStatus } from '@/types';
import { Badge } from '@/components/ui/badge';
import { 
    Clock, 
    CheckCircle, 
    XCircle, 
    Users, 
    CheckCircle2,
    Ban
} from 'lucide-react';

interface StatusBadgeProps {
    status: ReservationStatus;
    className?: string;
}

const STATUS_CONFIG: Record<ReservationStatus, {
    label: string;
    variant: 'default' | 'secondary' | 'destructive' | 'outline';
    icon: React.ReactNode;
    className: string;
}> = {
    pending: {
        label: 'Pending',
        variant: 'outline',
        icon: <Clock className="h-3 w-3" />,
        className: 'border-yellow-500 text-yellow-700 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-950/30',
    },
    confirmed: {
        label: 'Confirmed',
        variant: 'default',
        icon: <CheckCircle className="h-3 w-3" />,
        className: 'border-green-500 text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-950/30',
    },
    seated: {
        label: 'Seated',
        variant: 'default',
        icon: <Users className="h-3 w-3" />,
        className: 'border-blue-500 text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/30',
    },
    completed: {
        label: 'Completed',
        variant: 'secondary',
        icon: <CheckCircle2 className="h-3 w-3" />,
        className: 'border-gray-500 text-gray-700 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/30',
    },
    cancelled: {
        label: 'Cancelled',
        variant: 'destructive',
        icon: <XCircle className="h-3 w-3" />,
        className: 'border-red-500 text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-950/30',
    },
    no_show: {
        label: 'No Show',
        variant: 'destructive',
        icon: <Ban className="h-3 w-3" />,
        className: 'border-gray-700 dark:border-gray-500 text-gray-900 dark:text-gray-300 bg-gray-100 dark:bg-gray-800/30',
    },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
    const config = STATUS_CONFIG[status];

    return (
        <Badge 
            variant={config.variant}
            className={`flex items-center gap-1.5 px-3 py-1 font-semibold border-2 ${config.className} ${className || ''}`}
        >
            {config.icon}
            <span className="text-xs">{config.label}</span>
        </Badge>
    );
}
