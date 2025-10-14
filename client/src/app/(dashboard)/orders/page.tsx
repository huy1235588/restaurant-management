'use client';

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Search, Filter } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuthStore } from '@/stores/authStore';
import { useOrderStore } from '@/stores/orderStore';
import { hasPermission, Order, OrderStatus } from '@/types';

const statusColors: Record<OrderStatus, string> = {
    pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    confirmed: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    preparing: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
    ready: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    served: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
    cancelled: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
};

export default function OrdersPage() {
    const { t } = useTranslation();
    const { user } = useAuthStore();
    const { orders } = useOrderStore();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedStatus, setSelectedStatus] = useState<OrderStatus | 'all'>('all');

    const canCreateOrder = user && hasPermission(user.role, 'orders.create');

    const filteredOrders = orders.filter((order) => {
        const matchesSearch = order.orderId?.toString().includes(searchTerm) ||
            order.table?.tableNumber?.includes(searchTerm);
        const matchesStatus = selectedStatus === 'all' || order.status === selectedStatus;
        return matchesSearch && matchesStatus;
    });

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">
                        {t('orders.title') || 'Orders Management'}
                    </h1>
                    <p className="text-muted-foreground mt-2">
                        {t('orders.subtitle') || 'Manage and track all restaurant orders'}
                    </p>
                </div>
                {canCreateOrder && (
                    <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        {t('orders.createNew') || 'New Order'}
                    </Button>
                )}
            </div>

            {/* Filters */}
            <Card>
                <CardContent className="pt-6">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder={t('orders.searchPlaceholder') || 'Search by order ID or table...'}
                                className="pl-8"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="flex gap-2">
                            <Button
                                variant={selectedStatus === 'all' ? 'default' : 'outline'}
                                onClick={() => setSelectedStatus('all')}
                            >
                                All
                            </Button>
                            <Button
                                variant={selectedStatus === 'pending' ? 'default' : 'outline'}
                                onClick={() => setSelectedStatus('pending')}
                            >
                                Pending
                            </Button>
                            <Button
                                variant={selectedStatus === 'preparing' ? 'default' : 'outline'}
                                onClick={() => setSelectedStatus('preparing')}
                            >
                                Preparing
                            </Button>
                            <Button
                                variant={selectedStatus === 'ready' ? 'default' : 'outline'}
                                onClick={() => setSelectedStatus('ready')}
                            >
                                Ready
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Orders Grid */}
            {filteredOrders.length === 0 ? (
                <Card>
                    <CardContent className="py-12 text-center">
                        <p className="text-muted-foreground">
                            {t('orders.noOrders') || 'No orders found'}
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {filteredOrders.map((order) => (
                        <Card key={order.orderId} className="hover:shadow-lg transition-shadow cursor-pointer">
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-lg">
                                        Order #{order.orderId}
                                    </CardTitle>
                                    <Badge className={statusColors[order.status]}>
                                        {order.status}
                                    </Badge>
                                </div>
                                <CardDescription>
                                    Table {order.table?.tableNumber || order.tableId || 'N/A'} • {new Date(order.orderTime).toLocaleTimeString()}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Items:</span>
                                        <span className="font-medium">{order.orderItems?.length || 0}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Total:</span>
                                        <span className="font-bold text-lg">
                                            ${order.finalAmount?.toFixed(2) || '0.00'}
                                        </span>
                                    </div>
                                    {order.specialRequests && (
                                        <p className="text-xs text-muted-foreground mt-2">
                                            Note: {order.specialRequests}
                                        </p>
                                    )}
                                </div>
                                <div className="mt-4 flex gap-2">
                                    <Button size="sm" variant="outline" className="flex-1">
                                        View Details
                                    </Button>
                                    {user && hasPermission(user.role, 'orders.update') && (
                                        <Button size="sm" className="flex-1">
                                            Update Status
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
