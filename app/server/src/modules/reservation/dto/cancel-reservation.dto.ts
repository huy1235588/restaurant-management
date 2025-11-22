import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { RESERVATION_CONSTANTS } from '../constants/reservation.constants';

/**
 * DTO for cancelling a reservation
 */
export class CancelReservationDto {
    @ApiProperty({
        description: 'Reason for cancellation (required)',
        example: 'Customer requested cancellation',
        maxLength: RESERVATION_CONSTANTS.MAX_CANCELLATION_REASON_LENGTH,
    })
    @IsString()
    @IsNotEmpty({ message: 'Cancellation reason is required' })
    @MaxLength(RESERVATION_CONSTANTS.MAX_CANCELLATION_REASON_LENGTH, {
        message: `Cancellation reason cannot exceed ${RESERVATION_CONSTANTS.MAX_CANCELLATION_REASON_LENGTH} characters`,
    })
    reason: string;
}
