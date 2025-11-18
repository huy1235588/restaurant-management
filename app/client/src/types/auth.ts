// User và Authentication Types
export type UserRole = 'admin' | 'manager' | 'waiter' | 'chef' | 'cashier';

export interface User {
    accountId: number;
    username: string;
    email: string;
    fullName?: string;
    phoneNumber?: string;
    role: UserRole;
    isActive: boolean;
    avatar?: string;
    createdAt: string;
    updatedAt: string;
}

export interface LoginCredentials {
    username: string;
    password: string;
}

export interface AuthResponse {
    user: User;
    accessToken: string;
    refreshToken: string;
}

export interface LoginFormData {
    username: string;
    password: string;
}
