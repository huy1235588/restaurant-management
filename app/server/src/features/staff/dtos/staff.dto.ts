export interface CreateStaffDto {
    accountId: number;
    fullName: string;
    address?: string;
    dateOfBirth?: string;
    hireDate?: string;
    salary?: number;
    role: 'admin' | 'manager' | 'waiter' | 'chef' | 'bartender' | 'cashier';
    isActive?: boolean;
}

export interface UpdateStaffDto {
    fullName?: string;
    address?: string;
    dateOfBirth?: string;
    hireDate?: string;
    salary?: number;
    role?: 'admin' | 'manager' | 'waiter' | 'chef' | 'bartender' | 'cashier';
    isActive?: boolean;
}

export interface StaffResponseDto {
    staffId: number;
    accountId: number;
    fullName: string;
    address?: string;
    dateOfBirth?: Date;
    hireDate: Date;
    salary?: number;
    role: 'admin' | 'manager' | 'waiter' | 'chef' | 'bartender' | 'cashier';
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    account?: {
        accountId: number;
        username: string;
        email: string;
        phoneNumber: string;
    };
}
