import { IsString, IsNotEmpty, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CancelOrderDto {
    @ApiProperty({
        example: 'Customer left without waiting',
        description: 'Cancellation reason',
    })
    @IsString()
    @IsNotEmpty()
    @MaxLength(500)
    reason: string;
}
