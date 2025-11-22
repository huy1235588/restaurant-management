'use client';

import { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { MenuItemPicker } from '../../components/MenuItemPicker';
import { useAddOrderItem } from '../../hooks';
import { formatCurrency } from '../../utils';
import { Plus, Minus } from 'lucide-react';
import type { AddOrderItemDto } from '../../types';

interface MenuItem {
    itemId: number;
    itemCode: string;
    itemName: string;
    description?: string | null;
    price: number;
    imageUrl?: string | null;
    categoryId: number;
    isAvailable: boolean;
    category?: {
        categoryId: number;
        categoryName: string;
    };
}

interface AddItemDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    orderId: number;
    menuItems: MenuItem[];
}

export function AddItemDialog({
    open,
    onOpenChange,
    orderId,
    menuItems,
}: AddItemDialogProps) {
    const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
    const [quantity, setQuantity] = useState(1);
    const [specialRequest, setSpecialRequest] = useState('');

    const { mutate: addItem, isPending } = useAddOrderItem(orderId);

    // Reset form when dialog opens/closes
    useEffect(() => {
        if (!open) {
            setSelectedItem(null);
            setQuantity(1);
            setSpecialRequest('');
        }
    }, [open]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedItem) return;

        const data: AddOrderItemDto = {
            itemId: selectedItem.itemId,
            quantity,
            specialRequest: specialRequest.trim() || undefined,
        };

        addItem(data, {
            onSuccess: () => {
                onOpenChange(false);
            },
        });
    };

    const incrementQuantity = () => setQuantity((prev) => prev + 1);
    const decrementQuantity = () => setQuantity((prev) => Math.max(1, prev - 1));

    const subtotal = selectedItem ? selectedItem.price * quantity : 0;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Add Item to Order</DialogTitle>
                    <DialogDescription>
                        Select a menu item and specify quantity
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Menu Item Picker */}
                    <div className="space-y-2">
                        <Label>Select Menu Item</Label>
                        <MenuItemPicker
                            items={menuItems}
                            onSelectItem={setSelectedItem}
                            selectedItemId={selectedItem?.itemId}
                        />
                    </div>

                    {/* Selected Item Details */}
                    {selectedItem && (
                        <>
                            <div className="p-4 bg-muted rounded-lg space-y-4">
                                <div>
                                    <h4 className="font-semibold text-lg">
                                        {selectedItem.itemName}
                                    </h4>
                                    <p className="text-sm text-muted-foreground">
                                        {selectedItem.itemCode}
                                    </p>
                                    {selectedItem.description && (
                                        <p className="text-sm mt-1">
                                            {selectedItem.description}
                                        </p>
                                    )}
                                </div>

                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">
                                        Price
                                    </span>
                                    <span className="font-semibold">
                                        {formatCurrency(selectedItem.price)}
                                    </span>
                                </div>
                            </div>

                            {/* Quantity */}
                            <div className="space-y-2">
                                <Label htmlFor="quantity">
                                    Quantity <span className="text-destructive">*</span>
                                </Label>
                                <div className="flex items-center gap-3">
                                    <Button
                                        type="button"
                                        size="icon"
                                        variant="outline"
                                        onClick={decrementQuantity}
                                        disabled={quantity <= 1}
                                    >
                                        <Minus className="h-4 w-4" />
                                    </Button>
                                    <Input
                                        id="quantity"
                                        type="number"
                                        min="1"
                                        value={quantity}
                                        onChange={(e) =>
                                            setQuantity(
                                                Math.max(1, parseInt(e.target.value) || 1)
                                            )
                                        }
                                        className="w-20 text-center"
                                    />
                                    <Button
                                        type="button"
                                        size="icon"
                                        variant="outline"
                                        onClick={incrementQuantity}
                                    >
                                        <Plus className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>

                            {/* Special Request */}
                            <div className="space-y-2">
                                <Label htmlFor="specialRequest">
                                    Special Request (Optional)
                                </Label>
                                <Textarea
                                    id="specialRequest"
                                    value={specialRequest}
                                    onChange={(e) => setSpecialRequest(e.target.value)}
                                    placeholder="E.g., No onions, extra spicy, etc."
                                    rows={3}
                                />
                            </div>

                            {/* Subtotal */}
                            <div className="flex items-center justify-between p-4 bg-primary/10 rounded-lg">
                                <span className="font-semibold">Subtotal</span>
                                <span className="text-xl font-bold text-primary">
                                    {formatCurrency(subtotal)}
                                </span>
                            </div>
                        </>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-2 justify-end pt-4 border-t">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={isPending}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={!selectedItem || isPending}>
                            {isPending ? 'Adding...' : 'Add to Order'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
