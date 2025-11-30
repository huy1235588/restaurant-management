'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { OrderCard } from '../components/OrderCard';
import { OrderCardSkeleton } from '../components/OrderCardSkeleton';
import { CancelOrderDialog } from '../dialogs/CancelOrderDialog';
import { useOrders, useOrderSocket, useFullscreen } from '../hooks';
import { Order, OrderStatus } from '../types';
import { ORDER_CONSTANTS } from '../constants';
import { Plus, Search, Maximize2, Minimize2, Keyboard } from 'lucide-react';

export function OrderListView() {
    const { t } = useTranslation();
    const router = useRouter();
    const [page, setPage] = useState(1);
    const [limit] = useState(ORDER_CONSTANTS.DEFAULT_PAGE_SIZE);
    const [status, setStatus] = useState<OrderStatus | ''>('');
    const [search, setSearch] = useState('');
    const [orderToCancel, setOrderToCancel] = useState<Order | null>(null);
    const [showKeyboardHelp, setShowKeyboardHelp] = useState(false);

    // Use custom fullscreen hook
    const { isFullscreen, toggleFullscreen } = useFullscreen({
        toastDuration: ORDER_CONSTANTS.UI.FULLSCREEN_TOAST_DURATION,
    });

    const { data, isLoading, error, refetch } = useOrders({
        page,
        limit,
        status: status || undefined,
        search: search || undefined,
    });

    // Real-time updates
    useOrderSocket({
        enableNotifications: true,
        enableSound: false,
    });

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Ignore if typing in input/textarea
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
            if (isInputField && e.key !== '/') return;

            switch (e.key.toLowerCase()) {
                case 'n':
                    if (e.shiftKey) {
                        e.preventDefault();
                        handleCreateOrder();
                    }
                    break;
                case '/':
                    e.preventDefault();
                    document.querySelector<HTMLInputElement>('input[placeholder*="Tìm"]')?.focus();
                    break;
                case 'r':
                    if (!e.ctrlKey && !e.metaKey) {
                        e.preventDefault();
                        refetch();
                    }
                    break;
                case 'f':
                    e.preventDefault();
                    toggleFullscreen();
                    break;
                case '1':
                    e.preventDefault();
                    setStatus('');
                    break;
                case '2':
                    e.preventDefault();
                    setStatus('pending');
                    break;
                case '3':
                    e.preventDefault();
                    setStatus('confirmed');
                    break;
                case '4':
                    e.preventDefault();
                    setStatus('completed');
                    break;
                case '?':
                    e.preventDefault();
                    setShowKeyboardHelp(true);
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [toggleFullscreen, refetch]);

    // Memoize filtered orders count for display
    const ordersCount = useMemo(() => data?.data?.length || 0, [data?.data]);

    // Memoize callbacks
    const handleCreateOrder = useCallback(() => {
        router.push('/admin/orders/new');
    }, [router]);

    const handleCancelOrder = useCallback((order: Order) => {
        setOrderToCancel(order);
    }, []);

    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-bold">{t('orders.title')}</h1>
                    <Button onClick={handleCreateOrder}>
                        <Plus className="mr-2 h-4 w-4" />
                        {t('orders.createOrder')}
                    </Button>
                </div>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    <OrderCardSkeleton count={ORDER_CONSTANTS.UI.SKELETON_LOADING_COUNT} />
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-bold">{t('orders.title')}</h1>
                    <Button onClick={handleCreateOrder}>
                        <Plus className="mr-2 h-4 w-4" />
                        {t('orders.createOrder')}
                    </Button>
                </div>
                <div className="text-center py-12 text-destructive">
                    {t('common.error')}: {error.message}
                </div>
            </div>
        );
    }

    const orders = data?.data || [];
    const totalPages = data?.meta?.totalPages || 1;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">{t('orders.title')}</h1>
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
                        {isFullscreen ? t('common.exitFullscreen') : t('common.fullscreen')}
                    </Button>
                    <Button onClick={handleCreateOrder}>
                        <Plus className="mr-2 h-4 w-4" />
                        {t('orders.createOrder')}
                    </Button>
                </div>
            </div>

            {/* Filters */}
            <div className="flex gap-4">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder={t('orders.searchPlaceholder')}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-9"
                    />
                </div>
                <Select value={status} onValueChange={(value) => setStatus(value === "all" ? '' : value as OrderStatus | '')}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder={t('common.status')} />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">{t('orders.status.all')}</SelectItem>
                        <SelectItem value="pending">{t('orders.status.pending')}</SelectItem>
                        <SelectItem value="confirmed">{t('orders.status.confirmed')}</SelectItem>
                        <SelectItem value="completed">{t('orders.status.completed')}</SelectItem>
                        <SelectItem value="cancelled">{t('orders.status.cancelled')}</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Order List */}
            {orders.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                    {t('orders.noOrdersFound')}
                </div>
            ) : (
                <>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {orders.map((order) => (
                            <OrderCard
                                key={order.orderId}
                                order={order}
                                onCancelOrder={handleCancelOrder}
                            />
                        ))}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-center gap-2">
                            <Button
                                variant="outline"
                                onClick={() => setPage(Math.max(1, page - 1))}
                                disabled={page === 1}
                            >
                                {t('common.previous')}
                            </Button>
                            <span className="text-sm text-muted-foreground">
                                {t('common.page')} {page} / {totalPages}
                            </span>
                            <Button
                                variant="outline"
                                onClick={() => setPage(Math.min(totalPages, page + 1))}
                                disabled={page === totalPages}
                            >
                                {t('common.next')}
                            </Button>
                        </div>
                    )}
                </>
            )}

            {/* Cancel Order Dialog */}
            <CancelOrderDialog
                open={!!orderToCancel}
                onOpenChange={(open) => !open && setOrderToCancel(null)}
                order={orderToCancel}
            />

            {/* Keyboard Shortcuts Help Dialog */}
            <Dialog open={showKeyboardHelp} onOpenChange={setShowKeyboardHelp}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>{t('common.keyboardShortcuts')}</DialogTitle>
                        <DialogDescription>
                            {t('orders.keyboardHelpDescription')}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <h4 className="font-semibold text-sm">{t('common.actions')}</h4>
                            <div className="space-y-1 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">{t('orders.createNew')}</span>
                                    <kbd className="px-2 py-1 bg-muted rounded text-xs font-mono">Shift + N</kbd>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">{t('common.search')}</span>
                                    <kbd className="px-2 py-1 bg-muted rounded text-xs font-mono">/</kbd>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">{t('common.refresh')}</span>
                                    <kbd className="px-2 py-1 bg-muted rounded text-xs font-mono">R</kbd>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">{t('common.fullscreen')}</span>
                                    <kbd className="px-2 py-1 bg-muted rounded text-xs font-mono">F / F11</kbd>
                                </div>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <h4 className="font-semibold text-sm">{t('orders.filterByStatus')}</h4>
                            <div className="space-y-1 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">{t('orders.status.all')}</span>
                                    <kbd className="px-2 py-1 bg-muted rounded text-xs font-mono">1</kbd>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">{t('orders.status.pending')}</span>
                                    <kbd className="px-2 py-1 bg-muted rounded text-xs font-mono">2</kbd>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">{t('orders.status.confirmed')}</span>
                                    <kbd className="px-2 py-1 bg-muted rounded text-xs font-mono">3</kbd>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">{t('orders.status.completed')}</span>
                                    <kbd className="px-2 py-1 bg-muted rounded text-xs font-mono">4</kbd>
                                </div>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <h4 className="font-semibold text-sm">{t('common.other')}</h4>
                            <div className="space-y-1 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">{t('common.showHelp')}</span>
                                    <kbd className="px-2 py-1 bg-muted rounded text-xs font-mono">?</kbd>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">{t('common.closeDialog')}</span>
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
