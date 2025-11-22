'use client';

import { useForm } from 'react-hook-form';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useApplyDiscount } from '../../hooks';
import { ApplyDiscountDto, PaymentStatus } from '../../types';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

interface ApplyDiscountDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    billId: number;
    currentStatus: PaymentStatus;
}

export function ApplyDiscountDialog({
    open,
    onOpenChange,
    billId,
    currentStatus,
}: ApplyDiscountDialogProps) {
    const { mutate: applyDiscount, isPending } = useApplyDiscount();
    const {
        register,
        handleSubmit,
        watch,
        reset,
        formState: { errors },
    } = useForm<ApplyDiscountDto>();

    const amount = watch('amount');

    const onSubmit = (data: ApplyDiscountDto) => {
        applyDiscount(
            { id: billId, data },
            {
                onSuccess: () => {
                    reset();
                    onOpenChange(false);
                },
            }
        );
    };

    if (currentStatus !== PaymentStatus.PENDING) {
        return (
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Cannot Apply Discount</DialogTitle>
                    </DialogHeader>
                    <p className="text-sm text-muted-foreground">
                        Discounts can only be applied to pending bills.
                    </p>
                    <DialogFooter>
                        <Button onClick={() => onOpenChange(false)}>Close</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        );
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Apply Discount</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="amount">Discount Amount *</Label>
                        <Input
                            id="amount"
                            type="number"
                            min="0"
                            step="1000"
                            {...register('amount', {
                                required: 'Discount amount is required',
                                valueAsNumber: true,
                                min: { value: 0, message: 'Must be at least 0' },
                            })}
                            placeholder="10000"
                        />
                        {errors.amount && (
                            <p className="text-sm text-destructive">
                                {errors.amount.message}
                            </p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="reason">Reason *</Label>
                        <Input
                            id="reason"
                            {...register('reason', {
                                required: 'Reason is required',
                            })}
                            placeholder="Enter discount reason"
                        />
                        {errors.reason && (
                            <p className="text-sm text-destructive">
                                {errors.reason.message}
                            </p>
                        )}
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isPending}>
                            {isPending ? 'Applying...' : 'Apply Discount'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
