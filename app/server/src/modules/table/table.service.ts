import {
    Injectable,
    NotFoundException,
    BadRequestException,
    Logger,
} from '@nestjs/common';
import {
    TableRepository,
    TableFilters,
    FindOptions,
} from '@/modules/table/table.repository';
import { CreateTableDto, UpdateTableDto } from '@/modules/table/dto';
import { PrismaService } from '@/database/prisma.service';
import { TableStatus } from '@prisma/client';

@Injectable()
export class TableService {
    private readonly logger = new Logger(TableService.name);

    constructor(
        private readonly tableRepository: TableRepository,
        private readonly prisma: PrismaService,
    ) {}

    /**
     * Count tables by filter
     */
    async countTables(filters?: TableFilters) {
        return this.tableRepository.count(filters);
    }

    /**
     * Get all tables with pagination
     */
    async getAllTables(options?: FindOptions) {
        return this.tableRepository.findAllPaginated(options);
    }

    /**
     * Get table by ID
     */
    async getTableById(tableId: number) {
        const table = await this.tableRepository.findById(tableId);

        if (!table) {
            throw new NotFoundException('Table not found');
        }

        return table;
    }

    /**
     * Get table by table number
     */
    async getTableByNumber(tableNumber: string) {
        const table = await this.tableRepository.findByTableNumber(tableNumber);

        if (!table) {
            throw new NotFoundException('Table not found');
        }

        return table;
    }

    /**
     * Get tables by floor
     */
    async getTablesByFloor(floor: number) {
        return this.tableRepository.findByFloor(floor);
    }

    /**
     * Get tables by section
     */
    async getTablesBySection(section: string) {
        return this.tableRepository.findBySection(section);
    }

    /**
     * Get available tables
     */
    async getAvailableTables(capacity?: number) {
        return this.tableRepository.findAvailable(capacity);
    }

    /**
     * Create new table
     */
    async createTable(data: CreateTableDto) {
        // Check if table number already exists
        const existingTable = await this.tableRepository.findByTableNumber(
            data.tableNumber,
        );

        if (existingTable) {
            throw new BadRequestException('Table number already exists');
        }

        const table = await this.tableRepository.create(data);

        this.logger.log(`Table created: ${table.tableId}`);
        return table;
    }

    /**
     * Update table
     */
    async updateTable(tableId: number, data: UpdateTableDto) {
        const table = await this.getTableById(tableId);

        // Check if table number is being changed and if it already exists
        if (data.tableNumber && data.tableNumber !== table.tableNumber) {
            const existingTable = await this.tableRepository.findByTableNumber(
                data.tableNumber,
            );

            if (existingTable) {
                throw new BadRequestException('Table number already exists');
            }
        }

        const updated = await this.tableRepository.update(tableId, data);

        this.logger.log(`Table updated: ${tableId}`);
        return updated;
    }

    /**
     * Delete table
     */
    async deleteTable(tableId: number) {
        const table = await this.getTableById(tableId);

        // Check if table is currently occupied
        if (table.status === 'occupied') {
            throw new BadRequestException(
                'Cannot delete table that is currently occupied',
            );
        }

        await this.tableRepository.delete(tableId);

        this.logger.log(`Table deleted: ${tableId}`);
    }

    /**
     * Update table status
     */
    async updateTableStatus(tableId: number, status: TableStatus) {
        await this.getTableById(tableId);

        const updated = await this.tableRepository.updateStatus(
            tableId,
            status,
        );

        this.logger.log(`Table status updated: ${tableId} -> ${status}`);
        return updated;
    }
}
