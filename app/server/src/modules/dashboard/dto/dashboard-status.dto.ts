import { ApiProperty } from '@nestjs/swagger';

export class TableSummaryDto {
    @ApiProperty({ description: 'Total number of tables' })
    total: number;

    @ApiProperty({ description: 'Number of available tables' })
    available: number;

    @ApiProperty({ description: 'Number of occupied tables' })
    occupied: number;

    @ApiProperty({ description: 'Number of reserved tables' })
    reserved: number;

    @ApiProperty({ description: 'Number of tables under maintenance' })
    maintenance: number;
}

export class KitchenQueueDto {
    @ApiProperty({ description: 'Number of pending orders' })
    pending: number;

    @ApiProperty({ description: 'Number of orders being prepared' })
    preparing: number;

    @ApiProperty({ description: 'Number of ready orders' })
    ready: number;
}

export class DashboardStatusDto {
    @ApiProperty({ type: TableSummaryDto })
    tables: TableSummaryDto;

    @ApiProperty({ type: KitchenQueueDto })
    kitchen: KitchenQueueDto;
}
