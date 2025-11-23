import { IsDateString, IsInt, IsOptional, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CheckAvailabilityDto {
    @ApiProperty({
        description: 'Reservation date and time in ISO format',
        example: '2024-12-25T19:00:00Z',
    })
    @IsDateString()
    date: string;

    @ApiProperty({ description: 'Number of guests', example: 4, minimum: 1 })
    @Type(() => Number)
    @IsInt()
    @Min(1)
    partySize: number;

    @ApiPropertyOptional({
        description: 'Duration in minutes',
        example: 120,
        minimum: 30,
    })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(30)
    duration?: number;

    @ApiPropertyOptional({ description: 'Filter by floor', example: 1 })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    floor?: number;

    @ApiPropertyOptional({ description: 'Filter by section', example: 'VIP' })
    @IsOptional()
    section?: string;
}
