'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { useCancelOrder } from '../hooks';
import { Order } from '../types';
import { formatCurrency } from '../utils';
import { useTranslation } from 'react-i18next';
import { Loader2, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

const cancelOrderSchema = z.object({
    reason: z.string().min(1, 'Vui lòng nhập lý do hủy').max(500),
});

type CancelOrderFormData = z.infer<typeof cancelOrderSchema>;

interface CancelOrderDialogProps {
    open: boolean;
    onClose: () => void;
    order: Order | null;
    onSuccess?: () => void;
}

export function CancelOrderDialog({
    open,
    onClose,
    order,
    onSuccess,
}: CancelOrderDialogProps) {
    const { t } = useTranslation();
    const cancelMutation = useCancelOrder();

    const form = useForm<CancelOrderFormData>({
        resolver: zodResolver(cancelOrderSchema),
        defaultValues: {
            reason: '',
        },
    });

    const onSubmit = async (data: CancelOrderFormData) => {
        if (!order) return;

        try {
            await cancelMutation.mutateAsync({
                orderId: order.orderId || order.id,
                data,
            });
            form.reset();
            onSuccess?.();
            onClose();
        } catch (error) {
            // Error handled by mutation
        }
    };

    if (!order) return null;

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-destructive">
                        <AlertTriangle className="h-5 w-5" />
                        {t('orders.cancelOrder')}
                    </DialogTitle>
                    <DialogDescription>
                        {t('orders.confirmCancelOrder')}
                    </DialogDescription>
                </DialogHeader>

                <Alert variant="destructive">
                    <AlertDescription>
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <span className="font-semibold">Đơn hàng #{order.orderNumber || order.orderId || order.id}</span>
                                <span>Bàn {order.table?.tableNumber}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Số món:</span>
                                <span>{(order.orderItems || order.items)?.length || 0} món</span>
                            </div>
                            <div className="flex justify-between font-semibold">
                                <span>Tổng tiền:</span>
                                <span>{formatCurrency(order.finalAmount || order.totalAmount)}</span>
                            </div>
                        </div>
                    </AlertDescription>
                </Alert>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="reason"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t('orders.cancelReason')}</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Nhập lý do hủy đơn hàng..."
                                            {...field}
                                            rows={3}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={onClose}
                                disabled={cancelMutation.isPending}
                            >
                                {t('common.cancel')}
                            </Button>
                            <Button
                                type="submit"
                                variant="destructive"
                                disabled={cancelMutation.isPending}
                            >
                                {cancelMutation.isPending && (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                )}
                                Xác nhận hủy
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
