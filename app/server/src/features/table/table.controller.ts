import { Request, Response, NextFunction } from 'express';
import { tableService } from '@/features/table/table.service';
import { ApiResponse } from '@/shared/utils/response';

export class TableController {
    /**
     * Get all tables
     */
    async getAll(req: Request, res: Response, next: NextFunction) {
        try {
            const {
                status,
                floor,
                isActive,
                page = '1',
                limit = '20',
                sortBy = 'tableNumber',
                sortOrder = 'asc',
                search,
                section,
            } = req.query;

            const pageNumber = parseInt(page as string, 10);
            const pageSize = parseInt(limit as string, 10);
            const searchValue = typeof search === 'string' && search.trim() !== '' ? search.trim() : undefined;
            const sectionValue = typeof section === 'string' && section.trim() !== '' ? section.trim() : undefined;

            const tables = await tableService.getAllTables({
                filters: {
                    status: status as any,
                    floor: floor ? parseInt(floor as string, 10) : undefined,
                    isActive: isActive === 'true' ? true : isActive === 'false' ? false : undefined,
                    search: searchValue,
                    section: sectionValue,
                },
                skip: (pageNumber - 1) * pageSize,
                take: pageSize,
                sortBy: sortBy as string,
                sortOrder: (sortOrder as string).toLowerCase() === 'desc' ? 'desc' : 'asc',
            });

            res.json(ApiResponse.success(tables, 'Tables retrieved successfully'));
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get table by ID
     */
    async getById(req: Request, res: Response, next: NextFunction) {
        try {
            const tableId = parseInt(req.params['id'] || '0');

            const table = await tableService.getTableById(tableId);

            res.json(ApiResponse.success(table, 'Table retrieved successfully'));
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get table by number
     */
    async getByNumber(req: Request, res: Response, next: NextFunction) {
        try {
            const { number } = req.params;

            const table = await tableService.getTableByNumber(number || '');

            res.json(ApiResponse.success(table, 'Table retrieved successfully'));
        } catch (error) {
            next(error);
        }
    }

    /**
     * Create new table
     */
    async create(req: Request, res: Response, next: NextFunction) {
        try {
            const table = await tableService.createTable(req.body);

            res.status(201).json(ApiResponse.success(table, 'Table created successfully'));
        } catch (error) {
            next(error);
        }
    }

    /**
     * Update table
     */
    async update(req: Request, res: Response, next: NextFunction) {
        try {
            const tableId = parseInt(req.params['id'] || '0');

            const table = await tableService.updateTable(tableId, req.body);

            res.json(ApiResponse.success(table, 'Table updated successfully'));
        } catch (error) {
            next(error);
        }
    }

    /**
     * Delete table
     */
    async delete(req: Request, res: Response, next: NextFunction) {
        try {
            const tableId = parseInt(req.params['id'] || '0');

            await tableService.deleteTable(tableId);

            res.json(ApiResponse.success(null, 'Table deleted successfully'));
        } catch (error) {
            next(error);
        }
    }

    /**
     * Update table status
     */
    async updateStatus(req: Request, res: Response, next: NextFunction) {
        try {
            const tableId = parseInt(req.params['id'] || '0');
            const { status } = req.body;

            const table = await tableService.updateTableStatus(tableId, status);

            res.json(ApiResponse.success(table, 'Table status updated successfully'));
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get available tables
     */
    async getAvailable(req: Request, res: Response, next: NextFunction) {
        try {
            const { capacity, floor } = req.query;

            const tables = await tableService.getAvailableTables({
                capacity: capacity ? parseInt(capacity as string) : undefined,
                floor: floor ? parseInt(floor as string) : undefined,
            });

            res.json(ApiResponse.success(tables, 'Available tables retrieved successfully'));
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get table with current order
     */
    async getWithCurrentOrder(req: Request, res: Response, next: NextFunction) {
        try {
            const tableId = parseInt(req.params['id'] || '0');

            const table = await tableService.getTableWithCurrentOrder(tableId);

            res.json(ApiResponse.success(table, 'Table with current order retrieved successfully'));
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get table statistics
     */
    async getStats(_: Request, res: Response, next: NextFunction) {
        try {
            const stats = await tableService.getTableStats();

            res.json(ApiResponse.success(stats, 'Table statistics retrieved successfully'));
        } catch (error) {
            next(error);
        }
    }

    /**
     * Bulk update tables
     */
    async bulkUpdate(req: Request, res: Response, next: NextFunction) {
        try {
            const { updates } = req.body;

            const result = await tableService.bulkUpdateTables(updates);

            res.json(ApiResponse.success(result, 'Bulk update completed'));
        } catch (error) {
            next(error);
        }
    }

    /**
     * Bulk update table status
     */
    async bulkUpdateStatus(req: Request, res: Response, next: NextFunction) {
        try {
            const { tableIds, status } = req.body;

            const result = await tableService.bulkUpdateStatus(tableIds, status);

            res.json(ApiResponse.success(result, 'Bulk status update completed'));
        } catch (error) {
            next(error);
        }
    }
}

export const tableController = new TableController();
