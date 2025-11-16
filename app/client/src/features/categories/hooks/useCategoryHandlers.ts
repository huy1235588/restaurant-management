import { useCallback } from 'react';
import { toast } from 'sonner';
import { Category } from '@/types';
import { uploadApi } from '@/services/upload.service';

interface UseCategoryHandlersProps {
    onCreateCategory?: (data: any) => Promise<void>;
    onUpdateCategory?: (categoryId: number, data: any) => Promise<void>;
    onDeleteCategory?: (categoryId: number) => Promise<void>;
    onCreateSuccess?: () => void;
    onUpdateSuccess?: () => void;
    onDeleteSuccess?: () => void;
}

export function useCategoryHandlers({
    onCreateCategory,
    onUpdateCategory,
    onDeleteCategory,
    onCreateSuccess,
    onUpdateSuccess,
    onDeleteSuccess,
}: UseCategoryHandlersProps) {
    /**
     * Handle create category with image upload
     */
    const handleCreate = useCallback(
        async (data: any, imageFile?: File | null) => {
            try {
                let imageUrl = data.imageUrl;
                let imagePath = data.imagePath;

                // Upload image if a new file is selected
                if (imageFile) {
                    const uploadedFile = await uploadApi.uploadSingle(imageFile, 'categories', 'image');
                    imageUrl = uploadedFile.url;
                    imagePath = uploadedFile.path;
                }

                await onCreateCategory?.({
                    ...data,
                    imageUrl,
                    imagePath,
                });

                toast.success('Category created successfully');
                onCreateSuccess?.();
            } catch (error: any) {
                toast.error(error.message || 'Failed to create category');
                throw error;
            }
        },
        [onCreateCategory, onCreateSuccess]
    );

    /**
     * Handle update category with image upload
     */
    const handleUpdate = useCallback(
        async (categoryId: number, currentCategory: Category, data: any, imageFile?: File | null) => {
            try {
                let imageUrl = data.imageUrl;
                let imagePath = data.imagePath;

                // Upload new image if a file is selected
                if (imageFile) {
                    const uploadedFile = await uploadApi.uploadSingle(imageFile, 'categories', 'image');
                    imageUrl = uploadedFile.url;
                    imagePath = uploadedFile.path;

                    // Delete old image if exists
                    if (currentCategory.imagePath) {
                        try {
                            await uploadApi.deleteFile(currentCategory.imagePath);
                        } catch (deleteError) {
                            console.warn('Failed to delete old image:', deleteError);
                        }
                    }
                }

                await onUpdateCategory?.(categoryId, {
                    ...data,
                    imageUrl,
                    imagePath,
                });

                toast.success('Category updated successfully');
                onUpdateSuccess?.();
            } catch (error: any) {
                toast.error(error.message || 'Failed to update category');
                throw error;
            }
        },
        [onUpdateCategory, onUpdateSuccess]
    );

    /**
     * Handle delete category with image cleanup
     */
    const handleDelete = useCallback(
        async (categoryId: number, category: Category) => {
            try {
                // Delete image file if exists
                if (category.imagePath) {
                    try {
                        await uploadApi.deleteFile(category.imagePath);
                    } catch (deleteError) {
                        console.warn('Failed to delete category image:', deleteError);
                    }
                }

                await onDeleteCategory?.(categoryId);
                toast.success('Category deleted successfully');
                onDeleteSuccess?.();
            } catch (error: any) {
                toast.error(error.message || 'Failed to delete category');
                throw error;
            }
        },
        [onDeleteCategory, onDeleteSuccess]
    );

    return {
        handleCreate,
        handleUpdate,
        handleDelete,
    };
}
