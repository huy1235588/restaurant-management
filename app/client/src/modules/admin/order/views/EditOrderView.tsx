'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { MenuItemSelector } from '../components/MenuItemSelector';
import { ShoppingCart } from '../components/ShoppingCart';
import { OrderSummaryCard } from '../components/OrderSummaryCard';
import { OrderStatusBadge } from '../components/OrderStatusBadge';
import { useOrderById, useAddItems, useFullscreen } from '../hooks';
import { ShoppingCartItem, OrderItem } from '../types';
import { formatOrderNumber, formatCurrency, calculateOrderFinancials } from '../utils';
import { ArrowLeft, Save, AlertCircle, Maximize2, Minimize2, Keyboard } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface EditOrderViewProps {
    orderId: number;
}

export function EditOrderView({ orderId }: EditOrderViewProps) {
    const router = useRouter();
    const { t } = useTranslation();
    const [cartItems, setCartItems] = useState<ShoppingCartItem[]>([]);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    const [showKeyboardHelp, setShowKeyboardHelp] = useState(false);

    const { data: order, isLoading, error } = useOrderById(orderId);
    const addItemsMutation = useAddItems();

    // Use custom fullscreen hook
    const { isFullscreen, toggleFullscreen } = useFullscreen();

    // Warn about unsaved changes
    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (hasUnsavedChanges) {
                e.preventDefault();
                e.returnValue = '';
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [hasUnsavedChanges]);

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            const target = e.target as HTMLElement;
            const isInputField = ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName);

            // Always allow Escape and F11
            if (e.key === 'Escape') {
                e.preventDefault();
                setShowKeyboardHelp(false);
                return;
            }

            if (e.key === 'F11') {
                e.preventDefault();
                toggleFullscreen();
                return;
            }

            // Prevent shortcuts when typing
            if (isInputField) return;

            switch (e.key.toLowerCase()) {
                case 'b':
                    e.preventDefault();
                    handleBack();
                    break;
                case 's':
                    if (e.ctrlKey || e.metaKey) {
                        e.preventDefault();
                        if (cartItems.length > 0) {
                            handleSubmit();
                        }
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
    }, [cartItems, hasUnsavedChanges, toggleFullscreen]);

    const handleBack = () => {
        if (hasUnsavedChanges) {
            const confirmed = confirm(t('orders.unsavedChangesWarning'));
            if (!confirmed) return;
        }
        router.push(`/admin/orders/${orderId}`);
    };

    const handleSubmit = async () => {
        if (cartItems.length === 0) {
            alert(t('orders.pleaseAddItem'));
            return;
        }

        await addItemsMutation.mutateAsync({
            orderId,
            data: {
                items: cartItems.map((item) => ({
                    itemId: item.menuItemId,
                    quantity: item.quantity,
                    specialRequest: item.specialRequests,
                })),
            },
        });
        setHasUnsavedChanges(false);
        // Navigation handled by useAddItems hook
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

    const currentFinancials = calculateOrderFinancials(order.orderItems || []);

    // Convert cart items to OrderItem format
    const tempNewItems: OrderItem[] = cartItems.map((item, index) => ({
        orderItemId: -(index + 1), // Negative IDs for temp items
        orderId: order.orderId,
        itemId: item.menuItemId,
        menuItem: {
            itemId: item.menuItemId,
            itemName: item.name,
            price: item.price,
            categoryId: 0,
            description: null,
            imagePath: null,
            isAvailable: true,
        },
        quantity: item.quantity,
        unitPrice: item.price,
        totalPrice: item.price * item.quantity,
        specialRequest: item.specialRequests || null,
        status: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    }));

    const newItemsSubtotal = tempNewItems.reduce(
        (sum: number, item: any) => sum + item.totalPrice,
        0
    );

    const newFinancials = calculateOrderFinancials([
        ...(order.orderItems || []),
        ...tempNewItems,
    ]);

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
                            {t('orders.addItemsTitle', { orderNumber: formatOrderNumber(order.orderNumber) })}
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            {t('orders.table', { number: order.table?.tableNumber || 'N/A' })}
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
                </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                {/* Main Content */}
                <div className="space-y-6 lg:col-span-2">
                    {/* Current Order Summary */}
                    <Card>
                        <CardHeader>
                            <CardTitle>{t('orders.currentOrder')}</CardTitle>
                            <CardDescription>
                                {order.orderItems?.length || 0} {t('orders.items')} - {t('orders.total')}: {formatCurrency(currentFinancials.total)}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                {order.orderItems?.map((item: any) => (
                                    <div
                                        key={item.orderItemId}
                                        className="flex justify-between text-sm"
                                    >
                                        <span className="flex-1">
                                            {item.menuItem?.itemName || 'Unknown'} x{item.quantity}
                                            {item.specialRequest && (
                                                <span className="text-muted-foreground ml-2">
                                                    ({item.specialRequest})
                                                </span>
                                            )}
                                        </span>
                                        <span className="font-medium">
                                            {formatCurrency(Number(item.unitPrice) * item.quantity)}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Add Items */}
                    <Card>
                        <CardHeader>
                            <CardTitle>{t('orders.addNewItems')}</CardTitle>
                            <CardDescription>
                                {t('orders.selectFoodToAdd')}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <MenuItemSelector
                                cartItems={cartItems}
                                onAddItem={(item) => {
                                    setCartItems((prev) => {
                                        const existing = prev.find(
                                            (i) => i.menuItemId === item.menuItemId
                                        );
                                        if (existing) {
                                            return prev.map((i) =>
                                                i.menuItemId === item.menuItemId
                                                    ? { ...i, quantity: i.quantity + item.quantity }
                                                    : i
                                            );
                                        }
                                        return [...prev, item];
                                    });
                                    setHasUnsavedChanges(true);
                                }}
                            />
                        </CardContent>
                    </Card>

                    {/* Changes Summary */}
                    {cartItems.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle>{t('orders.changesSummary')}</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <h4 className="font-medium mb-2">{t('orders.newItems')} ({cartItems.length})</h4>
                                    <div className="space-y-1">
                                        {cartItems.map((item) => (
                                            <div
                                                key={item.menuItemId}
                                                className="flex justify-between text-sm"
                                            >
                                                <span>
                                                    {item.name} x{item.quantity}
                                                </span>
                                                <span className="font-medium">
                                                    {formatCurrency(item.price * item.quantity)}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <Separator />

                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">{t('orders.currentTotal')}</span>
                                        <span>{formatCurrency(currentFinancials.total)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">{t('orders.add')}</span>
                                        <span>{formatCurrency(newItemsSubtotal)}</span>
                                    </div>
                                    <Separator />
                                    <div className="flex justify-between font-semibold">
                                        <span>{t('orders.newTotal')}</span>
                                        <span>{formatCurrency(newFinancials.total)}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {addItemsMutation.isError && (
                        <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>
                                {addItemsMutation.error?.message || t('orders.errorOccurred')}
                            </AlertDescription>
                        </Alert>
                    )}
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Shopping Cart */}
                    {cartItems.length > 0 && (
                        <ShoppingCart
                            items={cartItems}
                            onUpdateQuantity={(menuItemId, quantity) => {
                                setCartItems((prev) =>
                                    prev.map((item) =>
                                        item.menuItemId === menuItemId
                                            ? { ...item, quantity }
                                            : item
                                    )
                                );
                                setHasUnsavedChanges(true);
                            }}
                            onRemoveItem={(menuItemId) => {
                                setCartItems((prev) =>
                                    prev.filter((item) => item.menuItemId !== menuItemId)
                                );
                                setHasUnsavedChanges(true);
                            }}
                        />
                    )}

                    {/* Summary */}
                    <OrderSummaryCard
                        subtotal={newFinancials.subtotal}
                        serviceCharge={newFinancials.serviceCharge}
                        tax={newFinancials.tax}
                        discount={newFinancials.discount}
                        total={newFinancials.total}
                    />

                    {/* Actions */}
                    <Button
                        className="w-full"
                        onClick={handleSubmit}
                        disabled={cartItems.length === 0 || addItemsMutation.isPending}
                    >
                        <Save className="mr-2 h-4 w-4" />
                        {addItemsMutation.isPending ? t('orders.saving') : t('orders.addItems')}
                    </Button>
                </div>
            </div>

            {/* Keyboard Shortcuts Help Dialog */}
            <Dialog open={showKeyboardHelp} onOpenChange={setShowKeyboardHelp}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>{t('orders.keyboardShortcutsAddItems')}</DialogTitle>
                        <DialogDescription>
                            {t('orders.keyboardShortcutsAddItemsDesc')}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <h4 className="font-semibold text-sm">{t('orders.actions')}</h4>
                            <div className="space-y-1 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">{t('orders.backToDetail')}</span>
                                    <kbd className="px-2 py-1 bg-muted rounded text-xs font-mono">B</kbd>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">{t('orders.saveChanges')}</span>
                                    <kbd className="px-2 py-1 bg-muted rounded text-xs font-mono">Ctrl+S</kbd>
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
