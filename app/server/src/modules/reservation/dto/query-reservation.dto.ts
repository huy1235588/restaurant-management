import {
    IsOptional,
    IsString,
    IsInt,
    IsDateString,
    IsEnum,
    Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { ReservationStatus } from '@/lib/prisma';

export class QueryReservationDto {
    @ApiPropertyOptional({ description: 'Page number', example: 1, minimum: 1 })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    page?: number;

    @ApiPropertyOptional({
        description: 'Items per page',
        example: 10,
        minimum: 1,
    })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    limit?: number;

    @ApiPropertyOptional({
        description: 'Filter by status',
        enum: ReservationStatus,
        example: 'confirmed',
    })
    @IsOptional()
    @IsEnum(ReservationStatus)
    status?: ReservationStatus;

    @ApiPropertyOptional({
        description: 'Filter by specific date (YYYY-MM-DD)',
        example: '2024-12-25',
    })
    @IsOptional()
    @IsDateString()
    date?: string;

    @ApiPropertyOptional({
        description: 'Filter from date (YYYY-MM-DD)',
        example: '2024-12-01',
    })
    @IsOptional()
    @IsDateString()
    startDate?: string;

    @ApiPropertyOptional({
        description: 'Filter to date (YYYY-MM-DD)',
        example: '2024-12-31',
    })
    @IsOptional()
    @IsDateString()
    endDate?: string;

    @ApiPropertyOptional({ description: 'Filter by table ID', example: 1 })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    tableId?: number;

    @ApiPropertyOptional({
        description: 'Search by customer name, phone, or reservation code',
        example: 'Nguyen',
    })
    @IsOptional()
    @IsString()
    search?: string;

    @ApiPropertyOptional({
        description: 'Field to sort by',
        example: 'reservationDate',
        enum: ['reservationDate', 'reservationTime', 'createdAt', 'status'],
    })
    @IsOptional()
    @IsString()
    sortBy?: string;

    @ApiPropertyOptional({
        description: 'Sort order',
        example: 'asc',
        enum: ['asc', 'desc'],
    })
    @IsOptional()
    @IsEnum(['asc', 'desc'])
    sortOrder?: 'asc' | 'desc';
}
