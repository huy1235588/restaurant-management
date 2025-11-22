import { Badge } from '@/components/ui/badge';
import { OrderStatus, OrderItemStatus, KitchenOrderStatus } from '../types';
import {
    getOrderStatusColor,
    getOrderItemStatusColor,
    getKitchenOrderStatusColor,
    getOrderStatusLabel,
    getOrderItemStatusLabel,
    getKitchenOrderStatusLabel,
} from '../utils';

interface OrderStatusBadgeProps {
    status: OrderStatus;
    className?: string;
}

export function OrderStatusBadge({ status, className }: OrderStatusBadgeProps) {
    return (
        <Badge
            variant="outline"
            className={`${getOrderStatusColor(status)} ${className || ''}`}
        >
            {getOrderStatusLabel(status)}
        </Badge>
    );
}

interface OrderItemStatusBadgeProps {
    status: OrderItemStatus;
    className?: string;
}

export function OrderItemStatusBadge({ status, className }: OrderItemStatusBadgeProps) {
    return (
        <Badge
            variant="outline"
            className={`${getOrderItemStatusColor(status)} ${className || ''}`}
        >
            {getOrderItemStatusLabel(status)}
        </Badge>
    );
}

interface KitchenOrderStatusBadgeProps {
    status: KitchenOrderStatus;
    className?: string;
}

export function KitchenOrderStatusBadge({ status, className }: KitchenOrderStatusBadgeProps) {
    return (
        <Badge
            variant="outline"
            className={`${getKitchenOrderStatusColor(status)} ${className || ''}`}
        >
            {getKitchenOrderStatusLabel(status)}
        </Badge>
    );
}
