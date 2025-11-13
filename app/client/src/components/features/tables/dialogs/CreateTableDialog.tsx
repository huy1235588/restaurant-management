import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { tableApi } from '@/services/table.service';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { Loader2 } from 'lucide-react';

const tableSchema = z.object({
    tableNumber: z.string().min(1, 'Table number is required'),
    tableName: z.string().optional(),
    capacity: z.number().min(1, 'Capacity must be at least 1'),
    minCapacity: z.number().min(0).optional(),
    floor: z.number().min(1).optional(),
    section: z.string().optional(),
    status: z.enum(['available', 'occupied', 'reserved', 'maintenance']),
});

type TableFormData = z.infer<typeof tableSchema>;

interface CreateTableDialogProps {
    open: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export function CreateTableDialog({ open, onClose, onSuccess }: CreateTableDialogProps) {
    const { t } = useTranslation();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<TableFormData>({
        resolver: zodResolver(tableSchema),
        defaultValues: {
            tableNumber: '',
            tableName: '',
            capacity: 4,
            minCapacity: undefined,
            floor: 1,
            section: '',
            status: 'available',
        },
    });

    const onSubmit = async (data: TableFormData) => {
        try {
            setIsSubmitting(true);
            await tableApi.create(data);
            toast.success(t('tables.createSuccess', 'Table created successfully'));
            form.reset();
            onSuccess();
            onClose();
        } catch (error: any) {
            console.error('Failed to create table:', error);
            toast.error(error.response?.data?.message || t('tables.createError', 'Failed to create table'));
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>{t('tables.createTable', 'Create New Table')}</DialogTitle>
                    <DialogDescription>
                        {t('tables.createDescription', 'Add a new table to your restaurant')}
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
                                                min="0" 
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
                                            onValueChange={field.onChange}
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

                        <FormField
                            control={form.control}
                            name="status"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t('tables.status', 'Status')}</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select status" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="available">Available</SelectItem>
                                            <SelectItem value="occupied">Occupied</SelectItem>
                                            <SelectItem value="reserved">Reserved</SelectItem>
                                            <SelectItem value="maintenance">Maintenance</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={onClose}>
                                {t('common.cancel', 'Cancel')}
                            </Button>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {t('common.create', 'Create')}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
