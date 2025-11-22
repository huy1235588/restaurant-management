import { Badge } from '@/components/ui/badge';
import { OrderStatus } from '../types';
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from '../utils';

interface OrderStatusBadgeProps {
    status: OrderStatus;
}

export function OrderStatusBadge({ status }: OrderStatusBadgeProps) {
    return (
        <Badge variant={ORDER_STATUS_COLORS[status]}>
            {ORDER_STATUS_LABELS[status]}
        </Badge>
    );
}
