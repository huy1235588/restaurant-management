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
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Order } from '../types';
import { useCancelOrder } from '../hooks';
import { formatCurrency, formatOrderNumber } from '../utils';
import { AlertCircle } from 'lucide-react';

interface CancelOrderDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    order: Order | null;
}

const CANCEL_REASONS = [
    { value: 'customer_cancelled', label: 'Khách hủy đơn' },
    { value: 'wrong_order', label: 'Tạo nhầm đơn hàng' },
    { value: 'customer_left', label: 'Khách bỏ đi không chờ' },
    { value: 'restaurant_issue', label: 'Sự cố nhà hàng' },
    { value: 'other', label: 'Lý do khác' },
];

export function CancelOrderDialog({
    open,
    onOpenChange,
    order,
}: CancelOrderDialogProps) {
    const [reason, setReason] = useState('customer_cancelled');
    const [customReason, setCustomReason] = useState('');
    const cancelOrderMutation = useCancelOrder();

    const handleSubmit = async () => {
        if (!order) return;

        const finalReason =
            reason === 'other'
                ? customReason
                : CANCEL_REASONS.find((r) => r.value === reason)?.label || reason;

        if (reason === 'other' && !customReason.trim()) {
            return;
        }

        await cancelOrderMutation.mutateAsync({
            orderId: order.orderId,
            data: { reason: finalReason },
        });

        onOpenChange(false);
        setReason('customer_cancelled');
        setCustomReason('');
    };

    if (!order) return null;

    const hasItemsInProgress = order.orderItems.some(
        (item) => item.status === 'active' || item.status === 'pending'
    );

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Hủy đơn hàng</DialogTitle>
                    <DialogDescription>
                        Bạn có chắc chắn muốn hủy đơn hàng này không? Hành động này không thể
                        hoàn tác.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    <div className="rounded-lg border p-4 space-y-2">
                        <h4 className="font-medium">
                            {formatOrderNumber(order.orderNumber)}
                        </h4>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                            <div>
                                <span className="text-muted-foreground">Bàn: </span>
                                <span className="font-medium">{order.table.tableNumber}</span>
                            </div>
                            <div>
                                <span className="text-muted-foreground">Số người: </span>
                                <span className="font-medium">{order.partySize}</span>
                            </div>
                        </div>
                        <div className="text-sm">
                            <span className="text-muted-foreground">Số món: </span>
                            <span className="font-medium">
                                {order.orderItems.length} món
                            </span>
                        </div>
                        <div className="text-sm font-bold">
                            <span className="text-muted-foreground">Tổng tiền: </span>
                            <span>{formatCurrency(parseFloat(order.finalAmount))}</span>
                        </div>
                    </div>

                    {hasItemsInProgress && (
                        <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>
                                Một số món đang được chế biến. Hủy đơn có thể gây lãng phí
                                nguyên liệu.
                            </AlertDescription>
                        </Alert>
                    )}

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
                        disabled={cancelOrderMutation.isPending}
                    >
                        Hủy bỏ
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={handleSubmit}
                        disabled={
                            cancelOrderMutation.isPending ||
                            (reason === 'other' && !customReason.trim())
                        }
                    >
                        {cancelOrderMutation.isPending
                            ? 'Đang xử lý...'
                            : 'Xác nhận hủy đơn'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
