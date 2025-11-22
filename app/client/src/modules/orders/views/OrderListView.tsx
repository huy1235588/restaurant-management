'use client';

import { useState } from 'react';
import { useOrders, useConfirmOrder } from '../hooks';
import { OrderCard } from '../components';
import { CreateOrderDialog, CancelOrderDialog } from '../dialogs';
import { Button } from '@/components/ui/button';
import { Plus, Loader2 } from 'lucide-react';
import { OrderStatus, type Order } from '../types';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

interface OrderListViewProps {
    tables?: Array<{ tableId: number; tableNumber: string; status: string }>;
}

export function OrderListView({ tables = [] }: OrderListViewProps) {
    const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all');
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
    const [selectedOrderId, setSelectedOrderId] = useState<number>();

    const { data, isLoading } = useOrders({
        status: statusFilter !== 'all' ? statusFilter : undefined,
        limit: 50,
    });

    const { mutate: confirmOrder } = useConfirmOrder();

    const orders = data?.items || [];

    const handleViewOrder = (order: Order) => {
        // Navigate to order details page
        window.location.href = `/orders/${order.orderId}`;
    };

    const handleConfirmOrder = (order: Order) => {
        if (confirm('Send this order to the kitchen?')) {
            confirmOrder(order.orderId);
        }
    };

    const handleCancelClick = (order: Order) => {
        setSelectedOrderId(order.orderId);
        setCancelDialogOpen(true);
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Orders</h1>
                    <p className="text-muted-foreground">
                        Manage restaurant orders
                    </p>
                </div>
                <Button onClick={() => setCreateDialogOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    New Order
                </Button>
            </div>

            <div className="flex gap-2">
                <Select
                    value={statusFilter}
                    onValueChange={(value) =>
                        setStatusFilter(value as OrderStatus | 'all')
                    }
                >
                    <SelectTrigger className="w-[200px]">
                        <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Orders</SelectItem>
                        <SelectItem value={OrderStatus.PENDING}>Pending</SelectItem>
                        <SelectItem value={OrderStatus.CONFIRMED}>
                            Confirmed
                        </SelectItem>
                        <SelectItem value={OrderStatus.READY}>Ready</SelectItem>
                        <SelectItem value={OrderStatus.SERVING}>Serving</SelectItem>
                        <SelectItem value={OrderStatus.COMPLETED}>
                            Completed
                        </SelectItem>
                        <SelectItem value={OrderStatus.CANCELLED}>
                            Cancelled
                        </SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {isLoading ? (
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                </div>
            ) : orders.length === 0 ? (
                <div className="text-center py-12">
                    <p className="text-muted-foreground">No orders found</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {orders.map((order) => (
                        <OrderCard
                            key={order.orderId}
                            order={order}
                            onView={handleViewOrder}
                            onConfirm={handleConfirmOrder}
                            onCancel={handleCancelClick}
                        />
                    ))}
                </div>
            )}

            <CreateOrderDialog
                open={createDialogOpen}
                onOpenChange={setCreateDialogOpen}
                tables={tables}
            />

            <CancelOrderDialog
                open={cancelDialogOpen}
                onOpenChange={setCancelDialogOpen}
                orderId={selectedOrderId}
            />
        </div>
    );
}
