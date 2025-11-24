import { Badge } from '@/components/ui/badge';
import { KitchenOrder } from '../types';

interface KitchenStatusBadgeProps {
    kitchenOrders?: KitchenOrder | null;
}

const statusConfig = {
    pending: {
        label: 'Đang chờ',
        variant: 'secondary' as const,
    },
    preparing: {
        label: 'Đang chuẩn bị',
        variant: 'default' as const,
    },
    cancelled: {
        label: 'Đã huỷ',
        variant: 'outline' as const,
    },
    completed: {
        label: 'Hoàn thành',
        variant: 'outline' as const,
    },
};

export function KitchenStatusBadge({ kitchenOrders }: KitchenStatusBadgeProps) {
    if (!kitchenOrders) {
        return (
            <Badge variant="outline" className="text-muted-foreground">
                Chưa gửi bếp
            </Badge>
        );
    }

    const config = statusConfig[kitchenOrders.status];

    return (
        <Badge variant={config.variant}>
            {config.label}
        </Badge>
    );
}
