'use client';

import { memo, useMemo } from 'react';
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
import { Plus, Trash2, FileText, Clock, User, Hash } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { cn } from '@/lib/utils';

interface OrderDetailsDialogProps {
    open: boolean;
    onClose: () => void;
    orderId: number | null;
    onAddItems?: (order: Order) => void;
    onCancelItem?: (order: Order, item: OrderItemType) => void;
    onCancelOrder?: (order: Order) => void;
    onPreviewInvoice?: (order: Order) => void;
}

// Memoized info card component
const InfoCard = memo(({ icon: Icon, label, value }: { icon: any; label: string; value: string }) => (
    <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
        <div className="mt-0.5">
            <Icon className="h-4 w-4 text-muted-foreground" />
        </div>
        <div className="flex-1 min-w-0">
            <p className="text-xs text-muted-foreground mb-0.5">{label}</p>
            <p className="font-medium truncate">{value}</p>
        </div>
    </div>
));
InfoCard.displayName = 'InfoCard';

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

    // Memoize handlers
    const handleMarkServed = useMemo(
        () => async (itemId: number) => {
            if (!order) return;
            await markServedMutation.mutateAsync({ orderId: order.id, itemId });
        },
        [order, markServedMutation]
    );

    const handleCancelItem = useMemo(
        () => (item: OrderItemType) => {
            if (order && onCancelItem) {
                onCancelItem(order, item);
            }
        },
        [order, onCancelItem]
    );

    // Memoize editable state
    const isEditable = useMemo(
        () => order && isOrderEditable(order.status),
        [order]
    );

    const canCancel = useMemo(
        () => order && canCancelOrder(order.status),
        [order]
    );

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-3xl max-h-[90vh] p-0">
                <DialogHeader className="px-6 pt-6 pb-4">
                    <div className="flex items-start justify-between">
                        <div className="space-y-1">
                            <DialogTitle className="text-2xl">
                                {t('orders.orderDetails')}
                            </DialogTitle>
                            <DialogDescription>
                                Chi tiết đơn hàng và trạng thái các món
                            </DialogDescription>
                        </div>
                        {order && <OrderStatusBadge status={order.status} />}
                    </div>
                </DialogHeader>

                {isLoading ? (
                    <div className="px-6 pb-6 space-y-4">
                        <Skeleton className="h-24 w-full rounded-lg" />
                        <Skeleton className="h-32 w-full rounded-lg" />
                        <Skeleton className="h-32 w-full rounded-lg" />
                    </div>
                ) : error ? (
                    <div className="px-6 pb-6">
                        <Alert variant="destructive">
                            <AlertDescription>
                                {error instanceof Error ? error.message : t('common.error')}
                            </AlertDescription>
                        </Alert>
                    </div>
                ) : order ? (
                    <ScrollArea className="max-h-[calc(90vh-180px)]">
                        <div className="px-6 pb-6 space-y-6">
                            {/* Order Header Info */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <Hash className="h-4 w-4" />
                                    <span className="text-2xl font-bold text-foreground">
                                        {order.id}
                                    </span>
                                    <span className="text-sm">•</span>
                                    <Clock className="h-4 w-4" />
                                    <span className="text-sm">
                                        {formatDateTime(order.createdAt)}
                                    </span>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <InfoCard
                                        icon={Hash}
                                        label="Bàn"
                                        value={order.table?.tableNumber || 'N/A'}
                                    />
                                    <InfoCard
                                        icon={User}
                                        label="Nhân viên"
                                        value={order.staff?.fullName || 'N/A'}
                                    />
                                </div>

                                {order.note && (
                                    <div className="p-4 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900">
                                        <p className="text-xs font-medium text-amber-900 dark:text-amber-200 mb-1">
                                            Ghi chú
                                        </p>
                                        <p className="text-sm text-amber-800 dark:text-amber-300">
                                            {order.note}
                                        </p>
                                    </div>
                                )}
                                {order.reservationId && (
                                    <>
                                        <div>
                                            <span className="text-muted-foreground">Reservation:</span>
                                            <p className="font-medium text-blue-700">
                                                {order.reservation?.reservationCode || `#${order.reservationId}`}
                                            </p>
                                        </div>
                                        <div>
                                            <span className="text-muted-foreground">Khách hàng:</span>
                                            <p className="font-medium">
                                                {order.customerName || order.reservation?.customerName || 'N/A'}
                                            </p>
                                        </div>
                                    </>
                                )}

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
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h4 className="text-lg font-semibold flex items-center gap-2">
                                        {t('orders.items')}
                                        <span className="text-sm font-normal text-muted-foreground">
                                            ({order.items?.length || 0})
                                        </span>
                                    </h4>
                                    {isEditable && onAddItems && (
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => onAddItems(order)}
                                            className="gap-2"
                                        >
                                            <Plus className="h-4 w-4" />
                                            {t('orders.addItems')}
                                        </Button>
                                    )}
                                </div>

                                {order.items && order.items.length > 0 ? (
                                    <div className="space-y-3">
                                        {order.items.map((item) => (
                                            <OrderItemCard
                                                key={item.id}
                                                item={item}
                                                onCancelItem={
                                                    onCancelItem ? () => handleCancelItem(item) : undefined
                                                }
                                                onMarkServed={handleMarkServed}
                                                showActions={isEditable}
                                            />
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-12 text-muted-foreground">
                                        <p>{t('orders.noItems')}</p>
                                    </div>
                                )}
                            </div>

                            <Separator />

                            {/* Total Amount - Prominent */}
                            <div className="relative overflow-hidden rounded-xl bg-linear-to-br from-primary/10 via-primary/5 to-background p-6 border-2 border-primary/20">
                                <div className="relative z-10 flex justify-between items-center">
                                    <span className="text-lg font-semibold">
                                        {t('orders.totalAmount')}
                                    </span>
                                    <span className="text-3xl font-bold text-primary">
                                        {formatCurrency(order.totalAmount)}
                                    </span>
                                </div>
                                <div className="absolute inset-0 bg-linear-to-br from-primary/5 to-transparent" />
                            </div>

                            {/* Actions */}
                            <div className="flex flex-wrap gap-2 justify-end">
                                {onPreviewInvoice && (
                                    <Button
                                        variant="outline"
                                        onClick={() => onPreviewInvoice(order)}
                                        className="gap-2"
                                    >
                                        <FileText className="h-4 w-4" />
                                        {t('orders.previewInvoice')}
                                    </Button>
                                )}
                                {canCancel && onCancelOrder && (
                                    <Button
                                        variant="destructive"
                                        onClick={() => onCancelOrder(order)}
                                        className="gap-2"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                        {t('orders.cancelOrder')}
                                    </Button>
                                )}
                            </div>
                        </div>
                    </ScrollArea>
                ) : null}
            </DialogContent>
        </Dialog >
    );
}