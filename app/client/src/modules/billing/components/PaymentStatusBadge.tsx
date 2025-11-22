import { Badge } from '@/components/ui/badge';
import { PaymentStatus } from '../types';
import { PAYMENT_STATUS_LABELS, PAYMENT_STATUS_COLORS } from '../utils';

interface PaymentStatusBadgeProps {
    status: PaymentStatus;
}

export function PaymentStatusBadge({ status }: PaymentStatusBadgeProps) {
    const rawVariant = PAYMENT_STATUS_COLORS[status];
    const variant =
        rawVariant === 'success' || rawVariant === 'warning'
            ? 'secondary'
            : (rawVariant as 'default' | 'secondary' | 'destructive' | 'outline' | undefined);
    return (
        <Badge variant={variant}>
            {PAYMENT_STATUS_LABELS[status]}
        </Badge>
    );
}
