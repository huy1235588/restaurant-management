'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { OrderStatusBadge } from '../components/OrderStatusBadge';
import { OrderItemList } from '../components/OrderItemList';
import { OrderSummaryCard } from '../components/OrderSummaryCard';
import { OrderTimeline } from '../components/OrderTimeline';
import { CancelItemDialog } from '../dialogs/CancelItemDialog';
import { CancelOrderDialog } from '../dialogs/CancelOrderDialog';
import { useOrderById, useOrderSocket } from '../hooks';
import { Order, OrderItem } from '../types';
import { formatOrderNumber, formatDateTime, canAddItems, canCancelOrder } from '../utils';
import { ArrowLeft, Plus, XCircle, Printer, Receipt } from 'lucide-react';

interface OrderDetailViewProps {
    orderId: number;
}

export function OrderDetailView({ orderId }: OrderDetailViewProps) {
    const router = useRouter();
    const [itemToCancel, setItemToCancel] = useState<OrderItem | null>(null);
    const [showCancelOrderDialog, setShowCancelOrderDialog] = useState(false);

    const { data: order, isLoading, error } = useOrderById(orderId);

    // Real-time updates
    useOrderSocket({
        enableNotifications: true,
        enableSound: true,
    });

    const handleBack = () => {
        router.push('/orders');
    };

    const handleAddItems = () => {
        router.push(`/orders/${orderId}/edit`);
    };

    const handleCancelOrder = () => {
        setShowCancelOrderDialog(true);
    };

    const handlePrint = () => {
        window.print();
    };

    const handleCreateBill = () => {
        // TODO: Integrate with billing module
        router.push(`/billing/create?orderId=${orderId}`);
    };

    if (isLoading) {
        return (
            <div className="space-y-6">
                <Button variant="ghost" onClick={handleBack}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Quay lại
                </Button>
                <div className="text-center py-12 text-muted-foreground">
                    Đang tải...
                </div>
            </div>
        );
    }

    if (error || !order) {
        return (
            <div className="space-y-6">
                <Button variant="ghost" onClick={handleBack}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Quay lại
                </Button>
                <div className="text-center py-12 text-destructive">
                    {error?.message || 'Không tìm thấy đơn hàng'}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" onClick={handleBack}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Quay lại
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold">
                            {formatOrderNumber(order.orderNumber)}
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            {formatDateTime(order.createdAt)}
                        </p>
                    </div>
                    <OrderStatusBadge status={order.orderStatus} />
                </div>
                <div className="flex gap-2">
                    {canAddItems(order) && (
                        <Button onClick={handleAddItems}>
                            <Plus className="mr-2 h-4 w-4" />
                            Thêm món
                        </Button>
                    )}
                    {canCancelOrder(order) && (
                        <Button variant="destructive" onClick={handleCancelOrder}>
                            <XCircle className="mr-2 h-4 w-4" />
                            Hủy đơn
                        </Button>
                    )}
                    <Button variant="outline" onClick={handlePrint}>
                        <Printer className="mr-2 h-4 w-4" />
                        In
                    </Button>
                    {order.orderStatus === 'completed' && (
                        <Button variant="outline" onClick={handleCreateBill}>
                            <Receipt className="mr-2 h-4 w-4" />
                            Tạo hóa đơn
                        </Button>
                    )}
                </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                {/* Main Content - Left Column (2/3) */}
                <div className="space-y-6 lg:col-span-2">
                    {/* Order Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Thông tin đơn hàng</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Bàn</p>
                                    <p className="text-lg font-semibold">
                                        {order.table?.tableNumber || 'N/A'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Nhân viên</p>
                                    <p className="text-lg">
                                        {order.staff?.fullName || 'N/A'}
                                    </p>
                                </div>
                            </div>
                            <Separator />
                            <div className="grid gap-4 md:grid-cols-2">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Khách hàng</p>
                                    <p className="text-lg">
                                        {order.customerName || 'Khách vãng lai'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Số điện thoại</p>
                                    <p className="text-lg">
                                        {order.customerPhone || 'Không có'}
                                    </p>
                                </div>
                            </div>
                            {order.specialRequests && (
                                <>
                                    <Separator />
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">Yêu cầu đặc biệt</p>
                                        <p className="text-base mt-1">{order.specialRequests}</p>
                                    </div>
                                </>
                            )}
                        </CardContent>
                    </Card>

                    {/* Order Items */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Món ăn ({order.items?.length || 0})</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <OrderItemList
                                items={order.items || []}
                                orderStatus={order.orderStatus}
                                onCancelItem={setItemToCancel}
                            />
                        </CardContent>
                    </Card>

                    {/* Timeline */}
                    {order.timeline && order.timeline.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Lịch sử</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <OrderTimeline events={order.timeline} />
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* Sidebar - Right Column (1/3) */}
                <div className="space-y-6">
                    {/* Order Summary */}
                    <OrderSummaryCard
                        subtotal={order.subtotal}
                        serviceCharge={order.serviceCharge}
                        tax={order.tax}
                        discount={order.discount}
                        total={order.total}
                    />

                    {/* Additional Info */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Thông tin bổ sung</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Mã đơn</p>
                                <p className="text-sm font-mono">{order.orderNumber}</p>
                            </div>
                            <Separator />
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Ngày tạo</p>
                                <p className="text-sm">{formatDateTime(order.createdAt)}</p>
                            </div>
                            {order.updatedAt && (
                                <>
                                    <Separator />
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">Cập nhật lần cuối</p>
                                        <p className="text-sm">{formatDateTime(order.updatedAt)}</p>
                                    </div>
                                </>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Dialogs */}
            <CancelItemDialog
                open={!!itemToCancel}
                onOpenChange={(open) => !open && setItemToCancel(null)}
                item={itemToCancel}
                orderId={orderId}
            />
            <CancelOrderDialog
                open={showCancelOrderDialog}
                onOpenChange={setShowCancelOrderDialog}
                order={order}
            />
        </div>
    );
}
