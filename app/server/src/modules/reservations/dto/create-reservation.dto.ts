import {
    IsString,
    IsNotEmpty,
    IsEmail,
    IsOptional,
    IsInt,
    IsNumber,
    IsDateString,
    Min,
    MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateReservationDto {
    @ApiProperty({ example: 'John Doe', description: 'Customer name' })
    @IsString()
    @IsNotEmpty()
    @MaxLength(255)
    customerName: string;

    @ApiProperty({
        example: '0123456789',
        description: 'Customer phone number',
    })
    @IsString()
    @IsNotEmpty()
    @MaxLength(20)
    phoneNumber: string;

    @ApiPropertyOptional({
        example: 'john@example.com',
        description: 'Customer email',
    })
    @IsEmail()
    @IsOptional()
    email?: string;

    @ApiProperty({ example: 1, description: 'Table ID' })
    @IsInt()
    @IsNotEmpty()
    tableId: number;

    @ApiProperty({
        example: '2024-12-25',
        description: 'Reservation date (ISO format)',
    })
    @IsDateString()
    @IsNotEmpty()
    reservationDate: string;

    @ApiProperty({
        example: '18:30:00',
        description: 'Reservation time (HH:mm:ss)',
    })
    @IsString()
    @IsNotEmpty()
    reservationTime: string;

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

    @ApiPropertyOptional({
        example: 'Birthday celebration',
        description: 'Special requests',
    })
    @IsString()
    @IsOptional()
    specialRequest?: string;

    @ApiPropertyOptional({
        example: 100000,
        description: 'Deposit amount',
    })
    @IsNumber()
    @IsOptional()
    @Min(0)
    depositAmount?: number;

    @ApiPropertyOptional({
        example: 'VIP customer',
        description: 'Internal notes',
    })
    @IsString()
    @IsOptional()
    notes?: string;
}
