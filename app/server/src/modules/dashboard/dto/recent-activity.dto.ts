import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class RecentActivityQueryDto {
    @ApiPropertyOptional({
        description: 'Number of activities to return',
        default: 10,
        minimum: 1,
        maximum: 50,
    })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(50)
    limit?: number = 10;
}

export class ActivityMetadataDto {
    @ApiProperty({ description: 'Entity ID (order, reservation, or bill)' })
    entityId: number;

    @ApiPropertyOptional({ description: 'Amount (for orders/payments)' })
    amount?: number;

    @ApiPropertyOptional({ description: 'Status of the entity' })
    status?: string;

    @ApiPropertyOptional({ description: 'Related table name' })
    tableName?: string;
}

export class ActivityItemDto {
    @ApiProperty({ description: 'Unique identifier for the activity' })
    id: string;

    @ApiProperty({
        description: 'Type of activity',
        enum: ['order', 'reservation', 'payment'],
    })
    type: 'order' | 'reservation' | 'payment';

    @ApiProperty({
        description: 'Action performed',
        example: 'created',
    })
    action: string;

    @ApiProperty({ description: 'Human-readable description' })
    description: string;

    @ApiProperty({ description: 'When the activity occurred' })
    timestamp: string;

    @ApiProperty({ type: ActivityMetadataDto })
    metadata: ActivityMetadataDto;
}

export class RecentActivityResponseDto {
    @ApiProperty({ type: [ActivityItemDto] })
    activities: ActivityItemDto[];
}
