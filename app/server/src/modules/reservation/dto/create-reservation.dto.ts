import {
    IsString,
    IsEmail,
    IsInt,
    IsOptional,
    IsDateString,
    MinLength,
    MaxLength,
    Min,
    Max,
    Matches,
    IsNumber,
    IsArray,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateReservationDto {
    @ApiPropertyOptional({ description: 'Existing customer ID', example: 1 })
    @IsOptional()
    @IsInt()
    customerId?: number;

    @ApiProperty({
        description: 'Customer full name',
        example: 'Nguyễn Văn A',
        minLength: 1,
        maxLength: 100,
    })
    @IsString()
    @MinLength(1)
    @MaxLength(100)
    customerName: string;

    @ApiProperty({
        description: 'Phone number (10-11 digits)',
        example: '0987654321',
    })
    @IsString()
    @Matches(/^[0-9]{10,11}$/, { message: 'Phone number must be 10-11 digits' })
    phoneNumber: string;

    @ApiPropertyOptional({
        description: 'Email address',
        example: 'customer@example.com',
    })
    @IsOptional()
    @IsEmail()
    email?: string;

    @ApiPropertyOptional({ description: 'Specific table ID', example: 1 })
    @IsOptional()
    @IsInt()
    tableId?: number;

    @ApiPropertyOptional({
        description: 'Preferred floor for auto-assignment',
        example: 1,
    })
    @IsOptional()
    @IsInt()
    floor?: number;

    @ApiPropertyOptional({
        description: 'Preferred table ID for auto-assignment',
        example: 2,
    })
    @IsOptional()
    @IsInt()
    preferredTableId?: number;

    @ApiProperty({
        description: 'Reservation date (YYYY-MM-DD)',
        example: '2024-12-25',
    })
    @IsDateString()
    reservationDate: string;

    @ApiProperty({ description: 'Reservation time (HH:mm)', example: '19:00' })
    @IsString()
    @Matches(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, {
        message: 'Time must be in HH:mm format',
    })
    reservationTime: string;

    @ApiPropertyOptional({
        description: 'Duration in minutes',
        example: 120,
        minimum: 30,
        maximum: 480,
    })
    @IsOptional()
    @IsInt()
    @Min(30)
    @Max(480)
    duration?: number;

    @ApiProperty({
        description: 'Number of guests',
        example: 4,
        minimum: 1,
        maximum: 50,
    })
    @IsInt()
    @Min(1)
    @Max(50)
    partySize: number;

    @ApiPropertyOptional({ description: 'Special requests or requirements' })
    @IsOptional()
    @IsString()
    specialRequest?: string;

    @ApiPropertyOptional({
        description: 'Deposit amount (stored only, not processed)',
        example: 100000,
    })
    @IsOptional()
    @IsNumber()
    depositAmount?: number;

    @ApiPropertyOptional({ description: 'Internal notes' })
    @IsOptional()
    @IsString()
    notes?: string;

    @ApiPropertyOptional({
        description: 'Tags for categorization',
        example: ['birthday', 'vip'],
    })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    tags?: string[];
}
