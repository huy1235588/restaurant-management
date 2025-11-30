import { useState, useEffect } from 'react';
import { categoryApi } from '@/modules/admin/categories/services';
import { Category } from '@/types';

// Hook to fetch all categories
export function useCategories(params?: { isActive?: boolean }) {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const refetch = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await categoryApi.getAll(params);
            setCategories(data);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to fetch categories');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        refetch();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [params?.isActive]);

    return { categories, loading, error, refetch };
}

// Hook to fetch category count
export function useCategoryCount(params?: { isActive?: boolean }) {
    const [count, setCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const refetch = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await categoryApi.count(params);
            setCount(data);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to fetch category count');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        refetch();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [params?.isActive]);

    return { count, loading, error, refetch };
}

// Hook to fetch single category
export function useCategory(id: number | null) {
    const [category, setCategory] = useState<Category | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const refetch = async () => {
        if (!id) {
            setCategory(null);
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError(null);
            const data = await categoryApi.getById(id);
            setCategory(data);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to fetch category');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        refetch();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    return { category, loading, error, refetch };
}

// Hook to fetch category with menu items
export function useCategoryWithItems(id: number | null) {
    const [category, setCategory] = useState<Category | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const refetch = async () => {
        if (!id) {
            setCategory(null);
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError(null);
            const data = await categoryApi.getWithItems(id);
            setCategory(data);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to fetch category');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        refetch();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    return { category, loading, error, refetch };
}

// Hook to create category
export function useCreateCategory() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const createCategory = async (data: Partial<Category>): Promise<Category | null> => {
        try {
            setLoading(true);
            setError(null);
            const result = await categoryApi.create(data);
            return result;
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || 'Failed to create category';
            setError(errorMessage);
            throw new Error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return { createCategory, loading, error };
}

// Hook to update category
export function useUpdateCategory() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const updateCategory = async (
        id: number,
        data: Partial<Category>
    ): Promise<Category | null> => {
        try {
            setLoading(true);
            setError(null);
            const result = await categoryApi.update(id, data);
            return result;
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || 'Failed to update category';
            setError(errorMessage);
            throw new Error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return { updateCategory, loading, error };
}

// Hook to delete category
export function useDeleteCategory() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const deleteCategory = async (id: number): Promise<void> => {
        try {
            setLoading(true);
            setError(null);
            await categoryApi.delete(id);
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || 'Failed to delete category';
            setError(errorMessage);
            throw new Error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return { deleteCategory, loading, error };
}
