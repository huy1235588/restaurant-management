import { Badge } from '@/components/ui/badge';
import { KitchenOrderStatus } from '../types';
import { KITCHEN_STATUS_LABELS, KITCHEN_STATUS_COLORS } from '../utils';

interface KitchenStatusBadgeProps {
    status: KitchenOrderStatus;
}

export function KitchenStatusBadge({ status }: KitchenStatusBadgeProps) {
      const rawVariant = KITCHEN_STATUS_COLORS[status];
        const variant =
            String(rawVariant) === 'success' || String(rawVariant) === 'warning'
                ? 'secondary'
                : (rawVariant as 'default' | 'secondary' | 'destructive' | 'outline' | undefined);
    return (
        <Badge variant={variant}>
            {KITCHEN_STATUS_LABELS[status]}
        </Badge>
    );
}
