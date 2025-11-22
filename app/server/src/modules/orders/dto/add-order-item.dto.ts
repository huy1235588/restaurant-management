import {
    IsInt,
    IsNotEmpty,
    IsOptional,
    IsString,
    Min,
    MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AddOrderItemDto {
    @ApiProperty({ example: 1, description: 'Menu item ID' })
    @IsInt()
    @IsNotEmpty()
    itemId: number;

    @ApiProperty({ example: 2, description: 'Quantity' })
    @IsInt()
    @IsNotEmpty()
    @Min(1)
    quantity: number;

    @ApiPropertyOptional({
        example: 'No onions, extra cheese',
        description: 'Special request for this item',
    })
    @IsString()
    @IsOptional()
    @MaxLength(500)
    specialRequest?: string;
}
