import { Badge } from '@/components/ui/badge';
import { PaymentStatus } from '../types';
import { PAYMENT_STATUS_LABELS, PAYMENT_STATUS_COLORS } from '../utils';

interface PaymentStatusBadgeProps {
    status: PaymentStatus;
}

export function PaymentStatusBadge({ status }: PaymentStatusBadgeProps) {
    return (
        <Badge variant={PAYMENT_STATUS_COLORS[status]}>
            {PAYMENT_STATUS_LABELS[status]}
        </Badge>
    );
}
