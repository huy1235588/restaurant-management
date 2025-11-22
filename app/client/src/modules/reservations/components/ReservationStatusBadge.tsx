import { Badge } from '@/components/ui/badge';
import { ReservationStatus } from '../types';
import { RESERVATION_STATUS_LABELS, RESERVATION_STATUS_COLORS } from '../utils';

interface ReservationStatusBadgeProps {
    status: ReservationStatus;
}

export function ReservationStatusBadge({ status }: ReservationStatusBadgeProps) {
    return (
        <Badge variant={RESERVATION_STATUS_COLORS[status]}>
            {RESERVATION_STATUS_LABELS[status]}
        </Badge>
    );
}
