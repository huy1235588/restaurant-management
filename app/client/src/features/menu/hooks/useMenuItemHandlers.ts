import { useResourceHandlers } from '@/hooks/useResourceHandlers';
import { MenuItem } from '@/types';

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
    const { handleCreate, handleUpdate, handleDelete } = useResourceHandlers({
        uploadFolder: 'menu',
        onCreate: onCreateMenuItem,
        onUpdate: onUpdateMenuItem,
        onDelete: onDeleteMenuItem,
        onCreateSuccess,
        onUpdateSuccess,
        onDeleteSuccess,
        successMessages: {
            create: 'Menu item created successfully',
            update: 'Menu item updated successfully',
            delete: 'Menu item deleted successfully',
        },
    });

    return {
        handleCreate,
        handleUpdate: handleUpdate as (itemId: number, currentMenuItem: MenuItem, data: any, imageFile?: File | null) => Promise<void>,
        handleDelete: handleDelete as (itemId: number, menuItem: MenuItem) => Promise<void>,
    };
}
