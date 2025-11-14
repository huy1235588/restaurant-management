'use client';

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

const quickTableSchema = z.object({
    tableNumber: z.string().min(1, 'Table number is required'),
    tableName: z.string().optional(),
    capacity: z.number().min(1, 'Capacity must be at least 1'),
    section: z.string().optional(),
    floor: z.number().min(1),
    positionX: z.number(),
    positionY: z.number(),
    width: z.number().min(50).max(300),
    height: z.number().min(50).max(300),
    rotation: z.number().min(0).max(360),
    shape: z.enum(['rectangle', 'circle', 'square', 'oval']),
});

type QuickTableFormData = z.infer<typeof quickTableSchema>;

interface QuickCreateTableDialogProps {
    open: boolean;
    onClose: () => void;
    onSuccess: () => void;
    position: { x: number; y: number };
    floor: number;
    suggestedTableNumber: string;
}

/**
 * Quick create dialog for adding tables in visual floor plan editor
 */
export function QuickCreateTableDialog({ 
    open, 
    onClose, 
    onSuccess,
    position,
    floor,
    suggestedTableNumber,
}: QuickCreateTableDialogProps) {
    const { t } = useTranslation();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<QuickTableFormData>({
        resolver: zodResolver(quickTableSchema),
        defaultValues: {
            tableNumber: suggestedTableNumber,
            tableName: '',
            capacity: 4,
            section: 'main',
            floor,
            positionX: Math.round(position.x),
            positionY: Math.round(position.y),
            width: 100,
            height: 100,
            rotation: 0,
            shape: 'rectangle',
        },
    });

    const onSubmit = async (data: QuickTableFormData) => {
        try {
            setIsSubmitting(true);
            await tableApi.create({
                ...data,
                status: 'available',
            });
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
            <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{t('tables.quickCreateTable', 'Quick Add Table')}</DialogTitle>
                    <DialogDescription>
                        {t('tables.quickCreateDescription', 'Add a new table at the selected position')}
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
                                            <Input placeholder="1" {...field} autoFocus />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

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
                        </div>

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

                        <div className="grid grid-cols-2 gap-4">
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

                            <FormField
                                control={form.control}
                                name="shape"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t('tables.shape', 'Shape')}</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select shape" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="rectangle">Rectangle</SelectItem>
                                                <SelectItem value="circle">Circle</SelectItem>
                                                <SelectItem value="square">Square</SelectItem>
                                                <SelectItem value="oval">Oval</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="bg-muted p-3 rounded-lg space-y-2">
                            <div className="text-sm font-medium text-muted-foreground mb-2">
                                {t('tables.positionAndSize', 'Position & Size')}
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <FormField
                                    control={form.control}
                                    name="positionX"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-xs">X Position</FormLabel>
                                            <FormControl>
                                                <Input 
                                                    type="number" 
                                                    {...field}
                                                    onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                                    className="h-8 text-sm"
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="positionY"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-xs">Y Position</FormLabel>
                                            <FormControl>
                                                <Input 
                                                    type="number" 
                                                    {...field}
                                                    onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                                    className="h-8 text-sm"
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="width"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-xs">Width (px)</FormLabel>
                                            <FormControl>
                                                <Input 
                                                    type="number" 
                                                    min="50"
                                                    max="300"
                                                    {...field}
                                                    onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                                    className="h-8 text-sm"
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="height"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-xs">Height (px)</FormLabel>
                                            <FormControl>
                                                <Input 
                                                    type="number" 
                                                    min="50"
                                                    max="300"
                                                    {...field}
                                                    onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                                    className="h-8 text-sm"
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
                                {t('common.cancel', 'Cancel')}
                            </Button>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {t('tables.createTable', 'Create Table')}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
