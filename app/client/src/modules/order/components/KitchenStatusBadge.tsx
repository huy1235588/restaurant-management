import { Badge } from '@/components/ui/badge';
import { KitchenOrder } from '../types';
import { useTranslation } from 'react-i18next';

interface KitchenStatusBadgeProps {
    kitchenOrders?: KitchenOrder | null;
}

export function KitchenStatusBadge({ kitchenOrders }: KitchenStatusBadgeProps) {
    const { t } = useTranslation();

    const statusConfig = {
        pending: {
            label: t('orders.kitchenStatus.pending'),
            variant: 'secondary' as const,
        },
        preparing: {
            label: t('orders.kitchenStatus.preparing'),
            variant: 'default' as const,
        },
        cancelled: {
            label: t('orders.kitchenStatus.cancelled'),
            variant: 'outline' as const,
        },
        completed: {
            label: t('orders.kitchenStatus.completed'),
            variant: 'outline' as const,
        },
    };

    if (!kitchenOrders) {
        return (
            <Badge variant="outline" className="text-muted-foreground">
                {t('orders.kitchenStatus.notSentToKitchen')}
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
