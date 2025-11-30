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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { SettingsFormValues } from '../utils/validation';

interface SocialLinksFormProps {
    form: UseFormReturn<SettingsFormValues>;
}

const PLATFORMS = [
    { value: 'facebook', label: 'Facebook', icon: 'facebook' },
    { value: 'instagram', label: 'Instagram', icon: 'instagram' },
    { value: 'tiktok', label: 'TikTok', icon: 'tiktok' },
    { value: 'twitter', label: 'Twitter/X', icon: 'twitter' },
    { value: 'youtube', label: 'YouTube', icon: 'youtube' },
    { value: 'zalo', label: 'Zalo', icon: 'zalo' },
    { value: 'linkedin', label: 'LinkedIn', icon: 'linkedin' },
];

export function SocialLinksForm({ form }: SocialLinksFormProps) {
    const { t } = useTranslation();
    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: 'socialLinks',
    });

    const addLink = () => {
        append({ platform: '', url: '', icon: '' });
    };

    const handlePlatformChange = (index: number, platformValue: string) => {
        const platform = PLATFORMS.find((p) => p.value === platformValue);
        if (platform) {
            form.setValue(`socialLinks.${index}.platform`, platform.label);
            form.setValue(`socialLinks.${index}.icon`, platform.icon);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <FormLabel className="text-base">
                    {t('settings.form.socialLinks')}
                </FormLabel>
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addLink}
                >
                    <Plus className="mr-2 h-4 w-4" />
                    {t('settings.form.addSocialLink')}
                </Button>
            </div>

            {fields.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                    {t('settings.form.noSocialLinks')}
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
                                    name={`socialLinks.${index}.platform`}
                                    render={({ field: formField }) => (
                                        <FormItem>
                                            <FormLabel>
                                                {t('settings.form.platform')}
                                            </FormLabel>
                                            <Select
                                                value={PLATFORMS.find(
                                                    (p) => p.label === formField.value
                                                )?.value || ''}
                                                onValueChange={(value) =>
                                                    handlePlatformChange(index, value)
                                                }
                                            >
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue
                                                            placeholder={t('settings.form.selectPlatform')}
                                                        />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {PLATFORMS.map((platform) => (
                                                        <SelectItem
                                                            key={platform.value}
                                                            value={platform.value}
                                                        >
                                                            {platform.label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name={`socialLinks.${index}.url`}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>URL</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="https://..."
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
