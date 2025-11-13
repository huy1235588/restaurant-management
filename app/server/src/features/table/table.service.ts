import { TableStatus } from '@prisma/client';
import tableRepository from '@/features/table/table.repository';
import { NotFoundError, BadRequestError } from '@/shared/utils/errors';
import { BaseFindOptions } from '@/shared/base';
import socketService from '@/shared/utils/socket';

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

        const table = await tableRepository.create(data);

        // Emit WebSocket event
        socketService.emitTableCreated(table);

        return table;
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

        const updatedTable = await tableRepository.update(tableId, data);

        // Emit WebSocket event
        socketService.emitTableUpdated(tableId, updatedTable);

        return updatedTable;
    }

    /**
     * Delete table
     */
    async deleteTable(tableId: number) {
        await this.getTableById(tableId);

        const result = await tableRepository.delete(tableId);

        // Emit WebSocket event
        socketService.emitTableDeleted(tableId);

        return result;
    }

    /**
     * Update table status
     */
    async updateTableStatus(tableId: number, status: TableStatus) {
        const table = await this.getTableById(tableId);
        const previousStatus = table.status;

        const updatedTable = await tableRepository.update(tableId, { status });

        // Emit WebSocket event
        socketService.emitTableStatusChanged(tableId, status, previousStatus);

        return updatedTable;
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

    /**
     * Get table statistics
     */
    async getTableStats() {
        const allTables = await tableRepository.findAll({ take: 10000 });
        
        const stats = {
            total: allTables.length,
            available: allTables.filter(t => t.status === 'available').length,
            occupied: allTables.filter(t => t.status === 'occupied').length,
            reserved: allTables.filter(t => t.status === 'reserved').length,
            maintenance: allTables.filter(t => t.status === 'maintenance').length,
            active: allTables.filter(t => t.isActive).length,
            inactive: allTables.filter(t => !t.isActive).length,
            totalCapacity: allTables.reduce((sum, t) => sum + t.capacity, 0),
            occupancyRate: allTables.length > 0 
                ? ((allTables.filter(t => t.status === 'occupied').length / allTables.length) * 100).toFixed(2)
                : '0.00',
        };

        return stats;
    }

    /**
     * Bulk update tables
     */
    async bulkUpdateTables(updates: Array<{ tableId: number; data: UpdateTableData }>) {
        const results = [];
        const errors = [];

        for (const update of updates) {
            try {
                const table = await this.updateTable(update.tableId, update.data);
                results.push({ success: true, tableId: update.tableId, table });
            } catch (error) {
                errors.push({ 
                    success: false, 
                    tableId: update.tableId, 
                    error: error instanceof Error ? error.message : 'Unknown error' 
                });
            }
        }

        return { results, errors, total: updates.length, successful: results.length, failed: errors.length };
    }

    /**
     * Bulk update table status
     */
    async bulkUpdateStatus(tableIds: number[], status: TableStatus) {
        const results = [];
        const errors = [];

        for (const tableId of tableIds) {
            try {
                const table = await this.updateTableStatus(tableId, status);
                results.push({ success: true, tableId, table });
            } catch (error) {
                errors.push({ 
                    success: false, 
                    tableId, 
                    error: error instanceof Error ? error.message : 'Unknown error' 
                });
            }
        }

        return { results, errors, total: tableIds.length, successful: results.length, failed: errors.length };
    }
}

export const tableService = new TableService();
