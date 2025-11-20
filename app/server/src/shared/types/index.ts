export enum Role {
    ADMIN = 'ADMIN',
    MANAGER = 'MANAGER',
    WAITER = 'WAITER',
    CHEF = 'CHEF',
    CASHIER = 'CASHIER',
}

export interface TokenPayload {
    accountId: number;
    staffId?: number;
    username: string;
    role: Role;
    iat?: number;
    exp?: number;
}

export interface PaginationParams {
    page?: number;
    limit?: number;
}

export interface PaginationMeta {
    currentPage: number;
    itemsPerPage: number;
    totalItems: number;
    totalPages: number;
}

export interface PaginatedResponse<T> {
    data: T[];
    meta: PaginationMeta;
}
