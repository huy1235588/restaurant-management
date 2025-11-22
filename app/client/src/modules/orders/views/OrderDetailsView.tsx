'use client';

import { useOrder, useConfirmOrder, useUpdateOrderItem, useRemoveOrderItem } from '../hooks';
import {
    OrderStatusBadge,
    OrderItemList,
    OrderSummary,
} from '../components';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, ArrowLeft, CheckCircle, XCircle, Plus } from 'lucide-react';
import { formatDateTime, canConfirmOrder, canCancelOrder, canModifyOrderItems, canConfirmOrderPermission, canCancelOrderPermission } from '../utils';
import { useState } from 'react';
import { CancelOrderDialog, AddItemDialog } from '../dialogs';
import { useAuthStore } from '@/stores/authStore';

interface OrderDetailsViewProps {
    orderId: number;
    menuItems?: Array<{
        itemId: number;
        itemCode: string;
        itemName: string;
        description?: string | null;
        price: number;
        imageUrl?: string | null;
        categoryId: number;
        isAvailable: boolean;
        category?: {
            categoryId: number;
            categoryName: string;
        };
    }>;
}

export function OrderDetailsView({ orderId, menuItems = [] }: OrderDetailsViewProps) {
    const { data: order, isLoading } = useOrder(orderId);
    const { mutate: confirmOrder } = useConfirmOrder();
    const { mutate: updateItem } = useUpdateOrderItem(orderId);
    const { mutate: removeItem } = useRemoveOrderItem(orderId);
    const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
    const [addItemDialogOpen, setAddItemDialogOpen] = useState(false);

    const { user } = useAuthStore();
    const userRole = user?.role;

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    if (!order) {
        return (
            <div className="text-center py-12">
                <p className="text-muted-foreground">Order not found</p>
            </div>
        );
    }

    const handleConfirm = () => {
        if (confirm('Send this order to the kitchen?')) {
            confirmOrder(orderId);
        }
    };

    const handleUpdateQuantity = (itemId: number, quantity: number) => {
        updateItem({ itemId, data: { quantity } });
    };

    const handleRemoveItem = (itemId: number) => {
        if (confirm('Remove this item from the order?')) {
            removeItem(itemId);
        }
    };

    const isPending = order.status === 'pending';
    const canEdit = isPending && canModifyOrderItems(userRole);

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => window.history.back()}
                >
                    <ArrowLeft className="w-5 h-5" />
                </Button>
                <div className="flex-1">
                    <h1 className="text-3xl font-bold">{order.orderNumber}</h1>
                    <p className="text-muted-foreground">
                        {formatDateTime(order.createdAt)}
                    </p>
                </div>
                <OrderStatusBadge status={order.status} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Order Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-muted-foreground">
                                        Table
                                    </p>
                                    <p className="font-medium">
                                        {order.table?.tableNumber}
                                    </p>
                                </div>
                                {order.customerName && (
                                    <div>
                                        <p className="text-sm text-muted-foreground">
                                            Customer
                                        </p>
                                        <p className="font-medium">
                                            {order.customerName}
                                        </p>
                                    </div>
                                )}
                                {order.partySize && (
                                    <div>
                                        <p className="text-sm text-muted-foreground">
                                            Party Size
                                        </p>
                                        <p className="font-medium">{order.partySize}</p>
                                    </div>
                                )}
                                {order.staff && (
                                    <div>
                                        <p className="text-sm text-muted-foreground">
                                            Server
                                        </p>
                                        <p className="font-medium">
                                            {order.staff.fullName}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle>Order Items</CardTitle>
                                {canEdit && menuItems.length > 0 && (
                                    <Button
                                        size="sm"
                                        onClick={() => setAddItemDialogOpen(true)}
                                    >
                                        <Plus className="w-4 h-4 mr-2" />
                                        Add Item
                                    </Button>
                                )}
                            </div>
                        </CardHeader>
                        <CardContent>
                            <OrderItemList
                                items={order.orderItems || []}
                                editable={canEdit}
                                onUpdateQuantity={
                                    canEdit ? handleUpdateQuantity : undefined
                                }
                                onRemove={canEdit ? handleRemoveItem : undefined}
                            />
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Summary</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <OrderSummary order={order} />
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Actions</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            {canConfirmOrder(order.status) && canConfirmOrderPermission(userRole) && (
                                <Button
                                    className="w-full"
                                    onClick={handleConfirm}
                                    disabled={(order.orderItems?.length || 0) === 0}
                                >
                                    <CheckCircle className="w-4 h-4 mr-2" />
                                    Confirm & Send to Kitchen
                                </Button>
                            )}
                            {canCancelOrder(order.status) && canCancelOrderPermission(userRole, order.status) && (
                                <Button
                                    variant="destructive"
                                    className="w-full"
                                    onClick={() => setCancelDialogOpen(true)}
                                >
                                    <XCircle className="w-4 h-4 mr-2" />
                                    Cancel Order
                                </Button>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>

            <CancelOrderDialog
                open={cancelDialogOpen}
                onOpenChange={setCancelDialogOpen}
                orderId={orderId}
            />

            <AddItemDialog
                open={addItemDialogOpen}
                onOpenChange={setAddItemDialogOpen}
                orderId={orderId}
                menuItems={menuItems}
            />
        </div>
    );
}
