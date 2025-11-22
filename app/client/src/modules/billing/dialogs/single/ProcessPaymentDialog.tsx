'use client';

import { useState } from 'react';
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
import { useProcessPayment } from '../../hooks';
import { ProcessPaymentDto, PaymentMethod, PaymentStatus } from '../../types';
import { formatCurrency, calculateChange, PAYMENT_METHOD_LABELS } from '../../utils';
import { CreditCard, Banknote, Smartphone } from 'lucide-react';

interface ProcessPaymentDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    billId: number;
    totalAmount: number;
    currentStatus: PaymentStatus;
}

export function ProcessPaymentDialog({
    open,
    onOpenChange,
    billId,
    totalAmount,
    currentStatus,
}: ProcessPaymentDialogProps) {
    const { mutate: processPayment, isPending } = useProcessPayment();
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(PaymentMethod.CASH);
    const {
        register,
        handleSubmit,
        watch,
        setValue,
        reset,
        formState: { errors },
    } = useForm<ProcessPaymentDto>({
        defaultValues: {
            method: PaymentMethod.CASH,
            amount: totalAmount,
        },
    });

    const amount = watch('amount');
    const change = calculateChange(amount || 0, totalAmount);

    const onSubmit = (data: ProcessPaymentDto) => {
        processPayment(
            { id: billId, data },
            {
                onSuccess: () => {
                    reset();
                    onOpenChange(false);
                },
            }
        );
    };

    if (currentStatus === PaymentStatus.PAID) {
        return (
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Bill Already Paid</DialogTitle>
                    </DialogHeader>
                    <p className="text-sm text-muted-foreground">
                        This bill has already been paid.
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
                    <DialogTitle>Process Payment</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="rounded-lg bg-muted p-4">
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">Total Amount</span>
                            <span className="text-2xl font-bold">
                                {formatCurrency(totalAmount)}
                            </span>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Payment Method *</Label>
                        <div className="grid grid-cols-2 gap-2">
                            <Button
                                type="button"
                                variant={paymentMethod === PaymentMethod.CASH ? 'default' : 'outline'}
                                onClick={() => {
                                    setPaymentMethod(PaymentMethod.CASH);
                                    setValue('method', PaymentMethod.CASH);
                                }}
                                className="justify-start"
                            >
                                <Banknote className="w-4 h-4 mr-2" />
                                Cash
                            </Button>
                            <Button
                                type="button"
                                variant={
                                    paymentMethod === PaymentMethod.CARD ? 'default' : 'outline'
                                }
                                onClick={() => {
                                    setPaymentMethod(PaymentMethod.CARD);
                                    setValue('method', PaymentMethod.CARD);
                                    setValue('amount', totalAmount);
                                }}
                                className="justify-start"
                            >
                                <CreditCard className="w-4 h-4 mr-2" />
                                Card
                            </Button>
                            <Button
                                type="button"
                                variant={
                                    paymentMethod === PaymentMethod.BANK_TRANSFER
                                        ? 'default'
                                        : 'outline'
                                }
                                onClick={() => {
                                    setPaymentMethod(PaymentMethod.BANK_TRANSFER);
                                    setValue('method', PaymentMethod.BANK_TRANSFER);
                                    setValue('amount', totalAmount);
                                }}
                                className="justify-start"
                            >
                                <Smartphone className="w-4 h-4 mr-2" />
                                Transfer
                            </Button>
                            <Button
                                type="button"
                                variant={
                                    paymentMethod === PaymentMethod.MOMO ? 'default' : 'outline'
                                }
                                onClick={() => {
                                    setPaymentMethod(PaymentMethod.MOMO);
                                    setValue('method', PaymentMethod.MOMO);
                                    setValue('amount', totalAmount);
                                }}
                                className="justify-start"
                            >
                                <Smartphone className="w-4 h-4 mr-2" />
                                MoMo
                            </Button>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="amount">Amount Paid *</Label>
                        <Input
                            id="amount"
                            type="number"
                            min={totalAmount}
                            step="1000"
                            {...register('amount', {
                                required: 'Amount is required',
                                valueAsNumber: true,
                                min: {
                                    value: totalAmount,
                                    message: 'Amount must equal total (no partial payments)',
                                },
                            })}
                        />
                        {errors.amount && (
                            <p className="text-sm text-destructive">
                                {errors.amount.message}
                            </p>
                        )}
                    </div>

                    {paymentMethod === PaymentMethod.CASH && change > 0 && (
                        <div className="rounded-lg bg-green-50 dark:bg-green-950 p-4">
                            <div className="flex justify-between items-center">
                                <span className="text-sm font-medium">Change to Return</span>
                                <span className="text-xl font-bold text-green-600">
                                    {formatCurrency(change)}
                                </span>
                            </div>
                        </div>
                    )}

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isPending}>
                            {isPending ? 'Processing...' : 'Process Payment'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
