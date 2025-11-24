import { IsArray, IsEnum, ArrayNotEmpty, IsInt } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { TableStatus } from '@/lib/prisma';

export class BulkUpdateStatusDto {
    @ApiProperty({
        example: [1, 2, 3],
        description: 'Array of table IDs to update',
        type: [Number],
    })
    @IsArray()
    @ArrayNotEmpty()
    @IsInt({ each: true })
    tableIds: number[];

    @ApiProperty({
        example: 'available',
        description: 'New status for all tables',
        enum: TableStatus,
    })
    @IsEnum(TableStatus)
    status: TableStatus;
}
