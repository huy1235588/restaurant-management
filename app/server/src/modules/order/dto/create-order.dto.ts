import {
    IsString,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsArray,
    ValidateNested,
    Min,
    MaxLength,
    IsInt,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ORDER_CONSTANTS } from '../constants/order.constants';

/**
 * DTO for creating an order item
 */
export class CreateOrderItemDto {
    @ApiProperty({
        description: 'Menu item ID',
        example: 1,
    })
    @IsInt()
    @IsNotEmpty({ message: 'Item ID is required' })
    itemId: number;

    @ApiProperty({
        description: 'Quantity of the item',
        example: 2,
        minimum: 1,
    })
    @IsInt()
    @IsNotEmpty({ message: 'Quantity is required' })
    @Min(1, { message: 'Quantity must be at least 1' })
    quantity: number;

    @ApiPropertyOptional({
        description: 'Special request for the item',
        example: 'No onions, extra sauce',
        maxLength: ORDER_CONSTANTS.MAX_SPECIAL_REQUEST_LENGTH,
    })
    @IsOptional()
    @IsString()
    @MaxLength(ORDER_CONSTANTS.MAX_SPECIAL_REQUEST_LENGTH, {
        message: `Special request cannot exceed ${ORDER_CONSTANTS.MAX_SPECIAL_REQUEST_LENGTH} characters`,
    })
    specialRequest?: string;
}

/**
 * DTO for creating a new order
 */
export class CreateOrderDto {
    @ApiProperty({
        description: 'Table ID',
        example: 1,
    })
    @IsInt()
    @IsNotEmpty({ message: 'Table ID is required' })
    tableId: number;

    @ApiPropertyOptional({
        description: 'Reservation ID (if order is linked to a reservation)',
        example: 1,
    })
    @IsOptional()
    @IsInt()
    reservationId?: number;

    @ApiPropertyOptional({
        description: 'Customer name',
        example: 'John Doe',
        maxLength: 255,
    })
    @IsOptional()
    @IsString()
    @MaxLength(255, {
        message: 'Customer name cannot exceed 255 characters',
    })
    customerName?: string;

    @ApiPropertyOptional({
        description: 'Customer phone number',
        example: '0901234567',
        maxLength: 20,
    })
    @IsOptional()
    @IsString()
    @MaxLength(20, {
        message: 'Customer phone cannot exceed 20 characters',
    })
    customerPhone?: string;

    @ApiProperty({
        description: 'Number of people in the party',
        example: 4,
        minimum: 1,
    })
    @IsInt()
    @IsNotEmpty({ message: 'Party size is required' })
    @Min(1, { message: 'Party size must be at least 1' })
    partySize: number;

    @ApiPropertyOptional({
        description: 'Additional notes for the order',
        example: 'Birthday celebration, please bring cake after main course',
        maxLength: ORDER_CONSTANTS.MAX_NOTES_LENGTH,
    })
    @IsOptional()
    @IsString()
    @MaxLength(ORDER_CONSTANTS.MAX_NOTES_LENGTH, {
        message: `Notes cannot exceed ${ORDER_CONSTANTS.MAX_NOTES_LENGTH} characters`,
    })
    notes?: string;

    @ApiProperty({
        type: [CreateOrderItemDto],
        description: 'Order items (at least one item required)',
        example: [
            {
                itemId: 1,
                quantity: 2,
                specialRequest: 'No onions',
            },
        ],
    })
    @IsArray({ message: 'Items must be an array' })
    @IsNotEmpty({ message: 'At least one item is required' })
    @ValidateNested({ each: true })
    @Type(() => CreateOrderItemDto)
    items: CreateOrderItemDto[];
}
