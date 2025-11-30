'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { OrderItem } from '../types';
import { useCancelItem } from '../hooks';
import { formatCurrency } from '../utils';

interface CancelItemDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    item: OrderItem | null;
    orderId: number;
}

const CANCEL_REASON_KEYS = [
    { value: 'customer_changed_mind', key: 'customerChangedMind' },
    { value: 'out_of_stock', key: 'outOfStock' },
    { value: 'wrong_order', key: 'wrongOrder' },
    { value: 'customer_wait', key: 'customerWait' },
    { value: 'other', key: 'other' },
] as const;

export function CancelItemDialog({
    open,
    onOpenChange,
    item,
    orderId,
}: CancelItemDialogProps) {
    const { t } = useTranslation();
    const [reason, setReason] = useState('customer_changed_mind');
    const [customReason, setCustomReason] = useState('');
    const cancelItemMutation = useCancelItem();

    const handleSubmit = async () => {
        if (!item) return;

        const finalReason =
            reason === 'other'
                ? customReason
                : t(`orders.cancelItemDialog.reasons.${CANCEL_REASON_KEYS.find((r) => r.value === reason)?.key}`) || reason;

        if (reason === 'other' && !customReason.trim()) {
            return;
        }

        await cancelItemMutation.mutateAsync({
            orderId,
            orderItemId: item.orderItemId,
            data: { reason: finalReason },
        });

        onOpenChange(false);
        setReason('customer_changed_mind');
        setCustomReason('');
    };

    if (!item) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{t('orders.cancelItemDialog.title')}</DialogTitle>
                    <DialogDescription>
                        {t('orders.cancelItemDialog.description')}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    <div className="rounded-lg border p-4 space-y-2">
                        <h4 className="font-medium">
                            {item.quantity}x {item.menuItem.itemName}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                            {formatCurrency(item.totalPrice)}
                        </p>
                        {item.specialRequest && (
                            <p className="text-sm text-amber-600">
                                📝 {item.specialRequest}
                            </p>
                        )}
                    </div>

                    <div className="space-y-3">
                        <Label>{t('orders.cancelItemDialog.cancelReason')}</Label>
                        <RadioGroup value={reason} onValueChange={setReason}>
                            {CANCEL_REASON_KEYS.map((r) => (
                                <div key={r.value} className="flex items-center space-x-2">
                                    <RadioGroupItem value={r.value} id={r.value} />
                                    <Label htmlFor={r.value} className="font-normal">
                                        {t(`orders.cancelItemDialog.reasons.${r.key}`)}
                                    </Label>
                                </div>
                            ))}
                        </RadioGroup>

                        {reason === 'other' && (
                            <Textarea
                                placeholder={t('orders.cancelItemDialog.enterReason')}
                                value={customReason}
                                onChange={(e) => setCustomReason(e.target.value)}
                                rows={3}
                            />
                        )}
                    </div>
                </div>

                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={cancelItemMutation.isPending}
                    >
                        {t('orders.cancelItemDialog.cancel')}
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={handleSubmit}
                        disabled={
                            cancelItemMutation.isPending ||
                            (reason === 'other' && !customReason.trim())
                        }
                    >
                        {cancelItemMutation.isPending ? t('orders.cancelItemDialog.processing') : t('orders.cancelItemDialog.confirmCancel')}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
