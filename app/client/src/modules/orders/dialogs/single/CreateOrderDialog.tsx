'use client';

import { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useCreateOrder } from '../../hooks';
import type { CreateOrderDto } from '../../types';

interface CreateOrderDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    tables?: Array<{ tableId: number; tableNumber: string; status: string }>;
}

export function CreateOrderDialog({
    open,
    onOpenChange,
    tables = [],
}: CreateOrderDialogProps) {
    const [formData, setFormData] = useState<CreateOrderDto>({
        tableId: 0,
        customerName: '',
        customerPhone: '',
        partySize: undefined,
    });

    const { mutate: createOrder, isPending } = useCreateOrder();

    const availableTables = tables.filter((t) => t.status === 'available');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.tableId) return;

        createOrder(formData, {
            onSuccess: () => {
                onOpenChange(false);
                setFormData({
                    tableId: 0,
                    customerName: '',
                    customerPhone: '',
                    partySize: undefined,
                });
            },
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Create New Order</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="tableId">
                            Table <span className="text-destructive">*</span>
                        </Label>
                        <Select
                            value={formData.tableId.toString()}
                            onValueChange={(value) =>
                                setFormData({ ...formData, tableId: parseInt(value) })
                            }
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select table" />
                            </SelectTrigger>
                            <SelectContent>
                                {availableTables.map((table) => (
                                    <SelectItem
                                        key={table.tableId}
                                        value={table.tableId.toString()}
                                    >
                                        Table {table.tableNumber}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="customerName">Customer Name</Label>
                        <Input
                            id="customerName"
                            value={formData.customerName || ''}
                            onChange={(e) =>
                                setFormData({ ...formData, customerName: e.target.value })
                            }
                            placeholder="Optional"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="customerPhone">Customer Phone</Label>
                        <Input
                            id="customerPhone"
                            value={formData.customerPhone || ''}
                            onChange={(e) =>
                                setFormData({ ...formData, customerPhone: e.target.value })
                            }
                            placeholder="Optional"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="partySize">Party Size</Label>
                        <Input
                            id="partySize"
                            type="number"
                            min="1"
                            value={formData.partySize || ''}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    partySize: e.target.value
                                        ? parseInt(e.target.value)
                                        : undefined,
                                })
                            }
                            placeholder="Optional"
                        />
                    </div>

                    <div className="flex gap-2 justify-end pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={isPending}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={!formData.tableId || isPending}>
                            {isPending ? 'Creating...' : 'Create Order'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
