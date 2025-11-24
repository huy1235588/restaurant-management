import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { formatCurrency } from '../utils';

interface OrderSummaryCardProps {
    subtotal: number;
    serviceCharge?: number;
    tax?: number;
    discount?: number;
    total: number;
}

export function OrderSummaryCard({
    subtotal,
    serviceCharge = 0,
    tax = 0,
    discount = 0,
    total,
}: OrderSummaryCardProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Tổng kết đơn hàng</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Tạm tính</span>
                    <span className="font-medium">{formatCurrency(subtotal)}</span>
                </div>

                {discount > 0 && (
                    <>
                        <div className="flex justify-between text-sm text-green-600 dark:text-green-400">
                            <span>Giảm giá</span>
                            <span className="font-medium">
                                -{formatCurrency(discount)}
                            </span>
                        </div>
                        <Separator />
                    </>
                )}

                {!discount && <Separator />}

                <div className="flex justify-between text-lg font-bold">
                    <span>Tổng cộng</span>
                    <span>{formatCurrency(total)}</span>
                </div>
            </CardContent>
        </Card>
    );
}
