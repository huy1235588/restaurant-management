import { Badge } from '@/components/ui/badge';
import { KitchenOrder } from '../types';

interface KitchenStatusBadgeProps {
    kitchenOrder?: KitchenOrder | null;
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
    ready: {
        label: 'Sẵn sàng',
        variant: 'default' as const,
    },
    completed: {
        label: 'Hoàn thành',
        variant: 'outline' as const,
    },
};

export function KitchenStatusBadge({ kitchenOrder }: KitchenStatusBadgeProps) {
    if (!kitchenOrder) {
        return (
            <Badge variant="outline" className="text-muted-foreground">
                Chưa gửi bếp
            </Badge>
        );
    }

    const config = statusConfig[kitchenOrder.status];

    return (
        <Badge variant={config.variant}>
            {config.label}
        </Badge>
    );
}
