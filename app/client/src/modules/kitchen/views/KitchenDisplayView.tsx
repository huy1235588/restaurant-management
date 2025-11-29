"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { RefreshCw, Maximize2, Minimize2, Keyboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { useKitchenOrders } from "../hooks/useKitchenOrders";
import { useKitchenSocket } from "../hooks/useKitchenSocket";
import { useFullscreen } from "../hooks/useFullscreen";
import { useStartPreparing } from "../hooks/useStartPreparing";
import { useCompleteOrder } from "../hooks/useCompleteOrder";
import { useCancelKitchenOrder } from "../hooks/useCancelKitchenOrder";
import {
    KitchenOrderStatus,
} from "../types/kitchen.types";
import { KitchenOrderCard } from "../components/KitchenOrderCard";
import { KitchenStats } from "../components/KitchenStats";
import { LoadingState } from "../components/LoadingState";
import { ErrorState } from "../components/ErrorState";
import { EmptyState } from "../components/EmptyState";
import { KitchenHelpers } from "../utils/kitchen-helpers";
import { useTranslation } from "react-i18next";

export function KitchenDisplayView() {
    const { t } = useTranslation();
    const [statusFilter, setStatusFilter] = useState<
        KitchenOrderStatus | "all"
    >("all");
    const [showKeyboardHelp, setShowKeyboardHelp] = useState(false);

    // Use custom fullscreen hook
    const { isFullscreen, toggleFullscreen } = useFullscreen();

    // Queries
    const { data: orders, isLoading, isError, refetch } = useKitchenOrders();

    // WebSocket connection
    const { isConnected } = useKitchenSocket();

    // Mutations
    const startPreparingMutation = useStartPreparing();
    const completeOrderMutation = useCompleteOrder();
    const cancelMutation = useCancelKitchenOrder();

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
            if (isInputField) return;

            switch (e.key.toLowerCase()) {
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
                    setStatusFilter('all');
                    break;
                case '2':
                    e.preventDefault();
                    setStatusFilter(KitchenOrderStatus.PENDING);
                    break;
                case '3':
                    e.preventDefault();
                    setStatusFilter(KitchenOrderStatus.PREPARING);
                    break;
                case '4':
                    e.preventDefault();
                    setStatusFilter(KitchenOrderStatus.COMPLETED);
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

    // Filter and sort orders by creation time (oldest first)
    const filteredOrders = useMemo(() => {
        if (!orders) return [];

        return KitchenHelpers.sortOrdersByTime(
            KitchenHelpers.filterOrdersByStatus(orders, statusFilter)
        );
    }, [orders, statusFilter]);

    // Memoize stats for orders
    const ordersStats = useMemo(() => {
        if (!orders) return { total: 0, pending: 0, preparing: 0, completed: 0 };

        return orders.reduce((acc, order) => {
            acc.total++;
            if (order.status === 'pending') acc.pending++;
            if (order.status === 'preparing') acc.preparing++;
            if (order.status === 'completed') acc.completed++;
            return acc;
        }, { total: 0, pending: 0, preparing: 0, completed: 0 });
    }, [orders]);

    // Memoize action handlers
    const handleStartPreparing = useCallback((orderId: number) => {
        startPreparingMutation.mutate(orderId);
    }, [startPreparingMutation]);

    const handleCompleteOrder = useCallback((orderId: number) => {
        completeOrderMutation.mutate(orderId);
    }, [completeOrderMutation]);

    const handleCancel = useCallback((orderId: number) => {
        cancelMutation.mutate(orderId);
    }, [cancelMutation]);

    // Listen to fullscreen changes (already handled by useFullscreen hook)
    // Removed duplicate fullscreen logic

    // Current time display
    const [currentTime, setCurrentTime] = useState(
        new Date().toLocaleTimeString()
    );

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date().toLocaleTimeString());
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    return (
        <div className="h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
            {/* Header - Hidden in fullscreen */}
            {!isFullscreen && (
                <div className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 px-3 md:px-4 py-2 md:py-3 flex items-center justify-between">
                    <div className="flex items-center gap-2 md:gap-4">
                        <h1 className="text-lg md:text-2xl font-bold text-gray-900 dark:text-white">
                            {t('kitchen.title')}
                        </h1>

                        {/* Connection Status */}
                        <div className="flex items-center gap-1 md:gap-2">
                            <div
                                className={`w-2 h-2 rounded-full ${isConnected
                                    ? "bg-green-500 animate-pulse"
                                    : "bg-red-500"
                                    }`}
                            />
                            <span className="text-xs md:text-sm text-gray-600 dark:text-gray-400 hidden sm:inline">
                                {isConnected ? t('common.connected') : t('common.disconnected')}
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 md:gap-4">
                        {/* Current Time */}
                        <span className="text-xs md:text-sm font-medium text-gray-600 dark:text-gray-400 hidden sm:inline">
                            {currentTime}
                        </span>

                        {/* Keyboard Help Button */}
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setShowKeyboardHelp(true)}
                            className="h-8 md:h-9 px-2 md:px-3"
                            title={t('common.keyboardShortcuts')}
                        >
                            <Keyboard className="h-3 w-3 md:h-4 md:w-4" />
                        </Button>

                        {/* Refresh Button */}
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => refetch()}
                            disabled={isLoading}
                            className="h-8 md:h-9 px-2 md:px-3"
                        >
                            <RefreshCw
                                className={`h-3 w-3 md:h-4 md:w-4 ${isLoading ? "animate-spin" : ""
                                    }`}
                            />
                            <span className="ml-1 md:ml-2 hidden sm:inline">{t('common.refresh')}</span>
                        </Button>

                        {/* Fullscreen Button */}
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={toggleFullscreen}
                            className="h-8 md:h-9 px-2 md:px-3"
                        >
                            {isFullscreen ? (
                                <Minimize2 className="h-3 w-3 md:h-4 md:w-4" />
                            ) : (
                                <Maximize2 className="h-3 w-3 md:h-4 md:w-4" />
                            )}
                            <span className="ml-1 md:ml-2 hidden sm:inline">
                                {isFullscreen ? t('common.exitFullscreen') : t('common.fullscreen')}
                            </span>
                        </Button>
                    </div>
                </div>
            )}

            {/* Stats Section */}
            <div className="px-3 md:px-4 py-2 md:py-3 bg-white dark:bg-gray-800 border-b dark:border-gray-700">
                <KitchenStats orders={orders} />
            </div>

            {/* Fullscreen Floating Controls */}
            {isFullscreen && (
                <div className="absolute top-2 right-2 z-50 flex items-center gap-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg px-3 py-2 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-2">
                        <div
                            className={`w-2 h-2 rounded-full ${isConnected
                                ? "bg-green-500 animate-pulse"
                                : "bg-red-500"
                                }`}
                        />
                        <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                            {currentTime}
                        </span>
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => refetch()}
                        disabled={isLoading}
                        className="h-7 px-2"
                    >
                        <RefreshCw
                            className={`h-3 w-3 ${isLoading ? "animate-spin" : ""
                                }`}
                        />
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={toggleFullscreen}
                        className="h-7 px-2"
                    >
                        <Minimize2 className="h-3 w-3" />
                    </Button>
                </div>
            )}

            {/* Filter Bar */}
            <div className="px-3 md:px-4 py-2 bg-white dark:bg-gray-800 border-b dark:border-gray-700">
                <div className="flex flex-wrap gap-2">
                    {/* Status Filters */}
                    <div className="flex gap-1 md:gap-2">
                        <Button
                            variant={statusFilter === "all" ? "default" : "outline"}
                            size="sm"
                            onClick={() => setStatusFilter("all")}
                            className="h-7 md:h-8 text-xs md:text-sm px-2 md:px-3"
                        >
                            {t('kitchen.filter.all')}
                        </Button>
                        <Button
                            variant={
                                statusFilter === KitchenOrderStatus.PENDING
                                    ? "default"
                                    : "outline"
                            }
                            size="sm"
                            onClick={() =>
                                setStatusFilter(KitchenOrderStatus.PENDING)
                            }
                            className="h-7 md:h-8 text-xs md:text-sm px-2 md:px-3"
                        >
                            {t('kitchen.filter.pending')}
                        </Button>
                        <Button
                            variant={
                                statusFilter === KitchenOrderStatus.PREPARING
                                    ? "default"
                                    : "outline"
                            }
                            size="sm"
                            onClick={() => setStatusFilter(KitchenOrderStatus.PREPARING)}
                            className="h-7 md:h-8 text-xs md:text-sm px-2 md:px-3"
                        >
                            {t('kitchen.filter.preparing')}
                        </Button>
                        <Button
                            variant={
                                statusFilter === KitchenOrderStatus.COMPLETED
                                    ? "default"
                                    : "outline"
                            }
                            size="sm"
                            onClick={() =>
                                setStatusFilter(KitchenOrderStatus.COMPLETED)
                            }
                            className="h-7 md:h-8 text-xs md:text-sm px-2 md:px-3"
                        >
                            {t('kitchen.filter.completed')}
                        </Button>
                    </div>
                </div>
            </div>

            {/* Orders Grid */}
            <div className="flex-1 overflow-auto p-3 md:p-4">
                {isLoading && <LoadingState />}

                {isError && (
                    <ErrorState
                        message={t('kitchen.failedToLoad')}
                        onRetry={() => refetch()}
                    />
                )}

                {!isLoading && !isError && filteredOrders.length === 0 && (
                    <EmptyState />
                )}

                {!isLoading && !isError && filteredOrders.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4">
                        {filteredOrders.map((order) => (
                            <KitchenOrderCard
                                key={order.kitchenOrderId}
                                order={order}
                                onStartPreparing={handleStartPreparing}
                                onCompleteOrder={handleCompleteOrder}
                                onCancel={handleCancel}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Keyboard Shortcuts Help Dialog */}
            <Dialog open={showKeyboardHelp} onOpenChange={setShowKeyboardHelp}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>{t('kitchen.keyboard.title')}</DialogTitle>
                        <DialogDescription>
                            {t('kitchen.keyboard.description')}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <h4 className="font-semibold text-sm">{t('kitchen.keyboard.actions')}</h4>
                            <div className="space-y-1 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">{t('kitchen.keyboard.refreshOrders')}</span>
                                    <kbd className="px-2 py-1 bg-muted rounded text-xs font-mono">R</kbd>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">{t('kitchen.keyboard.toggleFullscreen')}</span>
                                    <kbd className="px-2 py-1 bg-muted rounded text-xs font-mono">F / F11</kbd>
                                </div>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <h4 className="font-semibold text-sm">{t('kitchen.keyboard.filterStatus')}</h4>
                            <div className="space-y-1 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">{t('kitchen.keyboard.allOrders')}</span>
                                    <kbd className="px-2 py-1 bg-muted rounded text-xs font-mono">1</kbd>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">{t('kitchen.keyboard.pendingOrders')}</span>
                                    <kbd className="px-2 py-1 bg-muted rounded text-xs font-mono">2</kbd>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">{t('kitchen.keyboard.preparingOrders')}</span>
                                    <kbd className="px-2 py-1 bg-muted rounded text-xs font-mono">3</kbd>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">{t('kitchen.keyboard.completedOrders')}</span>
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
