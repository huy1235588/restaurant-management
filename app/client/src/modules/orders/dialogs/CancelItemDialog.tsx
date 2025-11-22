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
import { useCancelItem } from '../hooks';
import { OrderItem } from '../types';
import { useTranslation } from 'react-i18next';
import { Loader2, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

const cancelItemSchema = z.object({
    reason: z.string().min(1, 'Vui lòng nhập lý do hủy').max(500),
});

type CancelItemFormData = z.infer<typeof cancelItemSchema>;

interface CancelItemDialogProps {
    open: boolean;
    onClose: () => void;
    orderId: number;
    item: OrderItem | null;
    onSuccess?: () => void;
}

export function CancelItemDialog({
    open,
    onClose,
    orderId,
    item,
    onSuccess,
}: CancelItemDialogProps) {
    const { t } = useTranslation();
    const cancelMutation = useCancelItem();

    const form = useForm<CancelItemFormData>({
        resolver: zodResolver(cancelItemSchema),
        defaultValues: {
            reason: '',
        },
    });

    const onSubmit = async (data: CancelItemFormData) => {
        if (!item) return;

        try {
            await cancelMutation.mutateAsync({
                orderId,
                itemId: item.orderItemId || item.id,
                data,
            });
            form.reset();
            onSuccess?.();
            onClose();
        } catch (error) {
            // Error handled by mutation
        }
    };

    if (!item) return null;

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-destructive">
                        <AlertTriangle className="h-5 w-5" />
                        {t('orders.cancelItem')}
                    </DialogTitle>
                    <DialogDescription>
                        Bạn có chắc chắn muốn hủy món này?
                    </DialogDescription>
                </DialogHeader>

                <Alert variant="destructive">
                    <AlertDescription>
                        <div className="space-y-1">
                            <p className="font-semibold">{item.menuItem?.itemName || item.menuItem?.name}</p>
                            <p className="text-sm">
                                Số lượng: {item.quantity}
                            </p>
                            {(item.specialRequest || item.note) && (
                                <p className="text-sm">Ghi chú: {item.specialRequest || item.note}</p>
                            )}
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
                                            placeholder="Nhập lý do hủy món..."
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
