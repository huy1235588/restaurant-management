import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { formatCurrency } from '../utils';
import { useTranslation } from 'react-i18next';

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
    const { t } = useTranslation();
    
    return (
        <Card>
            <CardHeader>
                <CardTitle>{t('orders.orderSummary')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{t('orders.subtotal')}</span>
                    <span className="font-medium">{formatCurrency(subtotal)}</span>
                </div>

                {discount > 0 && (
                    <>
                        <div className="flex justify-between text-sm text-green-600 dark:text-green-400">
                            <span>{t('orders.discount')}</span>
                            <span className="font-medium">
                                -{formatCurrency(discount)}
                            </span>
                        </div>
                        <Separator />
                    </>
                )}

                {!discount && <Separator />}

                <div className="flex justify-between text-lg font-bold">
                    <span>{t('orders.total')}</span>
                    <span>{formatCurrency(total)}</span>
                </div>
            </CardContent>
        </Card>
    );
}
