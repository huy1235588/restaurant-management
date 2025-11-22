'use client';

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useState } from 'react';
import { useCancelOrder } from '../../hooks';

interface CancelOrderDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    orderId?: number;
}

export function CancelOrderDialog({
    open,
    onOpenChange,
    orderId,
}: CancelOrderDialogProps) {
    const [reason, setReason] = useState('');
    const { mutate: cancelOrder, isPending } = useCancelOrder();

    const handleSubmit = () => {
        if (!orderId || reason.trim().length < 10) return;

        cancelOrder(
            { id: orderId, data: { cancellationReason: reason } },
            {
                onSuccess: () => {
                    onOpenChange(false);
                    setReason('');
                },
            }
        );
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Cancel Order</DialogTitle>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="reason">
                            Cancellation Reason{' '}
                            <span className="text-destructive">*</span>
                        </Label>
                        <Textarea
                            id="reason"
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            placeholder="Please provide a reason for cancellation (minimum 10 characters)"
                            rows={4}
                        />
                        <p className="text-xs text-muted-foreground">
                            {reason.length}/10 minimum characters
                        </p>
                    </div>
                </div>

                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={isPending}
                    >
                        Close
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={handleSubmit}
                        disabled={reason.trim().length < 10 || isPending}
                    >
                        {isPending ? 'Cancelling...' : 'Cancel Order'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
