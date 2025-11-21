import {
    IsString,
    IsOptional,
    IsBoolean,
    IsNumber,
    IsUrl,
    MaxLength,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateCategoryDto {
    @ApiPropertyOptional({
        example: 'Main Dishes',
        description: 'Category name',
    })
    @IsString()
    @IsOptional()
    @MaxLength(100)
    categoryName?: string;

    @ApiPropertyOptional({
        example: 'Delicious main dishes',
        description: 'Category description',
    })
    @IsString()
    @IsOptional()
    @MaxLength(500)
    description?: string;

    @ApiPropertyOptional({ example: 1, description: 'Display order' })
    @IsNumber()
    @IsOptional()
    displayOrder?: number;

    @ApiPropertyOptional({
        example: 'https://example.com/image.jpg',
        description: 'Category image URL',
    })
    @IsUrl()
    @IsOptional()
    imageUrl?: string;

    @ApiPropertyOptional({
        example: 'categories/image.jpg',
        description: 'Category image path (relative or storage identifier)',
    })
    @IsString()
    @IsOptional()
    imagePath?: string;

    @ApiPropertyOptional({ example: true, description: 'Is category active' })
    @IsBoolean()
    @IsOptional()
    isActive?: boolean;
}
