import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { RESERVATION_CONSTANTS } from '../constants/reservation.constants';

/**
 * Base Pagination DTO for Reservation Module
 */
export class ReservationPaginationDto {
    @ApiPropertyOptional({
        description: 'Page number',
        example: 1,
        default: RESERVATION_CONSTANTS.DEFAULT_PAGE,
        minimum: 1,
    })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    page?: number = RESERVATION_CONSTANTS.DEFAULT_PAGE;

    @ApiPropertyOptional({
        description: 'Number of items per page',
        example: 10,
        default: RESERVATION_CONSTANTS.DEFAULT_LIMIT,
        minimum: 1,
        maximum: RESERVATION_CONSTANTS.MAX_LIMIT,
    })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    limit?: number = RESERVATION_CONSTANTS.DEFAULT_LIMIT;
}

/**
 * Base Response DTO
 */
export interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
}

/**
 * Paginated Response DTO
 */
export interface PaginatedResponse<T> {
    success: boolean;
    message: string;
    data: {
        items: T[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    };
}

/**
 * Sort Order Enum
 */
export enum SortOrder {
    ASC = 'asc',
    DESC = 'desc',
}
