'use client';

import { useKitchenOrders, useStartOrder, useMarkReady, useKitchenSocket } from '../hooks';
import { KitchenOrderCard } from '../components';
import { KitchenOrderStatus } from '../types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, CheckCircle, Timer, Wifi, WifiOff } from 'lucide-react';

export function KitchenDashboardView() {
    const { data: orders = [], isLoading } = useKitchenOrders();
    const { mutate: startOrder } = useStartOrder();
    const { mutate: markReady } = useMarkReady();
    const { isConnected } = useKitchenSocket();

    const pendingOrders = orders.filter(
        (o: KitchenOrder) => o.status === KitchenOrderStatus.PENDING
    );
    const readyOrders = orders.filter(
        (o: KitchenOrder) => o.status === KitchenOrderStatus.READY
    );
    const completedOrders = orders.filter(
        (o: KitchenOrder) => o.status === KitchenOrderStatus.COMPLETED
    ).slice(0, 10); // Show only last 10 completed

    if (isLoading) {
        return (
            <div className="container mx-auto p-6">
                <div className="text-center py-8">Loading kitchen orders...</div>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-6 space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">Kitchen Display</h1>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        {isConnected ? (
                            <>
                                <Wifi className="w-4 h-4 text-green-500" />
                                <span className="text-sm text-green-600">Live</span>
                            </>
                        ) : (
                            <>
                                <WifiOff className="w-4 h-4 text-red-500" />
                                <span className="text-sm text-red-600">Offline</span>
                            </>
                        )}
                    </div>
                    <div className="text-sm text-muted-foreground">
                        Auto-refreshing every 5 seconds
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Pending Column */}
                <div className="space-y-4">
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="flex items-center gap-2">
                                <Clock className="w-5 h-5 text-orange-500" />
                                Pending
                                <span className="ml-auto text-2xl font-bold">
                                    {pendingOrders.length}
                                </span>
                            </CardTitle>
                        </CardHeader>
                    </Card>
                    <div className="space-y-3">
                        {pendingOrders.map((order: KitchenOrder) => (
                            <KitchenOrderCard
                                key={order.kitchenOrderId}
                                order={order}
                                onStart={startOrder}
                                onReady={markReady}
                            />
                        ))}
                        {pendingOrders.length === 0 && (
                            <Card>
                                <CardContent className="py-8 text-center text-muted-foreground">
                                    <p>No pending orders</p>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>

                {/* Ready Column */}
                <div className="space-y-4">
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="flex items-center gap-2">
                                <CheckCircle className="w-5 h-5 text-green-500" />
                                Ready
                                <span className="ml-auto text-2xl font-bold">
                                    {readyOrders.length}
                                </span>
                            </CardTitle>
                        </CardHeader>
                    </Card>
                    <div className="space-y-3">
                        {readyOrders.map((order: KitchenOrder) => (
                            <KitchenOrderCard
                                key={order.kitchenOrderId}
                                order={order}
                            />
                        ))}
                        {readyOrders.length === 0 && (
                            <Card>
                                <CardContent className="py-8 text-center text-muted-foreground">
                                    <p>No ready orders</p>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>

                {/* Completed Column */}
                <div className="space-y-4">
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="flex items-center gap-2">
                                <Timer className="w-5 h-5 text-blue-500" />
                                Recently Completed
                                <span className="ml-auto text-2xl font-bold">
                                    {completedOrders.length}
                                </span>
                            </CardTitle>
                        </CardHeader>
                    </Card>
                    <div className="space-y-3">
                        {completedOrders.map((order: KitchenOrder) => (
                            <KitchenOrderCard
                                key={order.kitchenOrderId}
                                order={order}
                            />
                        ))}
                        {completedOrders.length === 0 && (
                            <Card>
                                <CardContent className="py-8 text-center text-muted-foreground">
                                    <p>No completed orders</p>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
