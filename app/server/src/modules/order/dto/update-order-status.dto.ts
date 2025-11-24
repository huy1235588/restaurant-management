import { IsEnum, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { OrderStatus } from '@/lib/prisma';

/**
 * DTO for updating order status
 */
export class UpdateOrderStatusDto {
    @ApiProperty({
        enum: OrderStatus,
        example: OrderStatus.confirmed,
        description: 'New order status',
        enumName: 'OrderStatus',
    })
    @IsEnum(OrderStatus, {
        message: 'Status must be a valid OrderStatus value',
    })
    @IsNotEmpty({ message: 'Status is required' })
    status: OrderStatus;
}
