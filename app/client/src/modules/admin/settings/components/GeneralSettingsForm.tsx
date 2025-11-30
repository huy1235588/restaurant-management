'use client';

import { UseFormReturn } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import {
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { SettingsFormValues } from '../utils/validation';

interface GeneralSettingsFormProps {
    form: UseFormReturn<SettingsFormValues>;
}

export function GeneralSettingsForm({ form }: GeneralSettingsFormProps) {
    const { t } = useTranslation();

    return (
        <div className="space-y-6">
            {/* Restaurant Name */}
            <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>{t('settings.form.name')}</FormLabel>
                        <FormControl>
                            <Input
                                placeholder={t('settings.form.namePlaceholder')}
                                {...field}
                            />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />

            {/* Tagline */}
            <FormField
                control={form.control}
                name="tagline"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>{t('settings.form.tagline')}</FormLabel>
                        <FormControl>
                            <Input
                                placeholder={t('settings.form.taglinePlaceholder')}
                                {...field}
                                value={field.value || ''}
                            />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />

            {/* Description */}
            <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>{t('settings.form.description')}</FormLabel>
                        <FormControl>
                            <Textarea
                                placeholder={t('settings.form.descriptionPlaceholder')}
                                className="min-h-[100px]"
                                {...field}
                                value={field.value || ''}
                            />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />

            {/* About Title */}
            <FormField
                control={form.control}
                name="aboutTitle"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>{t('settings.form.aboutTitle')}</FormLabel>
                        <FormControl>
                            <Input
                                placeholder={t('settings.form.aboutTitlePlaceholder')}
                                {...field}
                                value={field.value || ''}
                            />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />

            {/* About Content */}
            <FormField
                control={form.control}
                name="aboutContent"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>{t('settings.form.aboutContent')}</FormLabel>
                        <FormControl>
                            <Textarea
                                placeholder={t('settings.form.aboutContentPlaceholder')}
                                className="min-h-[150px]"
                                {...field}
                                value={field.value || ''}
                            />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
        </div>
    );
}
