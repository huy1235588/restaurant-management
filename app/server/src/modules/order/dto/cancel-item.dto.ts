import { IsString, IsNotEmpty, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ORDER_CONSTANTS } from '../constants/order.constants';

/**
 * DTO for cancelling an order item
 */
export class CancelItemDto {
    @ApiProperty({
        description: 'Reason for cancelling the item',
        example: 'Customer changed mind',
        maxLength: ORDER_CONSTANTS.MAX_CANCELLATION_REASON_LENGTH,
    })
    @IsString()
    @IsNotEmpty({ message: 'Cancellation reason is required' })
    @MaxLength(ORDER_CONSTANTS.MAX_CANCELLATION_REASON_LENGTH, {
        message: `Cancellation reason cannot exceed ${ORDER_CONSTANTS.MAX_CANCELLATION_REASON_LENGTH} characters`,
    })
    reason: string;
}
