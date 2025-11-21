import { ReservationStatus } from '../types';
import { getStatusText, getStatusColor } from '../utils';

interface StatusBadgeProps {
    status: ReservationStatus;
    className?: string;
}

export function StatusBadge({ status, className = '' }: StatusBadgeProps) {
    const colorClass = getStatusColor(status);
    const text = getStatusText(status);

    return (
        <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${colorClass} ${className}`}
        >
            {text}
        </span>
    );
}
