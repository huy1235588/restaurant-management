import { IsEnum, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { OrderStatus } from '@prisma/generated/client';

export class UpdateOrderStatusDto {
    @ApiProperty({
        enum: OrderStatus,
        example: OrderStatus.confirmed,
        description: 'Order status',
    })
    @IsEnum(OrderStatus)
    @IsNotEmpty()
    status: OrderStatus;
}
