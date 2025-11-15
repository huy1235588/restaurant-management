'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { MenuItem, Category } from '@/types';
import { MenuItemFormData } from '../types';
import { menuItemFormSchema } from '../utils/validation';
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
import { ImageUploadField } from './ImageUploadField';
import { Loader2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { calculateMargin, formatMargin } from '../utils';

interface MenuItemFormProps {
    menuItem?: MenuItem | null;
    categories: Category[];
    onSubmit: (data: MenuItemFormData) => Promise<void>;
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
    const form = useForm<MenuItemFormData>({
        resolver: zodResolver(menuItemFormSchema),
        defaultValues: {
            itemCode: menuItem?.itemCode || '',
            itemName: menuItem?.itemName || '',
            categoryId: Number(menuItem?.categoryId) || 0,
            price: Number(menuItem?.price) || 0,
            cost: menuItem?.cost ? Number(menuItem.cost) : undefined,
            description: menuItem?.description || '',
            imageUrl: menuItem?.imageUrl || '',
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
            await onSubmit(data);
            form.reset();
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
                        <TabsTrigger value="basic">Basic</TabsTrigger>
                        <TabsTrigger value="pricing">Pricing</TabsTrigger>
                        <TabsTrigger value="details">Details</TabsTrigger>
                        <TabsTrigger value="media">Media</TabsTrigger>
                    </TabsList>

                    <TabsContent value="basic" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Basic Information</CardTitle>
                                <CardDescription>Essential details about the menu item</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="itemCode"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Item Code *</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="e.g., APP-001"
                                                    {...field}
                                                    disabled={loading}
                                                    className="font-mono"
                                                />
                                            </FormControl>
                                            <FormDescription>
                                                Unique code for this item (uppercase letters, numbers, hyphens)
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
                                            <FormLabel>Item Name *</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="e.g., Grilled Chicken Salad"
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
                                            <FormLabel>Category *</FormLabel>
                                            <Select
                                                onValueChange={(value) => field.onChange(Number(value))}
                                                value={field.value?.toString()}
                                                disabled={loading}
                                            >
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select a category" />
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
                                            <FormLabel>Description</FormLabel>
                                            <FormControl>
                                                <Textarea
                                                    placeholder="Describe the dish..."
                                                    rows={4}
                                                    {...field}
                                                    value={field.value || ''}
                                                    disabled={loading}
                                                />
                                            </FormControl>
                                            <FormDescription>
                                                Appealing description for customers (max 1000 characters)
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
                                <CardTitle>Pricing Information</CardTitle>
                                <CardDescription>Set the price and cost for this item</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="price"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Selling Price * (VND)</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    min={0}
                                                    step="1000"
                                                    placeholder="0"
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
                                            <FormLabel>Cost Price (VND)</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    min={0}
                                                    step="1000"
                                                    placeholder="0"
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
                                                Cost to prepare this item (for profit calculation)
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {margin !== null && (
                                    <div className="p-4 bg-muted rounded-lg">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-medium">Profit Margin:</span>
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
                                            <FormLabel>Display Order</FormLabel>
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
                                                Lower numbers appear first in the menu
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
                                <CardTitle>Additional Details</CardTitle>
                                <CardDescription>Dietary info and characteristics</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="preparationTime"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Preparation Time (minutes)</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    min={0}
                                                    max={300}
                                                    placeholder="0"
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
                                                Estimated time to prepare this dish
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
                                            <FormLabel>Spicy Level</FormLabel>
                                            <Select
                                                onValueChange={(value) => field.onChange(Number(value))}
                                                value={field.value?.toString()}
                                                disabled={loading}
                                            >
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select spicy level" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="0">Not spicy</SelectItem>
                                                    <SelectItem value="1">🌶️ Mild</SelectItem>
                                                    <SelectItem value="2">🌶️🌶️ Medium</SelectItem>
                                                    <SelectItem value="3">🌶️🌶️🌶️ Hot</SelectItem>
                                                    <SelectItem value="4">🌶️🌶️🌶️🌶️ Very hot</SelectItem>
                                                    <SelectItem value="5">
                                                        🌶️🌶️🌶️🌶️🌶️ Extremely hot
                                                    </SelectItem>
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
                                            <FormLabel>Calories</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    min={0}
                                                    placeholder="0"
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
                                                Approximate calorie content
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
                                                    🌱 Vegetarian
                                                </FormLabel>
                                                <FormDescription>
                                                    This item is suitable for vegetarians
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
                                                <FormLabel className="text-base">Available</FormLabel>
                                                <FormDescription>
                                                    Item is currently in stock and can be ordered
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
                                                <FormLabel className="text-base">Active Status</FormLabel>
                                                <FormDescription>
                                                    Inactive items won't be visible in the menu
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
                                <CardTitle>Image Upload</CardTitle>
                                <CardDescription>Upload a photo of this dish</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <FormField
                                    control={form.control}
                                    name="imageUrl"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormControl>
                                                <ImageUploadField
                                                    value={field.value}
                                                    onChange={field.onChange}
                                                    folder="menu-items"
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
                        Cancel
                    </Button>
                    <Button type="submit" disabled={loading}>
                        {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                        {menuItem ? 'Update Menu Item' : 'Create Menu Item'}
                    </Button>
                </div>
            </form>
        </Form>
    );
}
