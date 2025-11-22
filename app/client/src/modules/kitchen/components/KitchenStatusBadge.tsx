import { Badge } from '@/components/ui/badge';
import { KitchenOrderStatus } from '../types';
import { KITCHEN_STATUS_LABELS, KITCHEN_STATUS_COLORS } from '../utils';

interface KitchenStatusBadgeProps {
    status: KitchenOrderStatus;
}

export function KitchenStatusBadge({ status }: KitchenStatusBadgeProps) {
    return (
        <Badge variant={KITCHEN_STATUS_COLORS[status]}>
            {KITCHEN_STATUS_LABELS[status]}
        </Badge>
    );
}
