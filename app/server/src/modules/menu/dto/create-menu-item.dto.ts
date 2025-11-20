import {
    IsString,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsBoolean,
    IsUrl,
    Min,
    Max,
    MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateMenuItemDto {
    @ApiProperty({ example: 'ITEM001', description: 'Item code' })
    @IsString()
    @IsNotEmpty()
    @MaxLength(50)
    itemCode: string;

    @ApiProperty({ example: 'Beef Steak', description: 'Item name' })
    @IsString()
    @IsNotEmpty()
    @MaxLength(200)
    itemName: string;

    @ApiProperty({ example: 1, description: 'Category ID' })
    @IsNumber()
    @IsNotEmpty()
    categoryId: number;

    @ApiProperty({ example: 150000, description: 'Item price' })
    @IsNumber()
    @IsNotEmpty()
    @Min(0)
    price: number;

    @ApiPropertyOptional({ example: 80000, description: 'Item cost' })
    @IsNumber()
    @IsOptional()
    @Min(0)
    cost?: number;

    @ApiPropertyOptional({
        example: 'Delicious beef steak',
        description: 'Item description',
    })
    @IsString()
    @IsOptional()
    @MaxLength(1000)
    description?: string;

    @ApiPropertyOptional({
        example: 'https://example.com/image.jpg',
        description: 'Item image URL',
    })
    @IsUrl()
    @IsOptional()
    imageUrl?: string;

    @ApiPropertyOptional({ example: true, description: 'Is item available' })
    @IsBoolean()
    @IsOptional()
    isAvailable?: boolean;

    @ApiPropertyOptional({ example: true, description: 'Is item active' })
    @IsBoolean()
    @IsOptional()
    isActive?: boolean;

    @ApiPropertyOptional({
        example: 30,
        description: 'Preparation time in minutes',
    })
    @IsNumber()
    @IsOptional()
    @Min(0)
    preparationTime?: number;

    @ApiPropertyOptional({ example: 2, description: 'Spicy level (0-5)' })
    @IsNumber()
    @IsOptional()
    @Min(0)
    @Max(5)
    spicyLevel?: number;

    @ApiPropertyOptional({ example: false, description: 'Is vegetarian' })
    @IsBoolean()
    @IsOptional()
    isVegetarian?: boolean;

    @ApiPropertyOptional({ example: 500, description: 'Calories' })
    @IsNumber()
    @IsOptional()
    @Min(0)
    calories?: number;

    @ApiPropertyOptional({ example: 1, description: 'Display order' })
    @IsNumber()
    @IsOptional()
    displayOrder?: number;
}
