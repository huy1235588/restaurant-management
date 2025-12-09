'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { MenuItem, Category } from '@/types';
import { MenuItemFormData } from '@/modules/admin/menu/types';
import { menuItemFormSchema } from '@/modules/admin/menu/utils/validation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { calculateMargin, formatMargin } from '@/modules/admin/menu/utils';
import { useTranslation } from 'react-i18next';

interface MenuItemFormProps {
    menuItem?: MenuItem | null;
    categories: Category[];
    onSubmit: (data: MenuItemFormData, imageFile?: File | null) => Promise<void>;
    onCancel: () => void;
    loading?: boolean;
}

export function MenuItemForm({
    menuItem,
    categories,
    onSubmit,
    onCancel,
    loading = false,
}: MenuItemFormProps) {
    const { t } = useTranslation();
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const form = useForm<MenuItemFormData>({
        resolver: zodResolver(menuItemFormSchema),
        defaultValues: {
            itemCode: menuItem?.itemCode || '',
            itemName: menuItem?.itemName || '',
            categoryId: Number(menuItem?.categoryId) || 0,
            price: Number(menuItem?.price) || 0,
            cost: menuItem?.cost ? Number(menuItem.cost) : undefined,
            description: menuItem?.description || '',
            imagePath: menuItem?.imagePath || '',
            isAvailable: menuItem?.isAvailable ?? true,
            isActive: menuItem?.isActive ?? true,
            preparationTime: menuItem?.preparationTime ? Number(menuItem.preparationTime) : undefined,
            spicyLevel: Number(menuItem?.spicyLevel) || 0,
            isVegetarian: menuItem?.isVegetarian ?? false,
            calories: menuItem?.calories ? Number(menuItem.calories) : undefined,
            displayOrder: Number(menuItem?.displayOrder) || 0,
        },
        mode: 'onChange',
    });

    const handleSubmit = async (data: MenuItemFormData) => {
        try {
            await onSubmit(data, selectedFile);
            form.reset();
            setSelectedFile(null);
        } catch (error) {
            // Error is handled by parent
        }
    };

    const watchPrice = form.watch('price');
    const watchCost = form.watch('cost');
    const margin = calculateMargin(watchPrice, watchCost || undefined);

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                <Tabs defaultValue="basic" className="w-full">
                    <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="basic">{t('menu.form.tabs.basic')}</TabsTrigger>
                        <TabsTrigger value="pricing">{t('menu.form.tabs.pricing')}</TabsTrigger>
                        <TabsTrigger value="details">{t('menu.form.tabs.details')}</TabsTrigger>
                        <TabsTrigger value="media">{t('menu.form.tabs.media')}</TabsTrigger>
                    </TabsList>

                    <TabsContent value="basic" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>{t('menu.form.sections.basicInfo.title')}</CardTitle>
                                <CardDescription>{t('menu.form.sections.basicInfo.description')}</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="itemCode"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>{t('menu.form.fields.itemCode.label')} *</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder={t('menu.form.fields.itemCode.placeholder')}
                                                    {...field}
                                                    disabled={loading}
                                                    className="font-mono"
                                                />
                                            </FormControl>
                                            <FormDescription>
                                                {t('menu.form.fields.itemCode.description')}
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="itemName"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>{t('menu.form.fields.itemName.label')} *</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder={t('menu.form.fields.itemName.placeholder')}
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
                                    name="categoryId"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>{t('menu.form.fields.category.label')} *</FormLabel>
                                            <Select
                                                onValueChange={(value) => field.onChange(Number(value))}
                                                value={field.value?.toString()}
                                                disabled={loading}
                                            >
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder={t('menu.form.fields.category.placeholder')} />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {categories.map((category) => (
                                                        <SelectItem
                                                            key={category.categoryId}
                                                            value={category.categoryId.toString()}
                                                        >
                                                            {category.categoryName}
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
                                    name="description"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>{t('menu.form.fields.description.label')}</FormLabel>
                                            <FormControl>
                                                <Textarea
                                                    placeholder={t('menu.form.fields.description.placeholder')}
                                                    rows={4}
                                                    {...field}
                                                    value={field.value || ''}
                                                    disabled={loading}
                                                />
                                            </FormControl>
                                            <FormDescription>
                                                {t('menu.form.fields.description.description')}
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="pricing" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>{t('menu.form.sections.pricingInfo.title')}</CardTitle>
                                <CardDescription>{t('menu.form.sections.pricingInfo.description')}</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="price"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>{t('menu.form.fields.price.label')} * ({t('menu.form.fields.price.unit')})</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    min={0}
                                                    step="1000"
                                                    placeholder={t('menu.form.fields.price.placeholder')}
                                                    {...field}
                                                    onChange={(e) => field.onChange(Number(e.target.value))}
                                                    disabled={loading}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="cost"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>{t('menu.form.fields.cost.label')} ({t('menu.form.fields.cost.unit')})</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    min={0}
                                                    step="1000"
                                                    placeholder={t('menu.form.fields.cost.placeholder')}
                                                    {...field}
                                                    value={field.value || ''}
                                                    onChange={(e) =>
                                                        field.onChange(
                                                            e.target.value ? Number(e.target.value) : undefined
                                                        )
                                                    }
                                                    disabled={loading}
                                                />
                                            </FormControl>
                                            <FormDescription>
                                                {t('menu.form.fields.cost.description')}
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {margin !== null && (
                                    <div className="p-4 bg-muted rounded-lg">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-medium">{t('menu.form.fields.profitMargin.label')}:</span>
                                            <span
                                                className={`text-lg font-bold ${margin > 50
                                                    ? 'text-green-600'
                                                    : margin > 30
                                                        ? 'text-yellow-600'
                                                        : 'text-red-600'
                                                    }`}
                                            >
                                                {formatMargin(watchPrice, watchCost ?? undefined)}
                                            </span>
                                        </div>
                                    </div>
                                )}

                                <FormField
                                    control={form.control}
                                    name="displayOrder"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>{t('menu.form.fields.displayOrder.label')}</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    min={0}
                                                    placeholder={t('menu.form.fields.displayOrder.placeholder')}
                                                    {...field}
                                                    value={field.value || 0}
                                                    onChange={(e) => field.onChange(Number(e.target.value))}
                                                    disabled={loading}
                                                />
                                            </FormControl>
                                            <FormDescription>
                                                {t('menu.form.fields.displayOrder.description')}
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="details" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>{t('menu.form.sections.additionalDetails.title')}</CardTitle>
                                <CardDescription>{t('menu.form.sections.additionalDetails.description')}</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="preparationTime"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>{t('menu.form.fields.preparationTime.label')} ({t('menu.form.fields.preparationTime.unit')})</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    min={0}
                                                    max={300}
                                                    placeholder={t('menu.form.fields.preparationTime.placeholder')}
                                                    {...field}
                                                    value={field.value || ''}
                                                    onChange={(e) =>
                                                        field.onChange(
                                                            e.target.value ? Number(e.target.value) : undefined
                                                        )
                                                    }
                                                    disabled={loading}
                                                />
                                            </FormControl>
                                            <FormDescription>
                                                {t('menu.form.fields.preparationTime.description')}
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="spicyLevel"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>{t('menu.form.fields.spicyLevel.label')}</FormLabel>
                                            <Select
                                                onValueChange={(value) => field.onChange(Number(value))}
                                                value={field.value?.toString()}
                                                disabled={loading}
                                            >
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder={t('menu.form.fields.spicyLevel.placeholder')} />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="0">{t('menu.form.fields.spicyLevel.options.0')}</SelectItem>
                                                    <SelectItem value="1">{t('menu.form.fields.spicyLevel.options.1')}</SelectItem>
                                                    <SelectItem value="2">{t('menu.form.fields.spicyLevel.options.2')}</SelectItem>
                                                    <SelectItem value="3">{t('menu.form.fields.spicyLevel.options.3')}</SelectItem>
                                                    <SelectItem value="4">{t('menu.form.fields.spicyLevel.options.4')}</SelectItem>
                                                    <SelectItem value="5">{t('menu.form.fields.spicyLevel.options.5')}</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="calories"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>{t('menu.form.fields.calories.label')}</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    min={0}
                                                    placeholder={t('menu.form.fields.calories.placeholder')}
                                                    {...field}
                                                    value={field.value || ''}
                                                    onChange={(e) =>
                                                        field.onChange(
                                                            e.target.value ? Number(e.target.value) : undefined
                                                        )
                                                    }
                                                    disabled={loading}
                                                />
                                            </FormControl>
                                            <FormDescription>
                                                {t('menu.form.fields.calories.description')}
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="isVegetarian"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                            <div className="space-y-0.5">
                                                <FormLabel className="text-base">
                                                    {t('menu.form.fields.isVegetarian.label')}
                                                </FormLabel>
                                                <FormDescription>
                                                    {t('menu.form.fields.isVegetarian.description')}
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

                                <FormField
                                    control={form.control}
                                    name="isAvailable"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                            <div className="space-y-0.5">
                                                <FormLabel className="text-base">{t('menu.form.fields.isAvailable.label')}</FormLabel>
                                                <FormDescription>
                                                    {t('menu.form.fields.isAvailable.description')}
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

                                <FormField
                                    control={form.control}
                                    name="isActive"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                            <div className="space-y-0.5">
                                                <FormLabel className="text-base">{t('menu.form.fields.isActive.label')}</FormLabel>
                                                <FormDescription>
                                                    {t('menu.form.fields.isActive.description')}
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
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="media" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>{t('menu.form.sections.imageUpload.title')}</CardTitle>
                                <CardDescription>{t('menu.form.sections.imageUpload.description')}</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <FormField
                                    control={form.control}
                                    name="imagePath"
                                    render={({ field }) => (
                                        <FormItem>
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
                                                    folder="menu"
                                                    disabled={loading}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>

                <div className="flex justify-end gap-2 pt-4 border-t">
                    <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
                        {t('menu.form.buttons.cancel')}
                    </Button>
                    <Button type="submit" disabled={loading}>
                        {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                        {menuItem ? t('menu.form.buttons.update') : t('menu.form.buttons.create')}
                    </Button>
                </div>
            </form>
        </Form>
    );
}
