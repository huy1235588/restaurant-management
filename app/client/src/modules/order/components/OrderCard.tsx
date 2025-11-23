'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Order } from '../types';
import { OrderStatusBadge } from './OrderStatusBadge';
import {
    formatCurrency,
    formatDateTime,
    formatOrderNumber,
    canAddItems,
    canCancelOrder,
} from '../utils';
import { Eye, Plus, X } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface OrderCardProps {
    order: Order;
    onCancelOrder?: (order: Order) => void;
}

export function OrderCard({ order, onCancelOrder }: OrderCardProps) {
    const router = useRouter();

    const handleViewDetails = () => {
        router.push(`/orders/${order.orderId}`);
    };

    const handleAddItems = () => {
        router.push(`/orders/${order.orderId}/edit`);
    };

    const handleCancelOrder = () => {
        if (onCancelOrder) {
            onCancelOrder(order);
        }
    };

    return (
        <Card>
            <CardHeader>
                <div className="flex items-start justify-between">
                    <div className="space-y-1">
                        <CardTitle className="text-lg">
                            {formatOrderNumber(order.orderNumber)}
                        </CardTitle>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span>Bàn {order.table.tableNumber}</span>
                            {order.table.tableName && (
                                <span>• {order.table.tableName}</span>
                            )}
                            {order.staff && (
                                <span>• {order.staff.fullName}</span>
                            )}
                        </div>
                    </div>
                    <OrderStatusBadge status={order.status} />
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                            <p className="text-muted-foreground">Khách</p>
                            <p className="font-medium">
                                {order.customerName || 'Không có tên'}
                            </p>
                            {order.customerPhone && (
                                <p className="text-xs text-muted-foreground">
                                    {order.customerPhone}
                                </p>
                            )}
                        </div>
                        <div>
                            <p className="text-muted-foreground">Số người</p>
                            <p className="font-medium">{order.partySize} người</p>
                        </div>
                    </div>

                    <div className="flex items-center justify-between border-t pt-3">
                        <div>
                            <p className="text-sm text-muted-foreground">
                                {formatDateTime(order.orderTime)}
                            </p>
                            <p className="text-xs text-muted-foreground">
                                {order.orderItems.length} món
                            </p>
                        </div>
                        <p className="text-lg font-bold">
                            {formatCurrency(parseFloat(order.finalAmount))}
                        </p>
                    </div>

                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleViewDetails}
                            className="flex-1"
                        >
                            <Eye className="mr-2 h-4 w-4" />
                            Xem chi tiết
                        </Button>
                        {canAddItems(order) && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleAddItems}
                            >
                                <Plus className="h-4 w-4" />
                            </Button>
                        )}
                        {canCancelOrder(order) && (
                            <Button
                                variant="destructive"
                                size="sm"
                                onClick={handleCancelOrder}
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
