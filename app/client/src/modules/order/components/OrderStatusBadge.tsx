import { Badge } from '@/components/ui/badge';
import { OrderStatus } from '../types';
import { getOrderStatusColor, getOrderStatusLabel } from '../utils';
import { cn } from '@/lib/utils';

interface OrderStatusBadgeProps {
    status: OrderStatus;
    className?: string;
}

export function OrderStatusBadge({ status, className }: OrderStatusBadgeProps) {
    return (
        <Badge
            variant="outline"
            className={cn(getOrderStatusColor(status), className)}
        >
            {getOrderStatusLabel(status)}
        </Badge>
    );
}
