/**
 * Common API Types
 */

export interface ApiResponse<T = unknown> {
    success: boolean;
    message: string;
    data?: T;
    error?: unknown;
}

export interface PaginationParams {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
    data: T[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}
