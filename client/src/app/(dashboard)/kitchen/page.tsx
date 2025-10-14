'use client';

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Clock, ChefHat, CheckCircle2 } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useOrderStore } from '@/stores/orderStore';
import { OrderStatus, OrderItem } from '@/types';

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
                        <Card
                            key={order.orderId}
                            className={`${order.status === 'confirmed'
                                    ? 'border-orange-500 border-2'
                                    : 'border-blue-500 border-2'
                                }`}
                        >
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-2xl font-bold">
                                        #{order.orderId}
                                    </CardTitle>
                                    <Badge
                                        className={
                                            order.status === 'confirmed'
                                                ? 'bg-orange-500'
                                                : 'bg-blue-500'
                                        }
                                    >
                                        {order.status === 'confirmed' ? 'NEW' : 'PREPARING'}
                                    </Badge>
                                </div>
                                <CardDescription className="flex items-center gap-2 text-base">
                                    <Clock className="h-4 w-4" />
                                    {new Date(order.orderTime).toLocaleTimeString()}
                                    {' • '}
                                    Table {order.table?.tableNumber || order.tableId}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {/* Order Items */}
                                <div className="space-y-3 mb-4">
                                    {order.orderItems.map((item, idx) => (
                                        <div
                                            key={idx}
                                            className="flex justify-between items-start p-2 bg-slate-50 dark:bg-slate-800 rounded"
                                        >
                                            <div className="flex-1">
                                                <p className="font-semibold">
                                                    {item.quantity}x {item.menuItem?.itemName || 'Item'}
                                                </p>
                                                {item.notes && (
                                                    <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">
                                                        ⚠️ {item.notes}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Special Requests */}
                                {order.specialRequests && (
                                    <div className="mb-4 p-2 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded">
                                        <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                                            📝 Special Request:
                                        </p>
                                        <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                                            {order.specialRequests}
                                        </p>
                                    </div>
                                )}

                                {/* Action Buttons */}
                                <div className="flex gap-2">
                                    {order.status === 'confirmed' && (
                                        <Button
                                            className="flex-1"
                                            size="lg"
                                            onClick={() => handleStartPreparing(order.orderId)}
                                        >
                                            Start Preparing
                                        </Button>
                                    )}
                                    {order.status === 'preparing' && (
                                        <Button
                                            className="flex-1 bg-green-600 hover:bg-green-700"
                                            size="lg"
                                            onClick={() => handleMarkReady(order.orderId)}
                                        >
                                            <CheckCircle2 className="mr-2 h-5 w-5" />
                                            Mark Ready
                                        </Button>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
