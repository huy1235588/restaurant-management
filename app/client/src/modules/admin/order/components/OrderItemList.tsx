'use client';

import { OrderItem } from '../types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    formatCurrency,
    getOrderItemStatusColor,
    getOrderItemStatusLabel,
    canCancelOrderItem,
    canMarkItemServed,
} from '../utils';
import { Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';

interface OrderItemListProps {
    items: OrderItem[];
    onCancelItem?: (item: OrderItem) => void;
    onMarkServed?: (item: OrderItem) => void;
    readOnly?: boolean;
}

export function OrderItemList({
    items,
    onCancelItem,
    onMarkServed,
    readOnly = false,
}: OrderItemListProps) {
    const { t } = useTranslation();

    if (items.length === 0) {
        return (
            <div className="text-center py-8 text-muted-foreground">
                {t('orders.noItems')}
            </div>
        );
    }

    return (
        <div className="space-y-2">
            {items.map((item) => (
                <div
                    key={item.orderItemId}
                    className={cn(
                        'flex items-start justify-between gap-4 rounded-lg border p-4',
                        item.status === 'cancelled' && 'opacity-50'
                    )}
                >
                    <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                            <h4 className="font-medium">
                                {item.quantity}x {item.menuItem.itemName}
                            </h4>
                            <Badge
                                variant="outline"
                                className={cn(
                                    'text-xs',
                                    getOrderItemStatusColor(item.status)
                                )}
                            >
                                {getOrderItemStatusLabel(item.status)}
                            </Badge>
                        </div>
                        {item.specialRequest && (
                            <p className="text-sm text-amber-600 dark:text-amber-400">
                                📝 {item.specialRequest}
                            </p>
                        )}
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>{formatCurrency(item.unitPrice)} {t('orders.perItem')}</span>
                            <span className="font-medium text-foreground">
                                {formatCurrency(item.totalPrice)}
                            </span>
                        </div>
                    </div>

                    {!readOnly && (
                        <div className="flex gap-2">
                            {canMarkItemServed(item) && onMarkServed && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => onMarkServed(item)}
                                >
                                    <Check className="h-4 w-4 mr-1" />
                                    {t('orders.served')}
                                </Button>
                            )}
                            {canCancelOrderItem(item) && onCancelItem && (
                                <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => onCancelItem(item)}
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            )}
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}
