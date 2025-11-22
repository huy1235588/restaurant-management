import { IsString, IsNotEmpty, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CancelOrderDto {
    @ApiProperty({
        example: 'Customer changed their mind',
        description: 'Reason for cancellation (minimum 10 characters)',
    })
    @IsString()
    @IsNotEmpty()
    @MinLength(10)
    cancellationReason: string;
}
