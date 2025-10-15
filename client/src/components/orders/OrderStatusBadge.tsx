import { Badge } from '@/components/ui/badge';
import { OrderStatus } from '@/types';

const statusColors: Record<OrderStatus, string> = {
    pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    confirmed: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    preparing: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
    ready: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    served: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
    cancelled: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
};

interface OrderStatusBadgeProps {
    status: OrderStatus;
}

export function OrderStatusBadge({ status }: OrderStatusBadgeProps) {
    return (
        <Badge className={statusColors[status]}>
            {status}
        </Badge>
    );
}
