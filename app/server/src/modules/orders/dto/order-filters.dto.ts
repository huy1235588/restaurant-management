import { IsOptional, IsEnum, IsInt, IsDateString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { OrderStatus } from '@prisma/generated/client';

export class OrderFiltersDto {
    @ApiPropertyOptional({
        enum: OrderStatus,
        description: 'Filter by order status',
    })
    @IsEnum(OrderStatus)
    @IsOptional()
    status?: OrderStatus;

    @ApiPropertyOptional({ example: 1, description: 'Filter by table ID' })
    @IsInt()
    @Type(() => Number)
    @IsOptional()
    tableId?: number;

    @ApiPropertyOptional({ example: 1, description: 'Filter by staff ID' })
    @IsInt()
    @Type(() => Number)
    @IsOptional()
    staffId?: number;

    @ApiPropertyOptional({
        example: '2024-01-01',
        description: 'Filter by date (ISO format)',
    })
    @IsDateString()
    @IsOptional()
    date?: string;

    @ApiPropertyOptional({ example: 1, description: 'Page number' })
    @IsInt()
    @Type(() => Number)
    @IsOptional()
    page?: number;

    @ApiPropertyOptional({ example: 20, description: 'Items per page' })
    @IsInt()
    @Type(() => Number)
    @IsOptional()
    limit?: number;
}
