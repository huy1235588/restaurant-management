import {
    IsInt,
    IsNotEmpty,
    IsOptional,
    IsString,
    Min,
    MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateOrderDto {
    @ApiProperty({ example: 1, description: 'Table ID' })
    @IsInt()
    @IsNotEmpty()
    tableId: number;

    @ApiPropertyOptional({
        example: 'John Doe',
        description: 'Customer name',
    })
    @IsString()
    @IsOptional()
    @MaxLength(255)
    customerName?: string;

    @ApiPropertyOptional({
        example: '0123456789',
        description: 'Customer phone number',
    })
    @IsString()
    @IsOptional()
    @MaxLength(20)
    customerPhone?: string;

    @ApiPropertyOptional({
        example: 4,
        description: 'Number of people',
    })
    @IsInt()
    @IsOptional()
    @Min(1)
    partySize?: number;

    @ApiPropertyOptional({
        example: 1,
        description: 'Reservation ID if order is from reservation',
    })
    @IsInt()
    @IsOptional()
    reservationId?: number;

    @ApiPropertyOptional({
        example: 'Special table setup needed',
        description: 'Order notes',
    })
    @IsString()
    @IsOptional()
    notes?: string;
}
