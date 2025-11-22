import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ORDER_CONSTANTS } from '../constants/order.constants';

/**
 * Base Pagination DTO
 * Reusable pagination parameters for all list endpoints
 */
export class PaginationDto {
    @ApiPropertyOptional({
        description: 'Page number',
        example: 1,
        default: ORDER_CONSTANTS.DEFAULT_PAGE,
        minimum: 1,
    })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    page?: number = ORDER_CONSTANTS.DEFAULT_PAGE;

    @ApiPropertyOptional({
        description: 'Number of items per page',
        example: 20,
        default: ORDER_CONSTANTS.DEFAULT_LIMIT,
        minimum: 1,
        maximum: ORDER_CONSTANTS.MAX_LIMIT,
    })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    limit?: number = ORDER_CONSTANTS.DEFAULT_LIMIT;
}

/**
 * Base Response DTO
 * Standard response wrapper for all API endpoints
 */
export interface ApiResponse<T> {
    message: string;
    data: T;
}

/**
 * Paginated Response DTO
 * Standard response for paginated list endpoints
 */
export interface PaginatedResponse<T> {
    message: string;
    data: T[];
    meta: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}
