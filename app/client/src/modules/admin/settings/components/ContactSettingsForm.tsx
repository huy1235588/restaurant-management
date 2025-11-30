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
import { SettingsFormValues } from '../utils/validation';

interface ContactSettingsFormProps {
    form: UseFormReturn<SettingsFormValues>;
}

export function ContactSettingsForm({ form }: ContactSettingsFormProps) {
    const { t } = useTranslation();
    const mapEmbedUrl = form.watch('mapEmbedUrl');

    return (
        <div className="space-y-6">
            {/* Address */}
            <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>{t('settings.form.address')}</FormLabel>
                        <FormControl>
                            <Input
                                placeholder={t('settings.form.addressPlaceholder')}
                                {...field}
                                value={field.value || ''}
                            />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />

            {/* Phone */}
            <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>{t('settings.form.phone')}</FormLabel>
                        <FormControl>
                            <Input
                                placeholder={t('settings.form.phonePlaceholder')}
                                {...field}
                                value={field.value || ''}
                            />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />

            {/* Email */}
            <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>{t('settings.form.email')}</FormLabel>
                        <FormControl>
                            <Input
                                type="email"
                                placeholder={t('settings.form.emailPlaceholder')}
                                {...field}
                                value={field.value || ''}
                            />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />

            {/* Map Embed URL */}
            <FormField
                control={form.control}
                name="mapEmbedUrl"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>{t('settings.form.mapEmbedUrl')}</FormLabel>
                        <FormControl>
                            <Input
                                placeholder={t('settings.form.mapEmbedUrlPlaceholder')}
                                {...field}
                                value={field.value || ''}
                            />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />

            {/* Map Preview */}
            {mapEmbedUrl && (
                <div className="mt-4">
                    <FormLabel>{t('settings.form.mapPreview')}</FormLabel>
                    <div className="mt-2 aspect-video w-full overflow-hidden rounded-lg border bg-muted">
                        <iframe
                            src={mapEmbedUrl}
                            width="100%"
                            height="100%"
                            style={{ border: 0 }}
                            allowFullScreen
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                            title="Map Preview"
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
