import { useState } from 'react';
import { staffApi } from '../services';
import { Staff, UpdateStaffData, Role, CreateStaffWithAccountData } from '../types';

// Hook for create staff with account (new staff registration)
export function useCreateStaffWithAccount() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const createStaffWithAccount = async (data: CreateStaffWithAccountData): Promise<Staff | null> => {
        try {
            setLoading(true);
            setError(null);
            const result = await staffApi.createWithAccount(data);
            return result;
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || 'Failed to create staff with account';
            setError(errorMessage);
            throw new Error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return { createStaffWithAccount, loading, error };
}

// Hook for update staff
export function useUpdateStaff() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const updateStaff = async (id: number, data: UpdateStaffData): Promise<Staff | null> => {
        try {
            setLoading(true);
            setError(null);
            const result = await staffApi.update(id, data);
            return result;
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || 'Failed to update staff';
            setError(errorMessage);
            throw new Error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return { updateStaff, loading, error };
}

// Hook for update staff role
export function useUpdateStaffRole() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const updateRole = async (id: number, role: Role): Promise<Staff | null> => {
        try {
            setLoading(true);
            setError(null);
            const result = await staffApi.updateRole(id, role);
            return result;
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || 'Failed to update role';
            setError(errorMessage);
            throw new Error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return { updateRole, loading, error };
}

// Hook for activate/deactivate staff
export function useToggleStaffStatus() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const activate = async (id: number): Promise<Staff | null> => {
        try {
            setLoading(true);
            setError(null);
            const result = await staffApi.activate(id);
            return result;
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || 'Failed to activate staff';
            setError(errorMessage);
            throw new Error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const deactivate = async (id: number): Promise<Staff | null> => {
        try {
            setLoading(true);
            setError(null);
            const result = await staffApi.deactivate(id);
            return result;
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || 'Failed to deactivate staff';
            setError(errorMessage);
            throw new Error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const toggleStatus = async (id: number, isActive: boolean): Promise<Staff | null> => {
        return isActive ? await deactivate(id) : await activate(id);
    };

    return { activate, deactivate, toggleStatus, loading, error };
}

// Hook for delete staff
export function useDeleteStaff() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const deleteStaff = async (id: number): Promise<void> => {
        try {
            setLoading(true);
            setError(null);
            await staffApi.delete(id);
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || 'Failed to delete staff';
            setError(errorMessage);
            throw new Error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return { deleteStaff, loading, error };
}
