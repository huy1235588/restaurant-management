import { ReservationStatus } from '../types';
import { getStatusText, getStatusColor } from '../utils';
import { Clock, CheckCircle, Users, XCircle, AlertCircle, Check } from 'lucide-react';

interface StatusBadgeProps {
    status: ReservationStatus;
    className?: string;
    showIcon?: boolean;
}

export function StatusBadge({ status, className = '', showIcon = true }: StatusBadgeProps) {
    const colorClass = getStatusColor(status);
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

    const getGradientClass = () => {
        switch (status) {
            case 'pending':
                return 'bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-950 dark:to-yellow-950 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800';
            case 'confirmed':
                return 'bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800';
            case 'seated':
                return 'bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800';
            case 'completed':
                return 'bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800';
            case 'cancelled':
                return 'bg-gradient-to-r from-red-50 to-rose-50 dark:from-red-950 dark:to-rose-950 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800';
            case 'no_show':
                return 'bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-950 dark:to-amber-950 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-800';
            default:
                return colorClass;
        }
    };

    return (
        <span
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border shadow-sm transition-all duration-200 hover:shadow-md ${getGradientClass()} ${className}`}
        >
            {showIcon && getIcon()}
            <span className="tracking-wide">{text}</span>
        </span>
    );
}