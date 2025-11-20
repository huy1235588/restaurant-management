import { IsEnum, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { TableStatus } from '@prisma/generated/client';

export class UpdateTableStatusDto {
    @ApiProperty({
        enum: TableStatus,
        example: 'available',
        description: 'Table status',
    })
    @IsEnum(TableStatus)
    @IsNotEmpty()
    status: TableStatus;
}
