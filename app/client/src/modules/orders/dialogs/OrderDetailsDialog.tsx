'use client';

import { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useOrder, useMarkItemAsServed } from '../hooks';
import { Order, OrderItem as OrderItemType } from '../types';
import { OrderStatusBadge, OrderItemCard } from '../components';
import { formatCurrency, formatDateTime, isOrderEditable, canCancelOrder } from '../utils';
import { useTranslation } from 'react-i18next';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, Trash2, FileText } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface OrderDetailsDialogProps {
    open: boolean;
    onClose: () => void;
    orderId: number | null;
    onAddItems?: (order: Order) => void;
    onCancelItem?: (order: Order, item: OrderItemType) => void;
    onCancelOrder?: (order: Order) => void;
    onPreviewInvoice?: (order: Order) => void;
}

export function OrderDetailsDialog({
    open,
    onClose,
    orderId,
    onAddItems,
    onCancelItem,
    onCancelOrder,
    onPreviewInvoice,
}: OrderDetailsDialogProps) {
    const { t } = useTranslation();
    const { data: order, isLoading, error } = useOrder(orderId || 0, !!orderId);
    const markServedMutation = useMarkItemAsServed();

    const handleMarkServed = async (itemId: number) => {
        if (!order) return;
        await markServedMutation.mutateAsync({ orderId: order.orderId || order.id, itemId });
    };

    const handleCancelItem = (item: OrderItemType) => {
        if (order && onCancelItem) {
            onCancelItem(order, item);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-3xl max-h-[90vh]">
                <DialogHeader>
                    <DialogTitle>{t('orders.orderDetails')}</DialogTitle>
                    <DialogDescription>
                        Chi tiết đơn hàng và trạng thái các món
                    </DialogDescription>
                </DialogHeader>

                {isLoading ? (
                    <div className="space-y-4">
                        <Skeleton className="h-20 w-full" />
                        <Skeleton className="h-32 w-full" />
                        <Skeleton className="h-32 w-full" />
                    </div>
                ) : error ? (
                    <Alert variant="destructive">
                        <AlertDescription>
                            {error instanceof Error ? error.message : t('common.error')}
                        </AlertDescription>
                    </Alert>
                ) : order ? (
                    <ScrollArea className="max-h-[70vh] pr-4">
                        <div className="space-y-6">
                            {/* Order Info */}
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="text-lg font-semibold">
                                            Đơn hàng #{order.id}
                                        </h3>
                                        <p className="text-sm text-muted-foreground">
                                            {formatDateTime(order.createdAt)}
                                        </p>
                                    </div>
                                    <OrderStatusBadge status={order.status} />
                                </div>

                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <span className="text-muted-foreground">Bàn:</span>
                                        <p className="font-medium">
                                            {order.table?.tableNumber || 'N/A'}
                                        </p>
                                    </div>
                                    <div>
                                        <span className="text-muted-foreground">Nhân viên:</span>
                                        <p className="font-medium">
                                            {order.staff?.fullName || 'N/A'}
                                        </p>
                                    </div>
                                </div>

                                {(order.notes || order.note) && (
                                    <div>
                                        <span className="text-sm text-muted-foreground">
                                            Ghi chú:
                                        </span>
                                        <p className="text-sm mt-1">{order.notes || order.note}</p>
                                    </div>
                                )}
                            </div>

                            <Separator />

                            {/* Order Items */}
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <h4 className="font-semibold">{t('orders.items')}</h4>
                                    {isOrderEditable(order.status) && onAddItems && (
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => onAddItems(order)}
                                        >
                                            <Plus className="h-4 w-4 mr-1" />
                                            {t('orders.addItems')}
                                        </Button>
                                    )}
                                </div>

                                {(order.orderItems || order.items) && (order.orderItems || order.items)!.length > 0 ? (
                                    <div className="space-y-2">
                                        {(order.orderItems || order.items)!.map((item) => (
                                            <OrderItemCard
                                                key={item.orderItemId || item.id}
                                                item={item}
                                                onCancelItem={
                                                    onCancelItem ? () => handleCancelItem(item) : undefined
                                                }
                                                onMarkServed={handleMarkServed}
                                                showActions={isOrderEditable(order.status)}
                                            />
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-center text-muted-foreground py-8">
                                        {t('orders.noItems')}
                                    </p>
                                )}
                            </div>

                            <Separator />

                            {/* Total Amount */}
                            <div className="bg-muted p-4 rounded-lg">
                                <div className="flex justify-between items-center text-lg font-semibold">
                                    <span>{t('orders.totalAmount')}:</span>
                                    <span className="text-primary">
                                        {formatCurrency(order.finalAmount || order.totalAmount)}
                                    </span>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-2 justify-end">
                                {onPreviewInvoice && (
                                    <Button variant="outline" onClick={() => onPreviewInvoice(order)}>
                                        <FileText className="h-4 w-4 mr-2" />
                                        {t('orders.previewInvoice')}
                                    </Button>
                                )}
                                {canCancelOrder(order.status) && onCancelOrder && (
                                    <Button
                                        variant="destructive"
                                        onClick={() => onCancelOrder(order)}
                                    >
                                        <Trash2 className="h-4 w-4 mr-2" />
                                        {t('orders.cancelOrder')}
                                    </Button>
                                )}
                            </div>
                        </div>
                    </ScrollArea>
                ) : null}
            </DialogContent>
        </Dialog>
    );
}
