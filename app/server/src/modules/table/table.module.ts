import { Module } from '@nestjs/common';
import { TableController } from '@/modules/table/table.controller';
import { TableService } from '@/modules/table/table.service';
import { TableRepository } from '@/modules/table/table.repository';

@Module({
    controllers: [TableController],
    providers: [TableService, TableRepository],
    exports: [TableService, TableRepository],
})
export class TableModule {}
