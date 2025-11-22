import { IsInt, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateBillDto {
    @ApiProperty({ example: 1, description: 'Order ID' })
    @IsInt()
    @IsNotEmpty()
    orderId: number;
}
