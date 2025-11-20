import { useState, useEffect } from 'react';
import { menuApi } from '../services';
import { MenuItem, PaginatedResponse } from '@/types';
import { MenuFilters } from '../types';

interface UseMenuItemsParams extends MenuFilters {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

// Hook to fetch menu items with pagination and filters
export function useMenuItems(params?: UseMenuItemsParams) {
    const [data, setData] = useState<PaginatedResponse<MenuItem>>({
        items: [],
        pagination: {
            page: 1,
            limit: 20,
            total: 0,
            totalPages: 0,
        },
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const refetch = async () => {
        try {
            setLoading(true);
            setError(null);
            const result = await menuApi.getAll(params);
            setData(result);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to fetch menu items');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        refetch();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        params?.categoryId,
        params?.isAvailable,
        params?.isActive,
        params?.search,
        params?.minPrice,
        params?.maxPrice,
        params?.isVegetarian,
        params?.spicyLevel,
        params?.page,
        params?.limit,
        params?.sortBy,
        params?.sortOrder,
    ]);

    return { data, menuItems: data.items, pagination: data.pagination, loading, error, refetch };
}

// Hook to fetch menu item count
export function useMenuItemCount(params?: {
    categoryId?: number;
    isAvailable?: boolean;
    isActive?: boolean;
}) {
    const [count, setCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const refetch = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await menuApi.count(params);
            setCount(data);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to fetch menu item count');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        refetch();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [params?.categoryId, params?.isAvailable, params?.isActive]);

    return { count, loading, error, refetch };
}

// Hook to fetch single menu item
export function useMenuItem(id: number | null) {
    const [menuItem, setMenuItem] = useState<MenuItem | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const refetch = async () => {
        if (!id) {
            setMenuItem(null);
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError(null);
            const data = await menuApi.getById(id);
            setMenuItem(data);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to fetch menu item');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        refetch();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    return { menuItem, loading, error, refetch };
}

// Hook to create menu item
export function useCreateMenuItem() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const createMenuItem = async (data: Partial<MenuItem>): Promise<MenuItem | null> => {
        try {
            setLoading(true);
            setError(null);
            const result = await menuApi.create(data);
            return result;
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || 'Failed to create menu item';
            setError(errorMessage);
            throw new Error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return { createMenuItem, loading, error };
}

// Hook to update menu item
export function useUpdateMenuItem() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const updateMenuItem = async (
        id: number,
        data: Partial<MenuItem>
    ): Promise<MenuItem | null> => {
        try {
            setLoading(true);
            setError(null);
            const result = await menuApi.update(id, data);
            return result;
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || 'Failed to update menu item';
            setError(errorMessage);
            throw new Error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return { updateMenuItem, loading, error };
}

// Hook to update availability (optimistic update)
export function useUpdateAvailability() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const updateAvailability = async (
        id: number,
        isAvailable: boolean
    ): Promise<MenuItem | null> => {
        try {
            setLoading(true);
            setError(null);
            const result = await menuApi.updateAvailability(id, isAvailable);
            return result;
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || 'Failed to update availability';
            setError(errorMessage);
            throw new Error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return { updateAvailability, loading, error };
}

// Hook to delete menu item
export function useDeleteMenuItem() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const deleteMenuItem = async (id: number): Promise<void> => {
        try {
            setLoading(true);
            setError(null);
            await menuApi.delete(id);
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || 'Failed to delete menu item';
            setError(errorMessage);
            throw new Error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return { deleteMenuItem, loading, error };
}
