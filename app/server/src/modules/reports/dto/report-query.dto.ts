import {
    IsOptional,
    IsDateString,
    IsEnum,
    IsInt,
    Min,
    Max,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export enum GroupBy {
    DAY = 'day',
    WEEK = 'week',
    MONTH = 'month',
    HOUR = 'hour',
    STATUS = 'status',
}

export class ReportQueryDto {
    @ApiPropertyOptional({
        description: 'Start date for the report period (ISO 8601 format)',
        example: '2024-01-01',
    })
    @IsOptional()
    @IsDateString()
    startDate?: string;

    @ApiPropertyOptional({
        description: 'End date for the report period (ISO 8601 format)',
        example: '2024-12-31',
    })
    @IsOptional()
    @IsDateString()
    endDate?: string;
}

export class RevenueQueryDto extends ReportQueryDto {
    @ApiPropertyOptional({
        description: 'Group revenue data by time period',
        enum: GroupBy,
        default: GroupBy.DAY,
    })
    @IsOptional()
    @IsEnum(GroupBy)
    groupBy?: GroupBy = GroupBy.DAY;
}

export class TopItemsQueryDto extends ReportQueryDto {
    @ApiPropertyOptional({
        description: 'Maximum number of items to return',
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

export class OrdersQueryDto extends ReportQueryDto {
    @ApiPropertyOptional({
        description: 'Group orders data by time or status',
        enum: GroupBy,
        default: GroupBy.HOUR,
    })
    @IsOptional()
    @IsEnum(GroupBy)
    groupBy?: GroupBy = GroupBy.HOUR;
}
