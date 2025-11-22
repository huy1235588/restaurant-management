import { Badge } from '@/components/ui/badge';
import { ReservationStatus } from '../types';
import { RESERVATION_STATUS_LABELS, RESERVATION_STATUS_COLORS } from '../utils';

interface ReservationStatusBadgeProps {
    status: ReservationStatus;
}

export function ReservationStatusBadge({ status }: ReservationStatusBadgeProps) {
    const rawVariant = RESERVATION_STATUS_COLORS[status];
    const variant =
        rawVariant === 'success' || rawVariant === 'warning'
            ? 'secondary'
            : (rawVariant as 'default' | 'secondary' | 'destructive' | 'outline' | undefined);
    return (
        <Badge variant={variant} >
            {RESERVATION_STATUS_LABELS[status]}
        </Badge>
    );
}
