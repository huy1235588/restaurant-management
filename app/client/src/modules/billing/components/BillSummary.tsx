import { Bill } from '../types';
import { formatCurrency } from '../utils';
import { Separator } from '@/components/ui/separator';

interface BillSummaryProps {
    bill: Bill;
}

export function BillSummary({ bill }: BillSummaryProps) {
    return (
        <div className="space-y-2">
            <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium">{formatCurrency(bill.subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Tax</span>
                <span className="font-medium">{formatCurrency(bill.taxAmount)}</span>
            </div>
            <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Service Charge</span>
                <span className="font-medium">{formatCurrency(bill.serviceCharge)}</span>
            </div>
            {bill.discountAmount > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                    <span>Discount</span>
                    <span className="font-medium">-{formatCurrency(bill.discountAmount)}</span>
                </div>
            )}
            <Separator />
            <div className="flex justify-between text-base">
                <span className="font-semibold">Total</span>
                <span className="font-bold text-lg">{formatCurrency(bill.totalAmount)}</span>
            </div>
            {bill.paidAmount > 0 && (
                <>
                    <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Paid</span>
                        <span className="font-medium">{formatCurrency(bill.paidAmount)}</span>
                    </div>
                    {bill.changeAmount > 0 && (
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Change</span>
                            <span className="font-medium">{formatCurrency(bill.changeAmount)}</span>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
