import { IsEnum, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { KitchenOrderStatus } from '@prisma/generated/client';

export class KitchenOrderFiltersDto {
    @ApiPropertyOptional({
        enum: KitchenOrderStatus,
        description: 'Filter by status',
    })
    @IsEnum(KitchenOrderStatus)
    @IsOptional()
    status?: KitchenOrderStatus;
}
