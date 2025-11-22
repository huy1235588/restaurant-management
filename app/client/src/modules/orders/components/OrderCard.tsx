import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Order } from '../types';
import { OrderStatusBadge } from './OrderStatusBadge';
import { formatCurrency, formatDateTime } from '../utils';
import { Button } from '@/components/ui/button';
import { Eye, CheckCircle, XCircle } from 'lucide-react';

interface OrderCardProps {
    order: Order;
    onView?: (order: Order) => void;
    onConfirm?: (order: Order) => void;
    onCancel?: (order: Order) => void;
}

export function OrderCard({ order, onView, onConfirm, onCancel }: OrderCardProps) {
    return (
        <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                    <div>
                        <h3 className="font-semibold text-lg">{order.orderNumber}</h3>
                        <p className="text-sm text-muted-foreground">
                            Table {order.table?.tableNumber}
                        </p>
                    </div>
                    <OrderStatusBadge status={order.status} />
                </div>
            </CardHeader>
            <CardContent className="space-y-3">
                {order.customerName && (
                    <div className="text-sm">
                        <span className="text-muted-foreground">Customer: </span>
                        <span className="font-medium">{order.customerName}</span>
                    </div>
                )}
                <div className="text-sm">
                    <span className="text-muted-foreground">Items: </span>
                    <span className="font-medium">
                        {order.orderItems?.length || 0}
                    </span>
                </div>
                <div className="text-sm">
                    <span className="text-muted-foreground">Total: </span>
                    <span className="font-semibold text-lg">
                        {formatCurrency(order.totalAmount)}
                    </span>
                </div>
                <div className="text-xs text-muted-foreground">
                    {formatDateTime(order.createdAt)}
                </div>

                <div className="flex gap-2 pt-2">
                    {onView && (
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onView(order)}
                            className="flex-1"
                        >
                            <Eye className="w-4 h-4 mr-1" />
                            View
                        </Button>
                    )}
                    {onConfirm && order.status === 'pending' && (
                        <Button
                            size="sm"
                            variant="default"
                            onClick={() => onConfirm(order)}
                            className="flex-1"
                        >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Confirm
                        </Button>
                    )}
                    {onCancel && (order.status === 'pending' || order.status === 'confirmed') && (
                        <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => onCancel(order)}
                        >
                            <XCircle className="w-4 h-4" />
                        </Button>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
