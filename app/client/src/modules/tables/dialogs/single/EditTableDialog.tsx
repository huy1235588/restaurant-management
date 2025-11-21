import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { tableApi } from '@/modules/tables/services/table.service';
import { Table } from '@/types';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { Loader2 } from 'lucide-react';

// Schema for editing table - all fields optional in DTO but some required in form
const tableSchema = z.object({
    tableNumber: z.string().min(1, 'Table number is required').max(20),
    tableName: z.string().max(50).optional(),
    capacity: z.number().min(1).max(50, 'Capacity must be between 1 and 50'),
    minCapacity: z.number().min(1).optional(),
    floor: z.number().min(1).optional(),
    section: z.string().max(50).optional(),
});

type TableFormData = z.infer<typeof tableSchema>;

interface EditTableDialogProps {
    open: boolean;
    table: Table;
    onClose: () => void;
    onSuccess: () => void;
}

export function EditTableDialog({ open, table, onClose, onSuccess }: EditTableDialogProps) {
    const { t } = useTranslation();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<TableFormData>({
        resolver: zodResolver(tableSchema),
        defaultValues: {
            tableNumber: table.tableNumber,
            tableName: table.tableName || '',
            capacity: table.capacity,
            minCapacity: table.minCapacity || undefined,
            floor: table.floor || undefined,
            section: table.section || '',
        },
    });

    useEffect(() => {
        if (table) {
            form.reset({
                tableNumber: table.tableNumber,
                tableName: table.tableName || '',
                capacity: table.capacity,
                minCapacity: table.minCapacity || undefined,
                floor: table.floor || undefined,
                section: table.section || '',
            });
        }
    }, [table, form]);

    const onSubmit = async (data: TableFormData) => {
        try {
            setIsSubmitting(true);
            await tableApi.update(table.tableId, data);
            toast.success(t('tables.updateSuccess', 'Table updated successfully'));
            onSuccess();
            onClose();
        } catch (error: any) {
            console.error('Failed to update table:', error);
            toast.error(error.response?.data?.message || t('tables.updateError', 'Failed to update table'));
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>{t('tables.editTable', 'Edit Table')}</DialogTitle>
                    <DialogDescription>
                        {t('tables.editDescription', 'Update table information')}
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="tableNumber"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t('tables.tableNumber', 'Table Number')} *</FormLabel>
                                        <FormControl>
                                            <Input placeholder="1" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="tableName"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t('tables.tableName', 'Table Name')}</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Window Table" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="capacity"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t('tables.capacity', 'Capacity')} *</FormLabel>
                                        <FormControl>
                                            <Input 
                                                type="number" 
                                                min="1" 
                                                max="50"
                                                placeholder="4" 
                                                {...field}
                                                onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="minCapacity"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t('tables.minCapacity', 'Min Capacity')}</FormLabel>
                                        <FormControl>
                                            <Input 
                                                type="number" 
                                                min="1" 
                                                placeholder="2" 
                                                {...field}
                                                onChange={(e) => field.onChange(parseInt(e.target.value) || undefined)}
                                                value={field.value || ''}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="floor"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t('tables.floor', 'Floor')}</FormLabel>
                                        <Select
                                            onValueChange={(value) => field.onChange(parseInt(value))}
                                            value={field.value?.toString()}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select floor" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="1">Floor 1</SelectItem>
                                                <SelectItem value="2">Floor 2</SelectItem>
                                                <SelectItem value="3">Floor 3</SelectItem>
                                                <SelectItem value="4">Floor 4</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="section"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t('tables.section', 'Section')}</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select section" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="main">Main</SelectItem>
                                                <SelectItem value="patio">Patio</SelectItem>
                                                <SelectItem value="vip">VIP</SelectItem>
                                                <SelectItem value="bar">Bar</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={onClose}>
                                {t('common.cancel', 'Cancel')}
                            </Button>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {t('common.save', 'Save')}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
