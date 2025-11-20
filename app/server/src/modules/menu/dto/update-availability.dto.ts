import { IsBoolean, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateAvailabilityDto {
    @ApiProperty({ example: true, description: 'Is item available' })
    @IsBoolean()
    @IsNotEmpty()
    isAvailable: boolean;
}
