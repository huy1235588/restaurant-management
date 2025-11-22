'use client';

import { useMemo, useCallback } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { useAddItems } from '../hooks';
import { useMenuItems } from '@/modules/menu/hooks';
import { formatCurrency } from '../utils';
import { useTranslation } from 'react-i18next';
import { Loader2, Plus, Trash2, ShoppingCart } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MenuItem } from '@/types';

const orderItemSchema = z.object({
    menuItemId: z.number().min(1, 'Vui lòng chọn món'),
    quantity: z.number().min(1, 'Số lượng phải lớn hơn 0'),
    note: z.string().optional(),
});

const addItemsSchema = z.object({
    items: z.array(orderItemSchema).min(1, 'Phải có ít nhất 1 món'),
});

type AddItemsFormData = z.infer<typeof addItemsSchema>;

interface AddItemsDialogProps {
    open: boolean;
    onClose: () => void;
    orderId: number;
    onSuccess?: () => void;
}

export function AddItemsDialog({ open, onClose, orderId, onSuccess }: AddItemsDialogProps) {
    const { t } = useTranslation();
    const addItemsMutation = useAddItems();
    const { data: menuData } = useMenuItems({ limit: 1000, isAvailable: true });

    const form = useForm<AddItemsFormData>({
        resolver: zodResolver(addItemsSchema),
        defaultValues: {
            items: [{ menuItemId: 0, quantity: 1, note: '' }],
        },
    });

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: 'items',
    });

    const onSubmit = useCallback(
        async (data: AddItemsFormData) => {
            try {
                const payload = {
                    items: data.items.map((it) => ({
                        itemId: it.menuItemId,
                        quantity: it.quantity,
                        specialRequest: it.note || undefined,
                    })),
                };
                await addItemsMutation.mutateAsync({ orderId, data: payload });
                form.reset();
                onSuccess?.();
                onClose();
            } catch (error) {
                // Error handled by mutation
            }
        },
        [addItemsMutation, orderId, onSuccess, onClose, form]
    );

    const handleAddItem = useCallback(() => {
        append({ menuItemId: 0, quantity: 1, note: '' });
    }, [append]);

    const handleRemoveItem = useCallback(
        (index: number) => {
            if (fields.length > 1) {
                remove(index);
            }
        },
        [fields.length, remove]
    );

    const totalAmount = useMemo(() => {
        const items = form.watch('items');
        if (!menuData?.items) return 0;

        return items.reduce((total, item) => {
            const menuItem = menuData.items.find((m: MenuItem) => m.itemId === item.menuItemId);
            return total + (menuItem?.price || 0) * (item.quantity || 0);
        }, 0);
    }, [form.watch('items'), menuData?.items]);

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-2xl max-h-[90vh] p-0">
                <DialogHeader className="px-6 pt-6 pb-4 border-b">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-primary/10">
                            <ShoppingCart className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                            <DialogTitle className="text-xl">
                                {t('orders.addItems')}
                            </DialogTitle>
                            <DialogDescription>
                                Thêm các món ăn mới vào đơn hàng #{orderId}
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col h-full">
                        <ScrollArea className="flex-1 px-6 max-h-[50vh]">
                            <div className="space-y-4 py-4">
                                <div className="flex items-center justify-between">
                                    <FormLabel className="text-base font-semibold">
                                        Danh sách món
                                    </FormLabel>
                                    <Button
                                        type="button"
                                        size="sm"
                                        variant="outline"
                                        onClick={handleAddItem}
                                        className="gap-2"
                                    >
                                        <Plus className="h-4 w-4" />
                                        Thêm món
                                    </Button>
                                </div>

                                {fields.map((field, index) => (
                                    <Card key={field.id} className="p-4 hover:shadow-md transition-shadow">
                                        <div className="space-y-3">
                                            <div className="flex gap-2">
                                                {/* Menu Item Selection */}
                                                <FormField
                                                    control={form.control}
                                                    name={`items.${index}.menuItemId`}
                                                    render={({ field }) => (
                                                        <FormItem className="flex-1">
                                                            <Select
                                                                onValueChange={(value) =>
                                                                    field.onChange(parseInt(value))
                                                                }
                                                                value={field.value?.toString()}
                                                            >
                                                                <FormControl>
                                                                    <SelectTrigger>
                                                                        <SelectValue placeholder="Chọn món" />
                                                                    </SelectTrigger>
                                                                </FormControl>
                                                                <SelectContent>
                                                                    {menuData?.items?.map((item: MenuItem) => (
                                                                        <SelectItem
                                                                            key={item.itemId}
                                                                            value={item.itemId.toString()}
                                                                        >
                                                                            <div className="flex justify-between items-center w-full gap-4">
                                                                                <span>{item.itemName}</span>
                                                                                <span className="text-primary font-medium">
                                                                                    {formatCurrency(item.price)}
                                                                                </span>
                                                                            </div>
                                                                        </SelectItem>
                                                                    ))}
                                                                </SelectContent>
                                                            </Select>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />

                                                {/* Quantity */}
                                                <FormField
                                                    control={form.control}
                                                    name={`items.${index}.quantity`}
                                                    render={({ field }) => (
                                                        <FormItem className="w-24">
                                                            <FormControl>
                                                                <Input
                                                                    type="number"
                                                                    min="1"
                                                                    placeholder="SL"
                                                                    className="text-center"
                                                                    {...field}
                                                                    onChange={(e) =>
                                                                        field.onChange(
                                                                            parseInt(e.target.value) || 1
                                                                        )
                                                                    }
                                                                />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />

                                                {/* Remove Button */}
                                                <Button
                                                    type="button"
                                                    size="icon"
                                                    variant="ghost"
                                                    onClick={() => handleRemoveItem(index)}
                                                    disabled={fields.length === 1}
                                                    className="hover:bg-destructive/10 hover:text-destructive"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>

                                            {/* Item Note */}
                                            <FormField
                                                control={form.control}
                                                name={`items.${index}.note`}
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormControl>
                                                            <Input
                                                                placeholder={t('orders.itemNote')}
                                                                className="text-sm"
                                                                {...field}
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                    </Card>
                                ))}

                                {/* Total Amount */}
                                <div className="sticky bottom-0 mt-4">
                                    <Card className="bg-linear-to-br from-primary/10 via-primary/5 to-background border-primary/20">
                                        <div className="p-4 flex justify-between items-center">
                                            <span className="font-semibold">Tổng tiền thêm:</span>
                                            <span className="text-2xl font-bold text-primary">
                                                {formatCurrency(totalAmount)}
                                            </span>
                                        </div>
                                    </Card>
                                </div>
                            </div>
                        </ScrollArea>

                        <DialogFooter className="px-6 py-4 border-t bg-muted/30">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={onClose}
                                disabled={addItemsMutation.isPending}
                            >
                                {t('common.cancel')}
                            </Button>
                            <Button
                                type="submit"
                                disabled={addItemsMutation.isPending || !totalAmount}
                                className="gap-2"
                            >
                                {addItemsMutation.isPending && (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                )}
                                {t('orders.addItems')}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}