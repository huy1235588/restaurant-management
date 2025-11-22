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
import { OrderStatus } from '@prisma/generated/client';

export class QueryOrderDto {
    @ApiPropertyOptional({
        description: 'Page number for pagination',
        example: 1,
        default: 1,
    })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    page?: number;

    @ApiPropertyOptional({
        description: 'Number of items per page',
        example: 10,
        default: 10,
    })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    limit?: number;

    @ApiPropertyOptional({
        description: 'Filter by order status',
        enum: OrderStatus,
        example: 'pending',
    })
    @IsOptional()
    @IsEnum(OrderStatus)
    status?: OrderStatus;

    @ApiPropertyOptional({
        description: 'Filter by table ID',
        example: 1,
    })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    tableId?: number;

    @ApiPropertyOptional({
        description: 'Filter by reservation ID',
        example: 1,
    })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    reservationId?: number;

    @ApiPropertyOptional({
        description: 'Filter orders created after this date (ISO 8601)',
        example: '2025-01-01',
    })
    @IsOptional()
    @IsDateString()
    startDate?: string;

    @ApiPropertyOptional({
        description: 'Filter orders created before this date (ISO 8601)',
        example: '2025-12-31',
    })
    @IsOptional()
    @IsDateString()
    endDate?: string;

    @ApiPropertyOptional({
        description: 'Search by customer name or phone',
        example: 'John',
    })
    @IsOptional()
    @IsString()
    search?: string;

    @ApiPropertyOptional({
        description: 'Sort field',
        example: 'orderTime',
        default: 'orderTime',
    })
    @IsOptional()
    @IsString()
    sortBy?: string;

    @ApiPropertyOptional({
        description: 'Sort order',
        enum: ['asc', 'desc'],
        example: 'desc',
        default: 'desc',
    })
    @IsOptional()
    @IsEnum(['asc', 'desc'])
    sortOrder?: 'asc' | 'desc';
}
