'use client';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { KitchenOrder, KitchenOrderStatus } from '../types';
import { KitchenStatusBadge } from './KitchenStatusBadge';
import { getElapsedTime } from '../utils';
import { CheckCircle } from 'lucide-react';

interface KitchenOrderCardProps {
    order: KitchenOrder;
    onStart?: (id: number) => void;
    onReady?: (id: number) => void;
}

export function KitchenOrderCard({ order, onStart, onReady }: KitchenOrderCardProps) {
    const isPending = order.status === KitchenOrderStatus.PENDING;
    const isReady = order.status === KitchenOrderStatus.READY;
    const isCompleted = order.status === KitchenOrderStatus.COMPLETED;

    return (
        <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                    <div>
                        <h3 className="font-bold text-2xl">{order.order.table.tableNumber}</h3>
                        <p className="text-sm text-muted-foreground">{order.order.orderNumber}</p>
                    </div>
                    <div className="text-right">
                        <KitchenStatusBadge status={order.status} />
                        <p className="text-xs text-muted-foreground mt-1">
                            {getElapsedTime(order.createdAt)}
                        </p>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-3">
                <div className="space-y-2">
                    {order.order.orderItems.map((item, idx) => (
                        <div key={idx} className="flex justify-between text-sm">
                            <span>
                                {item.quantity}x {item.menuItem.itemName}
                            </span>
                            {item.specialRequest && (
                                <span className="text-xs text-amber-600">*</span>
                            )}
                        </div>
                    ))}
                </div>

                {order.order.orderItems.some(item => item.specialRequest) && (
                    <div className="text-xs text-amber-600 border-t pt-2">
                        {order.order.orderItems
                            .filter(item => item.specialRequest)
                            .map((item, idx) => (
                                <div key={idx}>Note: {item.specialRequest}</div>
                            ))}
                    </div>
                )}

                <div className="flex gap-2 pt-2">
                    {isPending && onReady && (
                        <Button
                            size="sm"
                            onClick={() => onReady(order.kitchenOrderId)}
                            className="flex-1"
                        >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Mark Ready
                        </Button>
                    )}
                    {isReady && (
                        <div className="text-center py-2 text-sm font-medium text-green-600">
                            Ready for Pickup
                        </div>
                    )}
                    {isCompleted && (
                        <div className="text-center py-2 text-sm text-muted-foreground">
                            Completed
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
