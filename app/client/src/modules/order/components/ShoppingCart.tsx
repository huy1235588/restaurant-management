'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShoppingCartItem } from '../types';
import { formatCurrency } from '../utils';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ShoppingCartProps {
    items: ShoppingCartItem[];
    onUpdateQuantity: (menuItemId: number, quantity: number) => void;
    onRemoveItem: (menuItemId: number) => void;
}

export function ShoppingCart({
    items,
    onUpdateQuantity,
    onRemoveItem,
}: ShoppingCartProps) {
    const subtotal = items.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
    );

    if (items.length === 0) {
        return (
            <Card className="sticky top-4">
                <CardHeader>
                    <CardTitle>Giỏ hàng (0)</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-center text-sm text-muted-foreground py-8">
                        Chưa có món nào
                    </p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="sticky top-4">
            <CardHeader>
                <CardTitle>Giỏ hàng ({items.length})</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <ScrollArea className="max-h-[300px] pr-4">
                    <div className="space-y-3">
                        {items.map((item) => (
                            <div
                                key={item.menuItemId}
                                className="flex gap-3 rounded-lg border p-3"
                            >
                                <div className="flex-1 space-y-1">
                                    <h4 className="font-medium text-sm">
                                        {item.name}
                                    </h4>
                                    <p className="text-xs text-muted-foreground">
                                        {formatCurrency(item.price)}
                                    </p>
                                    {item.specialRequests && (
                                        <p className="text-xs text-amber-600 dark:text-amber-400">
                                            📝 {item.specialRequests}
                                        </p>
                                    )}
                                </div>
                                <div className="flex flex-col gap-2">
                                    <div className="flex items-center gap-1">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            className="h-6 w-6 p-0"
                                            onClick={() =>
                                                onUpdateQuantity(
                                                    item.menuItemId,
                                                    Math.max(1, item.quantity - 1)
                                                )
                                            }
                                        >
                                            <Minus className="h-3 w-3" />
                                        </Button>
                                        <span className="w-8 text-center text-sm font-medium">
                                            {item.quantity}
                                        </span>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            className="h-6 w-6 p-0"
                                            onClick={() =>
                                                onUpdateQuantity(item.menuItemId, item.quantity + 1)
                                            }
                                        >
                                            <Plus className="h-3 w-3" />
                                        </Button>
                                    </div>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="h-6 px-2"
                                        onClick={() => onRemoveItem(item.menuItemId)}
                                    >
                                        <Trash2 className="h-3 w-3" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </ScrollArea>

                <div className="border-t pt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Tạm tính</span>
                        <span className="font-medium">{formatCurrency(subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold">
                        <span>Tổng cộng</span>
                        <span>{formatCurrency(subtotal)}</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
