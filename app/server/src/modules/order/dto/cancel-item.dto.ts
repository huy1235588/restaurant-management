import { IsString, IsNotEmpty, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CancelItemDto {
    @ApiProperty({
        example: 'Customer changed mind',
        description: 'Cancellation reason',
    })
    @IsString()
    @IsNotEmpty()
    @MaxLength(500)
    reason: string;
}
