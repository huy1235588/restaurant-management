import {
    IsDateString,
    IsNotEmpty,
    IsInt,
    IsOptional,
    Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AvailableTablesQueryDto {
    @ApiProperty({
        example: '2024-12-25',
        description: 'Reservation date (ISO format)',
    })
    @IsDateString()
    @IsNotEmpty()
    date: string;

    @ApiProperty({
        example: '18:30',
        description: 'Reservation time (HH:mm)',
    })
    @IsNotEmpty()
    time: string;

    @ApiProperty({ example: 4, description: 'Party size' })
    @IsInt()
    @IsNotEmpty()
    @Min(1)
    partySize: number;

    @ApiPropertyOptional({
        example: 120,
        description: 'Duration in minutes',
        default: 120,
    })
    @IsInt()
    @IsOptional()
    @Min(30)
    duration?: number;
}
