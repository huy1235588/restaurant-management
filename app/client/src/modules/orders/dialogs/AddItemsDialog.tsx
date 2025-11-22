'use client';

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
import { Card, CardContent } from '@/components/ui/card';
import { useAddItems } from '../hooks';
import { useMenuItems } from '@/modules/menu/hooks';
import { formatCurrency } from '../utils';
import { useTranslation } from 'react-i18next';
import { Loader2, Plus, Trash2 } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MenuItem } from '@/types';

const orderItemSchema = z.object({
    itemId: z.number().min(1, 'Vui lòng chọn món'),
    quantity: z.number().min(1, 'Số lượng phải lớn hơn 0'),
    specialRequest: z.string().optional(),
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
            items: [{ itemId: 0, quantity: 1, specialRequest: '' }],
        },
    });

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: 'items',
    });

    const onSubmit = async (data: AddItemsFormData) => {
        try {
            await addItemsMutation.mutateAsync({
                orderId,
                data,
            });
            form.reset();
            onSuccess?.();
            onClose();
        } catch (error) {
            // Error handled by mutation
        }
    };

    const handleAddItem = () => {
        append({ itemId: 0, quantity: 1, specialRequest: '' });
    };

    const handleRemoveItem = (index: number) => {
        if (fields.length > 1) {
            remove(index);
        }
    };

    const calculateTotal = () => {
        const items = form.watch('items');
        if (!menuData?.items) return 0;

        return items.reduce((total, item) => {
            const menuItem = menuData.items.find((m: MenuItem) => m.itemId === item.itemId);
            return total + (menuItem?.price || 0) * item.quantity;
        }, 0);
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[90vh]">
                <DialogHeader>
                    <DialogTitle>{t('orders.addItems')}</DialogTitle>
                    <DialogDescription>
                        Thêm các món ăn mới vào đơn hàng #{orderId}
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <ScrollArea className="max-h-[50vh] pr-4">
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <FormLabel>{t('orders.selectItems')}</FormLabel>
                                    <Button
                                        type="button"
                                        size="sm"
                                        variant="outline"
                                        onClick={handleAddItem}
                                    >
                                        <Plus className="h-4 w-4 mr-1" />
                                        Thêm món
                                    </Button>
                                </div>

                                {fields.map((field, index) => (
                                    <Card key={field.id}>
                                        <CardContent className="pt-4">
                                            <div className="space-y-3">
                                                <div className="flex gap-2">
                                                    {/* Menu Item Selection */}
                                                    <FormField
                                                        control={form.control}
                                                        name={`items.${index}.itemId`}
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
                                                                                {item.itemName} -{' '}
                                                                                {formatCurrency(item.price)}
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
                                                                        {...field}
                                                                        onChange={(e) =>
                                                                            field.onChange(
                                                                                parseInt(e.target.value)
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
                                                    >
                                                        <Trash2 className="h-4 w-4 text-destructive" />
                                                    </Button>
                                                </div>

                                                {/* Item Note */}
                                                <FormField
                                                    control={form.control}
                                                    name={`items.${index}.specialRequest`}
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormControl>
                                                                <Input
                                                                    placeholder={t('orders.itemNote')}
                                                                    {...field}
                                                                />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}

                                {/* Total Amount */}
                                <Card className="bg-muted">
                                    <CardContent className="pt-4">
                                        <div className="flex justify-between items-center text-lg font-semibold">
                                            <span>Tổng tiền thêm:</span>
                                            <span className="text-primary">
                                                {formatCurrency(calculateTotal())}
                                            </span>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </ScrollArea>

                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={onClose}
                                disabled={addItemsMutation.isPending}
                            >
                                {t('common.cancel')}
                            </Button>
                            <Button type="submit" disabled={addItemsMutation.isPending}>
                                {addItemsMutation.isPending && (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
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
