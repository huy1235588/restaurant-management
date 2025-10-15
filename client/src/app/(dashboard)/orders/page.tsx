'use client';

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useAuthStore } from '@/stores/authStore';
import { useOrderStore } from '@/stores/orderStore';
import { hasPermission, OrderStatus } from '@/types';
import { PageHeader } from '@/components/shared/PageHeader';
import { OrderFilters } from '@/components/orders/OrderFilters';
import { OrderCard } from '@/components/orders/OrderCard';

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
            <PageHeader
                title={t('orders.title') || 'Orders Management'}
                subtitle={t('orders.subtitle') || 'Manage and track all restaurant orders'}
                actions={
                    canCreateOrder && (
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            {t('orders.createNew') || 'New Order'}
                        </Button>
                    )
                }
            />

            {/* Filters */}
            <OrderFilters
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                selectedStatus={selectedStatus}
                onStatusChange={setSelectedStatus}
                searchPlaceholder={t('orders.searchPlaceholder') || 'Search by order ID or table...'}
            />

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
                        <OrderCard
                            key={order.orderId}
                            order={order}
                            onViewDetails={() => console.log('View details', order.orderId)}
                            onUpdateStatus={
                                user && hasPermission(user.role, 'orders.update')
                                    ? () => console.log('Update status', order.orderId)
                                    : undefined
                            }
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
