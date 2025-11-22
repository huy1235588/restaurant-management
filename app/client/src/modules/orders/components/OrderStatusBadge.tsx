import { Badge } from '@/components/ui/badge';
import { OrderStatus, OrderItemStatus, KitchenOrderStatus } from '../types';
import {
    getOrderStatusColor,
    getOrderItemStatusColor,
    getKitchenOrderStatusColor,
} from '../utils';
import { useTranslation } from 'react-i18next';

interface OrderStatusBadgeProps {
    status: OrderStatus;
    className?: string;
}

export function OrderStatusBadge({ status, className }: OrderStatusBadgeProps) {
    const { t } = useTranslation();

    return (
        <Badge
            variant="outline"
            className={`${getOrderStatusColor(status)} ${className || ''}`}
        >
            {t(`orders.status.${status}`)}
        </Badge>
    );
}

interface OrderItemStatusBadgeProps {
    status: OrderItemStatus;
    className?: string;
}

export function OrderItemStatusBadge({ status, className }: OrderItemStatusBadgeProps) {
    const { t } = useTranslation();

    return (
        <Badge
            variant="outline"
            className={`${getOrderItemStatusColor(status)} ${className || ''}`}
        >
            {t(`orders.itemStatus.${status}`)}
        </Badge>
    );
}

interface KitchenOrderStatusBadgeProps {
    status: KitchenOrderStatus;
    className?: string;
}

export function KitchenOrderStatusBadge({ status, className }: KitchenOrderStatusBadgeProps) {
    const { t } = useTranslation();

    return (
        <Badge
            variant="outline"
            className={`${getKitchenOrderStatusColor(status)} ${className || ''}`}
        >
            {t(`orders.itemStatus.${status}`)}
        </Badge>
    );
}
