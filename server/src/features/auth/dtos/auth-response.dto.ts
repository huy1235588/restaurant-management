import { Role } from '@/shared/types';

export interface AuthResponseDto {
    user: {
        accountId: number;
        staffId: number;
        username: string;
        email: string;
        fullName: string;
        role: Role;
    };
    accessToken: string;
    refreshToken: string;
}

export interface TokenPayloadDto {
    accountId: number;
    staffId: number;
    username: string;
    email: string;
    role: Role;
}
