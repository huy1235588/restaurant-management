import { Role } from '@/shared/types';

export interface LoginDTO {
    username: string;
    password: string;
}

export interface RegisterDTO {
    username: string;
    email: string;
    password: string;
    phoneNumber: string;
    fullName: string;
    address?: string;
    dateOfBirth?: Date;
}

export interface CreateStaffDTO extends RegisterDTO {
    hireDate?: Date;
    salary?: number;
    role: Role;
}

export interface RefreshTokenDTO {
    refreshToken: string;
}

export interface ChangePasswordDTO {
    currentPassword: string;
    newPassword: string;
}
