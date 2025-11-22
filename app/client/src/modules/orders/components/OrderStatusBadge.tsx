import { Badge } from '@/components/ui/badge';
import { OrderStatus } from '../types';
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from '../utils';

interface OrderStatusBadgeProps {
    status: OrderStatus;
}

export function OrderStatusBadge({ status }: OrderStatusBadgeProps) {
    const rawVariant = ORDER_STATUS_COLORS[status];
    const variant =
        rawVariant === 'success' || rawVariant === 'warning'
            ? 'secondary'
            : (rawVariant as 'default' | 'secondary' | 'destructive' | 'outline' | undefined);

    return (
        <Badge variant={variant}>
            {ORDER_STATUS_LABELS[status]}
        </Badge>
    );
}
