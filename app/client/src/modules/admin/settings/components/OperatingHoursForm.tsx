'use client';

import { UseFormReturn, useFieldArray } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Plus, Trash2 } from 'lucide-react';
import {
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { SettingsFormValues } from '../utils/validation';

interface OperatingHoursFormProps {
    form: UseFormReturn<SettingsFormValues>;
}

export function OperatingHoursForm({ form }: OperatingHoursFormProps) {
    const { t } = useTranslation();
    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: 'operatingHours',
    });

    const addHours = () => {
        append({ day: '', hours: '' });
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <FormLabel className="text-base">
                    {t('settings.form.operatingHours')}
                </FormLabel>
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addHours}
                >
                    <Plus className="mr-2 h-4 w-4" />
                    {t('settings.form.addHours')}
                </Button>
            </div>

            {fields.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                    {t('settings.form.noOperatingHours')}
                </p>
            ) : (
                <div className="space-y-4">
                    {fields.map((field, index) => (
                        <div
                            key={field.id}
                            className="flex items-start gap-4 rounded-lg border p-4"
                        >
                            <div className="flex-1 space-y-4">
                                <FormField
                                    control={form.control}
                                    name={`operatingHours.${index}.day`}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>
                                                {t('settings.form.day')}
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder={t('settings.form.dayPlaceholder')}
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name={`operatingHours.${index}.hours`}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>
                                                {t('settings.form.hours')}
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder={t('settings.form.hoursPlaceholder')}
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="mt-8 text-destructive hover:text-destructive"
                                onClick={() => remove(index)}
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
