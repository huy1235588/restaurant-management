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
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { useCreateOrder } from '../hooks';
import { useTables } from '@/modules/tables/hooks';
import { useMenuItems } from '@/modules/menu/hooks';
import { formatCurrency } from '../utils';
import { useTranslation } from 'react-i18next';
import { Loader2, Plus, Trash2, ShoppingCart, Users } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MenuItem, Table } from '@/types';

const orderItemSchema = z.object({
    itemId: z.number().min(1, 'Vui lòng chọn món'),
    quantity: z.number().min(1, 'Số lượng phải lớn hơn 0'),
    specialRequest: z.string().optional(),
});

const createOrderSchema = z.object({
    tableId: z.number().min(1, 'Vui lòng chọn bàn'),
    partySize: z.number().min(1, 'Số người phải lớn hơn 0'),
    customerName: z.string().max(255).optional(),
    customerPhone: z.string().max(20).optional(),
    reservationId: z.number().optional(),
    notes: z.string().max(500).optional(),
    items: z.array(orderItemSchema).min(1, 'Phải có ít nhất 1 món'),
});

type CreateOrderFormData = z.infer<typeof createOrderSchema>;

interface CreateOrderDialogProps {
    open: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}

export function CreateOrderDialog({ open, onClose, onSuccess }: CreateOrderDialogProps) {
    const { t } = useTranslation();
    const createMutation = useCreateOrder();
    const { data: tablesData } = useTables({ filters: { status: 'available' } });
    const { data: menuData } = useMenuItems({ limit: 1000, isAvailable: true });

    const form = useForm<CreateOrderFormData>({
        resolver: zodResolver(createOrderSchema),
        defaultValues: {
            tableId: 0,
            partySize: 2,
            customerName: '',
            customerPhone: '',
            notes: '',
            items: [{ itemId: 0, quantity: 1, specialRequest: '' }],
        },
    });

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: 'items',
    });

    const onSubmit = useCallback(
        async (data: CreateOrderFormData) => {
            try {
                await createMutation.mutateAsync(data);
                form.reset();
                onSuccess?.();
                onClose();
            } catch (error) {
                // Error handled by mutation
            }
        },
        [createMutation, onSuccess, onClose, form]
    );

    const handleAddItem = useCallback(() => {
        append({ itemId: 0, quantity: 1, specialRequest: '' });
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
            const menuItem = menuData.items.find((m: MenuItem) => m.itemId === item.itemId);
            return total + (menuItem?.price || 0) * (item.quantity || 0);
        }, 0);
    }, [form.watch('items'), menuData?.items]);

    const selectedTable = useMemo(() => {
        const tableId = form.watch('tableId');
        return tablesData?.items?.find((t: Table) => t.tableId === tableId);
    }, [form.watch('tableId'), tablesData?.items]);

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-3xl max-h-[90vh] p-0">
                <DialogHeader className="px-6 pt-6 pb-4 border-b bg-linear-to-b from-background to-muted/30">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-primary/10 ring-4 ring-primary/5">
                            <ShoppingCart className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                            <DialogTitle className="text-2xl">
                                {t('orders.createOrder')}
                            </DialogTitle>
                            <DialogDescription>
                                Chọn bàn và thêm các món ăn vào đơn hàng
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col">
                        <ScrollArea className="max-h-[calc(90vh-220px)] px-6">
                            <div className="space-y-5 py-4">
                                {/* Table Selection - Enhanced */}
                                <FormField
                                    control={form.control}
                                    name="tableId"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-base font-semibold">
                                                {t('orders.selectTable')}
                                            </FormLabel>
                                            <Select
                                                onValueChange={(value) => field.onChange(parseInt(value))}
                                                value={field.value?.toString()}
                                            >
                                                <FormControl>
                                                    <SelectTrigger className="h-12">
                                                        <SelectValue placeholder="Chọn bàn trống" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {tablesData?.items?.map((table: Table) => (
                                                        <SelectItem
                                                            key={table.tableId}
                                                            value={table.tableId.toString()}
                                                            className="py-3"
                                                        >
                                                            <div className="flex items-center gap-3">
                                                                <div className="flex items-center gap-1.5">
                                                                    <span className="font-semibold">
                                                                        Bàn {table.tableNumber}
                                                                    </span>
                                                                    <span className="text-muted-foreground">•</span>
                                                                    <Users className="h-3.5 w-3.5" />
                                                                    <span className="text-sm text-muted-foreground">
                                                                        {table.capacity} chỗ
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                            {selectedTable && (
                                                <div className="mt-2 p-3 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900">
                                                    <p className="text-sm text-green-700 dark:text-green-300">
                                                        ✓ Đã chọn Bàn {selectedTable.tableNumber} ({selectedTable.capacity} chỗ ngồi)
                                                    </p>
                                                </div>
                                            )}
                                        </FormItem>
                                    )}
                                />

                                {/* Order Items */}
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <FormLabel className="text-base font-semibold">
                                            {t('orders.items')}
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
                                        <Card key={field.id} className="p-4 hover:shadow-md transition-all duration-200 hover:border-primary/30">
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
                                                                        className="text-center font-semibold"
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
                                                        className="hover:bg-destructive/10 hover:text-destructive transition-colors"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
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
                                                                    className="text-sm bg-muted/50"
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
                                </div>

                                {/* Order Note */}
                                <FormField
                                    control={form.control}
                                    name="notes"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-base font-semibold">
                                                {t('orders.orderNote')}
                                            </FormLabel>
                                            <FormControl>
                                                <Textarea
                                                    placeholder={t('orders.specialRequests')}
                                                    className="resize-none"
                                                    rows={3}
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* Total Amount - Prominent */}
                                <Card className="overflow-hidden border-2 border-primary/20 bg-linear-to-br from-primary/15 via-primary/10 to-primary/5 p-5">
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <p className="text-sm text-muted-foreground mb-1">
                                                {t('orders.totalAmount')}
                                            </p>
                                            <p className="text-3xl font-bold text-primary">
                                                {formatCurrency(totalAmount)}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm text-muted-foreground">
                                                Số món
                                            </p>
                                            <p className="text-2xl font-bold">
                                                {fields.length}
                                            </p>
                                        </div>
                                    </div>
                                </Card>
                            </div>
                        </ScrollArea>

                        <DialogFooter className="px-6 py-4 border-t bg-muted/30 gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={onClose}
                                disabled={createMutation.isPending}
                            >
                                {t('common.cancel')}
                            </Button>
                            <Button
                                type="submit"
                                disabled={createMutation.isPending || !totalAmount}
                                className="gap-2 min-w-[140px]"
                                size="lg"
                            >
                                {createMutation.isPending ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Đang tạo...
                                    </>
                                ) : (
                                    <>
                                        <ShoppingCart className="h-4 w-4" />
                                        {t('orders.createOrder')}
                                    </>
                                )}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}