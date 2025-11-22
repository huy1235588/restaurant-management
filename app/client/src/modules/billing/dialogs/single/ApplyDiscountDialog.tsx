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

    const discountPercentage = watch('discountPercentage');

    const onSubmit = (data: ApplyDiscountDto) => {
        applyDiscount(
            { billId, data },
            {
                onSuccess: () => {
                    reset();
                    onOpenChange(false);
                },
            }
        );
    };

    if (currentStatus !== PaymentStatus.UNPAID) {
        return (
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Cannot Apply Discount</DialogTitle>
                    </DialogHeader>
                    <p className="text-sm text-muted-foreground">
                        Discounts can only be applied to unpaid bills.
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
                    {discountPercentage > 10 && (
                        <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>
                                Discount exceeds 10% - Manager approval required
                            </AlertDescription>
                        </Alert>
                    )}

                    <div className="space-y-2">
                        <Label htmlFor="discountPercentage">Discount Percentage *</Label>
                        <Input
                            id="discountPercentage"
                            type="number"
                            min="0"
                            max="100"
                            step="0.01"
                            {...register('discountPercentage', {
                                required: 'Discount percentage is required',
                                valueAsNumber: true,
                                min: { value: 0, message: 'Must be at least 0%' },
                                max: { value: 100, message: 'Cannot exceed 100%' },
                            })}
                            placeholder="10"
                        />
                        {errors.discountPercentage && (
                            <p className="text-sm text-destructive">
                                {errors.discountPercentage.message}
                            </p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="discountReason">Reason *</Label>
                        <Select
                            onValueChange={(value) =>
                                register('discountReason').onChange({
                                    target: { value },
                                })
                            }
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select reason" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="loyalty">Loyalty Customer</SelectItem>
                                <SelectItem value="promotion">Promotion</SelectItem>
                                <SelectItem value="complaint">Service Recovery</SelectItem>
                                <SelectItem value="staff">Staff Discount</SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                        </Select>
                        <input type="hidden" {...register('discountReason', { required: true })} />
                        {errors.discountReason && (
                            <p className="text-sm text-destructive">Reason is required</p>
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
