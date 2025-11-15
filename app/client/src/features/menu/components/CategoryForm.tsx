'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Category } from '@/types';
import { CategoryFormData } from '../types';
import { categoryFormSchema } from '../utils/validation';
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
import { ImageUploadField } from './ImageUploadField';
import { Loader2 } from 'lucide-react';

interface CategoryFormProps {
    category?: Category | null;
    onSubmit: (data: CategoryFormData) => Promise<void>;
    onCancel: () => void;
    loading?: boolean;
}

export function CategoryForm({ category, onSubmit, onCancel, loading = false }: CategoryFormProps) {
    const form = useForm<CategoryFormData>({
        resolver: zodResolver(categoryFormSchema),
        defaultValues: {
            categoryName: category?.categoryName || '',
            description: category?.description || '',
            displayOrder: category?.displayOrder || 0,
            isActive: category?.isActive ?? true,
            imageUrl: category?.imageUrl || '',
        },
        mode: 'onChange',
    });

    const handleSubmit = async (data: CategoryFormData) => {
        try {
            await onSubmit(data);
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
                            <FormLabel>Category Name *</FormLabel>
                            <FormControl>
                                <Input
                                    placeholder="e.g., Appetizers, Main Course"
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
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                                <Textarea
                                    placeholder="Brief description of this category..."
                                    rows={3}
                                    {...field}
                                    value={field.value || ''}
                                    disabled={loading}
                                />
                            </FormControl>
                            <FormDescription>
                                Optional description to help customers understand this category
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="imageUrl"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Category Image</FormLabel>
                            <FormControl>
                                <ImageUploadField
                                    value={field.value}
                                    onChange={field.onChange}
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

                <FormField
                    control={form.control}
                    name="isActive"
                    render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                                <FormLabel className="text-base">Active Status</FormLabel>
                                <FormDescription>
                                    Inactive categories won't be visible to customers
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
                        Cancel
                    </Button>
                    <Button type="submit" disabled={loading}>
                        {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                        {category ? 'Update Category' : 'Create Category'}
                    </Button>
                </div>
            </form>
        </Form>
    );
}
