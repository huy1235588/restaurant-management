import {
    IsString,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    Min,
    Max,
    MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateTableDto {
    @ApiProperty({ example: 'T001', description: 'Table number' })
    @IsString()
    @IsNotEmpty()
    @MaxLength(20)
    tableNumber: string;

    @ApiPropertyOptional({ example: 'Table 1', description: 'Table name' })
    @IsString()
    @IsOptional()
    @MaxLength(50)
    tableName?: string;

    @ApiProperty({ example: 4, description: 'Seating capacity' })
    @IsNumber()
    @IsNotEmpty()
    @Min(1)
    @Max(50)
    capacity: number;

    @ApiPropertyOptional({ example: 1, description: 'Minimum capacity' })
    @IsNumber()
    @IsOptional()
    @Min(1)
    minCapacity?: number;

    @ApiPropertyOptional({ example: 1, description: 'Floor number' })
    @IsNumber()
    @IsOptional()
    @Min(1)
    floor?: number;

    @ApiPropertyOptional({
        example: 'VIP',
        description: 'Section (VIP, Garden, Indoor, Outdoor)',
    })
    @IsString()
    @IsOptional()
    @MaxLength(50)
    section?: string;
}
