import {
    IsNumber,
    IsString,
    IsNotEmpty,
    Min,
    Max,
    IsOptional,
    ValidateIf,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ApplyDiscountDto {
    @ApiPropertyOptional({ example: 50000, description: 'Discount amount' })
    @IsOptional()
    @IsNumber()
    @Min(0)
    @ValidateIf(
        (o: ApplyDiscountDto) => !o.percentage || o.amount !== undefined,
    )
    amount?: number;

    @ApiPropertyOptional({
        example: 10,
        description: 'Discount percentage (0-100)',
    })
    @IsOptional()
    @IsNumber()
    @Min(0)
    @Max(100)
    @ValidateIf(
        (o: ApplyDiscountDto) => !o.amount || o.percentage !== undefined,
    )
    percentage?: number;

    @ApiProperty({
        example: 'VIP customer discount',
        description: 'Reason for discount',
    })
    @IsString()
    @IsNotEmpty()
    reason: string;
}
