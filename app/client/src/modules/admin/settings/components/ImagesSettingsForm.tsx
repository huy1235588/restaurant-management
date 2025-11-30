'use client';

import { UseFormReturn } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import {
    FormControl,
    FormField,
    FormItem,
    FormMessage,
} from '@/components/ui/form';
import { SettingsFormValues } from '../utils/validation';
import { SettingsImageUpload } from './SettingsImageUpload';

interface ImagesSettingsFormProps {
    form: UseFormReturn<SettingsFormValues>;
}

export function ImagesSettingsForm({ form }: ImagesSettingsFormProps) {
    const { t } = useTranslation();

    return (
        <div className="space-y-8">
            {/* Logo */}
            <FormField
                control={form.control}
                name="logoUrl"
                render={({ field }) => (
                    <FormItem>
                        <FormControl>
                            <SettingsImageUpload
                                value={field.value}
                                onChange={field.onChange}
                                label={t('settings.form.logoUrl')}
                                description={t('settings.form.logoUrlDescription')}
                                aspectRatio="square"
                                maxSize={2}
                            />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />

            {/* Hero Image */}
            <FormField
                control={form.control}
                name="heroImage"
                render={({ field }) => (
                    <FormItem>
                        <FormControl>
                            <SettingsImageUpload
                                value={field.value}
                                onChange={field.onChange}
                                label={t('settings.form.heroImage')}
                                description={t('settings.form.heroImageDescription')}
                                aspectRatio="wide"
                                maxSize={5}
                            />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />

            {/* About Image */}
            <FormField
                control={form.control}
                name="aboutImage"
                render={({ field }) => (
                    <FormItem>
                        <FormControl>
                            <SettingsImageUpload
                                value={field.value}
                                onChange={field.onChange}
                                label={t('settings.form.aboutImage')}
                                description={t('settings.form.aboutImageDescription')}
                                aspectRatio="video"
                                maxSize={5}
                            />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
        </div>
    );
}
