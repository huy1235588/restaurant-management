'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { Category } from '@/types';
import { CategoryFormData } from '../../types';
import { categoryFormSchema } from '../../utils/validation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { ImageUploadField } from '@/components/shared/ImageUploadField';
import { Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface CategoryFormProps {
    category?: Category | null;
    onSubmit: (data: CategoryFormData, imageFile?: File | null) => Promise<void>;
    onCancel: () => void;
    loading?: boolean;
}

export function CategoryForm({ category, onSubmit, onCancel, loading = false }: CategoryFormProps) {
    const { t } = useTranslation();
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    
    const form = useForm<CategoryFormData>({
        resolver: zodResolver(categoryFormSchema),
        defaultValues: {
            categoryName: category?.categoryName || '',
            description: category?.description || '',
            displayOrder: category?.displayOrder || 0,
            isActive: category?.isActive ?? true,
            imagePath: category?.imagePath || '',
        },
        mode: 'onChange',
    });

    const handleSubmit = async (data: CategoryFormData) => {
        try {
            await onSubmit(data, selectedFile);
            setSelectedFile(null);
            form.reset();
        } catch (error) {
            // Error is handled by parent
        }
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                <FormField
                    control={form.control}
                    name="categoryName"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>{t('categories.categoryName')} *</FormLabel>
                            <FormControl>
                                <Input
                                    placeholder={t('categories.categoryNamePlaceholder')}
                                    {...field}
                                    disabled={loading}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>{t('categories.description')}</FormLabel>
                            <FormControl>
                                <Textarea
                                    placeholder={t('categories.descriptionPlaceholder')}
                                    rows={3}
                                    {...field}
                                    value={field.value || ''}
                                    disabled={loading}
                                />
                            </FormControl>
                            <FormDescription>
                                {t('categories.descriptionHelper')}
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="imagePath"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>{t('categories.categoryImage')}</FormLabel>
                            <FormControl>
                                <ImageUploadField
                                    value={field.value}
                                    onFileSelect={(file) => {
                                        setSelectedFile(file);
                                        if (file) {
                                            const previewUrl = URL.createObjectURL(file);
                                            field.onChange(previewUrl);
                                        } else {
                                            field.onChange('');
                                        }
                                    }}
                                    folder="categories"
                                    disabled={loading}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="displayOrder"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>{t('categories.displayOrder')}</FormLabel>
                            <FormControl>
                                <Input
                                    type="number"
                                    min={0}
                                    placeholder="0"
                                    {...field}
                                    value={field.value || 0}
                                    onChange={(e) => field.onChange(Number(e.target.value))}
                                    disabled={loading}
                                />
                            </FormControl>
                            <FormDescription>
                                {t('categories.displayOrderHelper')}
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="isActive"
                    render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                                <FormLabel className="text-base">{t('categories.activeStatus')}</FormLabel>
                                <FormDescription>
                                    {t('categories.activeStatusHelper')}
                                </FormDescription>
                            </div>
                            <FormControl>
                                <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                    disabled={loading}
                                />
                            </FormControl>
                        </FormItem>
                    )}
                />

                <div className="flex justify-end gap-2 pt-4">
                    <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
                        {t('common.cancel')}
                    </Button>
                    <Button type="submit" disabled={loading}>
                        {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                        {category ? t('categories.updateCategory') : t('categories.createCategory')}
                    </Button>
                </div>
            </form>
        </Form>
    );
}
