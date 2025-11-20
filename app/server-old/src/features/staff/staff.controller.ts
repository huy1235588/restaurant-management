import { Request, Response, NextFunction } from 'express';
import { staffService } from '@/features/staff/staff.service';
import { ApiResponse } from '@/shared/utils/response';

export class StaffController {
    /**
     * Get all staff
     */
    async getAll(req: Request, res: Response, next: NextFunction) {
        try {
            const { role, isActive, search, page = 1, limit = 10, sortBy = 'fullName', sortOrder = 'asc' } = req.query;

            const staff = await staffService.getAllStaff({
                filters: {
                    role: role as any,
                    isActive: isActive === 'true' ? true : isActive === 'false' ? false : undefined,
                    search: search as string,
                },
                skip: (parseInt(page as string) - 1) * parseInt(limit as string),
                take: parseInt(limit as string),
                sortBy: sortBy as string,
                sortOrder: (sortOrder as string).toLowerCase() as 'asc' | 'desc',
            });

            res.json(ApiResponse.success(staff, 'Staff retrieved successfully'));
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get staff by ID
     */
    async getById(req: Request, res: Response, next: NextFunction) {
        try {
            const staffId = parseInt(req.params['id'] || '0');

            const staff = await staffService.getStaffById(staffId);

            res.json(ApiResponse.success(staff, 'Staff retrieved successfully'));
        } catch (error) {
            next(error);
        }
    }

    /**
     * Create new staff
     */
    async create(req: Request, res: Response, next: NextFunction) {
        try {
            const staff = await staffService.createStaff(req.body);

            res.status(201).json(ApiResponse.success(staff, 'Staff created successfully'));
        } catch (error) {
            next(error);
        }
    }

    /**
     * Update staff
     */
    async update(req: Request, res: Response, next: NextFunction) {
        try {
            const staffId = parseInt(req.params['id'] || '0');

            const staff = await staffService.updateStaff(staffId, req.body);

            res.json(ApiResponse.success(staff, 'Staff updated successfully'));
        } catch (error) {
            next(error);
        }
    }

    /**
     * Delete staff
     */
    async delete(req: Request, res: Response, next: NextFunction) {
        try {
            const staffId = parseInt(req.params['id'] || '0');

            await staffService.deleteStaff(staffId);

            res.json(ApiResponse.success(null, 'Staff deleted successfully'));
        } catch (error) {
            next(error);
        }
    }

    /**
     * Deactivate staff
     */
    async deactivate(req: Request, res: Response, next: NextFunction) {
        try {
            const staffId = parseInt(req.params['id'] || '0');

            const staff = await staffService.deactivateStaff(staffId);

            res.json(ApiResponse.success(staff, 'Staff deactivated successfully'));
        } catch (error) {
            next(error);
        }
    }

    /**
     * Activate staff
     */
    async activate(req: Request, res: Response, next: NextFunction) {
        try {
            const staffId = parseInt(req.params['id'] || '0');

            const staff = await staffService.activateStaff(staffId);

            res.json(ApiResponse.success(staff, 'Staff activated successfully'));
        } catch (error) {
            next(error);
        }
    }

    /**
     * Update staff role
     */
    async updateRole(req: Request, res: Response, next: NextFunction) {
        try {
            const staffId = parseInt(req.params['id'] || '0');
            const { role } = req.body;

            const staff = await staffService.updateStaffRole(staffId, role);

            res.json(ApiResponse.success(staff, 'Staff role updated successfully'));
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get staff by role
     */
    async getByRole(req: Request, res: Response, next: NextFunction) {
        try {
            const { role } = req.params;

            const staff = await staffService.getStaffByRole(role as any);

            res.json(ApiResponse.success(staff, 'Staff retrieved successfully'));
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get staff performance
     */
    async getPerformance(req: Request, res: Response, next: NextFunction) {
        try {
            const staffId = parseInt(req.params['id'] || '0');
            const { startDate, endDate } = req.query;

            const performance = await staffService.getStaffPerformance(
                staffId,
                startDate ? new Date(startDate as string) : undefined,
                endDate ? new Date(endDate as string) : undefined
            );

            res.json(ApiResponse.success(performance, 'Staff performance retrieved successfully'));
        } catch (error) {
            next(error);
        }
    }
}

export const staffController = new StaffController();
