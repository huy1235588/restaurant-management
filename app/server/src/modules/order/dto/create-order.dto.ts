import {
    IsString,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsArray,
    ValidateNested,
    Min,
    MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateOrderItemDto {
    @ApiProperty({ example: 1, description: 'Menu item ID' })
    @IsNumber()
    @IsNotEmpty()
    itemId: number;

    @ApiProperty({ example: 2, description: 'Quantity' })
    @IsNumber()
    @IsNotEmpty()
    @Min(1)
    quantity: number;

    @ApiPropertyOptional({
        example: 'No onions',
        description: 'Special request',
    })
    @IsString()
    @IsOptional()
    @MaxLength(500)
    specialRequest?: string;
}

export class CreateOrderDto {
    @ApiProperty({ example: 1, description: 'Table ID' })
    @IsNumber()
    @IsNotEmpty()
    tableId: number;

    @ApiPropertyOptional({ example: 1, description: 'Reservation ID' })
    @IsNumber()
    @IsOptional()
    reservationId?: number;

    @ApiPropertyOptional({
        example: 'John Doe',
        description: 'Customer name',
    })
    @IsString()
    @IsOptional()
    @MaxLength(255)
    customerName?: string;

    @ApiPropertyOptional({
        example: '0901234567',
        description: 'Customer phone',
    })
    @IsString()
    @IsOptional()
    @MaxLength(20)
    customerPhone?: string;

    @ApiProperty({ example: 4, description: 'Party size' })
    @IsNumber()
    @IsNotEmpty()
    @Min(1)
    partySize: number;

    @ApiPropertyOptional({ example: 'VIP customer', description: 'Notes' })
    @IsString()
    @IsOptional()
    notes?: string;

    @ApiProperty({
        type: [CreateOrderItemDto],
        description: 'Order items',
    })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CreateOrderItemDto)
    items: CreateOrderItemDto[];
}
