'use client';

import { useState } from 'react';
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

const CANCEL_REASONS = [
    { value: 'customer_changed_mind', label: 'Khách thay đổi ý định' },
    { value: 'out_of_stock', label: 'Hết nguyên liệu' },
    { value: 'wrong_order', label: 'Đặt nhầm món' },
    { value: 'customer_wait', label: 'Khách không muốn chờ' },
    { value: 'other', label: 'Lý do khác' },
];

export function CancelItemDialog({
    open,
    onOpenChange,
    item,
    orderId,
}: CancelItemDialogProps) {
    const [reason, setReason] = useState('customer_changed_mind');
    const [customReason, setCustomReason] = useState('');
    const cancelItemMutation = useCancelItem();

    const handleSubmit = async () => {
        if (!item) return;

        const finalReason =
            reason === 'other'
                ? customReason
                : CANCEL_REASONS.find((r) => r.value === reason)?.label || reason;

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
                    <DialogTitle>Hủy món</DialogTitle>
                    <DialogDescription>
                        Bạn có chắc chắn muốn hủy món này không?
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
                        <Label>Lý do hủy *</Label>
                        <RadioGroup value={reason} onValueChange={setReason}>
                            {CANCEL_REASONS.map((r) => (
                                <div key={r.value} className="flex items-center space-x-2">
                                    <RadioGroupItem value={r.value} id={r.value} />
                                    <Label htmlFor={r.value} className="font-normal">
                                        {r.label}
                                    </Label>
                                </div>
                            ))}
                        </RadioGroup>

                        {reason === 'other' && (
                            <Textarea
                                placeholder="Nhập lý do..."
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
                        Hủy bỏ
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={handleSubmit}
                        disabled={
                            cancelItemMutation.isPending ||
                            (reason === 'other' && !customReason.trim())
                        }
                    >
                        {cancelItemMutation.isPending ? 'Đang xử lý...' : 'Xác nhận hủy'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
