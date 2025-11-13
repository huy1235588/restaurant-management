"use client";

import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Table, TableStatus } from '@/types';

const statusOptions: TableStatus[] = ['available', 'occupied', 'reserved', 'maintenance'];

export const tableFormSchema = z
    .object({
        tableNumber: z
            .string()
            .trim()
            .min(1, 'Table number is required')
            .max(20, 'Table number must be 20 characters or fewer')
            .regex(/^[a-zA-Z0-9-]+$/, 'Table number can only contain letters, numbers, and hyphens'),
        tableName: z.string().trim().max(50, 'Table name must be 50 characters or fewer').optional(),
        capacity: z
            .string()
            .min(1, 'Capacity is required')
            .regex(/^\d+$/, 'Capacity must be a number between 1 and 20')
            .refine((value) => {
                const numeric = Number(value);
                return numeric >= 1 && numeric <= 20;
            }, 'Capacity must be between 1 and 20'),
        minCapacity: z
            .string()
            .optional()
            .refine((value) => !value || /^\d+$/.test(value), 'Minimum capacity must be a number between 1 and 20')
            .refine((value) => {
                if (!value) {
                    return true;
                }
                const numeric = Number(value);
                return numeric >= 1 && numeric <= 20;
            }, 'Minimum capacity must be between 1 and 20'),
        floor: z
            .string()
            .optional()
            .refine((value) => !value || /^\d+$/.test(value), 'Floor must be a number between 1 and 10')
            .refine((value) => {
                if (!value) {
                    return true;
                }
                const numeric = Number(value);
                return numeric >= 1 && numeric <= 10;
            }, 'Floor must be between 1 and 10'),
        section: z.string().trim().max(50, 'Section name must be 50 characters or fewer').optional(),
        status: z.enum(statusOptions),
        isActive: z.boolean(),
    })
    .superRefine((values, ctx) => {
        if (!values.minCapacity) {
            return;
        }

        const minCapacity = Number(values.minCapacity);
        const capacity = Number(values.capacity);

        if (minCapacity > capacity) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ['minCapacity'],
                message: 'Minimum capacity cannot exceed capacity',
            });
        }
    });

type TableFormInput = z.infer<typeof tableFormSchema>;

export interface TableFormValues {
    tableNumber: string;
    tableName?: string;
    capacity: number;
    minCapacity?: number;
    floor?: number;
    section?: string;
    status: TableStatus;
    isActive: boolean;
}

interface TableFormProps {
    defaultValues?: Table;
    onSubmit: (values: TableFormValues) => Promise<void>;
    onCancel: () => void;
    submitting?: boolean;
}

export function TableForm({ defaultValues, onSubmit, onCancel, submitting }: TableFormProps) {
    const { t } = useTranslation();
    const [submitError, setSubmitError] = useState<string | null>(null);

    const initialValues: TableFormInput = useMemo(
        () => ({
            tableNumber: defaultValues?.tableNumber ?? '',
            tableName: defaultValues?.tableName ?? '',
            capacity: String(defaultValues?.capacity ?? 4),
            minCapacity: defaultValues?.minCapacity ? String(defaultValues.minCapacity) : '',
            floor: defaultValues?.floor ? String(defaultValues.floor) : '',
            section: defaultValues?.section ?? '',
            status: defaultValues?.status ?? 'available',
            isActive: defaultValues?.isActive ?? true,
        }),
        [defaultValues]
    );

    const form = useForm<TableFormInput>({
        resolver: zodResolver(tableFormSchema),
        defaultValues: initialValues,
    });

    useEffect(() => {
        form.reset(initialValues);
        setSubmitError(null);
    }, [initialValues, form]);

    const handleSubmit = async (values: TableFormInput) => {
        try {
            setSubmitError(null);
            await onSubmit({
                tableNumber: values.tableNumber.trim(),
                tableName: values.tableName?.trim() || undefined,
                capacity: Number(values.capacity),
                minCapacity: values.minCapacity ? Number(values.minCapacity) : undefined,
                floor: values.floor ? Number(values.floor) : undefined,
                section: values.section?.trim() || undefined,
                status: values.status,
                isActive: values.isActive,
            });
        } catch (error) {
            const message = error instanceof Error ? error.message : t('tables.form.error', 'Failed to save table');
            setSubmitError(message);
        }
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <FormField
                        control={form.control}
                        name="tableNumber"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>{t('tables.form.number', 'Table number')}</FormLabel>
                                <FormControl>
                                    <Input {...field} autoFocus placeholder="T-01" />
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
                                <FormLabel>{t('tables.form.name', 'Table name')}</FormLabel>
                                <FormControl>
                                    <Input
                                        {...field}
                                        value={field.value ?? ''}
                                        placeholder={t('tables.form.namePlaceholder', 'Optional display name')}
                                    />
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
                                <FormLabel>{t('tables.form.capacity', 'Capacity')}</FormLabel>
                                <FormControl>
                                    <Input
                                        type="number"
                                        min={1}
                                        max={20}
                                        value={field.value}
                                        onChange={field.onChange}
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
                                <FormLabel>{t('tables.form.minCapacity', 'Minimum capacity')}</FormLabel>
                                <FormControl>
                                    <Input
                                        type="number"
                                        min={1}
                                        max={20}
                                        value={field.value}
                                        onChange={field.onChange}
                                        placeholder="1"
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="floor"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>{t('tables.form.floor', 'Floor')}</FormLabel>
                                <FormControl>
                                    <Input
                                        type="number"
                                        min={1}
                                        max={10}
                                        value={field.value}
                                        onChange={field.onChange}
                                        placeholder="1"
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="section"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>{t('tables.form.section', 'Section')}</FormLabel>
                                <FormControl>
                                    <Input
                                        {...field}
                                        value={field.value ?? ''}
                                        placeholder={t('tables.form.sectionPlaceholder', 'E.g. Patio, VIP')}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="status"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>{t('tables.form.status', 'Status')}</FormLabel>
                                <Select value={field.value} onValueChange={(value) => field.onChange(value as TableStatus)}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder={t('tables.form.statusPlaceholder', 'Select status')} />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {statusOptions.map((status) => (
                                            <SelectItem key={status} value={status}>
                                                {t(`tables.status.${status}`, status)}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <FormField
                    control={form.control}
                    name="isActive"
                    render={({ field }) => (
                        <FormItem className="flex items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                                <FormLabel>{t('tables.form.active', 'Active')}</FormLabel>
                                <p className="text-sm text-muted-foreground">
                                    {t('tables.form.activeHelper', 'Inactive tables are hidden from availability lists.')}
                                </p>
                            </div>
                            <FormControl>
                                <Switch checked={field.value} onCheckedChange={field.onChange} />
                            </FormControl>
                        </FormItem>
                    )}
                />

                {submitError && <p className="text-sm text-destructive">{submitError}</p>}

                <div className="flex justify-end gap-3">
                    <Button type="button" variant="outline" onClick={onCancel}>
                        {t('common.cancel', 'Cancel')}
                    </Button>
                    <Button type="submit" disabled={submitting}>
                        {submitting
                            ? t('tables.form.saving', 'Saving...')
                            : defaultValues
                                ? t('tables.form.update', 'Update table')
                                : t('tables.form.create', 'Create table')}
                    </Button>
                </div>
            </form>
        </Form>
    );
}
