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
import { TableStatus } from '@prisma/generated/client';

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

    /**
     * Get table statistics
     */
    async getTableStats() {
        const tables = await this.tableRepository.findAll();
        const total = tables.length;
        const available = tables.filter((t) => t.status === 'available').length;
        const occupied = tables.filter((t) => t.status === 'occupied').length;
        const reserved = tables.filter((t) => t.status === 'reserved').length;
        const maintenance = tables.filter(
            (t) => t.status === 'maintenance',
        ).length;
        const active = tables.filter((t) => t.isActive).length;
        const inactive = total - active;
        const totalCapacity = tables.reduce((sum, t) => sum + t.capacity, 0);
        const occupiedCapacity = tables
            .filter((t) => t.status === 'occupied')
            .reduce((sum, t) => sum + t.capacity, 0);
        const occupancyRate =
            totalCapacity > 0
                ? ((occupiedCapacity / totalCapacity) * 100).toFixed(2) + '%'
                : '0%';

        return {
            total,
            available,
            occupied,
            reserved,
            maintenance,
            active,
            inactive,
            totalCapacity,
            occupancyRate,
        };
    }

    /**
     * Bulk update table status
     */
    async bulkUpdateStatus(tableIds: number[], status: TableStatus) {
        // Validate all tables exist
        const tables = await Promise.all(
            tableIds.map((id) => this.getTableById(id)),
        );

        // If any table is not found, getTableById will throw NotFoundException
        if (tables.length !== tableIds.length) {
            throw new NotFoundException('One or more tables not found');
        }

        // Update status for all tables
        const updated = await this.tableRepository.bulkUpdateStatus(
            tableIds,
            status,
        );

        this.logger.log(
            `Bulk status update: ${tableIds.length} tables -> ${status}`,
        );

        return {
            updatedCount: updated.count,
            tableIds,
            status,
        };
    }
}
