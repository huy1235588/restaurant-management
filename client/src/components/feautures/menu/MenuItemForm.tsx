'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { MenuItem, Category } from '@/types';
import { Loader2 } from 'lucide-react';

interface MenuItemFormProps {
    item?: MenuItem;
    categories: Category[];
    onSubmit: (data: Partial<MenuItem>) => Promise<void>;
    onCancel: () => void;
}

export function MenuItemForm({ item, categories, onSubmit, onCancel }: MenuItemFormProps) {
    const { t } = useTranslation();
    const [loading, setLoading] = useState(false);

    const form = useForm<Partial<MenuItem>>({
        defaultValues: item || {
            itemCode: '',
            itemName: '',
            categoryId: undefined,
            price: 0,
            cost: 0,
            description: '',
            imageUrl: '',
            isAvailable: true,
            isActive: true,
            preparationTime: 0,
            spicyLevel: 0,
            isVegetarian: false,
            calories: 0,
        },
    });

    const handleSubmit = async (data: Partial<MenuItem>) => {
        try {
            setLoading(true);
            await onSubmit(data);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Item Code */}
                    <FormField
                        control={form.control}
                        name="itemCode"
                        rules={{ required: t('menu.itemCodeRequired', 'Item code is required') }}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>{t('menu.itemCode', 'Item Code')}</FormLabel>
                                <FormControl>
                                    <Input placeholder="FOOD-001" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Item Name */}
                    <FormField
                        control={form.control}
                        name="itemName"
                        rules={{ required: t('menu.itemNameRequired', 'Item name is required') }}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>{t('menu.itemName', 'Item Name')}</FormLabel>
                                <FormControl>
                                    <Input placeholder={t('menu.itemNamePlaceholder', 'Enter item name')} {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Category */}
                    <FormField
                        control={form.control}
                        name="categoryId"
                        rules={{ required: t('menu.categoryRequired', 'Category is required') }}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>{t('menu.category', 'Category')}</FormLabel>
                                <Select
                                    onValueChange={(value) => field.onChange(parseInt(value))}
                                    value={field.value?.toString()}
                                >
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder={t('menu.selectCategory', 'Select a category')} />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {categories.map((category) => (
                                            <SelectItem key={category.categoryId} value={category.categoryId.toString()}>
                                                {category.categoryName}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Price */}
                    <FormField
                        control={form.control}
                        name="price"
                        rules={{
                            required: t('menu.priceRequired', 'Price is required'),
                            min: { value: 0, message: t('menu.priceMin', 'Price must be positive') },
                        }}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>{t('menu.price', 'Price')}</FormLabel>
                                <FormControl>
                                    <Input
                                        type="number"
                                        placeholder="0"
                                        {...field}
                                        onChange={(e) => field.onChange(parseFloat(e.target.value))}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Cost */}
                    <FormField
                        control={form.control}
                        name="cost"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>{t('menu.cost', 'Cost')}</FormLabel>
                                <FormControl>
                                    <Input
                                        type="number"
                                        placeholder="0"
                                        {...field}
                                        onChange={(e) => field.onChange(parseFloat(e.target.value))}
                                    />
                                </FormControl>
                                <FormDescription>
                                    {t('menu.costDescription', 'Optional - for profit calculation')}
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Preparation Time */}
                    <FormField
                        control={form.control}
                        name="preparationTime"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>{t('menu.preparationTime', 'Preparation Time (minutes)')}</FormLabel>
                                <FormControl>
                                    <Input
                                        type="number"
                                        placeholder="0"
                                        {...field}
                                        onChange={(e) => field.onChange(parseInt(e.target.value))}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Spicy Level */}
                    <FormField
                        control={form.control}
                        name="spicyLevel"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>{t('menu.spicyLevel', 'Spicy Level (0-5)')}</FormLabel>
                                <FormControl>
                                    <Input
                                        type="number"
                                        min="0"
                                        max="5"
                                        placeholder="0"
                                        {...field}
                                        onChange={(e) => field.onChange(parseInt(e.target.value))}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Calories */}
                    <FormField
                        control={form.control}
                        name="calories"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>{t('menu.calories', 'Calories')}</FormLabel>
                                <FormControl>
                                    <Input
                                        type="number"
                                        placeholder="0"
                                        {...field}
                                        onChange={(e) => field.onChange(parseInt(e.target.value))}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                {/* Description */}
                <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>{t('menu.description', 'Description')}</FormLabel>
                            <FormControl>
                                <Textarea
                                    placeholder={t('menu.descriptionPlaceholder', 'Enter item description')}
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Image URL */}
                <FormField
                    control={form.control}
                    name="imageUrl"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>{t('menu.imageUrl', 'Image URL')}</FormLabel>
                            <FormControl>
                                <Input placeholder="https://example.com/image.jpg" {...field} />
                            </FormControl>
                            <FormDescription>
                                {t('menu.imageUrlDescription', 'Enter a URL for the item image')}
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Is Vegetarian */}
                    <FormField
                        control={form.control}
                        name="isVegetarian"
                        render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                <div className="space-y-0.5">
                                    <FormLabel className="text-base">
                                        {t('menu.vegetarian', 'Vegetarian')}
                                    </FormLabel>
                                </div>
                                <FormControl>
                                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                                </FormControl>
                            </FormItem>
                        )}
                    />

                    {/* Is Available */}
                    <FormField
                        control={form.control}
                        name="isAvailable"
                        render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                <div className="space-y-0.5">
                                    <FormLabel className="text-base">
                                        {t('menu.available', 'Available')}
                                    </FormLabel>
                                </div>
                                <FormControl>
                                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                                </FormControl>
                            </FormItem>
                        )}
                    />

                    {/* Is Active */}
                    <FormField
                        control={form.control}
                        name="isActive"
                        render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                <div className="space-y-0.5">
                                    <FormLabel className="text-base">{t('menu.active', 'Active')}</FormLabel>
                                </div>
                                <FormControl>
                                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                                </FormControl>
                            </FormItem>
                        )}
                    />
                </div>

                {/* Form Actions */}
                <div className="flex justify-end gap-4 pt-4">
                    <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
                        {t('common.cancel', 'Cancel')}
                    </Button>
                    <Button type="submit" disabled={loading}>
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {item ? t('common.update', 'Update') : t('common.create', 'Create')}
                    </Button>
                </div>
            </form>
        </Form>
    );
}
