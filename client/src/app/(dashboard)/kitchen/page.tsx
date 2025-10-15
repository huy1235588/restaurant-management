'use client';

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ChefHat, CheckCircle2 } from 'lucide-react';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useOrderStore } from '@/stores/orderStore';
import { OrderStatus } from '@/types';
import { PageHeader } from '@/components/shared/PageHeader';
import { KitchenOrderCard } from '@/components/kitchen/KitchenOrderCard';

export default function KitchenPage() {
    const { t } = useTranslation();
    const { orders } = useOrderStore();
    const [audioEnabled, setAudioEnabled] = useState(true);

    // Filter orders that need kitchen attention
    const kitchenOrders = orders.filter(
        (order) => order.status === 'confirmed' || order.status === 'preparing'
    );

    const handleMarkReady = (orderId: number) => {
        // TODO: Call API to update order status to 'ready'
        console.log('Mark order as ready:', orderId);
    };

    const handleStartPreparing = (orderId: number) => {
        // TODO: Call API to update order status to 'preparing'
        console.log('Start preparing order:', orderId);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                        <ChefHat className="h-8 w-8" />
                        {t('kitchen.title') || 'Kitchen Display'}
                    </h1>
                    <p className="text-muted-foreground mt-2">
                        {t('kitchen.subtitle') || 'Active orders waiting for preparation'}
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    <Badge variant="outline" className="text-lg px-4 py-2">
                        {kitchenOrders.length} Active Orders
                    </Badge>
                    <Button
                        variant={audioEnabled ? 'default' : 'outline'}
                        onClick={() => setAudioEnabled(!audioEnabled)}
                    >
                        🔔 {audioEnabled ? 'On' : 'Off'}
                    </Button>
                </div>
            </div>

            {/* Orders Grid */}
            {kitchenOrders.length === 0 ? (
                <Card>
                    <CardContent className="py-12 text-center">
                        <CheckCircle2 className="h-12 w-12 mx-auto text-green-500 mb-4" />
                        <p className="text-xl font-medium">All Caught Up!</p>
                        <p className="text-muted-foreground mt-2">
                            No pending orders at the moment
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {kitchenOrders.map((order) => (
                        <KitchenOrderCard
                            key={order.orderId}
                            order={order}
                            onStartPreparing={handleStartPreparing}
                            onMarkReady={handleMarkReady}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
