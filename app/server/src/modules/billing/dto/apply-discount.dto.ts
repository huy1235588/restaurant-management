import { IsNumber, IsString, IsNotEmpty, Min, Max, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ApplyDiscountDto {
    @ApiProperty({ example: 50000, description: 'Discount amount' })
    @IsNumber()
    @IsNotEmpty()
    @Min(0)
    amount: number;

    @ApiPropertyOptional({ example: 10, description: 'Discount percentage (0-100)' })
    @IsNumber()
    @IsOptional()
    @Min(0)
    @Max(100)
    percentage?: number;

    @ApiProperty({ example: 'VIP customer discount', description: 'Reason for discount' })
    @IsString()
    @IsNotEmpty()
    reason: string;
}
