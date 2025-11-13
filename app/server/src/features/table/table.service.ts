import { TableStatus } from '@prisma/client';
import tableRepository from '@/features/table/table.repository';
import { NotFoundError, BadRequestError } from '@/shared/utils/errors';
import { BaseFindOptions } from '@/shared/base';

interface TableFilters {
    status?: TableStatus;
    floor?: number;
    isActive?: boolean;
    search?: string;
    section?: string;
}

interface AvailableTableFilters {
    capacity?: number;
    floor?: number;
}

interface CreateTableData {
    tableNumber: string;
    tableName?: string;
    capacity: number;
    minCapacity?: number;
    floor?: number;
    section?: string;
    status?: TableStatus;
    qrCode?: string;
    isActive?: boolean;
    // Floor plan positioning
    positionX?: number;
    positionY?: number;
    shape?: string;
    width?: number;
    height?: number;
}

interface UpdateTableData {
    tableNumber?: string;
    tableName?: string;
    capacity?: number;
    minCapacity?: number;
    floor?: number;
    section?: string;
    status?: TableStatus;
    qrCode?: string;
    isActive?: boolean;
    // Floor plan positioning
    positionX?: number;
    positionY?: number;
    shape?: string;
    width?: number;
    height?: number;
}

export class TableService {
    /**
     * Get all tables
     */
    async getAllTables(options?: BaseFindOptions<TableFilters>) {
        return tableRepository.findAllPaginated(options);
    }

    /**
     * Get table by ID
     */
    async getTableById(tableId: number) {
        const table = await tableRepository.findById(tableId);

        if (!table) {
            throw new NotFoundError('Table not found');
        }

        return table;
    }

    /**
     * Get table by number
     */
    async getTableByNumber(tableNumber: string) {
        const table = await tableRepository.findByNumber(tableNumber);

        if (!table) {
            throw new NotFoundError('Table not found');
        }

        return table;
    }

    /**
     * Create new table
     */
    async createTable(data: CreateTableData) {
        // Check if table number already exists
        const existingTable = await tableRepository.findByNumber(data.tableNumber);

        if (existingTable) {
            throw new BadRequestError('Table number already exists');
        }

        return tableRepository.create(data);
    }

    /**
     * Update table
     */
    async updateTable(tableId: number, data: UpdateTableData) {
        const table = await this.getTableById(tableId);

        // Check if table number is being changed and if it already exists
        if (data.tableNumber && data.tableNumber !== table.tableNumber) {
            const existingTable = await tableRepository.findByNumber(data.tableNumber);

            if (existingTable) {
                throw new BadRequestError('Table number already exists');
            }
        }

        return tableRepository.update(tableId, data);
    }

    /**
     * Delete table
     */
    async deleteTable(tableId: number) {
        await this.getTableById(tableId);

        return tableRepository.delete(tableId);
    }

    /**
     * Update table status
     */
    async updateTableStatus(tableId: number, status: TableStatus) {
        await this.getTableById(tableId);

        return tableRepository.update(tableId, { status });
    }

    /**
     * Get available tables
     */
    async getAvailableTables(filters: AvailableTableFilters = {}) {
        return tableRepository.findAvailable(filters);
    }

    /**
     * Get table with current order
     */
    async getTableWithCurrentOrder(tableId: number) {
        const table = await tableRepository.findByIdWithDetails(tableId, {
            orders: {
                where: {
                    status: {
                        notIn: ['served', 'cancelled']
                    }
                },
                include: {
                    orderItems: {
                        include: {
                            menuItem: true
                        }
                    },
                    staff: true
                },
                orderBy: {
                    orderTime: 'desc'
                },
                take: 1
            }
        });

        if (!table) {
            throw new NotFoundError('Table not found');
        }

        return table;
    }
}

export const tableService = new TableService();
