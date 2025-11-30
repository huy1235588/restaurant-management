import {
    IsString,
    IsNotEmpty,
    IsOptional,
    IsBoolean,
    IsNumber,
    MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCategoryDto {
    @ApiProperty({ example: 'Main Dishes', description: 'Category name' })
    @IsString()
    @IsNotEmpty()
    @MaxLength(100)
    categoryName: string;

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
