import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { OrderItem } from '../types';
import { OrderItemStatusBadge } from './OrderStatusBadge';
import {
    formatCurrency,
    canCancelItem,
    canMarkItemAsServed,
} from '../utils';
import { useTranslation } from 'react-i18next';
import { Trash2, Check } from 'lucide-react';

interface OrderItemCardProps {
    item: OrderItem;
    onCancelItem?: (itemId: number) => void;
    onMarkServed?: (itemId: number) => void;
    showActions?: boolean;
}

export function OrderItemCard({
    item,
    onCancelItem,
    onMarkServed,
    showActions = true,
}: OrderItemCardProps) {
    const { t } = useTranslation();

    return (
        <Card>
            <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <CardTitle className="text-base">
                            {item.menuItem?.itemName || item.menuItem?.name || 'Unknown Item'}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                            {t('orders.quantity')}: {item.quantity} × {formatCurrency(item.unitPrice || item.menuItem?.price || 0)}
                        </p>
                    </div>
                    <OrderItemStatusBadge status={item.status} />
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-2">
                    {(item.specialRequest || item.note) && (
                        <p className="text-sm text-muted-foreground">
                            <span className="font-medium">{t('orders.note')}:</span> {item.specialRequest || item.note}
                        </p>
                    )}
                    <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold">
                            {t('orders.subtotal')}: {formatCurrency(item.totalPrice || (item.unitPrice || item.menuItem?.price || 0) * item.quantity)}
                        </p>
                        {showActions && (
                            <div className="flex gap-2">
                                {canMarkItemAsServed(item.status) && onMarkServed && (
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => onMarkServed(item.orderItemId || item.id)}
                                    >
                                        <Check className="h-4 w-4 mr-1" />
                                        {t('orders.markServed')}
                                    </Button>
                                )}
                                {canCancelItem(item.status) && onCancelItem && (
                                    <Button
                                        size="sm"
                                        variant="destructive"
                                        onClick={() => onCancelItem(item.orderItemId || item.id)}
                                    >
                                        <Trash2 className="h-4 w-4 mr-1" />
                                        {t('orders.cancelItem')}
                                    </Button>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
