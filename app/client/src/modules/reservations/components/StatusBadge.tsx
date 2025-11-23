import { ReservationStatus } from '../types';
import { getStatusText, getStatusGradient } from '../utils';
import { Clock, CheckCircle, Users, XCircle, AlertCircle, Check } from 'lucide-react';

interface StatusBadgeProps {
    status: ReservationStatus;
    className?: string;
    showIcon?: boolean;
}

export function StatusBadge({ status, className = '', showIcon = true }: StatusBadgeProps) {
    const gradientClass = getStatusGradient(status);
    const text = getStatusText(status);

    const getIcon = () => {
        switch (status) {
            case 'pending':
                return <Clock className="w-3.5 h-3.5" />;
            case 'confirmed':
                return <CheckCircle className="w-3.5 h-3.5" />;
            case 'seated':
                return <Users className="w-3.5 h-3.5" />;
            case 'completed':
                return <Check className="w-3.5 h-3.5" />;
            case 'cancelled':
                return <XCircle className="w-3.5 h-3.5" />;
            case 'no_show':
                return <AlertCircle className="w-3.5 h-3.5" />;
            default:
                return null;
        }
    };

    return (
        <span
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border shadow-sm transition-all duration-200 hover:shadow-md ${gradientClass} ${className}`}
        >
            {showIcon && getIcon()}
            <span className="tracking-wide">{text}</span>
        </span>
    );
}