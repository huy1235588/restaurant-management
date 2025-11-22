import { Order } from '../types';
import { formatCurrency } from '../utils';
import { Separator } from '@/components/ui/separator';

interface OrderSummaryProps {
    order: Order;
}

export function OrderSummary({ order }: OrderSummaryProps) {
    return (
        <div className="space-y-2">
            <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium">{formatCurrency(order.subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Tax (10%)</span>
                <span className="font-medium">{formatCurrency(order.taxAmount)}</span>
            </div>
            <Separator />
            <div className="flex justify-between text-base">
                <span className="font-semibold">Total</span>
                <span className="font-bold text-lg">
                    {formatCurrency(order.totalAmount)}
                </span>
            </div>
        </div>
    );
}
