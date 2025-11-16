import { useCallback } from 'react';
import { toast } from 'sonner';
import { MenuItem } from '@/types';
import { uploadApi } from '@/services/upload.service';

interface UseMenuItemHandlersProps {
    onCreateMenuItem?: (data: any) => Promise<void>;
    onUpdateMenuItem?: (itemId: number, data: any) => Promise<void>;
    onDeleteMenuItem?: (itemId: number) => Promise<void>;
    onCreateSuccess?: () => void;
    onUpdateSuccess?: () => void;
    onDeleteSuccess?: () => void;
}

export function useMenuItemHandlers({
    onCreateMenuItem,
    onUpdateMenuItem,
    onDeleteMenuItem,
    onCreateSuccess,
    onUpdateSuccess,
    onDeleteSuccess,
}: UseMenuItemHandlersProps) {
    /**
     * Handle create menu item with image upload
     */
    const handleCreate = useCallback(
        async (data: any, imageFile?: File | null) => {
            try {
                let imageUrl = data.imageUrl;
                let imagePath = data.imagePath;

                // Upload image if a new file is selected
                if (imageFile) {
                    const uploadedFile = await uploadApi.uploadSingle(imageFile, 'menu', 'image');
                    imageUrl = uploadedFile.url;
                    imagePath = uploadedFile.path;
                }

                await onCreateMenuItem?.({
                    ...data,
                    imageUrl,
                    imagePath,
                });

                toast.success('Menu item created successfully');
                onCreateSuccess?.();
            } catch (error: any) {
                toast.error(error.message || 'Failed to create menu item');
                throw error;
            }
        },
        [onCreateMenuItem, onCreateSuccess]
    );

    /**
     * Handle update menu item with image upload
     */
    const handleUpdate = useCallback(
        async (itemId: number, currentMenuItem: MenuItem, data: any, imageFile?: File | null) => {
            try {
                let imageUrl = data.imageUrl;
                let imagePath = data.imagePath;

                // Upload new image if a file is selected
                if (imageFile) {
                    const uploadedFile = await uploadApi.uploadSingle(imageFile, 'menu', 'image');
                    imageUrl = uploadedFile.url;
                    imagePath = uploadedFile.path;

                    // Delete old image if exists
                    if (currentMenuItem.imagePath) {
                        try {
                            await uploadApi.deleteFile(currentMenuItem.imagePath);
                        } catch (deleteError) {
                            console.warn('Failed to delete old image:', deleteError);
                        }
                    }
                }

                await onUpdateMenuItem?.(itemId, {
                    ...data,
                    imageUrl,
                    imagePath,
                });

                toast.success('Menu item updated successfully');
                onUpdateSuccess?.();
            } catch (error: any) {
                toast.error(error.message || 'Failed to update menu item');
                throw error;
            }
        },
        [onUpdateMenuItem, onUpdateSuccess]
    );

    /**
     * Handle delete menu item with image cleanup
     */
    const handleDelete = useCallback(
        async (itemId: number, menuItem: MenuItem) => {
            try {
                // Delete image file if exists
                if (menuItem.imagePath) {
                    try {
                        await uploadApi.deleteFile(menuItem.imagePath);
                    } catch (deleteError) {
                        console.warn('Failed to delete menu item image:', deleteError);
                    }
                }

                await onDeleteMenuItem?.(itemId);
                toast.success('Menu item deleted successfully');
                onDeleteSuccess?.();
            } catch (error: any) {
                toast.error(error.message || 'Failed to delete menu item');
                throw error;
            }
        },
        [onDeleteMenuItem, onDeleteSuccess]
    );

    return {
        handleCreate,
        handleUpdate,
        handleDelete,
    };
}
