import { ApiResponse, PaginatedResponse } from '../types';

export class ResponseDto {
    static success<T>(message: string, data?: T): ApiResponse<T> {
        return {
            success: true,
            message,
            data,
        };
    }

    static error(message: string, error?: any): ApiResponse {
        return {
            success: false,
            message,
            error,
        };
    }

    static paginated<T>(
        data: T[],
        page: number,
        limit: number,
        total: number
    ): PaginatedResponse<T> {
        return {
            data,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
}
