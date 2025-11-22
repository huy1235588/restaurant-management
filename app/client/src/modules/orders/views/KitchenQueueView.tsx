'use client';

import { useKitchenQueue, useMarkKitchenOrderReady, useOrderSocket } from '../hooks';
import { KitchenOrderCard } from '../components';
import { useTranslation } from 'react-i18next';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { RefreshCw, ChefHat } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function KitchenQueueView() {
    const { t } = useTranslation();
    const { data: kitchenOrders, isLoading, error, refetch } = useKitchenQueue();
    const markReadyMutation = useMarkKitchenOrderReady();

    useOrderSocket();

    const handleMarkReady = (kitchenOrderId: number) => {
        markReadyMutation.mutate(kitchenOrderId);
    };

    if (error) {
        return (
            <Alert variant="destructive">
                <AlertDescription>
                    {error instanceof Error ? error.message : t('common.error')}
                </AlertDescription>
            </Alert>
        );
    }

    return (
        <div className="container mx-auto p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <ChefHat className="h-8 w-8 text-primary" />
                    <div>
                        <h1 className="text-3xl font-bold">{t('orders.kitchenQueue')}</h1>
                        <p className="text-muted-foreground">
                            {kitchenOrders?.length || 0} {t('orders.pending').toLowerCase()}
                        </p>
                    </div>
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => refetch()}
                    disabled={isLoading}
                >
                    <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                    {t('common.refresh')}
                </Button>
            </div>

            {/* Kitchen Queue Grid */}
            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[...Array(6)].map((_, i) => (
                        <Skeleton key={i} className="h-48" />
                    ))}
                </div>
            ) : kitchenOrders && kitchenOrders.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {kitchenOrders.map((kitchenOrder) => (
                        <KitchenOrderCard
                            key={kitchenOrder.id}
                            kitchenOrder={kitchenOrder}
                            onMarkReady={handleMarkReady}
                        />
                    ))}
                </div>
            ) : (
                <div className="text-center py-12">
                    <ChefHat className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">{t('orders.noOrders')}</h3>
                    <p className="text-muted-foreground">
                        Hiện tại không có món nào đang chờ làm
                    </p>
                </div>
            )}
        </div>
    );
}
