import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { OrderStatusBadge } from './OrderStatusBadge';
import { Order } from '@/types';

interface OrderCardProps {
    order: Order;
    onViewDetails?: (orderId: number) => void;
    onUpdateStatus?: (orderId: number) => void;
}

export function OrderCard({ order, onViewDetails, onUpdateStatus }: OrderCardProps) {
    return (
        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Order #{order.orderId}</CardTitle>
                    <OrderStatusBadge status={order.status} />
                </div>
                <CardDescription>
                    Table {order.table?.tableNumber || order.tableId || 'N/A'} •{' '}
                    {new Date(order.orderTime).toLocaleTimeString()}
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Items:</span>
                        <span className="font-medium">
                            {order.orderItems?.length || 0}
                        </span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Total:</span>
                        <span className="font-bold text-lg">
                            ${order.finalAmount?.toFixed(2) || '0.00'}
                        </span>
                    </div>
                    {order.specialRequests && (
                        <p className="text-xs text-muted-foreground mt-2">
                            Note: {order.specialRequests}
                        </p>
                    )}
                </div>
                <div className="mt-4 flex gap-2">
                    {onViewDetails && (
                        <Button
                            size="sm"
                            variant="outline"
                            className="flex-1"
                            onClick={() => onViewDetails(order.orderId)}
                        >
                            View Details
                        </Button>
                    )}
                    {onUpdateStatus && (
                        <Button
                            size="sm"
                            className="flex-1"
                            onClick={() => onUpdateStatus(order.orderId)}
                        >
                            Update Status
                        </Button>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
