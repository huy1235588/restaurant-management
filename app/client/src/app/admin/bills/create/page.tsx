'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useCreateBill } from '@/modules/bills/hooks';
import { useOrderById } from '@/modules/order/hooks';
import { formatCurrency } from '@/modules/bills/utils';
import { ArrowLeft, Receipt, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function CreateBillPage() {
    const { t } = useTranslation();
    const router = useRouter();
    const searchParams = useSearchParams();
    const orderId = searchParams.get('orderId');

    const orderIdNum = orderId ? parseInt(orderId, 10) : null;

    const { data: order, isLoading: orderLoading, error: orderError } = useOrderById(
        orderIdNum
    );

    const createBillMutation = useCreateBill();

    const handleBack = () => {
        if (orderIdNum) {
            router.push(`/admin/orders/${orderIdNum}`);
        } else {
            router.push('/admin/orders');
        }
    };

    const handleCreateBill = async () => {
        if (!orderIdNum) return;

        try {
            const result = await createBillMutation.mutateAsync({ orderId: orderIdNum });
            toast.success(t('billing.messages.billCreated', 'Hóa đơn đã được tạo thành công'));
            // Navigate to the new bill
            router.push(`/admin/bills/${result.billId}`);
        } catch (error: any) {
            toast.error(error.message || t('billing.errors.createFailed', 'Không thể tạo hóa đơn'));
        }
    };

    // No orderId provided
    if (!orderIdNum) {
        return (
            <div className="space-y-6">
                <Button variant="ghost" onClick={() => router.push('/admin/orders')}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    {t('common.back', 'Quay lại')}
                </Button>
                <Card>
                    <CardContent className="py-12">
                        <div className="flex flex-col items-center gap-4 text-center">
                            <AlertCircle className="h-12 w-12 text-destructive" />
                            <p className="text-destructive">
                                {t('billing.errors.noOrderId', 'Không có mã đơn hàng. Vui lòng chọn đơn hàng để tạo hóa đơn.')}
                            </p>
                            <Button onClick={() => router.push('/admin/orders')}>
                                {t('billing.goToOrders', 'Đi tới đơn hàng')}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // Loading state
    if (orderLoading) {
        return (
            <div className="space-y-6">
                <Button variant="ghost" onClick={handleBack}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    {t('common.back', 'Quay lại')}
                </Button>
                <Card>
                    <CardHeader>
                        <Skeleton className="h-8 w-48" />
                        <Skeleton className="h-4 w-72" />
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Skeleton className="h-24 w-full" />
                        <Skeleton className="h-24 w-full" />
                    </CardContent>
                </Card>
            </div>
        );
    }

    // Error or not found
    if (orderError || !order) {
        return (
            <div className="space-y-6">
                <Button variant="ghost" onClick={handleBack}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    {t('common.back', 'Quay lại')}
                </Button>
                <Card>
                    <CardContent className="py-12">
                        <div className="flex flex-col items-center gap-4 text-center">
                            <AlertCircle className="h-12 w-12 text-destructive" />
                            <p className="text-destructive">
                                {orderError?.message || t('billing.errors.orderNotFound', 'Không tìm thấy đơn hàng')}
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // Calculate totals from order items
    const subtotal = (order.orderItems || []).reduce(
        (sum, item) => sum + Number(item.unitPrice) * item.quantity,
        0
    );

    return (
        <div className="space-y-6 max-w-2xl mx-auto">
            <Button variant="ghost" onClick={handleBack}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                {t('common.back', 'Quay lại')}
            </Button>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Receipt className="h-6 w-6" />
                        {t('billing.createBill', 'Tạo hóa đơn')}
                    </CardTitle>
                    <CardDescription>
                        {t('billing.createBillDescription', 'Tạo hóa đơn từ đơn hàng')} #{order.orderNumber}
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Order Summary */}
                    <div className="space-y-4">
                        <h3 className="font-semibold">
                            {t('billing.orderSummary', 'Thông tin đơn hàng')}
                        </h3>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <p className="text-muted-foreground">{t('billing.orderNumber', 'Mã đơn')}</p>
                                <p className="font-medium">#{order.orderNumber}</p>
                            </div>
                            <div>
                                <p className="text-muted-foreground">{t('billing.table', 'Bàn')}</p>
                                <p className="font-medium">{order.table?.tableNumber || 'N/A'}</p>
                            </div>
                            <div>
                                <p className="text-muted-foreground">{t('billing.items', 'Số món')}</p>
                                <p className="font-medium">{order.orderItems?.length || 0}</p>
                            </div>
                            <div>
                                <p className="text-muted-foreground">{t('billing.status', 'Trạng thái')}</p>
                                <p className="font-medium capitalize">{order.status}</p>
                            </div>
                        </div>
                    </div>

                    {/* Items Preview */}
                    <div className="space-y-2">
                        <h3 className="font-semibold">{t('billing.itemsPreview', 'Danh sách món')}</h3>
                        <div className="border rounded-lg divide-y">
                            {(order.orderItems || []).slice(0, 5).map((item) => (
                                <div key={item.orderItemId} className="flex justify-between p-3">
                                    <div>
                                        <p className="font-medium">{item.menuItem?.itemName || 'Unknown'}</p>
                                        <p className="text-sm text-muted-foreground">x{item.quantity}</p>
                                    </div>
                                    <p className="font-medium">
                                        {formatCurrency(Number(item.unitPrice) * item.quantity)}
                                    </p>
                                </div>
                            ))}
                            {(order.orderItems?.length || 0) > 5 && (
                                <div className="p-3 text-center text-sm text-muted-foreground">
                                    ... {t('billing.andMore', 'và {{count}} món khác', {
                                        count: (order.orderItems?.length || 0) - 5
                                    })}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Total */}
                    <div className="flex justify-between items-center pt-4 border-t">
                        <span className="text-lg font-semibold">{t('billing.total', 'Tổng cộng')}</span>
                        <span className="text-2xl font-bold text-primary">
                            {formatCurrency(subtotal)}
                        </span>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-4">
                        <Button variant="outline" onClick={handleBack} className="flex-1">
                            {t('common.cancel', 'Hủy')}
                        </Button>
                        <Button
                            onClick={handleCreateBill}
                            disabled={createBillMutation.isPending}
                            className="flex-1"
                        >
                            <Receipt className="mr-2 h-4 w-4" />
                            {createBillMutation.isPending
                                ? t('common.creating', 'Đang tạo...')
                                : t('billing.createBill', 'Tạo hóa đơn')}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
