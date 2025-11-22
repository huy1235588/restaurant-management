import { IsOptional, IsEnum, IsInt, IsDateString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { PaymentStatus, PaymentMethod } from '@prisma/generated/client';

export class BillFiltersDto {
    @ApiPropertyOptional({
        enum: PaymentStatus,
        description: 'Filter by payment status',
    })
    @IsEnum(PaymentStatus)
    @IsOptional()
    paymentStatus?: PaymentStatus;

    @ApiPropertyOptional({
        enum: PaymentMethod,
        description: 'Filter by payment method',
    })
    @IsEnum(PaymentMethod)
    @IsOptional()
    paymentMethod?: PaymentMethod;

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
