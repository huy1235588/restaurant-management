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
import { Loader2, AlertCircle } from 'lucide-react';
import { ImageUploadCropper } from '@/components/shared/ImageUploadCropper';
import { useFileUpload } from '@/hooks/useFileUpload';
import { uploadApi } from '@/services/upload.service';

interface MenuItemFormProps {
    item?: MenuItem;
    categories: Category[];
    onSubmit: (data: Partial<MenuItem>) => Promise<void>;
    onCancel: () => void;
}

export function MenuItemForm({ item, categories, onSubmit, onCancel }: MenuItemFormProps) {
    const { t } = useTranslation();
    const [loading, setLoading] = useState(false);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [uploadError, setUploadError] = useState<string | null>(null);
    
    // Use upload hook for file upload management
    const { upload, uploading, error: uploadHookError } = useFileUpload({
        onSuccess: (file) => {
            console.log('File uploaded successfully:', file);
        },
        onError: (error) => {
            console.error('Upload failed:', error);
            setUploadError(error.message);
        },
    });

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
            setUploadError(null);
            const submitData = { ...data };
            
            // Upload image if a new file is selected
            if (imageFile) {
                console.log('Uploading image file...');
                const uploadedFile = await upload(imageFile, 'menu', 'image');
                
                if (!uploadedFile) {
                    throw new Error(uploadHookError?.message || 'Failed to upload image');
                }
                
                // Update form data with uploaded file URL
                submitData.imageUrl = uploadedFile.url;
                console.log('Image uploaded successfully. URL:', uploadedFile.url);
            }
            
            // Submit form data with image URL to parent handler
            await onSubmit(submitData);
            
            // Clear image file after successful submit
            setImageFile(null);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'An error occurred';
            setUploadError(errorMessage);
            console.error('Submit error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleImageSelect = async (file: File, preview: string) => {
        setImageFile(file);
        // Update form with preview for immediate visual feedback
        form.setValue('imageUrl', preview);
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

                {/* Image Upload */}
                <FormItem>
                    <FormLabel>{t('menu.image', 'Menu Item Image')}</FormLabel>
                    <FormControl>
                        <ImageUploadCropper
                            onImageSelect={handleImageSelect}
                            currentImage={item?.imageUrl}
                            label={t('menu.uploadImage', 'Upload Image')}
                        />
                    </FormControl>
                    <FormDescription>
                        {t('menu.imageDescription', 'Upload and crop your image. The image will be optimized automatically.')}
                    </FormDescription>
                    
                    {/* Upload Status Messages */}
                    {uploading && (
                        <div className="flex items-center gap-2 mt-2 text-sm text-blue-600">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            {t('common.uploading', 'Uploading...')}
                        </div>
                    )}
                    
                    {uploadError && (
                        <div className="flex items-center gap-2 mt-2 text-sm text-red-600">
                            <AlertCircle className="h-4 w-4" />
                            {uploadError}
                        </div>
                    )}
                    
                    {imageFile && !uploading && !uploadError && (
                        <div className="text-sm text-green-600 mt-2">
                            ✓ {t('common.ready', 'Ready to upload')}
                        </div>
                    )}
                    
                    <FormMessage />
                </FormItem>

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
                    <Button 
                        type="button" 
                        variant="outline" 
                        disabled={loading || uploading}
                        onClick={onCancel}
                    >
                        {t('common.cancel', 'Cancel')}
                    </Button>
                    <Button 
                        type="submit" 
                        disabled={loading || uploading}
                    >
                        {(loading || uploading) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {item ? t('common.update', 'Update') : t('common.create', 'Create')}
                    </Button>
                </div>
            </form>
        </Form>
    );
}
