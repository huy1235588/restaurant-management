import { useResourceHandlers } from '@/hooks/useResourceHandlers';
import { Category } from '@/types';

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
    const { handleCreate, handleUpdate, handleDelete } = useResourceHandlers({
        uploadFolder: 'categories',
        onCreate: onCreateCategory,
        onUpdate: onUpdateCategory,
        onDelete: onDeleteCategory,
        onCreateSuccess,
        onUpdateSuccess,
        onDeleteSuccess,
        successMessages: {
            create: 'Category created successfully',
            update: 'Category updated successfully',
            delete: 'Category deleted successfully',
        },
    });

    // Keep the same function signatures used by callers: update/delete expect current Category where applicable
    return {
        handleCreate,
        handleUpdate: handleUpdate as (categoryId: number, currentCategory: Category, data: any, imageFile?: File | null) => Promise<void>,
        handleDelete: handleDelete as (categoryId: number, category: Category) => Promise<void>,
    };
}
