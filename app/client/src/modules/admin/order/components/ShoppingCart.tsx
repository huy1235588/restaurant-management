'use client';

import { memo, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShoppingCartItem } from '../types';
import { formatCurrency } from '../utils';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useTranslation } from 'react-i18next';

interface ShoppingCartProps {
    items: ShoppingCartItem[];
    onUpdateQuantity: (menuItemId: number, quantity: number) => void;
    onRemoveItem: (menuItemId: number) => void;
}

// Separate CartItem component for better memoization
interface CartItemProps {
    item: ShoppingCartItem;
    onUpdateQuantity: (menuItemId: number, quantity: number) => void;
    onRemoveItem: (menuItemId: number) => void;
}

const CartItem = memo(({ item, onUpdateQuantity, onRemoveItem }: CartItemProps) => {
    const handleDecrease = useCallback(() => {
        onUpdateQuantity(item.menuItemId, Math.max(1, item.quantity - 1));
    }, [item.menuItemId, item.quantity, onUpdateQuantity]);

    const handleIncrease = useCallback(() => {
        onUpdateQuantity(item.menuItemId, item.quantity + 1);
    }, [item.menuItemId, item.quantity, onUpdateQuantity]);

    const handleRemove = useCallback(() => {
        onRemoveItem(item.menuItemId);
    }, [item.menuItemId, onRemoveItem]);

    return (
        <div className="flex gap-3 rounded-lg border p-3">
            <div className="flex-1 space-y-1">
                <h4 className="font-medium text-sm">{item.name}</h4>
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
                        onClick={handleDecrease}
                        disabled={item.quantity <= 1}
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
                        onClick={handleIncrease}
                    >
                        <Plus className="h-3 w-3" />
                    </Button>
                </div>
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-6 px-2"
                    onClick={handleRemove}
                >
                    <Trash2 className="h-3 w-3" />
                </Button>
            </div>
        </div>
    );
});

CartItem.displayName = 'CartItem';

// Empty cart component
const EmptyCart = memo(({ title, message }: { title: string; message: string }) => (
    <Card className="sticky top-4">
        <CardHeader>
            <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
            <p className="text-center text-sm text-muted-foreground py-8">
                {message}
            </p>
        </CardContent>
    </Card>
));

EmptyCart.displayName = 'EmptyCart';

export const ShoppingCart = memo(function ShoppingCart({
    items,
    onUpdateQuantity,
    onRemoveItem,
}: ShoppingCartProps) {
    const { t } = useTranslation();

    // Memoize subtotal calculation
    const subtotal = useMemo(() => {
        return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    }, [items]);

    const itemCount = items.length;
    const isEmpty = itemCount === 0;

    if (isEmpty) {
        return (
            <EmptyCart
                title={t('orders.shoppingCartCount', { count: 0 })}
                message={t('orders.noItemsYet')}
            />
        );
    }

    return (
        <Card className="sticky top-4">
            <CardHeader>
                <CardTitle>
                    {t('orders.shoppingCartCount', { count: itemCount })}
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="max-h-96 overflow-y-auto pr-4">
                    <div className="space-y-3">
                        {items.map((item) => (
                            <CartItem
                                key={item.menuItemId}
                                item={item}
                                onUpdateQuantity={onUpdateQuantity}
                                onRemoveItem={onRemoveItem}
                            />
                        ))}
                    </div>
                </div>

                <div className="border-t pt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">
                            {t('orders.subtotal')}
                        </span>
                        <span className="font-medium">
                            {formatCurrency(subtotal)}
                        </span>
                    </div>
                    <div className="flex justify-between text-lg font-bold">
                        <span>{t('orders.total')}</span>
                        <span>{formatCurrency(subtotal)}</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
});