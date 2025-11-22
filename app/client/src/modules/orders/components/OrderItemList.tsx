import { OrderItem } from '../types';
import { formatCurrency } from '../utils';
import { Button } from '@/components/ui/button';
import { Trash2, Minus, Plus } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface OrderItemListProps {
    items: OrderItem[];
    editable?: boolean;
    onUpdateQuantity?: (itemId: number, quantity: number) => void;
    onRemove?: (itemId: number) => void;
}

export function OrderItemList({
    items,
    editable = false,
    onUpdateQuantity,
    onRemove,
}: OrderItemListProps) {
    if (!items || items.length === 0) {
        return (
            <div className="text-center py-8 text-muted-foreground">
                No items in this order
            </div>
        );
    }

    return (
        <div className="space-y-2">
            {items.map((item) => (
                <Card key={item.orderItemId} className="p-3">
                    <div className="flex items-center justify-between gap-3">
                        <div className="flex-1">
                            <div className="font-medium">
                                {item.menuItem?.itemName || 'Unknown Item'}
                            </div>
                            <div className="text-sm text-muted-foreground">
                                {formatCurrency(item.unitPrice)} × {item.quantity}
                            </div>
                            {item.specialRequest && (
                                <div className="text-xs text-amber-600 mt-1">
                                    Note: {item.specialRequest}
                                </div>
                            )}
                        </div>

                        <div className="flex items-center gap-3">
                            {editable && onUpdateQuantity ? (
                                <div className="flex items-center gap-1">
                                    <Button
                                        size="icon"
                                        variant="outline"
                                        className="h-7 w-7"
                                        onClick={() =>
                                            onUpdateQuantity(
                                                item.orderItemId,
                                                Math.max(1, item.quantity - 1)
                                            )
                                        }
                                        disabled={item.quantity <= 1}
                                    >
                                        <Minus className="h-3 w-3" />
                                    </Button>
                                    <span className="w-8 text-center font-medium">
                                        {item.quantity}
                                    </span>
                                    <Button
                                        size="icon"
                                        variant="outline"
                                        className="h-7 w-7"
                                        onClick={() =>
                                            onUpdateQuantity(
                                                item.orderItemId,
                                                item.quantity + 1
                                            )
                                        }
                                    >
                                        <Plus className="h-3 w-3" />
                                    </Button>
                                </div>
                            ) : (
                                <span className="text-sm text-muted-foreground">
                                    Qty: {item.quantity}
                                </span>
                            )}

                            <div className="font-semibold min-w-[100px] text-right">
                                {formatCurrency(item.subtotal)}
                            </div>

                            {editable && onRemove && (
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    className="h-7 w-7 text-destructive hover:text-destructive"
                                    onClick={() => onRemove(item.orderItemId)}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            )}
                        </div>
                    </div>
                </Card>
            ))}
        </div>
    );
}
