import { IsInt, IsOptional, IsString, Min, MaxLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateOrderItemDto {
    @ApiPropertyOptional({ example: 3, description: 'Updated quantity' })
    @IsInt()
    @IsOptional()
    @Min(1)
    quantity?: number;

    @ApiPropertyOptional({
        example: 'Extra spicy',
        description: 'Updated special request',
    })
    @IsString()
    @IsOptional()
    @MaxLength(500)
    specialRequest?: string;
}
