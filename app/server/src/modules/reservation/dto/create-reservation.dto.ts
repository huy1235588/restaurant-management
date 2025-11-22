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
    IsNotEmpty,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { RESERVATION_CONSTANTS } from '../constants/reservation.constants';

/**
 * DTO for creating a new reservation
 * Supports workflow: Customer books -> Staff confirms -> Customer arrives -> Create order
 */

export class CreateReservationDto {
    @ApiPropertyOptional({ description: 'Existing customer ID', example: 1 })
    @IsOptional()
    @IsInt()
    customerId?: number;

    @ApiProperty({
        description: 'Customer full name',
        example: 'Nguyễn Văn A',
        minLength: 1,
        maxLength: RESERVATION_CONSTANTS.MAX_CUSTOMER_NAME_LENGTH,
    })
    @IsString()
    @IsNotEmpty({ message: 'Customer name is required' })
    @MinLength(1, { message: 'Customer name cannot be empty' })
    @MaxLength(RESERVATION_CONSTANTS.MAX_CUSTOMER_NAME_LENGTH, {
        message: `Customer name cannot exceed ${RESERVATION_CONSTANTS.MAX_CUSTOMER_NAME_LENGTH} characters`,
    })
    customerName: string;

    @ApiProperty({
        description: 'Customer phone number (10-11 digits)',
        example: '0987654321',
        maxLength: RESERVATION_CONSTANTS.MAX_CUSTOMER_PHONE_LENGTH,
    })
    @IsString()
    @IsNotEmpty({ message: 'Phone number is required' })
    @Matches(/^[0-9]{10,11}$/, {
        message: 'Phone number must be 10-11 digits',
    })
    phoneNumber: string;

    @ApiPropertyOptional({
        description: 'Customer email address',
        example: 'customer@example.com',
        maxLength: RESERVATION_CONSTANTS.MAX_CUSTOMER_EMAIL_LENGTH,
    })
    @IsOptional()
    @IsEmail({}, { message: 'Invalid email format' })
    @MaxLength(RESERVATION_CONSTANTS.MAX_CUSTOMER_EMAIL_LENGTH, {
        message: `Email cannot exceed ${RESERVATION_CONSTANTS.MAX_CUSTOMER_EMAIL_LENGTH} characters`,
    })
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
    @IsDateString({}, { message: 'Invalid date format. Use YYYY-MM-DD' })
    @IsNotEmpty({ message: 'Reservation date is required' })
    reservationDate: string;

    @ApiProperty({
        description: 'Reservation time (HH:mm, 24-hour format)',
        example: '19:00',
    })
    @IsString()
    @IsNotEmpty({ message: 'Reservation time is required' })
    @Matches(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, {
        message: 'Time must be in HH:mm format (00:00 to 23:59)',
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
        description: 'Number of guests in the party',
        example: 4,
        minimum: RESERVATION_CONSTANTS.MIN_PARTY_SIZE,
        maximum: RESERVATION_CONSTANTS.MAX_PARTY_SIZE,
    })
    @IsInt()
    @IsNotEmpty({ message: 'Party size is required' })
    @Min(RESERVATION_CONSTANTS.MIN_PARTY_SIZE, {
        message: `Party size must be at least ${RESERVATION_CONSTANTS.MIN_PARTY_SIZE}`,
    })
    @Max(RESERVATION_CONSTANTS.MAX_PARTY_SIZE, {
        message: `Party size cannot exceed ${RESERVATION_CONSTANTS.MAX_PARTY_SIZE}`,
    })
    partySize: number;

    @ApiPropertyOptional({
        description: 'Special requests or requirements from customer',
        example: 'Window seat preferred, celebrating anniversary',
        maxLength: RESERVATION_CONSTANTS.MAX_SPECIAL_REQUESTS_LENGTH,
    })
    @IsOptional()
    @IsString()
    @MaxLength(RESERVATION_CONSTANTS.MAX_SPECIAL_REQUESTS_LENGTH, {
        message: `Special requests cannot exceed ${RESERVATION_CONSTANTS.MAX_SPECIAL_REQUESTS_LENGTH} characters`,
    })
    specialRequest?: string;

    @ApiPropertyOptional({
        description: 'Deposit amount (stored only, not processed)',
        example: 100000,
    })
    @IsOptional()
    @IsNumber()
    @Min(0, { message: 'Deposit amount cannot be negative' })
    depositAmount?: number;

    @ApiPropertyOptional({
        description: 'Internal notes for staff',
        maxLength: RESERVATION_CONSTANTS.MAX_NOTES_LENGTH,
    })
    @IsOptional()
    @IsString()
    @MaxLength(RESERVATION_CONSTANTS.MAX_NOTES_LENGTH, {
        message: `Notes cannot exceed ${RESERVATION_CONSTANTS.MAX_NOTES_LENGTH} characters`,
    })
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
