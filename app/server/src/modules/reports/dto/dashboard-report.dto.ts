import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsDateString, IsBoolean } from 'class-validator';
import { Transform } from 'class-transformer';

export class DashboardQueryDto {
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

    @ApiPropertyOptional({
        description: 'Bypass cache and fetch fresh data',
        default: false,
    })
    @IsOptional()
    @IsBoolean()
    @Transform(({ value }) => value === 'true' || value === true)
    refresh?: boolean = false;
}

// Response types for dashboard batch endpoint
export class DashboardReportResponseDto {
    @ApiProperty({ description: 'Success message' })
    message: string;

    @ApiProperty({ description: 'Dashboard report data' })
    data: {
        overview: any;
        revenue: any;
        topItems: any;
        paymentMethods: any;
        orders: any;
    };

    @ApiProperty({ description: 'Whether data was served from cache' })
    cached: boolean;

    @ApiPropertyOptional({ description: 'Timestamp when data was cached' })
    cachedAt?: string;
}
