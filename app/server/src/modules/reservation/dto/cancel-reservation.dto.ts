import { IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class CancelReservationDto {
    @ApiPropertyOptional({
        description: 'Reason for cancellation',
        example: 'Customer requested',
    })
    @IsOptional()
    @IsString()
    @MaxLength(500)
    reason?: string;
}
