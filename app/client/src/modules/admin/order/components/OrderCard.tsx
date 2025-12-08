'use client';

import { memo, useCallback } from 'react';
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
    canCreateBill,
} from '../utils';
import { Eye, Plus, X, Receipt } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';

interface OrderCardProps {
    order: Order;
    onCancelOrder?: (order: Order) => void;
}

export const OrderCard = memo(function OrderCard({ order, onCancelOrder }: OrderCardProps) {
    const router = useRouter();
    const { t } = useTranslation();

    const handleViewDetails = useCallback(() => {
        router.push(`/admin/orders/${order.orderId}`);
    }, [router, order.orderId]);

    const handleAddItems = useCallback(() => {
        router.push(`/admin/orders/${order.orderId}/edit`);
    }, [router, order.orderId]);

    const handleCancelOrder = useCallback(() => {
        if (onCancelOrder) {
            onCancelOrder(order);
        }
    }, [onCancelOrder, order]);

    const handleCreateBill = useCallback(() => {
        router.push(`/admin/bills/create?orderId=${order.orderId}`);
    }, [router, order.orderId]);

    return (
        <Card>
            <CardHeader>
                <div className="space-y-1">
                    <CardTitle className="text-lg flex items-center gap-3">
                        {formatOrderNumber(order.orderNumber)}
                        <OrderStatusBadge status={order.status} />
                    </CardTitle>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>{t('orders.table', { number: order.table.tableNumber })}</span>
                        {order.table.tableName && (
                            <span>• {order.table.tableName}</span>
                        )}
                        {order.staff && (
                            <span>• {order.staff.fullName}</span>
                        )}
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                            <p className="text-muted-foreground">{t('orders.customer')}</p>
                            <p className="font-medium">
                                {order.customerName || t('orders.noName')}
                            </p>
                            {order.customerPhone && (
                                <p className="text-xs text-muted-foreground">
                                    {order.customerPhone}
                                </p>
                            )}
                        </div>
                        <div>
                            <p className="text-muted-foreground">{t('orders.partySize')}</p>
                            <p className="font-medium">{order.partySize} {t('orders.people')}</p>
                        </div>
                    </div>

                    <div className="flex items-center justify-between border-t pt-3">
                        <div>
                            <p className="text-sm text-muted-foreground">
                                {formatDateTime(order.orderTime)}
                            </p>
                            <p className="text-xs text-muted-foreground">
                                {order.orderItems.length} {t('orders.items')}
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
                            {t('orders.viewDetails')}
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
                        {canCreateBill(order) && (
                            <Button
                                variant="secondary"
                                size="sm"
                                onClick={handleCreateBill}
                                title={t('orders.createBill')}
                            >
                                <Receipt className="h-4 w-4" />
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
}, (prevProps, nextProps) => {
    // Only re-render if order data changed
    return (
        prevProps.order.orderId === nextProps.order.orderId &&
        prevProps.order.status === nextProps.order.status &&
        prevProps.order.updatedAt === nextProps.order.updatedAt &&
        prevProps.order.finalAmount === nextProps.order.finalAmount
    );
});
