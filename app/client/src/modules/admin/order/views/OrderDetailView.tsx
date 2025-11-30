'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { OrderStatusBadge } from '../components/OrderStatusBadge';
import { KitchenStatusBadge } from '../components/KitchenStatusBadge';
import { OrderItemList } from '../components/OrderItemList';
import { OrderSummaryCard } from '../components/OrderSummaryCard';
import { OrderTimeline } from '../components/OrderTimeline';
import { CancelItemDialog } from '../dialogs/CancelItemDialog';
import { CancelOrderDialog } from '../dialogs/CancelOrderDialog';
import { useOrderById, useOrderSocket, useUpdateOrderStatus, useFullscreen } from '../hooks';
import { Order, OrderItem } from '../types';
import { formatOrderNumber, formatDateTime, canAddItems, canCancelOrder, canCreateBill } from '../utils';
import { ArrowLeft, Plus, XCircle, Printer, Receipt, Check, Keyboard, Maximize2, Minimize2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface OrderDetailViewProps {
    orderId: number;
}

export function OrderDetailView({ orderId }: OrderDetailViewProps) {
    const router = useRouter();
    const { t } = useTranslation();
    const [itemToCancel, setItemToCancel] = useState<OrderItem | null>(null);
    const [showCancelOrderDialog, setShowCancelOrderDialog] = useState(false);
    const [showKeyboardHelp, setShowKeyboardHelp] = useState(false);

    const { data: order, isLoading, error } = useOrderById(orderId);
    const updateStatusMutation = useUpdateOrderStatus();

    // Use custom fullscreen hook
    const { isFullscreen, toggleFullscreen } = useFullscreen();

    // Real-time updates
    useOrderSocket({
        enableNotifications: true,
        enableSound: true,
    });

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            const target = e.target as HTMLElement;
            const isInputField = ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName);

            // Always allow Escape
            if (e.key === 'Escape') {
                e.preventDefault();
                setShowKeyboardHelp(false);
                setShowCancelOrderDialog(false);
                setItemToCancel(null);
                return;
            }

            // Prevent shortcuts when typing
            if (isInputField) return;

            if (!order) return;

            switch (e.key.toLowerCase()) {
                case 'b':
                    e.preventDefault();
                    handleBack();
                    break;
                case 'p':
                    if (e.ctrlKey || e.metaKey) {
                        e.preventDefault();
                        handlePrint();
                    }
                    break;
                case 'a':
                    if (canAddItems(order)) {
                        e.preventDefault();
                        handleAddItems();
                    }
                    break;
                case 'c':
                    if (order && canCreateBill(order)) {
                        e.preventDefault();
                        handleConfirmOrder();
                    }
                    break;
                case 'x':
                    if (canCancelOrder(order)) {
                        e.preventDefault();
                        handleCancelOrder();
                    }
                    break;
                case 'r':
                    if (order.status === 'completed') {
                        e.preventDefault();
                        handleCreateBill();
                    }
                    break;
                case 'f':
                    e.preventDefault();
                    toggleFullscreen();
                    break;
                case '?':
                    e.preventDefault();
                    setShowKeyboardHelp(true);
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [order, toggleFullscreen]);

    const handleBack = () => {
        router.push('/admin/orders');
    };

    const handleAddItems = () => {
        router.push(`/admin/orders/${orderId}/edit`);
    };

    const handleCancelOrder = () => {
        setShowCancelOrderDialog(true);
    };

    const handleConfirmOrder = () => {
        updateStatusMutation.mutate({
            orderId,
            data: { status: 'confirmed' },
        });
    };

    const handlePrint = () => {
        window.print();
    };

    const handleCreateBill = () => {
        // TODO: Integrate with billing module
        router.push(`/admin/bills/create?orderId=${orderId}`);
    };

    if (isLoading) {
        return (
            <div className="space-y-6">
                <Button variant="ghost" onClick={handleBack}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    {t('orders.back')}
                </Button>
                <div className="text-center py-12 text-muted-foreground">
                    {t('orders.loading')}
                </div>
            </div>
        );
    }

    if (error || !order) {
        return (
            <div className="space-y-6">
                <Button variant="ghost" onClick={handleBack}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    {t('orders.back')}
                </Button>
                <div className="text-center py-12 text-destructive">
                    {error?.message || t('orders.orderNotFound')}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" onClick={handleBack}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        {t('orders.back')}
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold">
                            {formatOrderNumber(order.orderNumber)}
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            {formatDateTime(order.createdAt)}
                        </p>
                    </div>
                    <OrderStatusBadge status={order.status} />
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="icon" onClick={() => setShowKeyboardHelp(true)} title={t('common.keyboardShortcuts')}>
                        <Keyboard className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" onClick={toggleFullscreen}>
                        {isFullscreen ? (
                            <Minimize2 className="mr-2 h-4 w-4" />
                        ) : (
                            <Maximize2 className="mr-2 h-4 w-4" />
                        )}
                        {isFullscreen ? "Exit" : "Fullscreen"}
                    </Button>
                    {order.status === 'pending' && (
                        <Button
                            onClick={handleConfirmOrder}
                            disabled={updateStatusMutation.isPending}
                        >
                            <Check className="mr-2 h-4 w-4" />
                            {updateStatusMutation.isPending ? t('orders.confirming') : t('orders.confirmOrder')}
                        </Button>
                    )}
                    {canAddItems(order) && (
                        <Button onClick={handleAddItems} variant="outline">
                            <Plus className="mr-2 h-4 w-4" />
                            {t('orders.addItems')}
                        </Button>
                    )}
                    {canCancelOrder(order) && (
                        <Button variant="destructive" onClick={handleCancelOrder}>
                            <XCircle className="mr-2 h-4 w-4" />
                            {t('orders.cancelOrder')}
                        </Button>
                    )}
                    <Button variant="outline" onClick={handlePrint}>
                        <Printer className="mr-2 h-4 w-4" />
                        {t('orders.print')}
                    </Button>
                    {canCreateBill(order) && (
                        <Button variant="outline" onClick={handleCreateBill}>
                            <Receipt className="mr-2 h-4 w-4" />
                            {t('orders.createBill')}
                        </Button>
                    )}
                </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                {/* Main Content - Left Column (2/3) */}
                <div className="space-y-6 lg:col-span-2">
                    {/* Order Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle>{t('orders.orderInfo')}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">{t('orders.tableLabel')}</p>
                                    <p className="text-lg font-semibold">
                                        {order.table?.tableNumber || 'N/A'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">{t('orders.staffLabel')}</p>
                                    <p className="text-lg">
                                        {order.staff?.fullName || 'N/A'}
                                    </p>
                                </div>
                            </div>
                            <Separator />
                            <div className="grid gap-4 md:grid-cols-2">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">{t('orders.customerLabel')}</p>
                                    <p className="text-lg">
                                        {order.customerName || t('orders.walkInCustomer')}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">{t('orders.phoneLabel')}</p>
                                    <p className="text-lg">
                                        {order.customerPhone || t('orders.noPhone')}
                                    </p>
                                </div>
                            </div>
                            <Separator />
                            <div>
                                <p className="text-sm font-medium text-muted-foreground mb-2">{t('orders.kitchenStatusLabel')}</p>
                                <KitchenStatusBadge kitchenOrders={order.kitchenOrders?.[0] || null} />
                                {order.kitchenOrders?.[0]?.chef && (
                                    <p className="text-sm text-muted-foreground mt-1">
                                        {t('orders.chef')} {order.kitchenOrders[0].chef.fullName}
                                    </p>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Order Items */}
                    <Card>
                        <CardHeader>
                            <CardTitle>{t('orders.items')} ({order.orderItems?.length || 0})</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <OrderItemList
                                items={order.orderItems || []}
                                onCancelItem={setItemToCancel}
                            />
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar - Right Column (1/3) */}
                <div className="space-y-6">
                    {/* Order Summary */}
                    <OrderSummaryCard
                        subtotal={(order.orderItems || []).reduce((sum: number, item) => sum + Number(item.unitPrice) * item.quantity, 0)}
                        serviceCharge={0}
                        tax={0}
                        discount={0}
                        total={(order.orderItems || []).reduce((sum: number, item) => sum + Number(item.unitPrice) * item.quantity, 0)}
                    />

                    {/* Additional Info */}
                    <Card>
                        <CardHeader>
                            <CardTitle>{t('orders.additionalInfo')}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">{t('orders.orderCode')}</p>
                                <p className="text-sm font-mono">{order.orderNumber}</p>
                            </div>
                            <Separator />
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">{t('orders.createdDate')}</p>
                                <p className="text-sm">{formatDateTime(order.createdAt)}</p>
                            </div>
                            {order.updatedAt && (
                                <>
                                    <Separator />
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">{t('orders.lastUpdated')}</p>
                                        <p className="text-sm">{formatDateTime(order.updatedAt)}</p>
                                    </div>
                                </>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Dialogs */}
            <CancelItemDialog
                open={!!itemToCancel}
                onOpenChange={(open) => !open && setItemToCancel(null)}
                item={itemToCancel}
                orderId={orderId}
            />
            <CancelOrderDialog
                open={showCancelOrderDialog}
                onOpenChange={setShowCancelOrderDialog}
                order={order}
            />

            {/* Keyboard Shortcuts Help Dialog */}
            <Dialog open={showKeyboardHelp} onOpenChange={setShowKeyboardHelp}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>{t('orders.keyboardShortcutsDetail')}</DialogTitle>
                        <DialogDescription>
                            {t('orders.keyboardShortcutsDetailDesc')}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <h4 className="font-semibold text-sm">{t('orders.actions')}</h4>
                            <div className="space-y-1 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">{t('orders.backToList')}</span>
                                    <kbd className="px-2 py-1 bg-muted rounded text-xs font-mono">B</kbd>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">{t('orders.printOrder')}</span>
                                    <kbd className="px-2 py-1 bg-muted rounded text-xs font-mono">Ctrl+P</kbd>
                                </div>
                                {canAddItems(order) && (
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">{t('orders.addItems')}</span>
                                        <kbd className="px-2 py-1 bg-muted rounded text-xs font-mono">A</kbd>
                                    </div>
                                )}
                                {order.status === 'pending' && (
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">{t('orders.confirmOrder')}</span>
                                        <kbd className="px-2 py-1 bg-muted rounded text-xs font-mono">C</kbd>
                                    </div>
                                )}
                                {canCancelOrder(order) && (
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">{t('orders.cancelOrder')}</span>
                                        <kbd className="px-2 py-1 bg-muted rounded text-xs font-mono">X</kbd>
                                    </div>
                                )}
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">{t('orders.createBill')}</span>
                                    <kbd className="px-2 py-1 bg-muted rounded text-xs font-mono">R</kbd>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">{t('orders.fullscreen')}</span>
                                    <kbd className="px-2 py-1 bg-muted rounded text-xs font-mono">F / F11</kbd>
                                </div>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <h4 className="font-semibold text-sm">{t('orders.other')}</h4>
                            <div className="space-y-1 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">{t('orders.showHelp')}</span>
                                    <kbd className="px-2 py-1 bg-muted rounded text-xs font-mono">?</kbd>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">{t('orders.closeDialog')}</span>
                                    <kbd className="px-2 py-1 bg-muted rounded text-xs font-mono">ESC</kbd>
                                </div>
                            </div>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
