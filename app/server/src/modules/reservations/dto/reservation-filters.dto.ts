import {
    IsOptional,
    IsEnum,
    IsInt,
    IsDateString,
    IsString,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ReservationStatus } from '@prisma/generated/client';

export class ReservationFiltersDto {
    @ApiPropertyOptional({
        enum: ReservationStatus,
        description: 'Filter by status',
    })
    @IsEnum(ReservationStatus)
    @IsOptional()
    status?: ReservationStatus;

    @ApiPropertyOptional({ example: 1, description: 'Filter by table ID' })
    @IsInt()
    @Type(() => Number)
    @IsOptional()
    tableId?: number;

    @ApiPropertyOptional({
        example: '2024-12-25',
        description: 'Filter by date',
    })
    @IsDateString()
    @IsOptional()
    date?: string;

    @ApiPropertyOptional({
        example: '0123456789',
        description: 'Search by phone number',
    })
    @IsString()
    @IsOptional()
    phoneNumber?: string;

    @ApiPropertyOptional({
        example: 'John',
        description: 'Search by customer name',
    })
    @IsString()
    @IsOptional()
    customerName?: string;

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
