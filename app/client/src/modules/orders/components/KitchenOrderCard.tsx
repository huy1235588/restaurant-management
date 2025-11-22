import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { KitchenOrder } from '../types';
import { KitchenOrderStatusBadge } from './OrderStatusBadge';
import {
    calculateElapsedTime,
    formatElapsedTime,
    getWaitingTimeColor,
} from '../utils';
import { useTranslation } from 'react-i18next';
import { Check, Clock } from 'lucide-react';
import { useMemo } from 'react';

interface KitchenOrderCardProps {
    kitchenOrder: KitchenOrder;
    onMarkReady?: (kitchenOrderId: number) => void;
}

export function KitchenOrderCard({ kitchenOrder, onMarkReady }: KitchenOrderCardProps) {
    const { t } = useTranslation();

    const elapsedMinutes = useMemo(
        () => calculateElapsedTime(kitchenOrder.createdAt),
        [kitchenOrder.createdAt]
    );

    const timeColor = useMemo(
        () => getWaitingTimeColor(elapsedMinutes),
        [elapsedMinutes]
    );

    return (
        <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
                <div className="space-y-3">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                        <div>
                            <h3 className="font-semibold">
                                {t('orders.table')} {kitchenOrder.order?.table?.tableNumber || 'N/A'}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                                {t('orders.orderNumber')}: #{kitchenOrder.orderId}
                            </p>
                        </div>
                        <KitchenOrderStatusBadge status={kitchenOrder.status} />
                    </div>

                    {/* Item details */}
                    <div className="space-y-1">
                        <p className="font-medium">
                            {kitchenOrder.orderItem?.menuItem?.name || 'Unknown Item'}
                        </p>
                        <p className="text-sm text-muted-foreground">
                            {t('orders.quantity')}: {kitchenOrder.quantity}
                        </p>
                        {kitchenOrder.orderItem?.note && (
                            <p className="text-sm text-amber-600">
                                <span className="font-medium">{t('orders.note')}:</span>{' '}
                                {kitchenOrder.orderItem.note}
                            </p>
                        )}
                    </div>

                    {/* Elapsed time */}
                    <div className="flex items-center justify-between pt-2 border-t">
                        <div className={`flex items-center gap-1 text-sm font-medium ${timeColor}`}>
                            <Clock className="h-4 w-4" />
                            {formatElapsedTime(elapsedMinutes)}
                        </div>
                        {kitchenOrder.status === 'pending' && onMarkReady && (
                            <Button
                                size="sm"
                                variant="default"
                                onClick={() => onMarkReady(kitchenOrder.id)}
                                className="bg-green-600 hover:bg-green-700"
                            >
                                <Check className="h-4 w-4 mr-1" />
                                {t('orders.markReady')}
                            </Button>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
