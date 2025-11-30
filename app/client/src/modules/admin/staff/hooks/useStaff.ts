import { useState, useEffect, useCallback } from 'react';
import { staffApi } from '../services';
import { Staff, StaffFiltersData, StaffQueryParams } from '../types';
import { PaginatedResponse } from '@/types';

// Hook to fetch staff list with pagination and filters
export function useStaff(params?: StaffQueryParams) {
    const [data, setData] = useState<PaginatedResponse<Staff>>({
        items: [],
        pagination: {
            page: 1,
            limit: 10,
            total: 0,
            totalPages: 0,
        },
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const refetch = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const result = await staffApi.getAll(params);
            setData(result);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to fetch staff');
        } finally {
            setLoading(false);
        }
    }, [params]);

    useEffect(() => {
        refetch();
    }, [
        params?.role,
        params?.isActive,
        params?.search,
        params?.page,
        params?.limit,
        params?.sortBy,
        params?.sortOrder,
        refetch,
    ]);

    return {
        data,
        staffList: data.items,
        pagination: data.pagination,
        loading,
        error,
        refetch,
    };
}

// Hook to fetch single staff by ID
export function useStaffById(id: number | null) {
    const [staff, setStaff] = useState<Staff | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const refetch = useCallback(async () => {
        if (!id) {
            setStaff(null);
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError(null);
            const data = await staffApi.getById(id);
            setStaff(data);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to fetch staff');
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        refetch();
    }, [id, refetch]);

    return { staff, loading, error, refetch };
}
