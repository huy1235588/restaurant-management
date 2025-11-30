// Staff Role type
export type Role = 'admin' | 'manager' | 'waiter' | 'chef' | 'cashier';

// Account interface (minimal - for staff form account selection)
export interface Account {
    accountId: number;
    username: string;
    email: string;
    phoneNumber: string;
    isActive: boolean;
    lastLogin?: string | null;
    createdAt: string;
    staff?: Staff | null;
}

// Staff interface
export interface Staff {
    staffId: number;
    accountId: number;
    fullName: string;
    address?: string | null;
    dateOfBirth?: string | null;
    hireDate: string;
    salary?: number | null;
    role: Role;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    account?: Account;
}

// Form data for create/edit
export interface StaffFormData {
    accountId: number;
    fullName: string;
    address?: string | null;
    dateOfBirth?: string | null;
    hireDate?: string | null;
    salary?: number | null;
    role: Role;
}

// Update staff data (accountId not updatable)
export interface UpdateStaffData {
    fullName?: string;
    address?: string | null;
    dateOfBirth?: string | null;
    hireDate?: string | null;
    salary?: number | null;
    role?: Role;
}

// Create staff with account data (for new staff registration)
export interface CreateStaffWithAccountData {
    // Account info
    username: string;
    email: string;
    password: string;
    phoneNumber: string;
    // Staff info
    fullName: string;
    address?: string;
    dateOfBirth?: string;
    hireDate?: string;
    salary?: number;
    role: Role;
}

// Filter types
export interface StaffFiltersData {
    role?: Role;
    isActive?: boolean;
    search?: string;
}

// View mode type
export type ViewMode = 'grid' | 'table';

// Statistics type
export interface StaffStatistics {
    total: number;
    active: number;
    inactive: number;
    byRole: {
        admin: number;
        manager: number;
        waiter: number;
        chef: number;
        cashier: number;
    };
}

// Sort options
export interface SortOption {
    field: string;
    order: 'asc' | 'desc';
    label: string;
}

// Staff query params
export interface StaffQueryParams extends StaffFiltersData {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

// Role colors for badge
export const ROLE_COLORS: Record<Role, { bg: string; text: string; border: string }> = {
    admin: {
        bg: 'bg-red-100 dark:bg-red-900/30',
        text: 'text-red-700 dark:text-red-400',
        border: 'border-red-200 dark:border-red-800',
    },
    manager: {
        bg: 'bg-purple-100 dark:bg-purple-900/30',
        text: 'text-purple-700 dark:text-purple-400',
        border: 'border-purple-200 dark:border-purple-800',
    },
    waiter: {
        bg: 'bg-blue-100 dark:bg-blue-900/30',
        text: 'text-blue-700 dark:text-blue-400',
        border: 'border-blue-200 dark:border-blue-800',
    },
    chef: {
        bg: 'bg-orange-100 dark:bg-orange-900/30',
        text: 'text-orange-700 dark:text-orange-400',
        border: 'border-orange-200 dark:border-orange-800',
    },
    cashier: {
        bg: 'bg-green-100 dark:bg-green-900/30',
        text: 'text-green-700 dark:text-green-400',
        border: 'border-green-200 dark:border-green-800',
    },
};

// All roles for dropdown
export const ALL_ROLES: Role[] = ['admin', 'manager', 'waiter', 'chef', 'cashier'];
